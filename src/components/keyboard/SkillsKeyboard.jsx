import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Grid, Lightformer, RoundedBox } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import keyboardSkills from '../../data/keyboardSkills'
import Keycap from './Keycap'
import SkillPreview from './SkillPreview'
import { GRID_COLS, GRID_ROWS, KEY_PITCH } from './keyboardLayout'
import useMediaFlag from '../../hooks/useMediaFlag'

const WAVE_SIGMA = 0.55
const WAVE_EMISSIVE = 0.28
const WAVE_SCALE = 0.05
const CAMERA_CONFIG = { fov: 32, near: 0.1, far: 140 }
const GRID_COUNT = GRID_COLS * GRID_ROWS

function keyPosition(col, row) {
  return {
    x: col * KEY_PITCH,
    y: 0,
    z: -row * KEY_PITCH,
  }
}

function buildLayout(items) {
  const raw = items.map((skill, index) => {
    const col = index % GRID_COLS
    const row = Math.floor(index / GRID_COLS)
    return { skill, row, ...keyPosition(col, row) }
  })

  const min = { x: Infinity, z: Infinity }
  const max = { x: -Infinity, z: -Infinity }
  raw.forEach(({ x, z }) => {
    min.x = Math.min(min.x, x)
    min.z = Math.min(min.z, z)
    max.x = Math.max(max.x, x)
    max.z = Math.max(max.z, z)
  })
  const center = {
    x: (min.x + max.x) / 2,
    z: (min.z + max.z) / 2,
  }

  return {
    rows: GRID_ROWS,
    keys: raw.map(({ skill, row, x, y, z }) => ({
      skill,
      row,
      position: [x - center.x, y, z - center.z],
    })),
  }
}

function smoothstep(edge0, edge1, x) {
  const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

function easeOutBack(t) {
  const c1 = 1.12
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2
}

function bezier2(a, b, c, t) {
  const u = 1 - t
  return u * u * a + 2 * u * t * b + t * t * c
}

function MotionGrid({ isMobile }) {
  return (
    <group>
      <Grid
        position={[0, -0.54, 0]}
        args={[24, 24]}
        cellSize={0.5}
        cellThickness={0.72}
        cellColor="#0a3d48"
        sectionSize={2}
        sectionThickness={1.2}
        sectionColor="#00e5ff"
        fadeDistance={isMobile ? 13 : 18}
        fadeStrength={1.35}
        infiniteGrid
      />
      <Grid
        position={[0, 2.2, -8.5]}
        rotation={[Math.PI / 2, 0, 0]}
        args={[20, 12]}
        cellSize={0.5}
        cellThickness={0.42}
        cellColor="#321028"
        sectionSize={2}
        sectionThickness={0.95}
        sectionColor="#ff2a85"
        fadeDistance={isMobile ? 15 : 20}
        fadeStrength={1.55}
        infiniteGrid
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.525, 0]} raycast={() => null}>
        <ringGeometry args={[2.05, 2.14, 72]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.42} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.525, 0]} raycast={() => null}>
        <ringGeometry args={[0.16, 0.22, 32]} />
        <meshBasicMaterial color="#ff2a85" transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  )
}

function StageHud({ scrollProgress }) {
  const depthRef = useRef(null)
  const yawRef = useRef(null)

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const p = scrollProgress.current ?? 0
      if (depthRef.current) {
        depthRef.current.textContent = `Z ${( -2.6 * (1 - p)).toFixed(2)}`
      }
      if (yawRef.current) {
        yawRef.current.textContent = `YAW ${(0.72 * (1 - p) * 57.3).toFixed(0)}°`
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [scrollProgress])

  return (
    <div className="skills-hud" aria-hidden="true">
      <span className="skills-hud-corner tl" />
      <span className="skills-hud-corner tr" />
      <span className="skills-hud-corner bl" />
      <span className="skills-hud-corner br" />
      <div className="skills-hud-meta top">
        <span>GRID // WORLD</span>
        <span ref={depthRef}>Z -2.60</span>
      </div>
      <div className="skills-hud-meta bottom">
        <span className="skills-hud-axes">
          <i className="x">X</i>
          <i className="y">Y</i>
          <i className="z">Z</i>
        </span>
        <span ref={yawRef}>YAW 41°</span>
      </div>
    </div>
  )
}

function SceneCamera({ isMobile, progress, reduceMotion, stageRef }) {
  const { camera } = useThree()
  const look = useRef(new Vector3(0, 0.18, 0))

  useFrame(() => {
    const p = reduceMotion ? 1 : (progress.current ?? 0)
    const t = easeInOutCubic(smoothstep(0, 0.82, p))
    camera.position.set(
      0,
      MathUtils.lerp(isMobile ? 6.0 : 5.85, isMobile ? 5.35 : 5.2, t),
      MathUtils.lerp(isMobile ? 9.1 : 9.0, isMobile ? 7.35 : 7.2, t),
    )

    const stage = stageRef.current
    const follow = 1 - t
    look.current.set(
      (stage?.position.x ?? 0) * follow * 0.22,
      0.18 + (stage?.position.y ?? 0) * follow * 0.06,
      (stage?.position.z ?? 0) * follow * 0.08,
    )
    camera.lookAt(look.current)
  })

  return null
}

function KeyboardScene({ isMobile, reduceMotion, scrollProgress, hoveredSkill, onHover }) {
  const registry = useRef(new Map())
  const stageRef = useRef(null)
  const glowRef = useRef(null)
  const dampedProgress = useRef(null)

  const items = useMemo(() => keyboardSkills.slice(0, GRID_COUNT), [])
  const layout = useMemo(() => buildLayout(items), [items])
  const quality = isMobile ? 'low' : 'high'

  const register = useCallback((name, channel) => {
    registry.current.set(name, channel)
    return () => registry.current.delete(name)
  }, [])

  const handleHover = useCallback((skill) => {
    onHover?.(skill)
  }, [onHover])

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage || reduceMotion) return
    const far = isMobile ? 0.82 : 1
    stage.position.set(1.85 * far, -0.85 * far, -2.6 * far)
    stage.rotation.set(0.38, 0.72, 0.28)
    stage.scale.setScalar(0.68)
  }, [reduceMotion, isMobile])

  useFrame((_, delta) => {
    const target = reduceMotion ? 1 : scrollProgress.current
    if (dampedProgress.current === null) dampedProgress.current = target
    dampedProgress.current = MathUtils.damp(dampedProgress.current, target, 6.2, delta)
    const p = dampedProgress.current

    const flyT = easeInOutCubic(smoothstep(0, 0.58, p))
    const settleT = easeOutCubic(smoothstep(0.42, 0.78, p))
    const flap = (1 - flyT) * Math.sin(p * Math.PI * 2.6)
    const stage = stageRef.current
    const far = isMobile ? 0.82 : 1

    if (stage) {
      stage.position.x = bezier2(1.85 * far, -0.7 * far, 0, flyT)
      stage.position.y = bezier2(-0.85 * far, 0.15 * far, 0, flyT) + flap * 0.1
      stage.position.z = bezier2(-2.6 * far, -1.1 * far, 0, flyT)
      stage.rotation.x = bezier2(0.38, 0.14, 0, flyT)
      stage.rotation.y = bezier2(0.72, 0.28, 0, flyT)
      stage.rotation.z = bezier2(0.28, -0.1, 0, flyT) + flap * 0.1
      stage.scale.setScalar(bezier2(0.68, 0.88, 1.02, flyT) - 0.02 * settleT)
    }

    if (glowRef.current) {
      glowRef.current.emissiveIntensity = MathUtils.lerp(0.06, 0.32, settleT)
    }

    const inRange = p > 0.46 && p < 0.92
    const sweep = MathUtils.clamp((p - 0.5) / 0.28, 0, 1)
    const activeRow = -0.75 + sweep * (layout.rows + 0.5)
    const keyCount = Math.max(1, GRID_COUNT - 1)

    registry.current.forEach((ch) => {
      const col = ch.index % GRID_COLS
      const order = (GRID_ROWS - 1 - ch.row) * GRID_COLS + col
      const start = 0.5 + (order / keyCount) * 0.16
      const land = easeOutBack(smoothstep(start, start + 0.14, p))

      if (ch.intro) {
        ch.intro.position.y = (1 - land) * 0.28
        ch.intro.rotation.set(0, 0, 0)
        ch.intro.scale.setScalar(1)
      }

      if (!inRange || reduceMotion) {
        ch.fx.wave = 0
        ch.fx.waveScale = 0
      } else {
        const d = ch.row - activeRow
        const g = Math.exp(-(d * d) / (2 * WAVE_SIGMA * WAVE_SIGMA))
        ch.fx.wave = WAVE_EMISSIVE * g
        ch.fx.waveScale = WAVE_SCALE * g
      }

      const emissive = ch.hover.emissive + ch.fx.wave
      const scale = 1 + ch.fx.waveScale
      for (let i = 0; i < ch.materials.length; i += 1) {
        const material = ch.materials[i]
        if (material && material.emissiveIntensity !== emissive) {
          material.emissiveIntensity = emissive
        }
      }
      if (ch.visual && ch.visual.scale.x !== scale) {
        ch.visual.scale.setScalar(scale)
      }
    })
  })

  const plateW = GRID_COLS * KEY_PITCH + 0.52
  const plateH = GRID_ROWS * KEY_PITCH + 0.52
  const wellW = GRID_COLS * KEY_PITCH + 0.1
  const wellH = GRID_ROWS * KEY_PITCH + 0.1
  const screwX = plateW / 2 + 0.08
  const screwZ = plateH / 2 + 0.08

  return (
    <>
      <MotionGrid isMobile={isMobile} />
      <SceneCamera isMobile={isMobile} progress={dampedProgress} reduceMotion={reduceMotion} stageRef={stageRef} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[3, 6, 8]} intensity={1.55} color="#ffffff" />
      <directionalLight position={[-5, 3, 4]} intensity={0.4} color="#dfe7ff" />
      <pointLight position={[0, 0.8, 0]} intensity={1.1} color="#00e5ff" distance={6} />

      <Environment resolution={isMobile ? 64 : 128} frames={1} environmentIntensity={0.45}>
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#ffffff"
          position={[0, 4, 6]}
          scale={[8, 4, 1]}
        />
      </Environment>

      <group ref={stageRef}>
      <group position={[0, 0, 0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <RoundedBox args={[plateW + 0.48, 0.34, plateH + 0.48]} radius={0.05} smoothness={2} position={[0, -0.22, 0]}>
          <meshPhysicalMaterial color="#0b0b10" roughness={0.42} metalness={0.38} clearcoat={0.18} />
        </RoundedBox>
        <RoundedBox args={[wellW, 0.05, wellH]} radius={0.03} smoothness={2} position={[0, -0.1, 0]}>
          <meshPhysicalMaterial
            ref={glowRef}
            color="#071016"
            emissive="#00e5ff"
            emissiveIntensity={0}
            roughness={0.68}
            metalness={0.12}
          />
        </RoundedBox>
        {[
          [screwX, screwZ],
          [-screwX, screwZ],
          [screwX, -screwZ],
          [-screwX, -screwZ],
        ].map(([x, z]) => (
          <mesh key={`${x}:${z}`} position={[x, -0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.042, 0.042, 0.035, 12]} />
            <meshPhysicalMaterial color="#2a2a32" roughness={0.28} metalness={0.72} />
          </mesh>
        ))}

        {layout.keys.map(({ skill, row, position }, index) => (
          <Keycap
            key={skill.name}
            name={skill.name}
            color={skill.color}
            iconName={skill.iconName}
            description={skill.description}
            position={position}
            row={row}
            index={index}
            reduceMotion={reduceMotion}
            quality={quality}
            register={register}
            onHover={handleHover}
          />
        ))}

        {hoveredSkill ? (
          <SkillPreview
            name={hoveredSkill.name}
            description={hoveredSkill.description}
            color={hoveredSkill.color}
            reduceMotion={reduceMotion}
            isMobile={isMobile}
            width={plateH + 0.48}
            offsetX={-(plateW + 0.48) / 2}
          />
        ) : null}
      </group>
      </group>

      {isMobile ? null : (
      <ContactShadows
        position={[0, -0.53, 0]}
        opacity={0.38}
        scale={14}
        blur={2.2}
        far={5}
        color="#000000"
      />
      )}
    </>
  )
}

export default function SkillsKeyboard({ scrollProgress }) {
  const fallbackProgress = useRef(1)
  const wrapRef = useRef(null)
  const isMobile = useMediaFlag('(max-width: 900px), ((orientation: landscape) and (max-height: 540px))')
  const reduceMotion = useMediaFlag('(prefers-reduced-motion: reduce)')
  const progress = scrollProgress ?? fallbackProgress
  const [hoveredSkill, setHoveredSkill] = useState(null)
  const [onStage, setOnStage] = useState(true)

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setOnStage(Boolean(entry?.isIntersecting)),
      { rootMargin: '15% 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="skills-keyboard" ref={wrapRef}>
      <StageHud scrollProgress={progress} />
      <Canvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'pan-y' }}
        camera={CAMERA_CONFIG}
        dpr={isMobile ? 1 : [1, 1.5]}
        frameloop={onStage ? 'always' : 'never'}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: isMobile ? 'low-power' : 'default' }}
        resize={{ scroll: false }}
        onPointerMissed={() => setHoveredSkill(null)}
      >
        <KeyboardScene
          isMobile={isMobile}
          reduceMotion={reduceMotion}
          scrollProgress={progress}
          hoveredSkill={hoveredSkill}
          onHover={setHoveredSkill}
        />
      </Canvas>
    </div>
  )
}
