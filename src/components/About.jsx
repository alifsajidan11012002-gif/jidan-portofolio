import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AboutBadge from './AboutBadge'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { target: 3, suffix: '+', label: 'Aplikasi mobile', decimal: 0 },
  { target: 3.39, suffix: '', label: 'IPK terakhir', decimal: 2 },
  { target: 2, suffix: '', label: 'Tech & marketing', decimal: 0 },
]

const CHIPS = ['Informatika', 'Universitas Mulia', 'Android', 'Digital Marketing']

export default function About() {
  const sectionRef = useRef(null)
  const numRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-copy',
        { opacity: 0, y: 56 },
        {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 86%',
            end: 'top 42%',
            scrub: 1.05,
          },
        }
      )

      gsap.fromTo(
        '.about-atmosphere-bloom',
        { opacity: 0, scale: 0.88 },
        {
          opacity: 0.22,
          scale: 1,
          ease: 'none',
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 88%',
            end: 'top 42%',
            scrub: 1.2,
          },
        }
      )

      STATS.forEach((stat, i) => {
        const el = numRefs.current[i]
        if (!el) return
        const obj = { val: 0 }
        gsap.to(obj, {
          val: stat.target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onUpdate() {
            el.textContent = obj.val.toFixed(stat.decimal) + stat.suffix
          },
          onComplete() {
            el.textContent = stat.target.toFixed(stat.decimal) + stat.suffix
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="about-section" ref={sectionRef} id="about">
      <div className="about-atmosphere" aria-hidden="true">
        <div className="about-atmosphere-bloom teal" />
        <div className="about-atmosphere-bloom magenta" />
        <div className="about-atmosphere-vignette" />
        <div className="about-atmosphere-grain" />
      </div>

      <div className="about-inner">
        <div className="about-copy">
          <span className="about-eyebrow">01 // ABOUT</span>
          <h2 className="about-heading">Tentang Saya</h2>
          <p className="about-name">Muhammad Alif Sajidan</p>
          <p className="about-role">Informatika · Developer · Designer</p>

          <div className="about-chips">
            {CHIPS.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>

          <p className="about-bio">
            Lulusan S.Kom. Informatika yang memadukan sisi teknis dan kreatif. Membangun
            aplikasi Android — dari sistem internal sampai aplikasi publik — sekaligus merancang
            strategi promo, desain visual, dan editing video.
          </p>

          <div className="about-stats">
            {STATS.map((stat, i) => (
              <div className="about-stat-card" key={stat.label}>
                <span
                  className="about-stat-num"
                  ref={(el) => {
                    numRefs.current[i] = el
                  }}
                >
                  {`0${stat.suffix}`}
                </span>
                <span className="about-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <AboutBadge />
      </div>
    </section>
  )
}
