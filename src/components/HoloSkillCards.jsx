import { useEffect, useRef, useState } from 'react'
import { SKILL_CARDS } from '../data/skillCards'
import { CARD_FLIGHT, CARD_IN, CARD_STAGGER, getSteppedSpin, smoothstep } from '../lib/cardOrbit'
import { getCoverHead } from '../lib/heroHead'
import useMediaFlag from '../hooks/useMediaFlag'
import SkillFootage from './SkillFootage'
import './HoloSkillCards.css'

const TWO_PI = Math.PI * 2
const SPAWN_ANGLE = 2.15

function lerp(a, b, t) {
  return a + (b - a) * t
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

function lerpAngle(from, to, t) {
  let delta = to - from
  while (delta > Math.PI) delta -= TWO_PI
  while (delta < -Math.PI) delta += TWO_PI
  return from + delta * t
}

function cardEnter(progress, index) {
  const start = CARD_IN + index * CARD_STAGGER
  return easeOutCubic(smoothstep(start, start + CARD_FLIGHT, progress))
}

function useOrbitRadius() {
  const [radius, setRadius] = useState({ x: 26, z: 340, scale: 1 })

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      if (width <= 560) setRadius({ x: 36, z: 168, scale: 0.68 })
      else if (width <= 768) setRadius({ x: 32, z: 210, scale: 0.78 })
      else setRadius({ x: 26, z: 340, scale: 1 })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return radius
}

function useHeadOrigin() {
  const [space, setSpace] = useState({
    x: 47,
    y: 40,
    headX: 47,
    headY: 34,
    headD: 220,
  })

  useEffect(() => {
    const update = () => {
      const head = getCoverHead()
      const mobile = window.innerWidth <= 768
      setSpace({
        x: head.xPercent + (mobile ? 5.4 : 8),
        y: head.yPercent + (mobile ? 7 : 8),
        headX: head.xPercent,
        headY: head.yPercent - 1,
        headD: head.d,
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return space
}

function getOrbitFromAngle(angle, radius) {
  const sinA = Math.sin(angle)
  const cosA = Math.cos(angle)
  const depth = (cosA + 1) / 2
  const x = sinA * radius.x
  const y = sinA * 4.6 + cosA * 0.9
  const z = cosA * radius.z
  const scale = (0.36 + depth * 0.64) * (radius.scale ?? 1)
  const opacity = 0.24 + depth * 0.76
  const rotateY = -sinA * 40
  const rotateX = cosA * 8 - sinA * 6

  return {
    angle,
    depth,
    x,
    y,
    z,
    scale,
    opacity,
    rotateY,
    rotateX,
    zIndex: Math.round(10 + depth * 90),
    featured: depth > 0.78,
  }
}

function isCardBehind(orbit, isFocused) {
  if (isFocused) return false
  return orbit.z < 80
}

export default function HoloSkillCards({ progress }) {
  const count = SKILL_CARDS.length
  const radius = useOrbitRadius()
  const space = useHeadOrigin()
  const isMobile = useMediaFlag('(max-width: 768px)')
  const safeProgress = Math.min(1, Math.max(0, progress))
  const spin = getSteppedSpin(safeProgress, count)
  const orbitSpin = spin / TWO_PI
  const firstEnter = cardEnter(safeProgress, 0)
  const [hoveredId, setHoveredId] = useState(null)
  const [focusedId, setFocusedId] = useState(null)
  const focusProgressRef = useRef(null)

  const closeFocus = () => {
    setFocusedId(null)
    focusProgressRef.current = null
  }

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') closeFocus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!focusedId || focusProgressRef.current == null) return
    if (Math.abs(safeProgress - focusProgressRef.current) > 0.01) {
      closeFocus()
    }
  }, [safeProgress, focusedId])

  const handleTilt = (event) => {
    if (event.pointerType === 'touch') return
    const frame = event.currentTarget.querySelector('.holo-card-frame')
    if (!frame) return
    const rect = frame.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    frame.style.setProperty('--tilt-x', `${(-py * 10).toFixed(2)}deg`)
    frame.style.setProperty('--tilt-y', `${(px * 12).toFixed(2)}deg`)
  }

  const clearTilt = (event) => {
    const frame = event.currentTarget.querySelector('.holo-card-frame')
    if (!frame) return
    frame.style.setProperty('--tilt-x', '0deg')
    frame.style.setProperty('--tilt-y', '0deg')
  }

  const cards = SKILL_CARDS.map((skill, index) => {
    const enter = cardEnter(safeProgress, index)
    const slotAngle = (index / count) * TWO_PI - spin
    const liveAngle = lerpAngle(SPAWN_ANGLE, slotAngle, enter)
    const orbit = getOrbitFromAngle(liveAngle, radius)
    const dest = getOrbitFromAngle(slotAngle, radius)
    return { skill, index, enter, orbit, dest }
  })

  const frontIndex = cards.reduce(
    (best, card, index) => (card.orbit.depth > cards[best].orbit.depth ? index : best),
    0
  )

  const personMask = `radial-gradient(ellipse ${space.headD * 1.45}px ${space.headD * 1.9}px at ${space.headX}% ${space.headY}%, transparent 0 50%, #000 74%)`

  const renderLayer = (behind) =>
    cards.map((card) => {
      const isFocused = focusedId === card.skill.id
      if (behind !== isCardBehind(card.orbit, isFocused)) return null
      return (
        <Card
          key={card.skill.id}
          skill={card.skill}
          orbit={card.orbit}
          dest={card.dest}
          enter={card.enter}
          isFront={card.index === frontIndex}
          isHovered={hoveredId === card.skill.id}
          isFocused={isFocused}
          focusedId={focusedId}
          safeProgress={safeProgress}
          setHoveredId={setHoveredId}
          setFocusedId={setFocusedId}
          focusProgressRef={focusProgressRef}
          handleTilt={handleTilt}
          clearTilt={clearTilt}
          isMobile={isMobile}
          sizeScale={radius.scale}
        />
      )
    })

  return (
    <div
      className={`holo-stage${focusedId ? ' is-inspecting' : ''}${firstEnter < 0.01 ? ' is-hidden' : ''}${firstEnter > 0.55 ? ' is-ready' : ''}`}
      aria-live="polite"
      style={{
        perspectiveOrigin: `${space.x}% ${space.y}%`,
      }}
    >
      <button
        type="button"
        className="holo-dim"
        aria-label="Tutup fokus card"
        tabIndex={focusedId ? 0 : -1}
        onClick={closeFocus}
      />
      <div
        className="holo-depth is-back"
        style={{
          WebkitMaskImage: personMask,
          maskImage: personMask,
        }}
      >
        <div className="holo-orbit-origin" style={{ left: `${space.x}%`, top: `${space.y}%` }}>
          <div
            className="holo-floor-ring"
            style={{
              transform: `rotateX(72deg) rotateZ(${-12 + orbitSpin * 360}deg)`,
              opacity: firstEnter,
            }}
          />
          <div className="holo-core-beam" style={{ opacity: 0.45 * firstEnter }} />
          {renderLayer(true)}
        </div>
      </div>
      <div className="holo-depth is-front">
        <div className="holo-orbit-origin" style={{ left: `${space.x}%`, top: `${space.y}%` }}>
          {renderLayer(false)}
        </div>
      </div>
    </div>
  )
}

function Card({
  skill,
  orbit,
  dest,
  enter,
  isFront,
  isHovered,
  isFocused,
  focusedId,
  safeProgress,
  setHoveredId,
  setFocusedId,
  focusProgressRef,
  handleTilt,
  clearTilt,
  isMobile,
  sizeScale,
}) {
  const dimmed = Boolean(focusedId && !isFocused)
  const boost = isFocused ? 1.08 : isHovered ? 1.04 : 1
  const destX = isFocused ? dest.x * 0.2 : orbit.x
  const destY = isFocused ? dest.y * 0.08 - (isMobile ? 16 : 0) : orbit.y
  const destZ = isFocused ? 90 : orbit.z + (1 - enter) * -260
  const destScale = (isFocused ? 0.98 * sizeScale : orbit.scale) * boost
  const appear = smoothstep(0.04, 0.32, enter)
  const liveOpacity = enter >= 0.96 ? orbit.opacity : appear
  const interactive = enter > 0.68
  const extrudeLayers = isFocused ? (isMobile ? 14 : 28) : 0
  const footageActive = isFocused || isHovered || isFront || orbit.depth > 0.72

  return (
    <article
      className={`holo-card${orbit.featured ? ' is-featured' : ''}${isHovered ? ' is-hovered' : ''}${isFocused ? ' is-focused' : ''}`}
      style={{
        zIndex: isFocused ? 220 : isHovered ? orbit.zIndex + 20 : orbit.zIndex,
        opacity: dimmed ? 0.08 : isFocused ? 1 : liveOpacity,
        transform: `
          translate3d(${destX}vw, ${destY}vh, ${destZ}px)
          rotateY(${isFocused ? 0 : orbit.rotateY}deg)
          rotateX(${isFocused ? 0 : orbit.rotateX}deg)
          scale(${lerp(0.3, destScale, enter)})
        `,
        pointerEvents: interactive ? 'auto' : 'none',
        '--holo-accent': skill.accent,
        '--holo-glow': isFocused ? 1 : Math.max(orbit.depth, appear),
      }}
      onMouseEnter={() => setHoveredId(skill.id)}
      onMouseLeave={(event) => {
        setHoveredId(null)
        clearTilt(event)
      }}
      onMouseMove={handleTilt}
      onClick={() => {
        setFocusedId((current) => {
          if (current === skill.id) {
            focusProgressRef.current = null
            return null
          }
          focusProgressRef.current = safeProgress
          return skill.id
        })
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setFocusedId((current) => {
            if (current === skill.id) {
              focusProgressRef.current = null
              return null
            }
            focusProgressRef.current = safeProgress
            return skill.id
          })
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isFocused}
      aria-label={`${skill.title}. Ketuk untuk fokus.`}
    >
      {isFocused ? (
        <aside className="holo-sleep" aria-hidden="false">
          <div className="holo-extrude">
            {Array.from({ length: extrudeLayers }, (_, layer) => (
              <span
                key={layer}
                className={`holo-extrude-layer${layer === 0 ? ' is-face' : ''}`}
                style={{
                  transform: `${isMobile ? 'translateX(-50%) ' : ''}translateZ(${-layer * 2.15}px)`,
                  color: layer === 0 ? '#ffffff' : `hsl(210 8% ${18 + layer * 0.7}%)`,
                }}
              >
                {skill.sleep.headline}
              </span>
            ))}
          </div>
          <ul className="holo-sleep-facts">
            {skill.sleep.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      <div className="holo-card-frame">
        <span className="holo-corner tl" />
        <span className="holo-corner tr" />
        <span className="holo-corner bl" />
        <span className="holo-corner br" />

        <div className="holo-footage">
          <SkillFootage type={skill.footage} active={footageActive} />
          <div className="holo-scanlines" />
          <div className="holo-flicker" />
          <span className="holo-rec">REC</span>
        </div>

        <div className="holo-meta">
          <div className="holo-meta-top">
            <span className="holo-index">{skill.index}</span>
            <span className="holo-signal">
              {isFocused ? 'FOKUS' : isHovered ? 'HOVER' : isFront ? 'HOLO · LIVE' : 'ORBIT'}
            </span>
          </div>
          <h3 className="holo-title">{skill.title}</h3>
          <p className="holo-line">{skill.line}</p>
          <span className="holo-hint">
            {isFocused
              ? (isMobile ? 'ketuk lagi untuk lepas' : 'klik lagi untuk lepas')
              : (isMobile ? 'ketuk untuk fokus' : 'klik untuk fokus')}
          </span>
        </div>
      </div>
    </article>
  )
}
