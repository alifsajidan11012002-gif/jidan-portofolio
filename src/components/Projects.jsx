import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Observer } from 'gsap/Observer'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProjectFootage, { ProjectStill } from './ProjectFootage'
import './Projects.css'

gsap.registerPlugin(ScrollTrigger, Observer)

const PROJECTS = [
  {
    id: 'app-tracking',
    index: '01',
    title: 'APP TRACKING',
    description:
      'Melacak truk secara realtime dengan GPS kustom, memantau muatan, dan absensi lokasi lewat geofence.',
    tags: ['Android', 'Custom GPS', 'Geofence', 'IoT'],
    footage: 'app-tracking',
    accent: '#00e5ff',
    live: 'LIVE GPS',
  },
  {
    id: 'abiza-chat',
    index: '02',
    title: 'ABIZA CHAT',
    description:
      'Messenger Android untuk percakapan realtime — pesan, emoji, dan balasan cepat dalam satu ruang chat.',
    tags: ['Android', 'Messenger', 'Realtime', 'Chat'],
    footage: 'abiza-chat',
    accent: '#ff2a85',
    live: 'LIVE CHAT',
  },
  {
    id: 'gextrack',
    index: '03',
    title: 'GEXTRACK',
    description:
      'Melacak paket terkirim secara realtime, dari proses kirim sampai sampai ke tujuan.',
    tags: ['Android', 'Package Tracking', 'Realtime', 'GPS'],
    footage: 'gextrack',
    accent: '#7f52ff',
    live: 'LIVE TRACK',
  },
]

function shortestOffset(index, selected, total) {
  let offset = index - selected
  const half = total / 2
  if (offset > half) offset -= total
  if (offset < -half) offset += total
  return offset
}

export default function Projects() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const cardRefs = useRef([])
  const [selected, setSelected] = useState(0)
  const selectedRef = useRef(0)
  const skipCardClick = useRef(false)
  selectedRef.current = selected

  const total = PROJECTS.length
  const current = PROJECTS[selected]

  const goTo = (index) => {
    setSelected(((index % total) + total) % total)
  }

  const step = (direction) => {
    goTo(selectedRef.current + direction)
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) return

      gsap.from('.projects-eyebrow, .projects-heading, .projects-subtext', {
        opacity: 0,
        y: 32,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    const layout = () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const landscapePhone = window.matchMedia('(orientation: landscape) and (max-height: 540px)').matches
      const compact = window.innerWidth < 760 || landscapePhone
      const spacing = landscapePhone ? 190 : compact ? 250 : 360

      cardRefs.current.forEach((el, index) => {
        if (!el) return
        const offset = shortestOffset(index, selected, total)
        const abs = Math.abs(offset)

        gsap.to(el, {
          x: offset * spacing,
          y: abs * 10,
          z: abs === 0 ? 160 : -150 - abs * 50,
          rotateY: offset * (compact ? -42 : -46),
          scale: abs === 0 ? 1 : abs === 1 ? 0.78 : 0.6,
          opacity: abs === 0 ? 1 : abs === 1 ? 0.78 : 0.38,
          filter: abs === 0 ? 'brightness(1)' : 'brightness(0.55)',
          duration: reduceMotion ? 0 : 0.72,
          ease: 'power3.out',
          overwrite: 'auto',
          force3D: true,
        })
      })
    }

    layout()
    window.addEventListener('resize', layout)
    return () => window.removeEventListener('resize', layout)
  }, [selected, total])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const swipe = (direction) => {
      skipCardClick.current = true
      step(direction)
    }

    const observer = Observer.create({
      target: stage,
      type: 'touch,pointer',
      tolerance: 70,
      preventDefault: false,
      onLeft: () => swipe(1),
      onRight: () => swipe(-1),
    })
    const onKey = (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
      }
    }

    stage.addEventListener('keydown', onKey)

    return () => {
      observer.kill()
      stage.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <section className="projects-section" ref={sectionRef} id="projects">
      <div className="projects-backdrop" aria-hidden="true">
        {PROJECTS.map((project, index) => (
          <ProjectStill
            key={project.id}
            type={project.footage}
            active={index === selected}
            accent={project.accent}
          />
        ))}
        <div className="projects-backdrop-veil" />
      </div>

      <div className="projects-inner">
        <span className="projects-eyebrow">05 // PROJECTS</span>
        <h2 className="projects-heading">Proyek Pilihan</h2>
        <p className="projects-subtext">
          Geser kartu ke samping. Kartu tengah aktif dan videonya diputar.
        </p>

        <div
          className="projects-stage"
          ref={stageRef}
          tabIndex={0}
          role="listbox"
          aria-label="Carousel proyek"
          aria-activedescendant={current.id}
        >
          <div className="projects-coverflow">
            {PROJECTS.map((project, index) => {
              const isSelected = index === selected
              return (
                <article
                  key={project.id}
                  id={project.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`project-card ${isSelected ? 'is-selected' : ''}`}
                  ref={(node) => {
                    cardRefs.current[index] = node
                  }}
                  style={{ zIndex: isSelected ? 8 : 4 - Math.abs(shortestOffset(index, selected, total)) }}
                  onClick={() => {
                    if (skipCardClick.current) {
                      skipCardClick.current = false
                      return
                    }
                    goTo(index)
                  }}
                >
                  <div className="project-thumb-wrap">
                    {project.footage ? (
                      <ProjectFootage
                        type={project.footage}
                        active={isSelected}
                        showHud={isSelected}
                        className="project-footage-canvas"
                      />
                    ) : (
                      <div className="project-thumb-soon" style={{ '--still-accent': project.accent }} />
                    )}
                    <div className="project-thumb-veil" />
                    {isSelected && project.live ? (
                      <span className="project-live">{project.live}</span>
                    ) : (
                      <span className="project-card-index">{project.index}</span>
                    )}
                    <span className="project-card-name">{project.title}</span>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="projects-nav">
          <button type="button" className="projects-nav-btn" onClick={() => step(-1)} aria-label="Proyek sebelumnya">
            ←
          </button>
          <div className="projects-dots">
            {PROJECTS.map((project, index) => (
              <button
                key={project.id}
                type="button"
                className={`projects-dot ${index === selected ? 'is-active' : ''}`}
                onClick={() => goTo(index)}
                aria-label={`Pilih ${project.title}`}
              />
            ))}
          </div>
          <button type="button" className="projects-nav-btn" onClick={() => step(1)} aria-label="Proyek berikutnya">
            →
          </button>
        </div>

        <div className="projects-info" key={current.id}>
          <span className="project-index">{current.index}</span>
          <h3 className="project-title">{current.title}</h3>
          <p className="project-desc">{current.description}</p>
          <div className="project-tags">
            {current.tags.map((tag) => (
              <span className="project-tag" key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
