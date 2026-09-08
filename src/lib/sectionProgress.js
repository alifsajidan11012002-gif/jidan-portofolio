export function getSectionProgress(section) {
  if (!section) return 0
  const max = section.offsetHeight - window.innerHeight
  if (max <= 1) return 0
  return Math.min(1, Math.max(0, -section.getBoundingClientRect().top / max))
}

export function startSectionProgressLoop(section, onProgress) {
  if (!section) return () => {}

  let raf = 0
  let inView = true
  let last = -1

  const publish = () => {
    const next = getSectionProgress(section)
    if (Math.abs(next - last) < 0.0008) return
    last = next
    onProgress(next)
  }

  const tick = () => {
    publish()
    if (inView) raf = requestAnimationFrame(tick)
    else raf = 0
  }

  const start = () => {
    if (!raf) raf = requestAnimationFrame(tick)
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      inView = Boolean(entry?.isIntersecting)
      if (inView) {
        last = -1
        start()
      }
    },
    { threshold: 0 }
  )

  observer.observe(section)
  window.addEventListener('scroll', start, { passive: true })
  window.addEventListener('touchmove', start, { passive: true })
  window.addEventListener('touchend', start, { passive: true })
  start()

  return () => {
    inView = false
    if (raf) cancelAnimationFrame(raf)
    observer.disconnect()
    window.removeEventListener('scroll', start)
    window.removeEventListener('touchmove', start)
    window.removeEventListener('touchend', start)
  }
}