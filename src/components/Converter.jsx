import { AnimatePresence, motion } from 'framer-motion'
import { Info, Settings2, Sparkles, Wand2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FORMAT_BY_ID } from '../data/catalog'
import { useFakeRender } from '../hooks/useFakeRender'
import { useVideoProbe } from '../hooks/useVideoProbe'
import CustomSettings from './CustomSettings'
import Dropzone from './Dropzone'
import FileInfo, { SectionHeading } from './FileInfo'
import ProgressBar from './ProgressBar'

const DEFAULT_SETTINGS = {
  format: 'mp4',
  resolutionMode: 'source',
  resolution: '1080p',
  width: 1920,
  height: 1080,
  fpsMode: 'source',
  fps: 30,
  quality: 72,
}

export default function Converter() {
  const { meta, poster, status, probe, clear } = useVideoProbe()
  const render = useFakeRender()

  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const settingsRef = useRef(null)
  const dropzoneRef = useRef(null)

  const syncDropzoneHeight = useCallback(() => {
    const settingsNode = settingsRef.current
    const dropzoneNode = dropzoneRef.current
    if (!settingsNode || !dropzoneNode) return

    const active = window.matchMedia('(min-width: 1024px)').matches && !meta
    dropzoneNode.style.height = active ? `${settingsNode.getBoundingClientRect().height}px` : ''
  }, [meta])

  useEffect(() => {
    const node = settingsRef.current
    if (!node) return undefined

    syncDropzoneHeight()
    const observer = new ResizeObserver(syncDropzoneHeight)
    observer.observe(node)

    return () => observer.disconnect()
  }, [syncDropzoneHeight])

  const setSetting = useCallback((key, value) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }, [])

  const handleFormat = useCallback((formatId) => {
    setSettings((s) => ({ ...s, format: formatId }))
  }, [])

  const handleFile = useCallback(
    (file) => {
      render.reset()
      probe(file)
    },
    [probe, render],
  )

  const handleReplace = useCallback(() => {
    render.reset()
    clear()
  }, [clear, render])

  useEffect(() => {
    if (render.state === 'running') {
      requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: 'smooth' }),
      )
    }
  }, [render.state])

  const format = FORMAT_BY_ID[settings.format] ?? FORMAT_BY_ID.mp4
  const hasFile = Boolean(meta)
  const busy = render.state === 'running'

  const summary = useMemo(
    () => [
      format.label,
      settings.resolutionMode === 'source'
        ? meta?.width
          ? `${meta.width}×${meta.height}`
          : 'оригинал'
        : `${settings.width}×${settings.height}`,
      settings.fpsMode === 'custom' ? `${settings.fps} fps` : 'оригинальный fps',
      `${settings.quality}% качества`,
      format.kind === 'image' ? 'без звука' : 'со звуком',
    ],
    [format, meta, settings],
  )

  return (
    <section id="converter" className="scroll-mt-0 py-16 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Конвертер"
          icon={Wand2}
          title="Загрузите видео — остальное сделаем сами"
          description="Файл определится автоматически. Настройте формат, разрешение, количество кадров и качество кадирования, после чего нажмите «Рендерить»."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:items-start">
          <div className="flex min-h-0 flex-col gap-6">
            <AnimatePresence mode="wait">
              {hasFile ? (
                <motion.div key="file" className="space-y-6">
                  <FileInfo
                    meta={meta}
                    poster={poster}
                    status={status}
                    onReplace={handleReplace}
                  />
                </motion.div>
              ) : (
                <Dropzone key="dropzone" onFile={handleFile} containerRef={dropzoneRef} />
              )}
            </AnimatePresence>

            {render.state !== 'idle' && (
              <ProgressBar
                progress={render.progress}
                stage={render.stage}
                state={render.state}
                elapsed={render.elapsed}
                meta={meta}
                onCancel={render.cancel}
                onReset={render.reset}
              />
            )}
          </div>

          {/* Settings column */}
          <motion.aside
            id="formats"
            ref={settingsRef}
            className="card bg-canvas sticky top-24 p-3 sm:p-4 lg:p-3 scroll-mt-28"
          >
            <div className="border-hairline flex items-center justify-between gap-3 border-b pb-2">
              <h3 className="text-ink-secondary flex items-center gap-2 text-[15px] font-semibold tracking-tight">
                <Settings2 className="text-ink-tertiary h-4 w-4" strokeWidth={2} />
                Настройки вывода
              </h3>
              {!hasFile && <span className="chip">Demo</span>}
            </div>

              <div className="mt-0 space-y-1">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 py-2 lg:flex-nowrap">
                  <p className="text-ink-secondary mb-2 text-sm font-semibold lg:mb-0 lg:shrink-0">Формат</p>
                  <div className="flex flex-wrap gap-2">
                  {Object.values(FORMAT_BY_ID).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleFormat(f.id)}
                      className={`relative rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                          settings.format === f.id
                            ? 'text-[#2b1c00]'
                            : 'border-hairline bg-surface-raised text-ink-secondary hover:text-ink border'
                        }`}
                    >
                      {settings.format === f.id && (
                        <motion.span
                          layoutId="format-pill"
                          transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                          className="pill-gold absolute inset-0 rounded-xl"
                        />
                      )}
                      <span className="relative z-10">{f.label}</span>
                    </button>
                  ))}
                  </div>
                </div>
                <p className="text-ink-tertiary mt-2 flex items-center gap-2 text-xs leading-tight lg:hidden">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {format.blurb}
                </p>
              </div>

              <div className="border-hairline border-t pt-1.5 lg:pt-0">
                <p className="text-ink-secondary mb-1 flex items-center gap-2 text-sm font-semibold lg:hidden">
                  <Sparkles className="text-gold-ink h-3.5 w-3.5" />
                  Расширенные параметры
                </p>
                <CustomSettings settings={settings} meta={meta} onChange={setSetting} />
              </div>
            </div>

            <div className="border-hairline mt-4 border-t pt-4">
              <button
                type="button"
                disabled={!hasFile || busy}
                onClick={render.start}
                className="btn-primary relative w-full overflow-hidden rounded-2xl py-3 text-sm"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {busy ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                      />
                      Рендеринг {Math.round(render.progress)}%
                    </>
                  ) : render.state === 'done' ? (
                    'Готово'
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Рендерить в {format.label}
                    </>
                  )}
                </span>
                {!busy && (
                  <span className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.35)_50%,transparent_65%)] bg-[length:200%_100%]" />
                )}
              </button>

              {!hasFile && (
                <p className="text-ink-tertiary mt-3 text-center text-xs lg:hidden">
                  Загрузите файл для рендера
                </p>
              )}

              <div className="mt-3 flex flex-wrap justify-center gap-1 lg:hidden">
                {summary.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}