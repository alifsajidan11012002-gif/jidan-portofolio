import { useEffect, useRef } from 'react'

export const FOOTAGE_BY_TYPE = {
  'app-tracking': {
    src: '/footage/app-tracking.mp4',
    label: 'APP TRACKING  ·  DEMO',
    caption: 'Pelacakan truk, muatan, dan geofence',
    freezeAt: 1.15,
  },
  'abiza-chat': {
    src: '/footage/abiza-chat.mp4',
    label: 'ABIZA CHAT  ·  LIVE',
    caption: 'Percakapan messenger realtime',
    freezeAt: 1.1,
  },
  gextrack: {
    src: '/footage/gextrack.mp4',
    label: 'GEXTRACK  ·  LIVE',
    caption: 'Lacak paket terkirim secara realtime',
    freezeAt: 1.2,
  },
}

function freezeVideo(video, time) {
  if (!video) return
  const duration = Number.isFinite(video.duration) ? video.duration : time
  const stamp = Math.min(Math.max(time, 0.08), Math.max(duration - 0.05, 0.08))
  try {
    video.pause()
    video.currentTime = stamp
  } catch {
    /* seek can fail before data is ready */
  }
}

export function ProjectStill({ type, active, accent }) {
  const videoRef = useRef(null)
  const scene = FOOTAGE_BY_TYPE[type]

  useEffect(() => {
    const video = videoRef.current
    if (!video || !scene) return undefined

    const freeze = () => freezeVideo(video, scene.freezeAt)
    const keepFrozen = () => video.pause()
    video.addEventListener('loadeddata', freeze)
    video.addEventListener('seeked', keepFrozen)
    video.addEventListener('play', keepFrozen)
    if (video.readyState >= 2) freeze()

    return () => {
      video.removeEventListener('loadeddata', freeze)
      video.removeEventListener('seeked', keepFrozen)
      video.removeEventListener('play', keepFrozen)
    }
  }, [scene])

  return (
    <div className={`project-still ${active ? 'is-active' : ''}`} aria-hidden="true">
      {scene ? (
        <video
          ref={videoRef}
          className="project-still-video"
          src={scene.src}
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <div
          className="project-still-fallback"
          style={{ '--still-accent': accent || '#00e5ff' }}
        />
      )}
    </div>
  )
}

export default function ProjectFootage({ type, active, className, showHud = true }) {
  const videoRef = useRef(null)
  const scene = FOOTAGE_BY_TYPE[type]

  useEffect(() => {
    const video = videoRef.current
    if (!video || !scene) return undefined

    const onLoaded = () => {
      if (!active) freezeVideo(video, scene.freezeAt)
    }

    video.addEventListener('loadeddata', onLoaded)

    if (active) {
      try {
        video.currentTime = 0
      } catch {
        /* ignore */
      }
      const play = video.play()
      if (play?.catch) play.catch(() => {})
    } else {
      video.pause()
      if (video.readyState >= 2) freezeVideo(video, scene.freezeAt)
    }

    return () => {
      video.removeEventListener('loadeddata', onLoaded)
    }
  }, [active, scene])

  if (!scene) return null

  return (
    <div className={`project-real-footage ${className || ''}`}>
      <video
        ref={videoRef}
        className="project-real-video"
        src={scene.src}
        muted
        loop
        playsInline
        preload={active ? 'auto' : 'metadata'}
      />
      {showHud ? (
        <div className="project-real-hud">
          <span className="project-real-label">{scene.label}</span>
          <span className="project-real-caption">{scene.caption}</span>
        </div>
      ) : null}
    </div>
  )
}
