import { useEffect, useRef } from 'react'

const FRAME_SOURCES = [1, 20, 40, 70, 100, 130, 160, 190, 220].map(
  (n) => `/frames/ezgif-frame-${String(n).padStart(3, '0')}.jpg`
)

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r)
    return
  }
  ctx.rect(x, y, w, h)
}

function fillRound(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color
  roundedRect(ctx, x, y, w, h, r)
  ctx.fill()
}

function clipRound(ctx, x, y, w, h, r, draw) {
  ctx.save()
  roundedRect(ctx, x, y, w, h, r)
  ctx.clip()
  draw()
  ctx.restore()
}

function readyFrames(frames) {
  return frames.filter((img) => img?.complete && img.naturalWidth > 0)
}

function drawCover(ctx, img, x, y, w, h) {
  if (!img?.complete || !img.naturalWidth) return false
  const ir = img.naturalWidth / img.naturalHeight
  const cr = w / h
  let dw
  let dh
  let dx
  let dy
  if (ir > cr) {
    dh = h
    dw = h * ir
    dx = x - (dw - w) / 2
    dy = y
  } else {
    dw = w
    dh = w / ir
    dx = x
    dy = y - (dh - h) / 2
  }
  ctx.drawImage(img, dx, dy, dw, dh)
  return true
}

function sceneIndex(t, length = 2, hold = 3.4) {
  return Math.floor(t / hold) % length
}

function typeText(text, t, speed = 14) {
  return text.slice(0, Math.min(text.length, Math.floor(t * speed)))
}

function drawAi(ctx, w, h, t) {
  ctx.fillStyle = '#061018'
  ctx.fillRect(0, 0, w, h)
  const scene = sceneIndex(t)

  if (scene === 0) {
    fillRound(ctx, 8, 8, w - 16, 20, 6, '#0b2430')
    ctx.fillStyle = '#00e5ff'
    ctx.font = '700 9px Space Grotesk, monospace'
    ctx.fillText('JIDAN  ·  STUDIO AGENT', 16, 22)

    const prompt = typeText('Buatkan agent yang cek stok & balas chat customer.', t % 3.4, 16)
    fillRound(ctx, 10, 34, w * 0.78, 26, 8, '#123040')
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = '9px Space Grotesk, monospace'
    ctx.fillText(prompt || ' ', 16, 51)

    const reply = typeText('Siap. Agent aktif. 3 tool terhubung: stok, chat, rute.', (t % 3.4) - 0.8, 15)
    fillRound(ctx, w * 0.16, 66, w * 0.78, 40, 8, '#05313c')
    ctx.fillStyle = '#9ef2ff'
    ctx.fillText(reply || '▌', w * 0.16 + 8, 82)
    ctx.fillStyle = 'rgba(0,229,255,0.55)'
    ctx.font = '8px Space Grotesk, monospace'
    ctx.fillText('model  jidan-lite  ·  48 tok/s', w * 0.16 + 8, 96)
    return
  }

  const cx = w * 0.5
  const cy = h * 0.46
  for (let ring = 1; ring <= 3; ring += 1) {
    ctx.strokeStyle = `rgba(0,229,255,${0.12 * ring})`
    ctx.beginPath()
    ctx.arc(cx, cy, 16 + ring * 16, 0, Math.PI * 2)
    ctx.stroke()
  }
  for (let i = 0; i < 10; i += 1) {
    const a = t * 1.3 + i * 0.63
    const r = 22 + (i % 3) * 16
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a * 1.1) * r * 0.72
    ctx.fillStyle = i % 2 ? '#00e5ff' : '#7af0ff'
    ctx.beginPath()
    ctx.arc(x, y, 2.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,229,255,0.25)'
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  ctx.fillStyle = '#d9fbff'
  ctx.font = '700 11px Outfit, sans-serif'
  ctx.fillText('thinking… routing tools', 16, h - 14)
}

function drawHeart(ctx, x, y, size, color, alpha = 1) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size, size)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 3.2)
  ctx.bezierCurveTo(-5.4, -0.6, -4.2, -6.2, 0, -3.6)
  ctx.bezierCurveTo(4.2, -6.2, 5.4, -0.6, 0, 3.2)
  ctx.fill()
  ctx.restore()
}

function drawBill(ctx, x, y, rot, scale) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#1b7a3c'
  fillRound(ctx, -16, -9, 32, 18, 2, '#1b7a3c')
  ctx.strokeStyle = 'rgba(210,255,220,0.7)'
  ctx.lineWidth = 1
  roundedRect(ctx, -14, -7, 28, 14, 1.5)
  ctx.stroke()
  ctx.fillStyle = '#e8ffe9'
  ctx.font = '800 9px Outfit, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('$', 0, 3)
  ctx.restore()
  ctx.textAlign = 'left'
}

function drawWalker(ctx, x, y, scale, phase, tone) {
  const swing = Math.sin(phase) * 5.5
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = tone
  ctx.beginPath()
  ctx.arc(0, -20, 4.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(-3.4, -15, 6.8, 11)
  ctx.save()
  ctx.translate(-2, -3)
  ctx.rotate(-swing * 0.09)
  ctx.fillRect(-1.2, 0, 2.4, 11)
  ctx.restore()
  ctx.save()
  ctx.translate(2, -3)
  ctx.rotate(swing * 0.09)
  ctx.fillRect(-1.2, 0, 2.4, 11)
  ctx.restore()
  ctx.fillStyle = '#ff2a85'
  ctx.fillRect(4.2, -10, 5, 6)
  ctx.restore()
}

function drawIgDot(ctx, x, y, r) {
  const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r)
  grad.addColorStop(0, '#f9ce34')
  grad.addColorStop(0.45, '#ee2a7b')
  grad.addColorStop(1, '#6228d7')
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
}

function drawMarketing(ctx, w, h, t, frames) {
  const hold = 4.1
  const scene = sceneIndex(t, 3, hold)
  const local = t % hold
  const shots = readyFrames(frames)
  ctx.fillStyle = '#0b0508'
  ctx.fillRect(0, 0, w, h)

  if (scene === 0) {
    fillRound(ctx, 0, 0, w, 20, 0, '#121212')
    drawIgDot(ctx, 14, 10, 5)
    ctx.fillStyle = '#fff'
    ctx.font = '700 10px Outfit, sans-serif'
    ctx.fillText('Instagram', 24, 14)
    ctx.fillStyle = '#ff4d8d'
    ctx.font = '9px Outfit, sans-serif'
    ctx.fillText('♥  ▹', w - 36, 14)

    fillRound(ctx, 0, 20, w, 42, 0, '#161616')
    clipRound(ctx, 10, 26, 28, 28, 14, () => {
      const face = shots[0]
      if (!drawCover(ctx, face, 10, 26, 28, 28)) {
        ctx.fillStyle = '#3a1524'
        ctx.fillRect(10, 26, 28, 28)
      }
    })
    ctx.strokeStyle = '#ee2a7b'
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.arc(24, 40, 15, 0, Math.PI * 2)
    ctx.stroke()

    const followers = (84.2 + local * 2.4).toFixed(1)
    const likesLive = 1200 + Math.floor(local * 380)
    ctx.fillStyle = '#fff'
    ctx.font = '800 10px Outfit, sans-serif'
    ctx.fillText('48', 50, 36)
    ctx.fillText(followers + 'K', 86, 36)
    ctx.fillText('214', 148, 36)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '7px Space Grotesk, monospace'
    ctx.fillText('posts', 50, 48)
    ctx.fillText('followers', 86, 48)
    ctx.fillText('following', 148, 48)

    ctx.fillStyle = '#fff'
    ctx.font = '700 8px Outfit, sans-serif'
    ctx.fillText('@dann_ji11  ✓', 10, 70)
    ctx.fillStyle = '#ff8fb8'
    ctx.font = '7px Space Grotesk, monospace'
    ctx.fillText('Night drop · live ads · sold out', 10, 81)

    const gridY = 88
    const cols = 3
    const gap = 2
    const cellW = (w - gap * 4) / cols
    const cellH = (h - gridY - 4) / 2
    for (let i = 0; i < 6; i += 1) {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = gap + col * (cellW + gap)
      const y = gridY + row * (cellH + gap)
      const img = shots[(i + Math.floor(t * 0.7)) % Math.max(shots.length, 1)]
      clipRound(ctx, x, y, cellW, cellH, 0, () => {
        if (!drawCover(ctx, img, x, y, cellW, cellH)) {
          ctx.fillStyle = '#2a1018'
          ctx.fillRect(x, y, cellW, cellH)
        }
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.fillRect(x, y + cellH - 14, cellW, 14)
      })
      const likes = 840 + i * 130 + Math.floor(local * (40 + i * 8))
      ctx.fillStyle = '#fff'
      ctx.font = '700 7px Outfit, sans-serif'
      ctx.fillText(`♥ ${likes}`, x + 4, y + cellH - 4)
    }

    const burst = 10 + Math.floor(local * 3)
    for (let i = 0; i < burst; i += 1) {
      const drift = (local * 22 + i * 17) % (h * 0.7)
      const x = 18 + ((i * 37 + local * 8) % (w - 36))
      const y = h - 10 - drift
      const pop = 0.7 + (i % 4) * 0.18
      drawHeart(ctx, x, y, pop, i % 2 ? '#ff2a85' : '#ff6aa8', 0.35 + (i % 3) * 0.2)
    }

    if (local > 1.7) {
      const open = Math.min(1, (local - 1.7) / 0.35)
      const ox = w * 0.12
      const oy = 28
      const ow = w * 0.76
      const oh = h * 0.62
      ctx.save()
      ctx.globalAlpha = open
      fillRound(ctx, ox, oy, ow, oh, 8, '#111')
      clipRound(ctx, ox + 4, oy + 4, ow - 8, oh - 28, 6, () => {
        const hero = shots[Math.floor(t * 3) % Math.max(shots.length, 1)]
        drawCover(ctx, hero, ox + 4, oy + 4, ow - 8, oh - 28)
      })
      ctx.fillStyle = '#fff'
      ctx.font = '700 8px Outfit, sans-serif'
      ctx.fillText(`@dann_ji11   ♥ ${likesLive.toLocaleString('en-US')}`, ox + 10, oy + oh - 10)
      const pulse = 1.2 + Math.sin(local * 8) * 0.25
      drawHeart(ctx, w * 0.5, h * 0.46, pulse * 2.4, '#ff2a85', 0.55 + Math.sin(local * 6) * 0.2)
      ctx.restore()
    }
    return
  }

  if (scene === 1) {
    const backdrop = shots[3] || shots[0]
    if (backdrop) {
      ctx.globalAlpha = 0.28
      drawCover(ctx, backdrop, 0, 0, w, h)
      ctx.globalAlpha = 1
    }
    ctx.fillStyle = 'rgba(8, 20, 12, 0.72)'
    ctx.fillRect(0, 0, w, h)

    const revenue = 860 + Math.floor(local * 1480)
    fillRound(ctx, 10, 8, w - 20, 28, 8, '#12351f')
    ctx.fillStyle = '#7dffb0'
    ctx.font = '700 9px Space Grotesk, monospace'
    ctx.fillText('PENJUALAN  LIVE', 18, 19)
    ctx.fillStyle = '#e8ffe9'
    ctx.font = '800 13px Outfit, sans-serif'
    ctx.fillText(`$${revenue.toLocaleString('en-US')}`, 18, 32)

    fillRound(ctx, w - 78, 12, 60, 20, 10, '#1f7a3c')
    ctx.fillStyle = '#d8ffe4'
    ctx.font = '800 8px Outfit, sans-serif'
    ctx.fillText('PROFIT ▲', w - 68, 25)

    const bills = 22
    for (let i = 0; i < bills; i += 1) {
      const fall = ((local * 70 + i * 23) % (h + 40)) - 16
      const x = 8 + ((i * 41 + Math.sin(local + i) * 10) % (w - 16))
      const rot = Math.sin(local * 2.2 + i) * 0.7
      const scale = 0.7 + (i % 4) * 0.18
      drawBill(ctx, x, fall, rot, scale)
    }

    const tickets = [
      { id: '#1842', pay: '$49', delay: 0.2 },
      { id: '#1848', pay: '$29', delay: 0.9 },
      { id: '#1855', pay: '$79', delay: 1.7 },
      { id: '#1861', pay: '$39', delay: 2.5 },
    ]
    tickets.forEach((ticket, i) => {
      if (local < ticket.delay) return
      const age = local - ticket.delay
      const y = 44 + i * 22 + Math.min(0, 8 - age * 18)
      ctx.globalAlpha = Math.min(1, age * 3)
      fillRound(ctx, 12, y, 118, 18, 6, 'rgba(20,70,40,0.88)')
      ctx.fillStyle = '#d8ffe4'
      ctx.font = '700 8px Space Grotesk, monospace'
      ctx.fillText(`ORDER ${ticket.id}   ${ticket.pay}`, 20, y + 12)
      ctx.globalAlpha = 1
    })

    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '700 8px Outfit, sans-serif'
    ctx.fillText('uang dollar berjatuhan', 12, h - 10)
    return
  }

  ctx.fillStyle = '#12080c'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#1c1014'
  ctx.fillRect(0, h * 0.62, w, h * 0.38)
  ctx.fillStyle = 'rgba(255,42,133,0.12)'
  ctx.fillRect(0, h * 0.62, w, 2)

  const stallX = w * 0.32
  const stallW = w * 0.36
  fillRound(ctx, stallX, h * 0.18, stallW, h * 0.46, 6, '#2a1218')
  ctx.fillStyle = '#ff2a85'
  ctx.beginPath()
  ctx.moveTo(stallX - 8, h * 0.2)
  ctx.lineTo(stallX + stallW + 8, h * 0.2)
  ctx.lineTo(stallX + stallW, h * 0.12)
  ctx.lineTo(stallX, h * 0.12)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = '800 8px Outfit, sans-serif'
  ctx.fillText('DROP  LIVE', stallX + 14, h * 0.18)

  clipRound(ctx, stallX + 8, h * 0.24, stallW - 16, h * 0.22, 4, () => {
    const product = shots[1] || shots[0]
    if (!drawCover(ctx, product, stallX + 8, h * 0.24, stallW - 16, h * 0.22)) {
      ctx.fillStyle = '#401820'
      ctx.fillRect(stallX + 8, h * 0.24, stallW - 16, h * 0.22)
    }
  })
  fillRound(ctx, stallX + 10, h * 0.5, stallW - 20, 14, 7, '#ff2a85')
  ctx.fillStyle = '#1a080e'
  ctx.font = '800 7px Outfit, sans-serif'
  ctx.fillText('BELI SEKARANG', stallX + 18, h * 0.59)

  const sold = 120 + Math.floor(local * 86)
  fillRound(ctx, 8, 8, 86, 20, 8, '#3a1020')
  ctx.fillStyle = '#ffd0e2'
  ctx.font = '700 8px Outfit, sans-serif'
  ctx.fillText(`${sold}  ORANG BELI`, 16, 21)

  fillRound(ctx, w - 78, 8, 70, 20, 8, '#12351f')
  ctx.fillStyle = '#7dffb0'
  ctx.font = '800 8px Outfit, sans-serif'
  ctx.fillText('SOLD  ▲', w - 62, 21)

  const crowd = 14
  for (let i = 0; i < crowd; i += 1) {
    const fromLeft = i % 2 === 0
    const speed = 18 + (i % 5) * 6
    const travel = ((local * speed + i * 21) % (w * 0.9)) 
    const x = fromLeft ? 8 + travel * 0.72 : w - 8 - travel * 0.72
    const depth = 0.7 + (i % 4) * 0.14
    const y = h * 0.78 + (i % 3) * 7
    const tone = i % 3 === 0 ? '#2a1a20' : i % 3 === 1 ? '#3d2430' : '#1a1014'
    drawWalker(ctx, x, y, depth, t * 8 + i, tone)
  }

  ctx.fillStyle = 'rgba(255,208,226,0.8)'
  ctx.font = '700 8px Outfit, sans-serif'
  ctx.fillText('berbondong-bondong ke etalase', 10, h - 8)
}

function drawYtMark(ctx, x, y, s) {
  fillRound(ctx, x - s * 1.15, y - s * 0.72, s * 2.3, s * 1.44, s * 0.28, '#ff0033')
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.moveTo(x - s * 0.28, y - s * 0.38)
  ctx.lineTo(x + s * 0.46, y)
  ctx.lineTo(x - s * 0.28, y + s * 0.38)
  ctx.closePath()
  ctx.fill()
}

function drawTtMark(ctx, x, y, s) {
  ctx.save()
  ctx.translate(x, y)
  ctx.font = `800 ${Math.round(s * 1.8)}px Outfit, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillStyle = '#25f4ee'
  ctx.fillText('♪', 1.2, s * 0.55)
  ctx.fillStyle = '#fe2c55'
  ctx.fillText('♪', -1.2, s * 0.55)
  ctx.fillStyle = '#fff'
  ctx.fillText('♪', 0, s * 0.55)
  ctx.restore()
  ctx.textAlign = 'left'
}

function drawVideo(ctx, w, h, t, frames) {
  const hold = 4.2
  const scene = sceneIndex(t, 3, hold)
  const local = t % hold
  const shots = readyFrames(frames)

  if (scene === 0) {
    ctx.fillStyle = '#0b0b10'
    ctx.fillRect(0, 0, w, h)

    fillRound(ctx, 0, 0, w, 18, 0, '#14141c')
    ctx.fillStyle = '#fff'
    ctx.font = '800 8px Outfit, sans-serif'
    ctx.fillText('CapCut', 10, 13)
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '7px Space Grotesk, monospace'
    ctx.fillText('promo-final.mp4', 52, 13)
    fillRound(ctx, w - 58, 3, 50, 12, 6, '#c77dff')
    ctx.fillStyle = '#16081f'
    ctx.font = '800 7px Outfit, sans-serif'
    ctx.fillText('EXPORT', w - 48, 12)

    const tools = ['✂', 'T', '✦', '♪', '◈']
    tools.forEach((icon, i) => {
      fillRound(ctx, 4, 24 + i * 18, 16, 16, 4, i === Math.floor(local) % 5 ? '#2a1840' : '#16161f')
      ctx.fillStyle = '#e2c4ff'
      ctx.font = '8px Outfit, sans-serif'
      ctx.fillText(icon, 8, 35 + i * 18)
    })

    const px = 24
    const py = 22
    const pw = w - 32
    const ph = h * 0.52
    fillRound(ctx, px, py, pw, ph, 6, '#08080c')
    clipRound(ctx, px + 2, py + 2, pw - 4, ph - 4, 5, () => {
      const cutSpeed = local > 1.6 ? 14 : 7
      const preview = shots[Math.floor(t * cutSpeed) % Math.max(shots.length, 1)]
      if (!drawCover(ctx, preview, px + 2, py + 2, pw - 4, ph - 4)) {
        ctx.fillStyle = '#22142e'
        ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4)
      }
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(px + 2, py + 2, pw - 4, 8)
      ctx.fillRect(px + 2, py + ph - 10, pw - 4, 8)
      if (local > 0.8) {
        ctx.fillStyle = local > 2.2 ? 'rgba(199,125,255,0.22)' : 'rgba(255,255,255,0.04)'
        ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4)
      }
      const flash = Math.sin(t * 16) > 0.88
      if (flash) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4)
      }
      if (local > 1.1) {
        const slide = Math.min(1, (local - 1.1) / 0.35)
        ctx.fillStyle = `rgba(255,255,255,${0.92 * slide})`
        ctx.font = '800 14px Outfit, sans-serif'
        ctx.fillText('NIGHT DROP', px + 12, py + ph * 0.58)
        ctx.fillStyle = `rgba(199,125,255,${0.9 * slide})`
        ctx.font = '700 8px Space Grotesk, monospace'
        ctx.fillText('CUT ON BEAT  ·  24fps', px + 12, py + ph * 0.72)
      }
    })

    const trackY = h * 0.68
    fillRound(ctx, 6, trackY, w - 12, h * 0.3, 5, '#12121a')
    const clipW = (w - 24) / 7
    for (let i = 0; i < 7; i += 1) {
      const x = 10 + i * clipW
      clipRound(ctx, x, trackY + 5, clipW - 3, 16, 2, () => {
        const img = shots[i % Math.max(shots.length, 1)]
        if (!drawCover(ctx, img, x, trackY + 5, clipW - 3, 16)) {
          ctx.fillStyle = '#2a1840'
          ctx.fillRect(x, trackY + 5, clipW - 3, 16)
        }
      })
    }
    for (let i = 0; i < 28; i += 1) {
      const amp = 3 + Math.abs(Math.sin(t * 6 + i * 0.5)) * 6
      ctx.fillStyle = '#c77dff'
      ctx.fillRect(10 + i * ((w - 28) / 28), trackY + 32 - amp * 0.4, 2, amp)
    }
    const playhead = 10 + ((local / hold) * (w - 28))
    ctx.fillStyle = '#ff4d6d'
    ctx.fillRect(playhead, trackY + 2, 1.6, h * 0.26)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '7px Space Grotesk, monospace'
    ctx.fillText(local > 2.6 ? 'auto captions  ·  color grade' : 'trim  ·  beat detect', 10, h - 6)
    return
  }

  if (scene === 1) {
    ctx.fillStyle = '#0c0c12'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#e2c4ff'
    ctx.font = '800 9px Outfit, sans-serif'
    ctx.fillText('UPLOAD  KE  2 PLATFORM', 10, 16)

    const cards = [
      { x: 8, label: 'YouTube', color: '#ff0033', progress: Math.min(1, local / 2.1) },
      { x: w * 0.5 + 2, label: 'TikTok', color: '#fe2c55', progress: Math.min(1, (local - 0.35) / 2.1) },
    ]
    cards.forEach((card, i) => {
      const cw = w * 0.46
      fillRound(ctx, card.x, 24, cw, h - 36, 8, '#16161f')
      if (i === 0) drawYtMark(ctx, card.x + 16, 38, 6)
      else drawTtMark(ctx, card.x + 16, 38, 7)
      ctx.fillStyle = '#fff'
      ctx.font = '700 8px Outfit, sans-serif'
      ctx.fillText(card.label, card.x + 30, 41)
      clipRound(ctx, card.x + 8, 50, cw - 16, h * 0.32, 5, () => {
        const thumb = shots[(i + Math.floor(t * 4)) % Math.max(shots.length, 1)]
        if (!drawCover(ctx, thumb, card.x + 8, 50, cw - 16, h * 0.32)) {
          ctx.fillStyle = '#22142e'
          ctx.fillRect(card.x + 8, 50, cw - 16, h * 0.32)
        }
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.fillRect(card.x + 8, 50, cw - 16, h * 0.32)
        if (i === 0) drawYtMark(ctx, card.x + cw / 2, 50 + h * 0.16, 8)
        else drawTtMark(ctx, card.x + cw / 2, 50 + h * 0.16, 9)
      })
      fillRound(ctx, card.x + 8, h - 48, cw - 16, 8, 4, '#2a2a36')
      fillRound(ctx, card.x + 8, h - 48, (cw - 16) * Math.max(0, card.progress), 8, 4, card.color)
      ctx.fillStyle = card.progress >= 1 ? '#9ef2c4' : '#d7c4ff'
      ctx.font = '700 7px Space Grotesk, monospace'
      ctx.fillText(
        card.progress >= 1 ? 'PUBLISHED ✓' : `uploading  ${Math.floor(Math.max(0, card.progress) * 100)}%`,
        card.x + 10,
        h - 28
      )
    })
    return
  }

  ctx.fillStyle = '#100814'
  ctx.fillRect(0, 0, w, h)
  const ytViews = 18000 + Math.floor(local * 42000)
  const ttViews = 64000 + Math.floor(local * 88000)
  const likes = 2400 + Math.floor(local * 6200)

  fillRound(ctx, 8, 8, w * 0.46, 52, 8, '#1a0c14')
  drawYtMark(ctx, 22, 22, 6)
  ctx.fillStyle = '#ffb3c0'
  ctx.font = '7px Space Grotesk, monospace'
  ctx.fillText('YouTube', 34, 18)
  ctx.fillStyle = '#fff'
  ctx.font = '800 12px Outfit, sans-serif'
  ctx.fillText(`${(ytViews / 1000).toFixed(1)}K`, 14, 40)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '7px Space Grotesk, monospace'
  ctx.fillText('views  ·  trending', 14, 52)

  fillRound(ctx, w * 0.52, 8, w * 0.44, 52, 8, '#180814')
  drawTtMark(ctx, w * 0.52 + 16, 22, 7)
  ctx.fillStyle = '#ff8fb0'
  ctx.font = '7px Space Grotesk, monospace'
  ctx.fillText('TikTok FYP', w * 0.52 + 28, 18)
  ctx.fillStyle = '#fff'
  ctx.font = '800 12px Outfit, sans-serif'
  ctx.fillText(`${(ttViews / 1000).toFixed(1)}K`, w * 0.52 + 10, 40)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '7px Space Grotesk, monospace'
  ctx.fillText('views  ·  For You', w * 0.52 + 10, 52)

  fillRound(ctx, 8, 68, w - 16, 28, 8, '#22142e')
  ctx.fillStyle = '#e2c4ff'
  ctx.font = '800 10px Outfit, sans-serif'
  ctx.fillText(`♥  ${likes.toLocaleString('en-US')}  likes`, 16, 80)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '7px Space Grotesk, monospace'
  ctx.fillText('komentar + share meledak', 16, 90)

  const notes = 12
  for (let i = 0; i < notes; i += 1) {
    const y = h - 8 - ((local * 28 + i * 14) % (h * 0.42))
    const x = 16 + ((i * 29 + local * 10) % (w - 32))
    if (i % 2 === 0) drawHeart(ctx, x, y, 0.85, '#fe2c55', 0.45 + (i % 3) * 0.15)
    else {
      ctx.fillStyle = `rgba(37,244,238,${0.35 + (i % 3) * 0.15})`
      ctx.font = '10px Outfit, sans-serif'
      ctx.fillText('♪', x, y)
    }
  }

  if (local > 1.4) {
    const pop = Math.min(1, (local - 1.4) / 0.3)
    ctx.save()
    ctx.globalAlpha = pop
    fillRound(ctx, w * 0.14, h * 0.58, w * 0.72, 36, 10, '#2a1040')
    ctx.fillStyle = '#fff'
    ctx.font = '800 11px Outfit, sans-serif'
    ctx.fillText('★  TERKENAL', w * 0.22, h * 0.58 + 15)
    ctx.fillStyle = '#c77dff'
    ctx.font = '7px Space Grotesk, monospace'
    ctx.fillText('1M+ reach  ·  creator verified', w * 0.22, h * 0.58 + 28)
    ctx.restore()
  }
}

function drawBurger(ctx, x, y, scale) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#c47a28'
  ctx.beginPath()
  ctx.ellipse(0, -10, 18, 9, 0, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff3c4'
  ;[[-8, -13], [-2, -15], [6, -12]].forEach(([sx, sy]) => {
    ctx.beginPath()
    ctx.ellipse(sx, sy, 1.4, 0.8, 0.4, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#5aa13a'
  ctx.beginPath()
  ctx.ellipse(0, -2, 17, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffc107'
  ctx.fillRect(-16, 0, 32, 4)
  ctx.fillStyle = '#6b2a12'
  fillRound(ctx, -15, 4, 30, 7, 2, '#6b2a12')
  ctx.fillStyle = '#d08932'
  fillRound(ctx, -16, 11, 32, 6, 2, '#d08932')
  ctx.restore()
}

function drawFries(ctx, x, y, scale) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#e23b2f'
  fillRound(ctx, -9, 4, 18, 16, 2, '#e23b2f')
  ctx.fillStyle = '#ffd166'
  ;[-6, -2, 2, 6].forEach((fx, i) => {
    ctx.fillRect(fx, -10 + (i % 2), 3.2, 16)
  })
  ctx.fillStyle = '#fff6d8'
  ctx.font = '800 5px Outfit, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('FRIES', 0, 14)
  ctx.restore()
  ctx.textAlign = 'left'
}

function drawDrink(ctx, x, y, scale) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#7b1e12'
  ctx.beginPath()
  ctx.moveTo(-7, -8)
  ctx.lineTo(7, -8)
  ctx.lineTo(5, 14)
  ctx.lineTo(-5, 14)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#ff4d4d'
  ctx.fillRect(-8, -10, 16, 4)
  ctx.strokeStyle = '#fff6d8'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(3, -10)
  ctx.lineTo(6, -20)
  ctx.stroke()
  ctx.restore()
}

function drawDiscountBurst(ctx, x, y, scale, spin) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(spin)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#ff2a2a'
  ctx.beginPath()
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2
    const r = i % 2 === 0 ? 22 : 14
    const px = Math.cos(a) * r
    const py = Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fff6d8'
  ctx.font = '800 9px Outfit, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('DISKON', 0, -2)
  ctx.font = '900 12px Outfit, sans-serif'
  ctx.fillText('50%', 0, 12)
  ctx.restore()
  ctx.textAlign = 'left'
}

function drawFoodPoster(ctx, x, y, fw, fh, local, showDiscount, pulse) {
  fillRound(ctx, x, y, fw, fh, 8, '#8b1e12')
  ctx.fillStyle = '#ffd166'
  ctx.fillRect(x, y, fw, 7)
  ctx.fillStyle = '#fff6d8'
  ctx.font = '800 8px Outfit, sans-serif'
  ctx.fillText('MENU  HARI INI', x + 8, y + 20)

  drawBurger(ctx, x + fw * 0.38, y + fh * 0.4, 1.15)
  drawFries(ctx, x + fw * 0.78, y + fh * 0.42, 0.85)
  drawDrink(ctx, x + fw * 0.14, y + fh * 0.4, 0.8)

  ctx.fillStyle = '#fff6d8'
  ctx.font = '900 16px Outfit, sans-serif'
  ctx.fillText('SMASH', x + 10, y + fh * 0.68)
  ctx.fillText('BURGER', x + 10, y + fh * 0.68 + 16)

  ctx.fillStyle = 'rgba(255,246,216,0.55)'
  ctx.font = '7px Space Grotesk, monospace'
  ctx.fillText('Rp 35.000', x + 12, y + fh * 0.68 + 30)
  ctx.strokeStyle = '#ffd166'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(x + 12, y + fh * 0.68 + 26)
  ctx.lineTo(x + 58, y + fh * 0.68 + 32)
  ctx.stroke()

  ctx.fillStyle = '#ffd166'
  ctx.font = '900 14px Outfit, sans-serif'
  ctx.fillText('Rp 17.000', x + 12, y + fh - 12)

  fillRound(ctx, x + fw - 64, y + fh - 24, 54, 14, 7, '#ffd166')
  ctx.fillStyle = '#5a140c'
  ctx.font = '800 7px Outfit, sans-serif'
  ctx.fillText('PESAN', x + fw - 50, y + fh - 14)

  if (showDiscount) {
    drawDiscountBurst(ctx, x + fw - 28, y + 36, 0.82 + pulse * 0.08, -0.18 + pulse * 0.05)
  }
}

function drawFlyer(ctx, w, h, t) {
  const hold = 4.1
  const scene = sceneIndex(t, 3, hold)
  const local = t % hold

  if (scene === 0) {
    ctx.fillStyle = '#171208'
    ctx.fillRect(0, 0, w, h)
    fillRound(ctx, 4, 6, 20, h - 12, 6, '#2a210d')
    ;['T', '▢', '●', '★'].forEach((icon, i) => {
      ctx.fillStyle = i === Math.floor(local) % 4 ? '#ffd166' : '#c4a15a'
      ctx.font = '9px Outfit, sans-serif'
      ctx.fillText(icon, 9, 26 + i * 20)
    })

    const fx = 30
    const fy = 8
    const fw = w - 38
    const fh = h - 16
    fillRound(ctx, fx, fy, fw, fh, 8, '#24180c')
    ctx.fillStyle = '#ffd166'
    ctx.fillRect(fx, fy, fw, 5)
    ctx.fillStyle = 'rgba(255,246,216,0.4)'
    ctx.font = '7px Space Grotesk, monospace'
    ctx.fillText('Canva  ·  Figma', fx + 8, fy + 16)

    const build = local / hold
    clipRound(ctx, fx + 6, fy + 22, fw - 12, fh - 30, 6, () => {
      fillRound(ctx, fx + 6, fy + 22, fw - 12, fh - 30, 6, '#8b1e12')
      if (build > 0.12) {
        ctx.fillStyle = '#ffd166'
        ctx.fillRect(fx + 6, fy + 22, fw - 12, 6)
      }
      if (build > 0.28) {
        drawBurger(ctx, fx + fw * 0.42, fy + fh * 0.42, Math.min(1, (build - 0.28) * 3))
      }
      if (build > 0.42) {
        drawFries(ctx, fx + fw * 0.78, fy + fh * 0.44, 0.7)
        drawDrink(ctx, fx + fw * 0.16, fy + fh * 0.42, 0.7)
      }
      if (build > 0.58) {
        ctx.fillStyle = '#fff6d8'
        ctx.font = '900 13px Outfit, sans-serif'
        ctx.fillText('SMASH', fx + 14, fy + fh * 0.68)
        ctx.fillText('BURGER', fx + 14, fy + fh * 0.68 + 14)
      }
      if (build > 0.74) {
        ctx.fillStyle = '#ffd166'
        ctx.font = '800 11px Outfit, sans-serif'
        ctx.fillText('Rp 17.000', fx + 14, fy + fh - 18)
      }
    })
    if (build > 0.88) {
      ctx.fillStyle = 'rgba(255,246,216,0.7)'
      ctx.font = '7px Space Grotesk, monospace'
      ctx.fillText('layout siap cetak…', fx + 8, fy + fh - 4)
    }
    return
  }

  if (scene === 1) {
    ctx.fillStyle = '#1a1008'
    ctx.fillRect(0, 0, w, h)
    const pulse = 0.5 + 0.5 * Math.sin(local * 6)
    drawFoodPoster(ctx, 10, 8, w - 20, h - 16, local, true, pulse)
    ctx.fillStyle = `rgba(255,209,102,${0.12 + pulse * 0.12})`
    ctx.fillRect(0, 0, w, h)
    return
  }

  ctx.fillStyle = '#120c06'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#ffd166'
  ctx.font = '800 8px Outfit, sans-serif'
  ctx.fillText('SIAP TAYANG', 10, 16)

  const cards = [
    { x: 8, label: 'Feed' },
    { x: w * 0.36, label: 'Story' },
    { x: w * 0.64, label: 'Print' },
  ]
  cards.forEach((card, i) => {
    const cw = w * 0.3
    const ch = h - 36
    ctx.save()
    ctx.translate(card.x + cw / 2, 26 + ch / 2)
    ctx.rotate((i - 1) * 0.06)
    ctx.translate(-(card.x + cw / 2), -(26 + ch / 2))
    drawFoodPoster(ctx, card.x, 26, cw, ch, local, i !== 1, 0.4)
    ctx.fillStyle = '#fff6d8'
    ctx.font = '700 7px Outfit, sans-serif'
    ctx.fillText(card.label, card.x + 6, 22)
    ctx.restore()
  })
}

function drawAndroidPhone(ctx, x, y, pw, ph, drawScreen) {
  fillRound(ctx, x, y, pw, ph, 14, '#101410')
  ctx.strokeStyle = '#3ddc84'
  ctx.lineWidth = 1.5
  roundedRect(ctx, x, y, pw, ph, 14)
  ctx.stroke()
  fillRound(ctx, x + pw * 0.34, y + 5, pw * 0.32, 3.5, 2, '#1a1a1a')
  clipRound(ctx, x + 4, y + 12, pw - 8, ph - 22, 10, () => {
    ctx.fillStyle = '#0c1610'
    ctx.fillRect(x + 4, y + 12, pw - 8, ph - 22)
    drawScreen(x + 4, y + 12, pw - 8, ph - 22)
  })
}

function drawChatScreen(ctx, sx, sy, sw, sh, local, compact) {
  fillRound(ctx, sx, sy, sw, 16, 0, '#12321f')
  ctx.fillStyle = '#8cffc4'
  ctx.font = '700 7px Outfit, sans-serif'
  ctx.fillText(compact ? 'Abiza · online' : 'Abiza Chat  ·  online', sx + 6, sy + 11)

  const lines = [
    { me: false, text: 'Pak, truk sudah berangkat.', at: 0.15 },
    { me: true, text: 'Oke, saya pantau dari app.', at: 0.85 },
    { me: false, text: 'Lokasi live sudah nyala.', at: 1.55 },
    { me: true, text: 'Siap, saya lacak paketnya.', at: 2.25 },
  ]
  let row = sy + 24
  lines.forEach((line) => {
    if (local < line.at) return
    const bw = Math.min(sw * 0.82, 8 + line.text.length * 3.1)
    const bx = line.me ? sx + sw - bw - 6 : sx + 6
    fillRound(ctx, bx, row, bw, 16, 7, line.me ? '#1d4f34' : '#245a3c')
    ctx.fillStyle = '#d7ffe9'
    ctx.font = '6px Space Grotesk, monospace'
    ctx.fillText(line.text, bx + 5, row + 11)
    row += 20
  })
  if (local > 2.8 && local < 3.4) {
    fillRound(ctx, sx + 6, row, 36, 12, 6, '#163d28')
    ctx.fillStyle = '#8cffc4'
    ctx.font = '7px Outfit, sans-serif'
    ctx.fillText('•••', sx + 16, row + 9)
  }
}

function drawTruck(ctx, x, y, scale, wheelPhase) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#245a3c'
  fillRound(ctx, -6, -18, 40, 16, 2, '#1d4f34')
  ctx.fillStyle = '#3ddc84'
  fillRound(ctx, -30, -20, 26, 18, 3, '#2f8f58')
  ctx.fillStyle = '#0c1610'
  fillRound(ctx, -26, -16, 12, 8, 2, '#0c1610')
  ctx.fillStyle = '#8cffc4'
  ctx.font = '800 6px Outfit, sans-serif'
  ctx.fillText('JIDAN', 4, -7)
  ;[-20, 6, 26].forEach((wx) => {
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(wx, 4, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#3ddc84'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(wx, 4)
    ctx.lineTo(wx + Math.cos(wheelPhase) * 4, 4 + Math.sin(wheelPhase) * 4)
    ctx.stroke()
  })
  ctx.restore()
}

function drawTrackingMap(ctx, x, y, mw, mh, t, withPhoneChrome) {
  const paint = (sx, sy, sw, sh) => {
    ctx.fillStyle = '#102418'
    ctx.fillRect(sx, sy, sw, sh)
    for (let i = 0; i < 7; i += 1) {
      ctx.strokeStyle = 'rgba(61,220,132,0.16)'
      ctx.beginPath()
      ctx.moveTo(sx, sy + 8 + i * 16)
      ctx.lineTo(sx + sw, sy + i * 14)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(sx + i * (sw / 6), sy)
      ctx.lineTo(sx + i * (sw / 7), sy + sh)
      ctx.stroke()
    }
    ctx.strokeStyle = '#3ddc84'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 3])
    ctx.beginPath()
    ctx.moveTo(sx + 8, sy + sh * 0.78)
    ctx.quadraticCurveTo(sx + sw * 0.42, sy + 12, sx + sw - 10, sy + sh * 0.32)
    ctx.stroke()
    ctx.setLineDash([])
    const p = (t % 3.2) / 3.2
    const tx = sx + 8 + (sw - 22) * p
    const ty = sy + sh * 0.78 - Math.sin(p * Math.PI) * (sh * 0.52)
    ctx.fillStyle = '#3ddc84'
    ctx.beginPath()
    ctx.arc(tx, ty, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#d7ffe9'
    ctx.font = '6px Outfit, sans-serif'
    ctx.fillText('TRUK', tx - 8, ty - 8)
    fillRound(ctx, sx + 6, sy + 6, 72, 14, 6, 'rgba(18,50,31,0.88)')
    ctx.fillStyle = '#8cffc4'
    ctx.font = '700 7px Space Grotesk, monospace'
    ctx.fillText('GPS LIVE  ·  ETA 14m', sx + 10, sy + 16)
  }

  if (withPhoneChrome) {
    drawAndroidPhone(ctx, x, y, mw, mh, paint)
    return
  }
  paint(x, y, mw, mh)
}

function drawMobile(ctx, w, h, t, frames) {
  const hold = 3.6
  const scene = sceneIndex(t, 5, hold)
  const local = t % hold
  const shots = readyFrames(frames)
  ctx.fillStyle = '#07130d'
  ctx.fillRect(0, 0, w, h)

  if (scene === 0) {
    ctx.fillStyle = '#8cffc4'
    ctx.font = '800 8px Outfit, sans-serif'
    ctx.fillText('MESSENGER  LIVE', 10, 14)
    drawAndroidPhone(ctx, w * 0.18, 20, w * 0.64, h - 26, (sx, sy, sw, sh) => {
      drawChatScreen(ctx, sx, sy, sw, sh, local, false)
    })
    return
  }

  if (scene === 1) {
    const person = shots[Math.floor(t * 4) % Math.max(shots.length, 1)]
    if (!drawCover(ctx, person, 0, 0, w, h)) {
      ctx.fillStyle = '#102418'
      ctx.fillRect(0, 0, w, h)
    }
    ctx.fillStyle = 'rgba(7,19,13,0.35)'
    ctx.fillRect(0, 0, w, h)
    drawAndroidPhone(ctx, w * 0.52, h * 0.18, w * 0.42, h * 0.74, (sx, sy, sw, sh) => {
      drawChatScreen(ctx, sx, sy, sw, sh, local + 0.4, true)
    })
    ctx.fillStyle = '#d7ffe9'
    ctx.font = '700 8px Outfit, sans-serif'
    ctx.fillText('chatting dari HP', 10, 16)
    return
  }

  if (scene === 2) {
    const sky = ctx.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#163d28')
    sky.addColorStop(0.55, '#0c1610')
    sky.addColorStop(1, '#07130d')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#12321f'
    ctx.fillRect(0, h * 0.68, w, h * 0.32)
    ctx.strokeStyle = 'rgba(141,255,196,0.35)'
    ctx.setLineDash([8, 10])
    ctx.beginPath()
    ctx.moveTo(0, h * 0.78)
    ctx.lineTo(w, h * 0.78)
    ctx.stroke()
    ctx.setLineDash([])
    for (let i = 0; i < 6; i += 1) {
      const bx = ((local * 40 + i * 48) % (w + 40)) - 20
      ctx.fillStyle = '#1d4f34'
      ctx.fillRect(bx, h * 0.48, 18, 22)
    }
    const truckX = 24 + ((local * 38) % (w * 0.7))
    drawTruck(ctx, truckX, h * 0.68, 1.15, local * 10)
    ctx.fillStyle = '#8cffc4'
    ctx.font = '800 8px Outfit, sans-serif'
    ctx.fillText('TRUK  DALAM PERJALANAN', 10, 16)
    ctx.fillStyle = 'rgba(215,255,233,0.6)'
    ctx.font = '7px Space Grotesk, monospace'
    ctx.fillText('JDN-4821  ·  ke gudang B', 10, 28)
    return
  }

  if (scene === 3) {
    const wipe = Math.min(1, local / 0.45)
    if (wipe < 1) {
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#163d28')
      sky.addColorStop(1, '#07130d')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#12321f'
      ctx.fillRect(0, h * 0.68, w, h * 0.32)
      drawTruck(ctx, w * 0.42, h * 0.68, 1.1, local * 10)
    }
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, h * (1 - wipe), w, h * wipe)
    ctx.clip()
    ctx.fillStyle = '#07130d'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#8cffc4'
    ctx.font = '800 8px Outfit, sans-serif'
    ctx.fillText('LACAK TRUK  ·  MAPS', 10, 14)
    drawTrackingMap(ctx, w * 0.16, 20, w * 0.68, h - 28, local, true)
    ctx.restore()
    return
  }

  ctx.fillStyle = '#07130d'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#8cffc4'
  ctx.font = '800 8px Outfit, sans-serif'
  ctx.fillText('LACAK PAKET  ·  ANDROID', 8, 14)
  drawAndroidPhone(ctx, w * 0.16, 20, w * 0.68, h - 26, (sx, sy, sw, sh) => {
    fillRound(ctx, sx, sy, sw, 18, 0, '#12321f')
    ctx.fillStyle = '#d7ffe9'
    ctx.font = '700 7px Outfit, sans-serif'
    ctx.fillText('Resi  GX-4821', sx + 6, sy + 12)
    const steps = ['Diterima', 'Gudang', 'Dikirim', 'Sampai']
    const active = Math.min(3, Math.floor(local / 0.85))
    steps.forEach((label, i) => {
      const y = sy + 28 + i * 22
      ctx.fillStyle = i <= active ? '#3ddc84' : '#1d4f34'
      ctx.beginPath()
      ctx.arc(sx + 12, y + 4, 4, 0, Math.PI * 2)
      ctx.fill()
      if (i < 3) {
        ctx.fillStyle = i < active ? '#3ddc84' : '#1d4f34'
        ctx.fillRect(sx + 11, y + 8, 2, 14)
      }
      ctx.fillStyle = i <= active ? '#d7ffe9' : 'rgba(215,255,233,0.4)'
      ctx.font = '700 7px Outfit, sans-serif'
      ctx.fillText(label, sx + 22, y + 7)
    })
    fillRound(ctx, sx + 6, sy + sh - 28, sw - 12, 20, 6, '#1d4f34')
    ctx.fillStyle = '#8cffc4'
    ctx.font = '700 7px Space Grotesk, monospace'
    ctx.fillText(active >= 3 ? 'Paket sampai gerbang.' : 'Melacak paket…', sx + 12, sy + sh - 15)
  })
}

function drawWeb(ctx, w, h, t) {
  const hold = 3.8
  const scene = sceneIndex(t, 3, hold)
  const local = t % hold
  ctx.fillStyle = '#071018'
  ctx.fillRect(0, 0, w, h)

  if (scene === 0) {
    fillRound(ctx, 8, 8, w - 16, 18, 5, '#122033')
    ctx.fillStyle = '#8ec8ff'
    ctx.font = '700 8px Space Grotesk, monospace'
    ctx.fillText('VS CODE  ·  Hero.jsx', 16, 20)

    const lines = [
      { c: '#6b7c90', t: '// cinematic scroll portfolio' },
      { c: '#4ea3ff', t: 'export default function Hero() {' },
      { c: '#d7e8ff', t: '  useGSAP(() => {' },
      { c: '#7dffb0', t: '    pinViewport()'},
      { c: '#d7e8ff', t: '    scrubFrames(240)' },
      { c: '#4ea3ff', t: '  })' },
    ]
    const shown = Math.min(lines.length, 1 + Math.floor(local * 2.1))
    lines.slice(0, shown).forEach((line, i) => {
      ctx.fillStyle = line.c
      ctx.font = '8px Space Grotesk, monospace'
      ctx.fillText(typeText(line.t, local - i * 0.28, 18) || ' ', 14, 42 + i * 14)
    })
    ctx.fillStyle = '#4ea3ff'
    if (Math.sin(t * 6) > 0) ctx.fillRect(14 + (local * 40) % (w * 0.5), 42 + (shown - 1) * 14, 6, 2)
    return
  }

  if (scene === 1) {
    fillRound(ctx, 10, 8, w - 20, h - 16, 8, '#101820')
    fillRound(ctx, 10, 8, w - 20, 16, 8, '#1a2838')
    ctx.fillStyle = '#ff5f57'
    ctx.beginPath()
    ctx.arc(22, 16, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#febc2e'
    ctx.beginPath()
    ctx.arc(32, 16, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#28c840'
    ctx.beginPath()
    ctx.arc(42, 16, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#8ec8ff'
    ctx.font = '7px Space Grotesk, monospace'
    ctx.fillText('jidan.dev', 56, 19)

    ctx.fillStyle = '#0b1220'
    ctx.fillRect(14, 28, w - 28, h - 42)
    ctx.fillStyle = '#fff'
    ctx.font = '800 13px Outfit, sans-serif'
    ctx.fillText('MUHAMMAD', 22, 52)
    ctx.fillStyle = '#4ea3ff'
    ctx.font = '8px Space Grotesk, monospace'
    ctx.fillText('scroll  ·  live site', 22, 68)
    fillRound(ctx, 22, 80, 54, 14, 6, '#4ea3ff')
    ctx.fillStyle = '#061018'
    ctx.font = '700 7px Outfit, sans-serif'
    ctx.fillText('OPEN', 36, 90)
    return
  }

  fillRound(ctx, 12, 14, w * 0.52, h - 28, 7, '#122033')
  ctx.fillStyle = '#8ec8ff'
  ctx.font = '700 7px Outfit, sans-serif'
  ctx.fillText('DESKTOP', 20, 28)
  ctx.fillStyle = '#4ea3ff'
  ctx.fillRect(20, 36, w * 0.42, 8)
  ctx.fillStyle = '#1d3348'
  ctx.fillRect(20, 50, w * 0.28, 28)

  fillRound(ctx, w * 0.62, 22, w * 0.28, h - 40, 10, '#101820')
  ctx.strokeStyle = '#4ea3ff'
  ctx.lineWidth = 1.4
  roundedRect(ctx, w * 0.62, 22, w * 0.28, h - 40, 10)
  ctx.stroke()
  ctx.fillStyle = '#8ec8ff'
  ctx.font = '7px Outfit, sans-serif'
  ctx.fillText('MOBILE', w * 0.66, 38)
  ctx.fillStyle = '#4ea3ff'
  ctx.fillRect(w * 0.66, 46, w * 0.2, 6)
  ctx.fillStyle = '#d7e8ff'
  ctx.font = '700 8px Outfit, sans-serif'
  ctx.fillText('responsive', 16, h - 10)
}

const DRAWERS = {
  ai: drawAi,
  marketing: drawMarketing,
  video: drawVideo,
  graphic: drawFlyer,
  flyer: drawFlyer,
  mobile: drawMobile,
  web: drawWeb,
}

export default function SkillFootage({ type, active }) {
  const canvasRef = useRef(null)
  const framesRef = useRef([])

  useEffect(() => {
    framesRef.current = FRAME_SOURCES.map((src) => {
      const img = new Image()
      img.src = src
      return img
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let raf = 0
    const started = performance.now()

    const render = (now) => {
      const seconds = (now - started) / 1000
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)
      const draw = DRAWERS[type] || drawWeb
      draw(ctx, width, height, seconds, framesRef.current)
      if (active) raf = requestAnimationFrame(render)
    }

    const resize = () => {
      const w = canvas.clientWidth || canvas.offsetWidth
      const h = canvas.clientHeight || canvas.offsetHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
    }

    resize()
    raf = requestAnimationFrame(render)
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [type, active])

  return <canvas ref={canvasRef} className="holo-footage-canvas" />
}
