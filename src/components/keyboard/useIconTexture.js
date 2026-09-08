import { createElement, useEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { CanvasTexture, SRGBColorSpace } from 'three'

const TEX_SIZE = 256

function iconToSvg(Icon, color) {
  const host = document.createElement('div')
  const root = createRoot(host)
  flushSync(() => {
    root.render(createElement(Icon, { size: TEX_SIZE, color }))
  })
  let svg = host.innerHTML
  root.unmount()
  if (!svg.includes('xmlns=')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  return svg
}

export default function useIconTexture(Icon, color = '#ffffff') {
  const texture = useMemo(() => {
    if (!Icon) return null

    const canvas = document.createElement('canvas')
    canvas.width = TEX_SIZE
    canvas.height = TEX_SIZE
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 8
    tex.premultiplyAlpha = false

    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, TEX_SIZE, TEX_SIZE)
      ctx.drawImage(img, 0, 0, TEX_SIZE, TEX_SIZE)
      tex.needsUpdate = true
    }
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconToSvg(Icon, color))}`
    return tex
  }, [Icon, color])

  useEffect(() => () => texture?.dispose(), [texture])

  return texture
}
