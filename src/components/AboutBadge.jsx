import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import './AboutBadge.css'

gsap.registerPlugin(ScrollTrigger)

const REST = 188
const GRAVITY = 0.72
const SPRING = 0.042
const DAMP = 0.965
const GRAB = 0.18
const MAX_STRETCH = 260

export default function AboutBadge() {
  const stageRef = useRef(null)
  const cardRef = useRef(null)
  const leftStrapRef = useRef(null)
  const rightStrapRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
    const card = cardRef.current
    const leftStrap = leftStrapRef.current
    const rightStrap = rightStrapRef.current
    if (!stage || !card || !leftStrap || !rightStrap) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const state = {
      x: 26,
      y: -240,
      vx: 1.4,
      vy: 0.4,
      px: 26,
      py: -240,
      dragging: false,
      pointerX: 0,
      pointerY: REST,
      idleX: 0,
      live: reduced,
    }

    if (reduced) {
      state.x = 0
      state.y = REST
      state.vx = 0
      state.vy = 0
    }

    const origin = () => {
      const box = stage.getBoundingClientRect()
      return { x: box.left + box.width / 2, y: box.top + 18 }
    }

    const applyRubber = () => {
      const dist = Math.hypot(state.x, state.y) || 0.001
      const stretch = dist - REST
      if (stretch > 0) {
        const nx = state.x / dist
        const ny = state.y / dist
        const force = stretch * SPRING
        state.vx -= nx * force
        state.vy -= ny * force
        if (stretch > MAX_STRETCH) {
          const scale = (REST + MAX_STRETCH) / dist
          state.x *= scale
          state.y *= scale
          state.vx *= 0.55
          state.vy *= 0.55
        }
      }
      if (state.y < 64) {
        state.y = 64
        if (state.vy < 0) state.vy *= -0.35
      }
    }

    const drawStraps = () => {
      const cardBox = card.getBoundingClientRect()
      const stageBox = stage.getBoundingClientRect()
      const hookX = stageBox.width / 2
      const hookY = 18
      const leftX = cardBox.left - stageBox.left + cardBox.width * 0.28
      const rightX = cardBox.left - stageBox.left + cardBox.width * 0.72
      const holeY = cardBox.top - stageBox.top + 22
      const stretch = Math.max(0, Math.hypot(state.x, state.y) - REST)
      const sag = 18 + stretch * 0.28
      const pullX = state.x * 0.22
      leftStrap.setAttribute(
        'd',
        `M ${hookX} ${hookY} C ${hookX - 16 - pullX} ${hookY + sag * 0.55}, ${leftX - 8 - pullX * 0.4} ${holeY - sag}, ${leftX} ${holeY}`
      )
      rightStrap.setAttribute(
        'd',
        `M ${hookX} ${hookY} C ${hookX + 16 - pullX} ${hookY + sag * 0.55}, ${rightX + 8 - pullX * 0.4} ${holeY - sag}, ${rightX} ${holeY}`
      )
      const width = Math.max(3.2, 6.2 - stretch * 0.012)
      leftStrap.setAttribute('stroke-width', `${width}`)
      rightStrap.setAttribute('stroke-width', `${width}`)
    }

    const paint = () => {
      const lean = state.x * 0.09 + state.vx * 0.55
      card.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${lean}deg)`
      drawStraps()
    }

    const tick = () => {
      if (state.live && !reduced) {
        if (state.dragging) {
          state.vx += (state.pointerX - state.x) * GRAB
          state.vy += (state.pointerY - state.y) * GRAB
          state.vx *= 0.86
          state.vy *= 0.86
        } else {
          state.vx += (state.idleX - state.x) * 0.012
          state.vy += GRAVITY
        }

        state.x += state.vx
        state.y += state.vy
        applyRubber()
        state.vx *= DAMP
        state.vy *= DAMP
      }

      paint()
      raf = requestAnimationFrame(tick)
    }

    const onMove = (event) => {
      if (event.pointerType === 'touch' && !state.dragging) return
      const point = origin()
      const clientX = event.touches ? event.touches[0].clientX : event.clientX
      const clientY = event.touches ? event.touches[0].clientY : event.clientY
      state.pointerX = clientX - point.x
      state.pointerY = clientY - point.y

      if (!state.dragging) {
        const reach = Math.min(1, Math.hypot(state.pointerX, state.pointerY) / 320)
        state.idleX = Math.max(-110, Math.min(110, state.pointerX * 0.28 * reach))
      }
    }

    const onDown = (event) => {
      if (event.pointerType !== 'mouse') event.preventDefault()
      card.setPointerCapture?.(event.pointerId)
      state.dragging = true
      state.live = true
      card.classList.add('is-pulling')
      onMove(event)
    }

    const onUp = () => {
      state.dragging = false
      card.classList.remove('is-pulling')
    }

    let raf = requestAnimationFrame(tick)
    let started = reduced

    const startFall = () => {
      if (started || reduced) return
      started = true
      state.live = true
      state.x = 22
      state.y = -260
      state.vx = 2.2
      state.vy = 6
      card.classList.add('is-falling')
      window.setTimeout(() => card.classList.remove('is-falling'), 900)
    }

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top 86%',
      once: true,
      onEnter: startFall,
    })

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.12)) {
          startFall()
        }
      },
      { threshold: [0.12, 0.28, 0.5] }
    )
    observer.observe(stage)

    if (stage.getBoundingClientRect().top < window.innerHeight * 0.9) {
      startFall()
    }

    stage.addEventListener('pointermove', onMove)
    card.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      cancelAnimationFrame(raf)
      trigger.kill()
      observer.disconnect()
      stage.removeEventListener('pointermove', onMove)
      card.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return (
    <div className="about-badge-stage" ref={stageRef}>
      <span className="about-badge-hook" aria-hidden="true" />
      <svg className="about-badge-straps" aria-hidden="true">
        <path ref={leftStrapRef} className="about-badge-strap" d="M 140 18 C 124 70 96 150 90 198" />
        <path ref={rightStrapRef} className="about-badge-strap" d="M 140 18 C 156 70 184 150 190 198" />
      </svg>

      <article
        className="about-badge"
        ref={cardRef}
        aria-label="Kartu nama Muhammad Alif Sajidan. Tarik untuk menggerakkan."
      >
        <div className="about-badge-clip" aria-hidden="true">
          <span className="about-badge-hole left" />
          <span className="about-badge-bar" />
          <span className="about-badge-hole right" />
        </div>

        <div className="about-badge-photo">
          <img src="/frames/ezgif-frame-001.jpg" alt="" />
        </div>

        <div className="about-badge-meta">
          <span className="about-badge-id">ID · 01</span>
          <h3>Muhammad Alif Sajidan</h3>
          <p>Informatika · Developer</p>
        </div>
      </article>
    </div>
  )
}
