export function isIOS() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const iOSDevice = /iP(hone|od|ad)/.test(ua)
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return iOSDevice || iPadOS
}

export function needsIosScrollFix() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  if (isIOS()) return true
  const ua = navigator.userAgent || ''
  if (/Android/i.test(ua)) return false
  if (/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) return true
  return /AppleWebKit/.test(ua) && navigator.maxTouchPoints > 1
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

export function isPhonePortrait() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(orientation: portrait) and (max-width: 900px)').matches
}

export function isPhoneLandscape() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(orientation: landscape) and (max-height: 540px)').matches
}

export function syncPhoneOrientation() {
  if (typeof document === 'undefined') return { portrait: false, landscape: false }
  const portrait = isPhonePortrait()
  const landscape = isPhoneLandscape()
  const root = document.documentElement
  root.classList.toggle('is-phone-portrait', portrait)
  root.classList.toggle('is-phone-landscape', landscape)
  root.classList.toggle('is-phone', portrait || landscape)
  return { portrait, landscape }
}
