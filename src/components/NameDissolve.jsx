import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getCoverHead } from '../lib/heroHead'

const LINES = ['Muhammad Alif Sajidan']
const PALETTE = [
  [255, 255, 255],
  [220, 250, 255],
  [0, 229, 255],
  [255, 96, 164],
]

function smoothstep(start, end, value) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)))
  return t * t * (3 - 2 * t)
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function hash(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

function ellipseOutside(x, y, cx, cy, rx, ry) {
  const d = Math.hypot((x - cx) / rx, (y - cy) / ry)
  return smoothstep(0.9, 1.2, d)
}

function behindObject(x, y, head) {
  const hair = ellipseOutside(x, y, head.x, head.y - head.d * 0.16, head.d * 0.78, head.d * 0.62)
  const face = ellipseOutside(x, y, head.x, head.y + head.d * 0.02, head.d * 0.7, head.d * 0.9)
  const body = ellipseOutside(x, y, head.x + head.d * 0.03, head.y + head.d * 0.82, head.d * 1.05, head.d * 1.45)
  return Math.min(hair, face, body)
}

function rasterizeTitle(title, dpr, layer) {
  const spans = [...title.querySelectorAll('span')]
  if (!spans.length) return null

  const boxes = spans.map((span) => ({
    text: span.textContent || '',
    box: span.getBoundingClientRect(),
    style: getComputedStyle(span),
  }))

  let minX = Infinity
  let minY = Infinity
  let maxX = 0
  let maxY = 0
  boxes.forEach(({ box }) => {
    minX = Math.min(minX, box.left)
    minY = Math.min(minY, box.top)
    maxX = Math.max(maxX, box.right)
    maxY = Math.max(maxY, box.bottom)
  })

  const pad = 6
  const width = Math.max(2, Math.ceil((maxX - minX + pad * 2) * dpr))
  const height = Math.max(2, Math.ceil((maxY - minY + pad * 2) * dpr))
  const source = document.createElement('canvas')
  source.width = width
  source.height = height
  const ctx = source.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 24 * dpr
  ctx.shadowOffsetY = 8 * dpr
  ctx.fillStyle = '#ffffff'

  boxes.forEach(({ text, box, style }) => {
    ctx.font = style.font
    if (typeof ctx.letterSpacing !== 'undefined') {
      ctx.letterSpacing = style.letterSpacing
    }
    ctx.fillText(
      text,
      (box.left - minX + pad) * dpr,
      (box.top - minY + pad) * dpr
    )
  })
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  const { data } = ctx.getImageData(0, 0, width, height)
  const layerBox = layer?.getBoundingClientRect()
  const originX = layerBox?.left ?? 0
  const originY = layerBox?.top ?? 0
  const mobile = window.innerWidth <= 768
  const step = Math.max(mobile ? 3 : 2, Math.round((mobile ? 3 : 2) * dpr))
  const particles = []

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] < 90) continue
      const n = hash(x, y)
      const n2 = hash(y, x)
      const n3 = hash(x * 0.51, y * 1.7)
      const orbitScale = 1.02 + n2 ** 1.12 * 1.9 + (n3 > 0.83 ? 0.7 : 0) + (n3 > 0.93 ? 0.5 : 0)
      particles.push({
        ox: minX - pad + x / dpr - originX,
        oy: minY - pad + y / dpr - originY,
        size: step / dpr,
        delay: (x / width) * 0.3 + n * 0.04,
        color: PALETTE[Math.floor(n2 * PALETTE.length)],
        seed: n,
        orbitScale,
        phase: n * Math.PI * 2,
        speed: 0.07 + n * 0.11 + 0.055 / orbitScale,
        tilt: 0.4 + n2 * 0.16,
        arm: Math.floor(n3 * 3) * ((Math.PI * 2) / 3),
        twinkle: n2,
        glow: n3 > 0.84,
      })
    }
  }

  return {
    source,
    particles,
    srcX: minX - pad - originX,
    srcY: minY - pad - originY,
  }
}

export default function NameDissolve({ progress, fadeStart = 0.02, fadeEnd = 0.34, layer }) {
  const titleRef = useRef(null)
  const canvasRef = useRef(null)
  const cacheRef = useRef(null)
  const progressRef = useRef(progress)
  const reducedRef = useRef(false)
  const startLoopRef = useRef(() => {})

  progressRef.current = progress
  const fadeStartRef = useRef(fadeStart)
  const fadeEndRef = useRef(fadeEnd)
  fadeStartRef.current = fadeStart
  fadeEndRef.current = fadeEnd

  useEffect(() => {
    const title = titleRef.current
    const canvas = canvasRef.current
    if (!title || !canvas || !layer) return undefined

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return undefined

    let raf = 0
    let disposed = false
    let looping = false
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const fitCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1.25 : 1.75)
      const w = layer.clientWidth || window.innerWidth
      const h = layer.clientHeight || window.innerHeight
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      return dpr
    }

    const rebuild = () => {
      const dpr = fitCanvas()
      cacheRef.current = rasterizeTitle(title, dpr, layer)
    }

    const draw = (now) => {
      const dissolve = smoothstep(fadeStartRef.current, fadeEndRef.current, progressRef.current)
      const cache = cacheRef.current
      const viewW = layer.clientWidth || window.innerWidth
      const viewH = layer.clientHeight || window.innerHeight
      const dpr = canvas.width / Math.max(1, viewW)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, viewW + 2, viewH + 2)
      canvas.style.zIndex = dissolve < 0.22 ? '10' : '2'
      if (!cache) return

      if (dissolve <= 0.001) {
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(
          cache.source,
          cache.srcX,
          cache.srcY,
          cache.source.width / dpr,
          cache.source.height / dpr
        )
        return
      }

      const time = now / 1000
      const head = getCoverHead(viewW, viewH)
      const cx = head.x
      const cy = head.y
      const spin = 1 + progressRef.current * 0.35

      const paint = (frontPass) => {
        cache.particles.forEach((p) => {
          const local = Math.min(1, Math.max(0, (dissolve - p.delay) / 0.82))
          const x0 = p.ox
          const y0 = p.oy

          if (local <= 0) {
            if (!frontPass) {
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(x0, y0, p.size * 1.35, p.size * 1.35)
            }
            return
          }

          const radius = head.d * p.orbitScale
          const join = easeInOutCubic(smoothstep(0, 0.38, local))
          const swirl = p.phase + p.arm + time * p.speed * spin + p.orbitScale * 0.95
          const depth = Math.sin(swirl)
          const inFront = join > 0.7 && depth > 0.22
          if (inFront !== frontPass) return

          const gx = cx + Math.cos(swirl) * radius
          const gy = cy + Math.sin(swirl) * radius * p.tilt
          const x = lerp(x0, gx, join)
          const y = lerp(y0, gy, join)
          const vis = join < 0.18 ? 1 : behindObject(x, y, head)
          if (vis < 0.05) return

          const facing = 0.32 + 0.4 * (0.5 + 0.5 * depth)
          const twinkle = 0.7 + Math.sin(time * (1.5 + p.twinkle * 2.4) + p.phase) * 0.3
          const alpha = (0.07 + facing * 0.32) * twinkle * vis
          if (alpha < 0.04) return

          const [r, g, b] = p.color
          const size = p.size * (0.55 + facing * 1.05 + p.twinkle * 0.25)

          if (p.glow && facing > 0.5) {
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.2})`
            ctx.fillRect(x - size * 1.2, y - size * 1.2, size * 3.2, size * 3.2)
          }

          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
          ctx.fillRect(x, y, size, size)
        })
      }

      paint(false)
      paint(true)
    }

    const tick = (now) => {
      if (disposed) return
      draw(now)
      const dissolve = smoothstep(fadeStartRef.current, fadeEndRef.current, progressRef.current)
      if (dissolve <= 0.001 || (reducedRef.current && dissolve >= 0.98)) {
        looping = false
        return
      }
      looping = true
      raf = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (disposed || looping) return
      looping = true
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }

    startLoopRef.current = startLoop

    const boot = async () => {
      if (document.fonts?.ready) await document.fonts.ready
      await new Promise((resolve) => requestAnimationFrame(resolve))
      if (disposed) return
      rebuild()
      startLoop()
    }

    const onResize = () => {
      looping = false
      rebuild()
      startLoop()
    }

    boot()
    const later = window.setTimeout(() => {
      if (!disposed) {
        rebuild()
        startLoop()
      }
    }, 1400)
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      looping = false
      cancelAnimationFrame(raf)
      window.clearTimeout(later)
      window.removeEventListener('resize', onResize)
    }
  }, [layer])

  useEffect(() => {
    startLoopRef.current()
  }, [progress])

  return (
    <div className="hero-name-stage">
      <h1 ref={titleRef} className="hero-big-name is-ghost">
        <span>{LINES[0]}</span>
      </h1>
      {layer
        ? createPortal(
            <canvas ref={canvasRef} className="hero-name-particles" aria-hidden="true" />,
            layer
          )
        : null}
    </div>
  )
}
