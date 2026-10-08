import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Reads real characteristics from the dropped file using the HTML5 video element.
 * No actual transcoding — metadata, duration, aspect ratio and a poster frame only.
 */
export function useVideoProbe() {
  const [meta, setMeta] = useState(null)
  const [poster, setPoster] = useState(null)
  const [status, setStatus] = useState('idle')
  const urlRef = useRef(null)

  const probe = useCallback((file) => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setMeta(null)
    setPoster(null)
    if (!file) {
      setStatus('idle')
      return
    }

    const url = URL.createObjectURL(file)
    urlRef.current = url
    setStatus('probing')

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.src = url

    const finish = () => {
      const width = video.videoWidth || 0
      const height = video.videoHeight || 0
      const duration = Number.isFinite(video.duration) ? video.duration : 0

      let captured = null
      try {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, 640 / Math.max(width, 1))
        canvas.width = Math.max(1, Math.round(width * scale))
        canvas.height = Math.max(1, Math.round(height * scale))
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        captured = canvas.toDataURL('image/jpeg', 0.72)
      } catch {
        captured = null
      }

      const mime = file.type || ''
      const guessedFormat = mime.includes('webm')
        ? 'webm'
        : mime.includes('quicktime')
          ? 'mov'
          : mime.includes('x-msvideo')
            ? 'avi'
            : mime.includes('matroska')
              ? 'mkv'
              : 'mp4'

      setPoster(captured)
      setMeta({
        name: file.name,
        size: file.size,
        type: mime || 'video/*',
        mimeLabel: (mime.split('/')[1] || 'video').toUpperCase(),
        width,
        height,
        duration,
        aspect: width && height ? width / height : 16 / 9,
        isVertical: height > width,
        hasAudio: true,
        bitrate: duration ? (file.size * 8) / duration : 0,
        sourceFormat: guessedFormat,
      })
      setStatus('ready')
    }

    const onError = () => {
      setMeta({
        name: file.name,
        size: file.size,
        type: file.type || 'video/*',
        mimeLabel: (file.type.split('/')[1] || 'video').toUpperCase(),
        width: 0,
        height: 0,
        duration: 0,
        aspect: 16 / 9,
        isVertical: false,
        hasAudio: true,
        bitrate: 0,
        sourceFormat: 'mp4',
        unreadable: true,
      })
      setStatus('ready')
    }

    video.addEventListener('loadeddata', finish, { once: true })
    video.addEventListener('error', onError, { once: true })

    video.load()

    return () => {
      video.removeEventListener('loadeddata', finish)
      video.removeEventListener('error', onError)
      video.removeAttribute('src')
    }
  }, [])

  const clear = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setMeta(null)
    setPoster(null)
    setStatus('idle')
  }, [])

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
  }, [])

  return { meta, poster, status, probe, clear }
}