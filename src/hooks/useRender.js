import { useCallback, useEffect, useRef, useState } from 'react'
import { RENDER_STAGES } from './useFakeRender'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const POLL_INTERVAL = 400

function resolveApiUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/api/')) return url
  return `${API_BASE.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

export function useRender(token, onUsageChange) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(RENDER_STAGES[0].id)
  const [state, setState] = useState('idle')
  const [elapsed, setElapsed] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')
  const jobRef = useRef(null)
  const abortRef = useRef(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    jobRef.current = null
    setProgress(0)
    setStage(RENDER_STAGES[0].id)
    setState('idle')
    setElapsed(0)
    setDownloadUrl('')
    setError('')
  }, [])

  const cancel = useCallback(async () => {
    const jobId = jobRef.current
    abortRef.current?.abort()
    if (jobId) {
      await fetch(`${API_BASE}/conversions/${jobId}`, { method: 'DELETE' }).catch(() => {})
    }
    reset()
  }, [reset])

  const start = useCallback(async (file, settings, meta) => {
    if (!file || jobRef.current) return
    setState('running')
    setProgress(0)
    setStage('analyze')
    setElapsed(0)
    setDownloadUrl('')
    setError('')

    const controller = new AbortController()
    abortRef.current = controller
    const body = new FormData()
    body.append('file', file)
    body.append('format', settings.format)
    body.append('resolutionMode', settings.resolutionMode)
    body.append('resolution', settings.resolution)
    body.append('width', String(settings.width))
    body.append('height', String(settings.height))
    body.append('fpsMode', settings.fpsMode)
    body.append('fps', String(settings.fps))
    body.append('quality', String(settings.quality))
    body.append('durationMs', String(Math.round((meta?.duration || 0) * 1000)))

    try {
      const response = await fetch(`${API_BASE}/conversions`, {
        method: 'POST',
        body,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(await response.text() || 'Не удалось запустить конвертацию')
      const { id } = await response.json()
      jobRef.current = id

      while (jobRef.current === id) {
        const statusResponse = await fetch(`${API_BASE}/conversions/${id}`, { signal: controller.signal })
        if (!statusResponse.ok) throw new Error(await statusResponse.text() || 'Не удалось получить статус')
        const status = await statusResponse.json()
        setProgress(status.progress)
        setStage(status.stage)
        if (status.state === 'done') {
          setState('done')
          setDownloadUrl(resolveApiUrl(status.downloadUrl))
          onUsageChange?.()
          jobRef.current = null
          return
        }
        if (status.state === 'failed') throw new Error(status.error || 'Ошибка конвертации')
        if (status.state === 'cancelled') return
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
      }
    } catch (conversionError) {
      if (conversionError.name === 'AbortError') return
      setError(conversionError.message)
      setState('error')
      jobRef.current = null
    } finally {
      abortRef.current = null
    }
  }, [token, onUsageChange])

  useEffect(() => {
    if (state !== 'running') return undefined
    const interval = setInterval(() => setElapsed((value) => value + 0.1), 100)
    return () => clearInterval(interval)
  }, [state])

  useEffect(() => () => abortRef.current?.abort(), [])

  return { progress, stage, state, elapsed, downloadUrl, error, start, cancel, reset }
}
