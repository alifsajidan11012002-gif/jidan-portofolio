import { useEffect, useRef } from 'react'
import { FaBullhorn, FaMobileAlt } from 'react-icons/fa'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Experience.css'

gsap.registerPlugin(ScrollTrigger)

const CARDS = [
  {
    id: 'digital-marketing',
    index: '01',
    title: 'Pemasaran Digital & Konten',
    description:
      'Menyusun alur promo digital: strategi konten, desain visual di Canva, dan video di CapCut.',
    tags: ['Canva', 'CapCut', 'Content'],
    Icon: FaBullhorn,
    accent: '#ff5e5e',
    accentBg: 'rgba(255, 94, 94, 0.12)',
    accentGlow: 'rgba(255, 94, 94, 0.35)',
  },
  {
    id: 'mobile-iot',
    index: '02',
    title: 'Aplikasi Mobile & IoT',
    description:
      'Membangun aplikasi Android untuk logistik, messenger, dan perangkat GPS IoT kustom.',
    tags: ['Android', 'IoT', 'Messenger'],
    Icon: FaMobileAlt,
    accent: '#5eafff',
    accentBg: 'rgba(94, 175, 255, 0.12)',
    accentGlow: 'rgba(94, 175, 255, 0.35)',
  },
]

export default function Experience() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduceMotion) {
        gsap.set('.exp-reveal, .exp-card, .exp-atmosphere-bloom', { clearProps: 'all', opacity: 1 })
        return
      }

      gsap.set('.exp-reveal', { y: 36, opacity: 0 })
      gsap.set('.exp-card', { y: 48, opacity: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 76%',
          once: true,
        },
      })

      tl.to('.exp-reveal', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
      }, 0)
        .to('.exp-card', {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.16,
        }, 0.18)

      gsap.fromTo(
        '.exp-atmosphere-bloom',
        { opacity: 0, scale: 0.86 },
        {
          opacity: 0.32,
          scale: 1,
          ease: 'none',
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            end: 'top 40%',
            scrub: 1.1,
          },
        }
      )

      gsap.to('.exp-atmosphere-grid', {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    e.currentTarget.style.setProperty('--mx', `${x}%`)
    e.currentTarget.style.setProperty('--my', `${y}%`)
    e.currentTarget.style.setProperty('--spotlight', '1')
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.setProperty('--spotlight', '0')
  }

  return (
    <section className="exp-section" ref={sectionRef} id="experience">
      <div className="exp-atmosphere" aria-hidden="true">
        <div className="exp-atmosphere-bloom teal" />
        <div className="exp-atmosphere-bloom magenta" />
        <div className="exp-atmosphere-grid" />
        <div className="exp-atmosphere-vignette" />
        <div className="exp-atmosphere-grain" />
      </div>

      <div className="exp-inner">
        <span className="exp-eyebrow exp-reveal">03 // EXPERIENCE</span>
        <h2 className="exp-heading exp-reveal">Pengalaman</h2>
        <p className="exp-lead exp-reveal">
          Dua sisi yang saya kerjakan bersamaan: merancang pesan supaya orang tertarik,
          lalu membangun sistem yang benar-benar dipakai.
        </p>

        <div className="exp-cards">
          {CARDS.map(({ id, index, title, description, tags, Icon, accent, accentBg, accentGlow }) => (
            <article
              key={id}
              className="exp-card"
              style={{
                '--accent': accent,
                '--accent-bg': accentBg,
                '--accent-glow': accentGlow,
                '--mx': '50%',
                '--my': '50%',
                '--spotlight': '0',
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="exp-card-spotlight" aria-hidden="true" />
              <span className="exp-card-index">{index}</span>
              <div className="exp-icon-ring">
                <Icon className="exp-icon" />
              </div>
              <h3 className="exp-card-title">{title}</h3>
              <p className="exp-card-desc">{description}</p>
              <ul className="exp-card-tags">
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
