import { useEffect, useRef, useState, useCallback } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCanvasFrames } from '../hooks/useCanvasFrames'
import HoloSkillCards from './HoloSkillCards'
import HeroAtmosphere from './HeroAtmosphere'
import NameDissolve from './NameDissolve'
import PortofolioTitle from './PortofolioTitle'
import './Hero.css'

const FRAME_COUNT = 240

const NAV_ITEMS = [
  { href: '#about', label: 'About' },
  { href: '#education', label: 'Education' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#certificates', label: 'Certificates' },
  { href: '#contact', label: 'Contact' },
]

function smoothstep(start, end, value) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)))
  return t * t * (3 - 2 * t)
}

function getFramePath(index) {
  const num = String(index + 1).padStart(3, '0')
  return `/frames/ezgif-frame-${num}.jpg`
}

function addSmoothStops(gradient, fadeIn) {
  const steps = 18
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const eased = t * t * (3 - 2 * t)
    const alpha = fadeIn ? eased : 1 - eased
    gradient.addColorStop(t, `rgba(0,0,0,${alpha.toFixed(4)})`)
  }
}

function fillSoftEdge(ctx, x, y, w, h, side) {
  let gradient
  if (side === 'left') gradient = ctx.createLinearGradient(x, 0, x + w, 0)
  if (side === 'right') gradient = ctx.createLinearGradient(x, 0, x + w, 0)
  if (side === 'top') gradient = ctx.createLinearGradient(0, y, 0, y + h)
  if (side === 'bottom') gradient = ctx.createLinearGradient(0, y, 0, y + h)
  addSmoothStops(gradient, side === 'right' || side === 'bottom')
  ctx.fillStyle = gradient
  ctx.fillRect(x, y, w, h)
}

export default function Hero() {
  const canvasRef = useRef(null)
  const sectionRef = useRef(null)
  const viewportRef = useRef(null)
  const currentFrameRef = useRef(0)
  const [activeFrame, setActiveFrame] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [particleLayer, setParticleLayer] = useState(null)
  const [activeHref, setActiveHref] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setParticleLayer(viewportRef.current)
  }, [])

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.querySelector(item.href)).filter(Boolean)
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) {
          setActiveHref(`#${visible.target.id}`)
        }
      },
      { rootMargin: '-28% 0px -48% 0px', threshold: [0.12, 0.28, 0.5] }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const { getFrame, isInitialReady } =
    useCanvasFrames({
      frameCount: FRAME_COUNT,
      getPath: getFramePath,
    })

  const drawFrame = useCallback(
    (index) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) return

      const img = getFrame(index)
      if (!img || !img.complete || img.naturalWidth === 0) return

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const imgRatio = img.naturalWidth / img.naturalHeight
      const canvasRatio = canvasWidth / canvasHeight

      let drawWidth
      let drawHeight
      let offsetX
      let offsetY

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      if (imgRatio > canvasRatio) {
        drawWidth = canvasWidth
        drawHeight = drawWidth / imgRatio
        offsetX = 0
        offsetY = (canvasHeight - drawHeight) / 2
      } else {
        drawHeight = canvasHeight
        drawWidth = drawHeight * imgRatio
        offsetX = (canvasWidth - drawWidth) / 2
        offsetY = 0
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

      const fadeX = Math.max(drawWidth * 0.2, canvasWidth * 0.12)
      const fadeY = Math.max(drawHeight * 0.16, canvasHeight * 0.1)
      fillSoftEdge(ctx, offsetX, offsetY, fadeX, drawHeight, 'left')
      fillSoftEdge(ctx, offsetX + drawWidth - fadeX, offsetY, fadeX, drawHeight, 'right')
      fillSoftEdge(ctx, offsetX, offsetY, drawWidth, fadeY, 'top')
      fillSoftEdge(ctx, offsetX, offsetY + drawHeight - fadeY, drawWidth, fadeY, 'bottom')

      const cx = offsetX + drawWidth / 2
      const cy = offsetY + drawHeight / 2
      const inner = Math.min(drawWidth, drawHeight) * 0.42
      const outer = Math.hypot(drawWidth, drawHeight) * 0.58
      const vignette = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer)
      addSmoothStops(vignette, true)
      ctx.fillStyle = vignette
      ctx.fillRect(offsetX, offsetY, drawWidth, drawHeight)

      const viewport = viewportRef.current
      if (viewport) {
        viewport.style.setProperty('--plate-left', `${(offsetX / canvasWidth) * 100}%`)
        viewport.style.setProperty('--plate-right', `${((offsetX + drawWidth) / canvasWidth) * 100}%`)
        viewport.style.setProperty('--plate-top', `${(offsetY / canvasHeight) * 100}%`)
        viewport.style.setProperty('--plate-bottom', `${((offsetY + drawHeight) / canvasHeight) * 100}%`)
      }
    },
    [getFrame]
  )

  // Handle window resizing & Retina pixel density
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1.5 : 2)
    const w = window.innerWidth
    const h = window.innerHeight

    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    drawFrame(currentFrameRef.current)
  }, [drawFrame])

  // Setup resize listeners and initial canvas size
  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [handleResize])

  // Draw initial frame as soon as frame 0 or initial burst is ready
  useEffect(() => {
    if (isInitialReady) {
      drawFrame(0)
    }
  }, [isInitialReady, drawFrame])

  // Setup GSAP ScrollTrigger with pin to keep viewport 100% full screen
  useEffect(() => {
    const section = sectionRef.current
    const viewport = viewportRef.current
    if (!section || !viewport) return

    let lastFrame = 0
    let rafId = null

    // Refresh ScrollTrigger to ensure accurate pin geometry
    ScrollTrigger.refresh()

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=350%',
      pin: viewport,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress
        const targetFrame = Math.min(
          FRAME_COUNT - 1,
          Math.max(0, Math.round(progress * (FRAME_COUNT - 1)))
        )

        currentFrameRef.current = targetFrame

        if (targetFrame !== lastFrame) {
          lastFrame = targetFrame
          drawFrame(targetFrame)
        }

        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            setActiveFrame(targetFrame)
            setScrollProgress(progress)
            rafId = null
          })
        }
      },
    })

    return () => {
      trigger.kill()
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [drawFrame])

  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    setMenuOpen(false)
    const targetElement = document.querySelector(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (!menuOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <section ref={sectionRef} className="hero-scroll-section" id="hero-scroll">
      {/* Sticky Canvas Viewport pinned by GSAP */}
      <div ref={viewportRef} className="hero-sticky-viewport">
        <canvas ref={canvasRef} className="hero-canvas" />
        <div className="hero-edge-veil" aria-hidden="true" />
        <HeroAtmosphere progress={scrollProgress} />

        <PortofolioTitle progress={scrollProgress} />
        <HoloSkillCards progress={scrollProgress} />

        <div className="hero-overlay-ui">
          <div className="hero-left-panel">
            <div className="hero-name-cluster">
              <NameDissolve
                progress={scrollProgress}
                fadeStart={0.02}
                fadeEnd={0.34}
                layer={particleLayer}
              />
              <p
                className="hero-tagline-text"
                style={{
                  opacity: 1 - smoothstep(0.02, 0.22, scrollProgress),
                  transform: `translate3d(0, ${smoothstep(0.02, 0.22, scrollProgress) * -14}px, 0)`,
                  filter: `blur(${smoothstep(0.06, 0.24, scrollProgress) * 6}px)`,
                  visibility: scrollProgress > 0.24 ? 'hidden' : 'visible',
                }}
              >
                Merancang pengalaman digital yang imersif.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`hero-nav-toggle${menuOpen ? ' is-open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="hero-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="hero-nav-toggle-bar" />
            <span className="hero-nav-toggle-bar" />
            <span className="hero-nav-toggle-bar" />
            <span className="sr-only">{menuOpen ? 'Tutup menu' : 'Buka menu'}</span>
          </button>
          <nav
            id="hero-nav"
            className={`hero-side-nav${menuOpen ? ' is-open' : ''}`}
            aria-label="Navigasi utama"
          >
            <span className="hero-side-nav-eyebrow">Jelajah</span>
            <ul className="hero-side-nav-list">
              {NAV_ITEMS.map((item, index) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={activeHref === item.href ? 'is-active' : ''}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    <span className="hero-side-nav-label">{item.label}</span>
                    <span className="hero-side-nav-index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hero-bottom-row">
            <div className="hero-bottom-center">
              <div className="hero-scroll-indicator">
                <span className="scroll-indicator-text">SCROLL</span>
                <div className="scroll-indicator-line">
                  <div className="scroll-indicator-line-thumb" />
                </div>
              </div>
            </div>
            <div className="hero-bottom-right">
              <span className="hero-timeline-tag">
                {String(activeFrame + 1).padStart(3, '0')} <span className="dim">/ {FRAME_COUNT}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}