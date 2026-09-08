import { useEffect, useState, useRef, useCallback } from 'react'

export function useCanvasFrames({ frameCount, getPath }) {
  const [loadedCount, setLoadedCount] = useState(0)
  const [isInitialReady, setIsInitialReady] = useState(false)
  const imagesRef = useRef([])
  const loadedSetRef = useRef(new Set())
  const getPathRef = useRef(getPath)

  useEffect(() => {
    getPathRef.current = getPath
  }, [getPath])

  useEffect(() => {
    let isCancelled = false
    const images = new Array(frameCount)
    imagesRef.current = images
    loadedSetRef.current = new Set()

    let count = 0

    const markLoaded = (index) => {
      if (isCancelled) return
      if (!loadedSetRef.current.has(index)) {
        loadedSetRef.current.add(index)
        count++
        setLoadedCount(count)
        if (index === 0 || count >= 5) {
          setIsInitialReady(true)
        }
      }
    }

    const loadImage = (index) => {
      return new Promise((resolve) => {
        if (images[index]) {
          resolve(images[index])
          return
        }

        const img = new Image()
        img.decoding = 'async'
        img.onload = () => {
          markLoaded(index)
          resolve(img)
        }
        img.onerror = () => {
          resolve(null)
        }

        img.src = getPathRef.current(index)
        images[index] = img

        // If already cached by the browser
        if (img.complete && img.naturalWidth > 0) {
          markLoaded(index)
          resolve(img)
        }
      })
    }

    // Priority 1: Load frame 0 immediately
    loadImage(0).then(() => {
      if (isCancelled) return

      // Priority 2: Load the first 25 frames
      const initialBatch = []
      for (let i = 1; i < Math.min(25, frameCount); i++) {
        initialBatch.push(loadImage(i))
      }

      Promise.all(initialBatch).then(() => {
        if (isCancelled) return

        // Priority 3: Load keyframes across the timeline (every 4th frame)
        const keyframeIndices = []
        for (let i = 25; i < frameCount; i += 4) {
          keyframeIndices.push(i)
        }

        const waitIdle = () =>
          new Promise((resolve) => {
            const idle = window.requestIdleCallback
            if (idle) idle(() => resolve(), { timeout: 240 })
            else window.setTimeout(resolve, 24)
          })

        const loadKeyframes = async () => {
          for (let i = 0; i < keyframeIndices.length; i += 4) {
            if (isCancelled) return
            if (document.hidden) {
              await new Promise((resolve) => {
                const onVisible = () => {
                  if (!document.hidden) {
                    document.removeEventListener('visibilitychange', onVisible)
                    resolve()
                  }
                }
                document.addEventListener('visibilitychange', onVisible)
              })
            }
            const chunk = keyframeIndices.slice(i, i + 4).map((idx) => loadImage(idx))
            await Promise.all(chunk)
            await waitIdle()
          }

          const remainingIndices = []
          const mobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
          const step = mobile ? 2 : 1
          for (let i = 0; i < frameCount; i += step) {
            if (!images[i] || !loadedSetRef.current.has(i)) {
              remainingIndices.push(i)
            }
          }

          for (let i = 0; i < remainingIndices.length; i += 6) {
            if (isCancelled) return
            if (document.hidden) {
              await new Promise((resolve) => {
                const onVisible = () => {
                  if (!document.hidden) {
                    document.removeEventListener('visibilitychange', onVisible)
                    resolve()
                  }
                }
                document.addEventListener('visibilitychange', onVisible)
              })
            }
            const chunk = remainingIndices.slice(i, i + 6).map((idx) => loadImage(idx))
            await Promise.all(chunk)
            await waitIdle()
          }
        }

        loadKeyframes()
      })
    })

    return () => {
      isCancelled = true
    }
  }, [frameCount])

  // Nearest frame fallback: guarantees no black screen or blank flicker
  const getFrame = useCallback(
    (targetIndex) => {
      const idx = Math.max(0, Math.min(frameCount - 1, Math.round(targetIndex)))
      const images = imagesRef.current
      const loadedSet = loadedSetRef.current

      // If exact frame is ready, return it
      if (loadedSet.has(idx) && images[idx]?.complete && images[idx]?.naturalWidth > 0) {
        return images[idx]
      }

      // Search nearest loaded frame
      let radius = 1
      while (radius < frameCount) {
        const prev = idx - radius
        if (prev >= 0 && loadedSet.has(prev) && images[prev]?.complete && images[prev]?.naturalWidth > 0) {
          return images[prev]
        }
        const next = idx + radius
        if (next < frameCount && loadedSet.has(next) && images[next]?.complete && images[next]?.naturalWidth > 0) {
          return images[next]
        }
        radius++
      }

      // Fallback to frame 0
      return images[0] || null
    },
    [frameCount]
  )

  const isFullyLoaded = loadedCount >= frameCount

  return {
    getFrame,
    loadedCount,
    totalFrames: frameCount,
    isInitialReady,
    isFullyLoaded,
    loadingProgress: Math.min(100, Math.round((loadedCount / frameCount) * 100)),
  }
}