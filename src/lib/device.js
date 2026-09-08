export function isIOS() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const iOSDevice = /iP(hone|od|ad)/.test(ua)
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return iOSDevice || iPadOS
}

export function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return (
    isIOS() ||
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  )
}

export function prefersNativeScroll() {
  return isIOS() || isTouchDevice()
}
