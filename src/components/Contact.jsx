import { useEffect, useRef, useState } from 'react'
import { FaWhatsapp, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import { FaTiktok } from 'react-icons/fa6'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Contact.css'

gsap.registerPlugin(ScrollTrigger)

const CHANNELS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    handle: '0856-5412-5028',
    href: 'https://wa.me/6285654125028',
    Icon: FaWhatsapp,
    accent: '#25d366',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@dann_ji11',
    href: 'https://instagram.com/dann_ji11',
    Icon: FaInstagram,
    accent: '#e1306c',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@danss_ji',
    href: 'https://www.tiktok.com/@danss_ji',
    Icon: FaTiktok,
    accent: '#25f4ee',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'Muhammad Alif Sajidan',
    href: 'https://www.linkedin.com/in/muhammad-alif-sajidan-32550735a',
    Icon: FaLinkedinIn,
    accent: '#0a66c2',
  },
]

function ContactCard({ channel, index, dimmed, onEnter, onLeave }) {
  const cardRef = useRef(null)
  const floatRef = useRef(null)
  const iconRef = useRef(null)
  const driversRef = useRef(null)
  const Icon = channel.Icon

  useEffect(() => {
    const card = cardRef.current
    const float = floatRef.current
    const icon = iconRef.current
    if (!card || !float || !icon) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      gsap.set(card, { transformPerspective: 980, transformStyle: 'preserve-3d' })

      if (reduceMotion) return

      gsap.from(card, {
        autoAlpha: 0,
        y: 46,
        rotateX: -18,
        duration: 0.85,
        delay: index * 0.1,
        ease: 'power3.out',
      })

      const floatTween = gsap.to(float, {
        y: gsap.utils.random(-12, -7),
        rotateZ: gsap.utils.random(-1.8, 1.8),
        duration: gsap.utils.random(2.4, 3.4),
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 0.9 + index * 0.18,
      })

      driversRef.current = {
        rx: gsap.quickTo(card, 'rotationX', { duration: 0.42, ease: 'power3' }),
        ry: gsap.quickTo(card, 'rotationY', { duration: 0.42, ease: 'power3' }),
        z: gsap.quickTo(card, 'z', { duration: 0.42, ease: 'power3' }),
        scale: gsap.quickTo(card, 'scale', { duration: 0.42, ease: 'power3' }),
        ix: gsap.quickTo(icon, 'x', { duration: 0.5, ease: 'power3' }),
        iy: gsap.quickTo(icon, 'y', { duration: 0.5, ease: 'power3' }),
        floatTween,
      }
    }, card)

    return () => {
      driversRef.current = null
      ctx.revert()
    }
  }, [index])

  const handleMove = (event) => {
    const drivers = driversRef.current
    const card = cardRef.current
    if (!drivers || !card) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const rect = card.getBoundingClientRect()
    const nx = (event.clientX - rect.left) / rect.width - 0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5
    drivers.rx(-ny * 20)
    drivers.ry(nx * 24)
    drivers.ix(nx * 16)
    drivers.iy(ny * 16)
    card.style.setProperty('--glow-x', `${(nx + 0.5) * 100}%`)
    card.style.setProperty('--glow-y', `${(ny + 0.5) * 100}%`)
  }

  const handleEnter = () => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const drivers = driversRef.current
    if (canHover && drivers) {
      drivers.floatTween.pause()
      drivers.z(56)
      drivers.scale(1.07)
    }
    onEnter()
  }

  const handleLeave = () => {
    const drivers = driversRef.current
    if (drivers) {
      drivers.rx(0)
      drivers.ry(0)
      drivers.z(0)
      drivers.scale(1)
      drivers.ix(0)
      drivers.iy(0)
      drivers.floatTween.resume()
    }
    const card = cardRef.current
    if (card) {
      card.style.setProperty('--glow-x', '50%')
      card.style.setProperty('--glow-y', '38%')
    }
    onLeave()
  }

  return (
    <a
      ref={cardRef}
      className={`contact-card is-${channel.id} ${dimmed ? 'is-dim' : ''}`}
      href={channel.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${channel.label}: ${channel.handle}`}
      style={{ '--card-accent': channel.accent }}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <div className="contact-card-float" ref={floatRef}>
        <span className="contact-card-glow" />
        <span className="contact-card-shine" />
        <span className="contact-card-scan" />
        <span className="contact-card-bracket tl" />
        <span className="contact-card-bracket tr" />
        <span className="contact-card-bracket bl" />
        <span className="contact-card-bracket br" />

        <span className="contact-icon-stage">
          <span className="contact-orbit one" aria-hidden="true">
            <span className="contact-orbit-dot" />
          </span>
          <span className="contact-orbit two" aria-hidden="true">
            <span className="contact-orbit-dot" />
          </span>
          <span className="contact-icon-wrap" ref={iconRef}>
            <Icon className="contact-icon" aria-hidden="true" />
          </span>
        </span>

        <span className="contact-card-label">{channel.label}</span>
        <span className="contact-card-handle">{channel.handle}</span>
        <span className="contact-card-cta">
          Buka <span aria-hidden="true">↗</span>
        </span>
      </div>
    </a>
  )
}

export default function Contact() {
  const sectionRef = useRef(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) return

      gsap.from('.contact-eyebrow, .contact-heading, .contact-subtext', {
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

  return (
    <section className="contact-section" ref={sectionRef} id="contact">
      <div className="contact-atmosphere" aria-hidden="true">
        <div className="contact-atmosphere-bloom teal" />
        <div className="contact-atmosphere-bloom magenta" />
        <div className="contact-atmosphere-grid" />
      </div>

      <div className="contact-inner">
        <span className="contact-eyebrow">07 // CONTACT</span>
        <h2 className="contact-heading">Mari Terhubung</h2>
        <p className="contact-subtext">
          Punya ide atau tawaran kolaborasi? Klik kartu untuk terhubung.
        </p>

        <div className="contact-grid">
          {CHANNELS.map((channel, index) => (
            <ContactCard
              key={channel.id}
              channel={channel}
              index={index}
              dimmed={hovered !== null && hovered !== channel.id}
              onEnter={() => setHovered(channel.id)}
              onLeave={() => setHovered(null)}
            />
          ))}
        </div>

        <p className="contact-copyright">
          © {new Date().getFullYear()} Muhammad Alif Sajidan.
        </p>
      </div>
    </section>
  )
}
