export const FRAME_SIZE = { w: 1920, h: 1080 }

// Normalized to the 1920x1080 hero plate. Diameter is a fraction of image height.
export const HEAD = { x: 0.468, y: 0.356, d: 0.286 }

export function getCoverHead(vw = window.innerWidth, vh = window.innerHeight) {
  const imgRatio = FRAME_SIZE.w / FRAME_SIZE.h
  const viewRatio = vw / vh
  let drawW
  let drawH
  let offsetX
  let offsetY

  // Contain: full photo, no crop/zoom.
  if (imgRatio > viewRatio) {
    drawW = vw
    drawH = vw / imgRatio
    offsetX = 0
    offsetY = (vh - drawH) / 2
  } else {
    drawH = vh
    drawW = vh * imgRatio
    offsetX = (vw - drawW) / 2
    offsetY = 0
  }

  const x = offsetX + HEAD.x * drawW
  const y = offsetY + HEAD.y * drawH
  const d = HEAD.d * drawH

  return {
    x,
    y,
    d,
    xPercent: (x / vw) * 100,
    yPercent: (y / vh) * 100,
  }
}
