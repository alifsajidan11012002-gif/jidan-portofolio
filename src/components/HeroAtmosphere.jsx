import { useEffect, useRef } from 'react'
import './HeroAtmosphere.css'

function seedDust(count, w, h) {
  return Array.from({ length: count }, (_, i) => ({
    x: (i * 97) % w,
    y: (i * 53) % h,
    r: 0.6 + (i % 5) * 0.35,
    s: 8 + (i % 7) * 6,
    a: 0.08 + (i % 4) * 0.05,
    hue: i % 3 === 0 ? '0,229,255' : i % 3 === 1 ? '255,42,133' : '255,255,255',
  }))
}

export default function HeroAtmosphere({ progress = 0 }) {
  const canvasRef = useRef(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let raf = 0
    let disposed = false
    let dust = []
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dust = seedDust(window.innerWidth < 768 ? 46 : 78, window.innerWidth, window.innerHeight)
    }

    const draw = (now) => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)
      const t = now / 1000
      const drift = progressRef.current * 28

      dust.forEach((p, i) => {
        const x = (p.x + t * p.s * 0.35 + drift) % (w + 20) - 10
        const y = (p.y + Math.sin(t * 0.35 + i) * 10 - drift * 0.25) % (h + 20)
        ctx.fillStyle = `rgba(${p.hue},${p.a})`
        ctx.fillRect(x, y, p.r, p.r)
      })
    }

    const tick = (now) => {
      if (disposed) return
      draw(now)
      if (!reduced) raf = requestAnimationFrame(tick)
    }

    resize()
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="hero-atmosphere" aria-hidden="true">
      <div className="hero-atmosphere-bloom teal" />
      <div className="hero-atmosphere-bloom magenta" />
      <div className="hero-atmosphere-vignette" />
      <div className="hero-atmosphere-grid" />
      <canvas ref={canvasRef} className="hero-atmosphere-dust" />
      <div className="hero-atmosphere-grain" />
      <div className="hero-atmosphere-hud">
        <span>STAGE  ·  LIVE</span>
        <span>TEAL / MAGENTA  ·  24FPS</span>
      </div>
    </div>
  )
}
