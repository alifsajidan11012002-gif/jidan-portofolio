export const CARD_IN = 51 / 239
export const CARD_STAGGER = 0.075
export const CARD_FLIGHT = 0.14

const TWO_PI = Math.PI * 2

export function smoothstep(start, end, value) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)))
  return t * t * (3 - 2 * t)
}

function easeInOutSine(t) {
  return 0.5 - 0.5 * Math.cos(t * Math.PI)
}

export function getSteppedSpin(progress, count) {
  const t = smoothstep(CARD_IN, 1, progress)
  const scaled = t * Math.max(1, count - 1)
  const slot = Math.min(count - 2, Math.floor(scaled))
  const local = scaled - slot
  const eased = easeInOutSine(local)
  return ((slot + eased) / count) * TWO_PI
}
