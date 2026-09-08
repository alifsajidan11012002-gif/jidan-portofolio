import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide, CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import gsap from 'gsap'

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let cursorY = y

  words.forEach((word, index) => {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY)
      line = word
      cursorY += lineHeight
    } else {
      line = test
    }
    if (index === words.length - 1) {
      ctx.fillText(line, x, cursorY)
    }
  })
}

function useHologramTexture(name, description, color) {
  const texture = useMemo(() => {
    const width = 1024
    const height = 512
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#07141a'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = color
    ctx.globalAlpha = 0.16
    ctx.fillRect(0, 0, width, height)
    ctx.globalAlpha = 1

    ctx.fillStyle = color
    ctx.fillRect(28, 56, 14, height - 112)

    ctx.shadowColor = color
    ctx.shadowBlur = 28
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 72px Outfit, Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(name, 72, 64)

    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(236, 246, 248, 0.94)'
    ctx.font = '500 42px Inter, sans-serif'
    wrapText(ctx, description, 72, 172, width - 150, 56)

    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 8
    tex.wrapS = RepeatWrapping
    tex.repeat.x = -1
    tex.offset.x = 1
    tex.needsUpdate = true
    return tex
  }, [name, description, color])

  useEffect(() => () => texture.dispose(), [texture])

  return texture
}

export default function SkillPreview({
  name,
  description,
  color,
  reduceMotion,
  isMobile = false,
  width = 4.4,
  offsetX = -1.8,
}) {
  const rootRef = useRef(null)
  const height = isMobile ? 1.55 : 1.75
  const screenMap = useHologramTexture(name, description, color)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (reduceMotion) {
      root.scale.setScalar(1)
      return undefined
    }

    root.scale.setScalar(0.9)
    const tween = gsap.to(root.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.32,
      ease: 'power3.out',
    })
    return () => tween.kill()
  }, [name, reduceMotion])

  return (
    <group
      position={[offsetX - 0.08, height / 2 + 0.22, 0]}
      rotation={[0, -Math.PI / 2, 0]}
    >
      <group ref={rootRef}>
        <mesh raycast={() => null}>
          <planeGeometry args={[width + 0.1, height + 0.1]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.45}
            toneMapped={false}
            side={DoubleSide}
          />
        </mesh>

        <mesh position={[0, 0, 0.02]} raycast={() => null}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            map={screenMap}
            transparent
            toneMapped={false}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  )
}
