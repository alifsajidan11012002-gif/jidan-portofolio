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
    let lastWidth = window.innerWidth
    let refreshTimer = 0

    const refreshIfWidthChanged = () => {
      setAppHeight()
      const width = window.innerWidth
      if (Math.abs(width - lastWidth) < 48) return
      lastWidth = width
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 220)
    }

    const onOrientation = () => {
      lastWidth = window.innerWidth
      setAppHeight()
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 280)
    }

    window.addEventListener('resize', refreshIfWidthChanged)
    window.addEventListener('orientationchange', onOrientation)

    return () => {
      window.clearTimeout(refreshTimer)
      window.removeEventListener('resize', refreshIfWidthChanged)
      window.removeEventListener('orientationchange', onOrientation)
    }
  }, [])

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.28,
      gestureOrientation: 'vertical',
    })

    lenis.on('scroll', ScrollTrigger.update)

    const updateTicker = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(updateTicker)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(updateTicker)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
  }, [])

  return (
    <main className="app-container">
      <Hero />
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
