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
import { needsIosScrollFix, prefersNativeScroll, syncPhoneOrientation } from './lib/device'

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
      syncPhoneOrientation()
      const width = window.innerWidth
      if (Math.abs(width - lastWidth) < 48) return
      lastWidth = width
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 220)
    }

    const onOrientation = () => {
      lastWidth = window.innerWidth
      setAppHeight()
      syncPhoneOrientation()
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 280)
    }

    window.addEventListener('resize', refreshIfWidthChanged)
    window.addEventListener('orientationchange', onOrientation)
    window.addEventListener('pageshow', onOrientation)

    const bootRefresh = [180, 600, 1400].map((delay) =>
      window.setTimeout(() => ScrollTrigger.refresh(), delay)
    )

    return () => {
      window.clearTimeout(refreshTimer)
      bootRefresh.forEach((id) => window.clearTimeout(id))
      window.removeEventListener('resize', refreshIfWidthChanged)
      window.removeEventListener('orientationchange', onOrientation)
      window.removeEventListener('pageshow', onOrientation)
    }
  }, [])

  useEffect(() => {
    const nativeScroll = prefersNativeScroll()
    const iosFix = needsIosScrollFix()

    if (nativeScroll) {
      document.documentElement.classList.add('is-native-scroll')
    }

    let iosRaf = 0
    let iosActive = false
    let iosStopTimer = 0
    const iosPulse = () => {
      ScrollTrigger.update()
      if (iosActive) iosRaf = requestAnimationFrame(iosPulse)
      else iosRaf = 0
    }
    const startIosPulse = () => {
      iosActive = true
      window.clearTimeout(iosStopTimer)
      iosStopTimer = window.setTimeout(() => {
        iosActive = false
      }, 900)
      if (iosFix && !iosRaf) iosRaf = requestAnimationFrame(iosPulse)
    }

    if (iosFix) {
      window.addEventListener('scroll', startIosPulse, { passive: true })
      window.addEventListener('touchmove', startIosPulse, { passive: true })
    }

    if (nativeScroll) {
      return () => {
        document.documentElement.classList.remove('is-native-scroll')
        iosActive = false
        window.clearTimeout(iosStopTimer)
        if (iosRaf) cancelAnimationFrame(iosRaf)
        if (iosFix) {
          window.removeEventListener('scroll', startIosPulse)
          window.removeEventListener('touchmove', startIosPulse)
        }
      }
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      gestureOrientation: 'vertical',
    })

    lenis.on('scroll', ScrollTrigger.update)

    const updateTicker = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(updateTicker)
    gsap.ticker.lagSmoothing(0)

    return () => {
      iosActive = false
      window.clearTimeout(iosStopTimer)
      if (iosRaf) cancelAnimationFrame(iosRaf)
      if (iosFix) {
        window.removeEventListener('scroll', startIosPulse)
        window.removeEventListener('touchmove', startIosPulse)
      }
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
