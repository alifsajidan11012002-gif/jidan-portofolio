import { useEffect, useState } from 'react'
import { getCoverHead } from '../lib/heroHead'
import './PortofolioTitle.css'

function smoothstep(start, end, value) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)))
  return t * t * (3 - 2 * t)
}

function useHead() {
  const [head, setHead] = useState(() =>
    typeof window === 'undefined'
      ? { x: 0, y: 0, d: 0 }
      : getCoverHead()
  )

  useEffect(() => {
    const update = () => setHead(getCoverHead())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return head
}

export default function PortofolioTitle({ progress = 0 }) {
  const head = useHead()
  const recede = smoothstep(0.05, 0.42, progress)
  const fade = 1 - smoothstep(0.12, 1, recede)
  const depth = recede * 980
  const wordScale = 1 - recede * 0.58
  const slip = recede * 0.55
  const vw = typeof window === 'undefined' ? 1280 : window.innerWidth
  const fontSize = Math.min(head.d * 0.66, vw * 0.084)
  const gap = Math.min(head.d * 1.22, vw * 0.24)
  const holeX = head.d * (0.56 + recede * 0.7)
  const holeY = head.d * (0.68 + recede * 0.62)
  const mask = `radial-gradient(ellipse ${holeX}px ${holeY}px at ${head.x}px ${head.y}px, transparent 0 42%, rgba(0,0,0,0.35) 68%, #000 100%)`

  return (
    <div
      className="folio-stage"
      aria-hidden={fade < 0.04}
      style={{
        opacity: fade,
        visibility: fade < 0.015 ? 'hidden' : 'visible',
        perspectiveOrigin: `${head.x}px ${head.y}px`,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      <div
        className="folio-lockup"
        style={{
          left: head.x,
          top: head.y,
          fontSize,
          '--folio-o': `${gap}px`,
          '--folio-feather': `${18 + recede * 46}%`,
          transform: `translate(-50%, -50%) translate3d(0, 0, ${-depth}px)`,
          filter: `blur(${recede * 5}px)`,
        }}
      >
        <span className="folio-sr">Portofolio</span>
        <span
          className="folio-word is-port"
          style={{
            transform: `translateX(calc(0.38em + ${slip}em)) scale(${wordScale})`,
          }}
        >
          PORT
        </span>
        <span className="folio-o" aria-hidden="true" />
        <span
          className="folio-word is-folio"
          style={{
            transform: `translateX(calc(0.72em - ${slip}em)) scale(${wordScale})`,
          }}
        >
          FOLIO
        </span>
      </div>
    </div>
  )
}
