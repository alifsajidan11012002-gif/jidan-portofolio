import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SkillsKeyboard from './keyboard/SkillsKeyboard'
import useMediaFlag from '../hooks/useMediaFlag'
import './Skills.css'

gsap.registerPlugin(ScrollTrigger)

export default function Skills() {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const scrollProgress = useRef(0)
  const isTouchUi = useMediaFlag('(max-width: 900px), (hover: none)')

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduceMotion) {
        scrollProgress.current = 1
        gsap.set('.skills-reveal, .skills-stage, .skills-atmosphere-bloom', {
          clearProps: 'all',
          opacity: 1,
        })
        return
      }

      gsap.set('.skills-reveal', { y: 36, opacity: 0 })
      gsap.set('.skills-hint', { y: 18, opacity: 0 })
      gsap.set('.skills-stage', { opacity: 0 })

      gsap.to('.skills-eyebrow, .skills-heading, .skills-subtext, .skills-chips', {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 76%',
          once: true,
        },
      })

      gsap.to('.skills-stage', {
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 88%',
          once: true,
        },
      })

      gsap.to('.skills-hint', {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top+=95% top',
          once: true,
        },
      })

      ScrollTrigger.create({
        id: 'skills-keyboard',
        trigger: sectionRef.current,
        pin: pinRef.current,
        start: 'top top',
        end: '+=150%',
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollProgress.current = self.progress
        },
        onRefresh: (self) => {
          scrollProgress.current = self.progress
        },
      })

      gsap.fromTo(
        '.skills-atmosphere-bloom',
        { opacity: 0, scale: 0.88 },
        {
          opacity: 0.3,
          scale: 1,
          ease: 'none',
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            end: 'top 42%',
            scrub: 1.1,
          },
        }
      )

      gsap.to('.skills-atmosphere-grid', {
        y: -36,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }, sectionRef)

    const refresh = () => ScrollTrigger.refresh()
    const refreshTimer = window.setTimeout(refresh, 120)
    window.addEventListener('load', refresh)

    return () => {
      window.clearTimeout(refreshTimer)
      window.removeEventListener('load', refresh)
      ctx.revert()
    }
  }, [])

  return (
    <section className="skills-section" ref={sectionRef} id="skills">
      <div className="skills-pin" ref={pinRef}>
        <div className="skills-atmosphere" aria-hidden="true">
          <div className="skills-atmosphere-bloom teal" />
          <div className="skills-atmosphere-bloom magenta" />
          <div className="skills-atmosphere-grid" />
          <div className="skills-atmosphere-vignette" />
          <div className="skills-atmosphere-grain" />
        </div>

        <div className="skills-layout">
          <div className="skills-copy">
            <span className="skills-eyebrow skills-reveal">04 // SKILLS</span>
            <h2 className="skills-heading skills-reveal">Keahlian</h2>
            <p className="skills-subtext skills-reveal">
              Stack teknis dan alat kreatif untuk aplikasi mobile, web, dan konten.
            </p>
            <div className="skills-chips skills-reveal">
              <span>12 Stack</span>
              <span>Keyboard 3D</span>
              <span>{isTouchUi ? 'Tap Preview' : 'Hover Preview'}</span>
            </div>
            <p className="skills-hint skills-reveal">
              {isTouchUi ? 'Ketuk tombol untuk melihat deskripsi' : 'Arahkan kursor ke tombol'}
            </p>
          </div>

          <div className="skills-stage">
            <SkillsKeyboard scrollProgress={scrollProgress} />
          </div>
        </div>
      </div>
    </section>
  )
}
