import { useCallback, useEffect, useRef, useState } from 'react'

export const RENDER_STAGES = [
  { id: 'analyze', label: 'Анализ файла', weight: 0.08 },
  { id: 'decode', label: 'Декодирование', weight: 0.32 },
  { id: 'encode', label: 'Кодирование', weight: 0.48 },
  { id: 'mux', label: 'Сборка контейнера', weight: 0.12 },
]

const STAGE_IDS = RENDER_STAGES.map((s) => s.id)

function resolveStage(progress) {
  let acc = 0
  for (const s of RENDER_STAGES) {
    acc += s.weight
    if (progress <= acc) return s.id
  }
  return STAGE_IDS[STAGE_IDS.length - 1]
}

/**
 * Frontend-only simulated render pipeline.
 * Progress advances smoothly and non-linearly, like a real encoder would.
 */
export function useFakeRender() {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(RENDER_STAGES[0].id)
  const [state, setState] = useState('idle') // idle | running | done
  const [elapsed, setElapsed] = useState(0)

  const ctxRef = useRef(null)
  const rafRef = useRef(null)

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    const ctx = ctxRef.current
    if (ctx) {
      ctx.progress = 0
      ctx.phase = 'idle'
    }
    setProgress(0)
    setElapsed(0)
    setStage(RENDER_STAGES[0].id)
    setState('idle')
  }, [])

  const start = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx || ctx.phase === 'running') return

    ctx.progress = 0
    ctx.phase = 'running'
    setProgress(0)
    setElapsed(0)
    setStage(RENDER_STAGES[0].id)
    setState('running')

    const step = () => {
      if (ctx.phase !== 'running') return

      if (ctx.progress >= 1) {
        ctx.progress = 1
        ctx.phase = 'done'
        setProgress(100)
        setStage('done')
        setState('done')
        rafRef.current = null
        return
      }

      const delta = 0.0035 + (1 - ctx.progress) * 0.011
      const next = Math.min(1, ctx.progress + delta * (0.85 + Math.random() * 0.3))
      ctx.progress = next

      setProgress(next * 100)
      setStage(resolveStage(next))

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
  }, [])

  const cancel = useCallback(() => reset(), [reset])

  useEffect(() => {
    ctxRef.current = { progress: 0, phase: 'idle' }
    return () => {
      ctxRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (state !== 'running') return undefined
    const id = setInterval(() => setElapsed((v) => v + 0.1), 100)
    return () => clearInterval(id)
  }, [state])

  return { progress, stage, state, elapsed, start, cancel, reset }
}