import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import gsap from 'gsap'
import ICONS from '../../data/skillIcons'
import { createKeycapChannel } from './keycapChannel'
import useIconTexture from './useIconTexture'

export const KEYCAP_SIZE = 1
export const KEYCAP_HEIGHT = 0.5
const BOTTOM_W = 0.97
const TOP_W = 0.72
const DISH = 0.052
const KEYCAP_LIFT = 0.12
const HIT_HEIGHT = KEYCAP_HEIGHT + KEYCAP_LIFT
const ICON_SIZE = 0.38

const DEPTH = { rest: 0, hover: 0.05, press: 0.13 }
const EMISSIVE = { rest: 0.08, hover: 0.34, press: 0.5 }
const TRANSITION = {
  hover: { duration: 0.15, ease: 'power2.out' },
  press: { duration: 0.08, ease: 'power2.in' },
  release: { duration: 0.3, ease: 'back.out(2)' },
  rest: { duration: 0.2, ease: 'power2.out' },
}

function roundedRectPoints(width, radius, cornerSegs) {
  const half = width / 2
  const r = Math.min(radius, half * 0.46)
  const corners = [
    { x: half - r, z: -half + r, a0: -Math.PI / 2, a1: 0 },
    { x: half - r, z: half - r, a0: 0, a1: Math.PI / 2 },
    { x: -half + r, z: half - r, a0: Math.PI / 2, a1: Math.PI },
    { x: -half + r, z: -half + r, a0: Math.PI, a1: Math.PI * 1.5 },
  ]

  const points = []
  corners.forEach((corner) => {
    for (let i = 0; i < cornerSegs; i += 1) {
      const angle = corner.a0 + ((corner.a1 - corner.a0) * i) / cornerSegs
      points.push({
        x: corner.x + Math.cos(angle) * r,
        z: corner.z + Math.sin(angle) * r,
      })
    }
  })
  return points
}

function createKeycapGeometry(quality) {
  const cornerSegs = quality === 'low' ? 4 : 7
  const height = KEYCAP_HEIGHT
  const slices = [
    { t: 0, w: BOTTOM_W, r: 0.1 },
    { t: 0.1, w: BOTTOM_W * 0.99, r: 0.1 },
    { t: 0.52, w: TOP_W + 0.1, r: 0.095 },
    { t: 0.86, w: TOP_W + 0.02, r: 0.088 },
    { t: 1, w: TOP_W, r: 0.085 },
  ]

  const sideRings = slices.map((slice) => {
    const outline = roundedRectPoints(slice.w, slice.r, cornerSegs)
    return outline.map((point) => [point.x, slice.t * height, point.z])
  })

  const topOutline = roundedRectPoints(TOP_W, 0.085, cornerSegs)
  const dishScales = [0.68, 0.36]
  const dishRings = dishScales.map((scale) => (
    topOutline.map((point) => {
      const x = point.x * scale
      const z = point.z * scale
      const falloff = 1 - scale * scale
      return [x, height - DISH * falloff, z]
    })
  ))

  const positions = []
  const uvs = []
  const indices = []

  const pushRing = (ring, v) => {
    ring.forEach((vertex, index) => {
      positions.push(vertex[0], vertex[1], vertex[2])
      uvs.push(index / ring.length, v)
    })
  }

  sideRings.forEach((ring, index) => {
    pushRing(ring, index / (sideRings.length - 1))
  })

  const pts = sideRings[0].length
  const stitch = (start, rings) => {
    for (let r = 0; r < rings - 1; r += 1) {
      for (let i = 0; i < pts; i += 1) {
        const next = (i + 1) % pts
        const a = start + r * pts + i
        const b = start + r * pts + next
        const c = start + (r + 1) * pts + i
        const d = start + (r + 1) * pts + next
        indices.push(a, c, b, b, c, d)
      }
    }
  }

  stitch(0, sideRings.length)

  const bottomCenter = positions.length / 3
  positions.push(0, 0, 0)
  uvs.push(0.5, 0)
  for (let i = 0; i < pts; i += 1) {
    indices.push(bottomCenter, (i + 1) % pts, i)
  }

  const dishStart = positions.length / 3
  const topRing = sideRings[sideRings.length - 1]
  pushRing(topRing, 1)
  dishRings.forEach((ring, index) => {
    pushRing(ring, 1 + (index + 1) / (dishRings.length + 1))
  })
  stitch(dishStart, dishRings.length + 1)

  const lastDish = dishStart + dishRings.length * pts
  const topCenter = positions.length / 3
  positions.push(0, height - DISH, 0)
  uvs.push(0.5, 1)
  for (let i = 0; i < pts; i += 1) {
    indices.push(topCenter, lastDish + i, lastDish + ((i + 1) % pts))
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  return geometry
}

function SwitchHousing() {
  return (
    <group>
      <mesh position={[0, 0.055, 0]} castShadow={false}>
        <boxGeometry args={[0.5, 0.11, 0.5]} />
        <meshPhysicalMaterial color="#16161c" roughness={0.55} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 12]} />
        <meshPhysicalMaterial color="#2b2b34" roughness={0.35} metalness={0.28} />
      </mesh>
    </group>
  )
}

export default function Keycap({
  name,
  color,
  iconColor = '#ffffff',
  iconName,
  description,
  position = [0, 0, 0],
  row = 0,
  index = 0,
  reduceMotion = false,
  quality = 'high',
  register,
  onHover,
}) {
  const groupRef = useRef(null)
  const introRef = useRef(null)
  const topMaterialRef = useRef(null)
  const interaction = useRef({ hovered: false, pressed: false })
  const channel = useRef(createKeycapChannel(row, index))
  const Icon = ICONS[iconName]
  const iconTexture = useIconTexture(Icon, iconColor)

  const capGeometry = useMemo(() => createKeycapGeometry(quality), [quality])
  const iconY = KEYCAP_HEIGHT - DISH + 0.014

  useEffect(() => () => capGeometry.dispose(), [capGeometry])

  useEffect(() => {
    const ch = channel.current
    ch.row = row
    ch.index = index
    ch.materials = [topMaterialRef.current].filter(Boolean)
    ch.visual = groupRef.current
    ch.intro = introRef.current
    return register ? register(name, ch) : undefined
  }, [name, row, index, register])

  useEffect(() => {
    const group = groupRef.current
    const hover = channel.current.hover
    const state = interaction.current
    return () => {
      if (group) gsap.killTweensOf(group.position)
      gsap.killTweensOf(hover)
      if (state.hovered) document.body.style.cursor = 'auto'
    }
  }, [])

  const animateTo = (state, transition) => {
    const group = groupRef.current
    if (!group) return

    const hover = channel.current.hover
    const targetY = KEYCAP_LIFT - DEPTH[state]
    const targetEmissive = EMISSIVE[state]

    if (reduceMotion) {
      gsap.killTweensOf(group.position)
      gsap.killTweensOf(hover)
      group.position.y = targetY
      hover.emissive = targetEmissive
      return
    }

    gsap.to(group.position, { y: targetY, ...transition, overwrite: 'auto' })
    gsap.to(hover, {
      emissive: targetEmissive,
      duration: transition.duration,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const handlePointerOver = (event) => {
    event.stopPropagation()
    interaction.current.hovered = true
    onHover?.({ name, description, color })
    if (event.pointerType !== 'touch') document.body.style.cursor = 'pointer'
    if (!interaction.current.pressed) animateTo('hover', TRANSITION.hover)
  }

  const handlePointerOut = (event) => {
    if (event.pointerType === 'touch') return
    const wasPressed = interaction.current.pressed
    interaction.current.hovered = false
    interaction.current.pressed = false
    onHover?.(null)
    document.body.style.cursor = 'auto'
    animateTo('rest', wasPressed ? TRANSITION.release : TRANSITION.rest)
  }

  const handlePointerDown = (event) => {
    event.stopPropagation()
    interaction.current.pressed = true
    animateTo('press', TRANSITION.press)
  }

  const handlePointerUp = (event) => {
    if (!interaction.current.pressed) return
    event.stopPropagation()
    interaction.current.pressed = false
    animateTo(interaction.current.hovered ? 'hover' : 'rest', TRANSITION.release)
  }

  return (
    <group position={position}>
      <group ref={introRef}>
        <mesh
          visible={false}
          position={[0, HIT_HEIGHT / 2, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onClick={(event) => {
            event.stopPropagation()
            onHover?.({ name, description, color })
          }}
        >
          <boxGeometry args={[KEYCAP_SIZE, HIT_HEIGHT, KEYCAP_SIZE]} />
        </mesh>

        <SwitchHousing />

        <group ref={groupRef} position={[0, KEYCAP_LIFT, 0]}>
          <mesh geometry={capGeometry}>
            <meshPhysicalMaterial
              ref={topMaterialRef}
              color={color}
              emissive={color}
              emissiveIntensity={EMISSIVE.rest}
              roughness={0.34}
              metalness={0.06}
              clearcoat={0.38}
              clearcoatRoughness={0.28}
            />
          </mesh>

          {iconTexture ? (
            <mesh
              position={[0, iconY, 0]}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
              raycast={() => null}
              renderOrder={2}
            >
              <planeGeometry args={[ICON_SIZE, ICON_SIZE]} />
              <meshBasicMaterial
                map={iconTexture}
                color="#ffffff"
                transparent
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          ) : null}
        </group>
      </group>
    </group>
  )
}
