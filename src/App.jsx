import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './components/Hero'
import './App.css';
import About from './components/About';
import Education from './components/Education';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Projects from './components/Projects'
import Certificates from './components/Certificates'
import Contact from './components/Contact';

function setAppHeight() {
  const height = window.visualViewport?.height || window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${height}px`)
}

function App() {
  useEffect(() => {
    setAppHeight()
    let refreshTimer = 0
    const onViewportChange = () => {
      setAppHeight()
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 180)
    }

    window.addEventListener('resize', onViewportChange)
    window.addEventListener('orientationchange', onViewportChange)
    window.visualViewport?.addEventListener('resize', onViewportChange)

    return () => {
      window.clearTimeout(refreshTimer)
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('orientationchange', onViewportChange)
      window.visualViewport?.removeEventListener('resize', onViewportChange)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px), (pointer: coarse)')
    let lenis = null
    let updateTicker = null

    const teardown = () => {
      if (updateTicker) {
        gsap.ticker.remove(updateTicker)
        updateTicker = null
      }
      if (lenis) {
        lenis.destroy()
        lenis = null
      }
      gsap.ticker.lagSmoothing(500, 33)
    }

    const setup = () => {
      teardown()
      if (media.matches) {
        ScrollTrigger.refresh()
        return
      }

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1,
      })

      lenis.on('scroll', ScrollTrigger.update)
      updateTicker = (time) => {
        lenis.raf(time * 1000)
      }
      gsap.ticker.add(updateTicker)
      gsap.ticker.lagSmoothing(0)
    }

    setup()
    media.addEventListener('change', setup)

    return () => {
      media.removeEventListener('change', setup)
      teardown()
    }
  }, [])

  return (
    <main className="app-container">
      {/* 240-Frame Interactive Scrollytelling Section */}
      <Hero />

      {/* Continuation Portfolio Content */}
      <About />
      <Education />
      <Experience />
      <Skills />
      <Projects />
      <Certificates />
      <Contact />

    </main>
  )
}

export default App