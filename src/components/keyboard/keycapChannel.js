export function createKeycapChannel(row, index = 0) {
  return {
    row,
    index,
    hover: { emissive: 0 },
    fx: { wave: 0, waveScale: 0, blink: 0, pulse: 0, pulseScale: 0 },
    materials: [],
    visual: null,
    intro: null,
  }
}
