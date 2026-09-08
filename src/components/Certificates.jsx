import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FaNetworkWired, FaRobot } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi2'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Certificates.css'

gsap.registerPlugin(ScrollTrigger)

const CERTS = [
  {
    id: 'llm',
    src: '/certificates/llm-skillsbuild.png',
    index: '01',
    title: 'Introduction to Large Language Models',
    issuer: 'Hacktiv8',
    partner: 'IBM SkillsBuild',
    date: '24 Juni 2026',
    meta: '1 jam 30 menit',
    description:
      'Fondasi Large Language Model bersama Hacktiv8 × IBM SkillsBuild: cara model bahasa bekerja, merancang prompt, dan memakai AI secara bertanggung jawab.',
    tags: ['LLM', 'Generative AI', 'SkillsBuild'],
    accent: '#7af6ff',
    theme: 'ai',
    Icon: HiSparkles,
  },
  {
    id: 'agent',
    src: '/certificates/ai-agent-skillsbuild.png',
    index: '02',
    title: 'Intelligent by Design: Build an AI Agent',
    issuer: 'Hacktiv8',
    partner: 'IBM SkillsBuild',
    date: '25 Juni 2026',
    meta: '3 jam 30 menit',
    description:
      'Kelas lanjutan tentang arsitektur AI agent, alur keputusan, dan asisten yang menjalankan tugas secara mandiri.',
    tags: ['AI Agent', 'Automation', 'SkillsBuild'],
    accent: '#ff2a85',
    theme: 'ai',
    Icon: FaRobot,
  },
  {
    id: 'ccna',
    src: '/certificates/ccna-intro-networks.png',
    index: '03',
    title: 'CCNAv7: Introduction to Networks',
    issuer: 'Universitas Mulia',
    partner: 'Cisco Networking Academy',
    date: '31 Desember 2022',
    meta: 'Instruktur: Djumhadi, M.Kom',
    description:
      'Jaringan komputer Cisco: switch, router, IPv4/IPv6, Ethernet, keamanan skala kecil, dan troubleshooting.',
    tags: ['Cisco', 'Networking', 'CCNA'],
    accent: '#e8c45c',
    theme: 'cisco',
    Icon: FaNetworkWired,
  },
]

function CertPreview({ src, title, className }) {
  return (
    <div className={`cert-preview ${className || ''}`}>
      <img className="cert-image" src={src} alt={title} />
    </div>
  )
}

function CertVitrine({ cert, index, onOpen }) {
  const cardRef = useRef(null)
  const driversRef = useRef(null)
  const Icon = cert.Icon

  useEffect(() => {
    const card = cardRef.current
    if (!card) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      gsap.set(card, { transformPerspective: 1100, transformStyle: 'preserve-3d' })
      if (reduceMotion) return

      gsap.from(card, {
        autoAlpha: 0,
        y: 52,
        rotateX: -14,
        duration: 0.9,
        delay: index * 0.12,
        ease: 'power3.out',
      })

      driversRef.current = {
        rx: gsap.quickTo(card, 'rotationX', { duration: 0.45, ease: 'power3' }),
        ry: gsap.quickTo(card, 'rotationY', { duration: 0.45, ease: 'power3' }),
        z: gsap.quickTo(card, 'z', { duration: 0.45, ease: 'power3' }),
        scale: gsap.quickTo(card, 'scale', { duration: 0.45, ease: 'power3' }),
      }
    }, card)

    return () => {
      driversRef.current = null
      ctx.revert()
    }
  }, [index])

  const onMove = (event) => {
    const drivers = driversRef.current
    const card = cardRef.current
    if (!drivers || !card) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const rect = card.getBoundingClientRect()
    const nx = (event.clientX - rect.left) / rect.width - 0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5
    drivers.rx(-ny * 12)
    drivers.ry(nx * 16)
    card.style.setProperty('--spot-x', `${(nx + 0.5) * 100}%`)
    card.style.setProperty('--spot-y', `${(ny + 0.5) * 100}%`)
  }

  const onEnter = () => {
    const drivers = driversRef.current
    if (!drivers) return
    drivers.z(36)
    drivers.scale(1.035)
  }

  const onLeave = () => {
    const drivers = driversRef.current
    if (!drivers) return
    drivers.rx(0)
    drivers.ry(0)
    drivers.z(0)
    drivers.scale(1)
  }

  return (
    <article className={`cert-vitrine is-${cert.theme}`}>
      <button
        type="button"
        className="cert-stage"
        ref={cardRef}
        style={{ '--cert-accent': cert.accent }}
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onClick={() => onOpen(cert)}
        aria-label={`Lihat sertifikat ${cert.title}`}
      >
        <span className="cert-spot" />
        <span className="cert-ribbon">{cert.issuer}</span>
        <span className="cert-frame">
          <span className="cert-mat">
            <CertPreview src={cert.src} title={cert.title} />
          </span>
        </span>
        <span className="cert-pedestal" />
        <span className="cert-inspect">Lihat sertifikat ↗</span>
      </button>

      <div className="cert-copy">
        <span className="cert-index">{cert.index}</span>
        <span className="cert-issuer">
          <Icon aria-hidden="true" />
          {cert.partner}
        </span>
        <h3>{cert.title}</h3>
        <p>{cert.description}</p>
        <div className="cert-meta">
          <span>{cert.date}</span>
          <span>{cert.meta}</span>
        </div>
        <div className="cert-tags">
          {cert.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function Certificates() {
  const sectionRef = useRef(null)
  const [viewing, setViewing] = useState(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) return

      gsap.from('.certs-eyebrow, .certs-heading, .certs-subtext', {
        opacity: 0,
        y: 32,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!viewing) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') setViewing(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [viewing])

  return (
    <section className="certs-section" ref={sectionRef} id="certificates">
      <div className="certs-atmosphere" aria-hidden="true">
        <div className="certs-atmosphere-bloom teal" />
        <div className="certs-atmosphere-bloom gold" />
      </div>

      <div className="certs-inner">
        <span className="certs-eyebrow">06 // CERTIFICATES</span>
        <h2 className="certs-heading">Sertifikat</h2>
        <p className="certs-subtext">
          Klik kartu untuk melihat sertifikat.
        </p>

        <div className="certs-gallery">
          {CERTS.map((cert, index) => (
            <CertVitrine key={cert.id} cert={cert} index={index} onOpen={setViewing} />
          ))}
        </div>
      </div>

      {viewing && typeof document !== 'undefined'
        ? createPortal(
            <div className="cert-viewer" onClick={() => setViewing(null)}>
              <div
                className="cert-viewer-panel"
                role="dialog"
                aria-modal="true"
                aria-label={viewing.title}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="cert-viewer-top">
                  <div>
                    <span className="cert-viewer-kicker">
                      {viewing.issuer}  ·  {viewing.partner}
                    </span>
                    <h3>{viewing.title}</h3>
                  </div>
                  <button type="button" className="cert-viewer-close" onClick={() => setViewing(null)}>
                    Tutup
                  </button>
                </div>
                <div className="cert-viewer-stage">
                  <CertPreview src={viewing.src} title={viewing.title} className="is-large" />
                </div>
                <p>{viewing.description}</p>
                <div className="cert-viewer-actions">
                  <span>
                    {viewing.date}  ·  {viewing.meta}
                  </span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  )
}
