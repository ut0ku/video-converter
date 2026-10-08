import { motion } from 'framer-motion'
import {
  Clock,
  Film,
  Gauge,
  HardDrive,
  Maximize,
  MonitorPlay,
  Music2,
  Ratio,
  Replace,
  Sparkles,
} from 'lucide-react'
import { formatBytes, formatDuration, simplifyRatio } from '../lib/utils'

function Stat({ icon: Icon, label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.32, 0.72, 0, 1] }}
      className="bg-surface-raised border-hairline hover:border-gold-dark/30 flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition-colors duration-300"
    >
      <Icon className="text-ink-tertiary h-4 w-4 shrink-0" strokeWidth={2} />
      <div className="min-w-0">
        <p className="text-ink-tertiary text-[10px] font-semibold tracking-[0.12em] uppercase">
          {label}
        </p>
        <p className="truncate text-[13px] font-semibold">{value}</p>
      </div>
    </motion.div>
  )
}

export default function FileInfo({ meta, poster, status, onReplace }) {
  const dims = meta?.width ? `${meta.width} × ${meta.height}` : 'не определено'
  const bitrate = meta?.bitrate ? `${(meta.bitrate / 1_000_000).toFixed(1)} Мбит/с` : '—'
  const ratio = meta?.width ? simplifyRatio(meta.width, meta.height) : '—'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      className="card overflow-hidden"
    >
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="bg-canvas-subtle border-hairline relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl border sm:w-[264px]"
        >
          {poster ? (
            <img src={poster} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <Film className="text-ink-tertiary h-8 w-8" strokeWidth={1.5} />
            </div>
          )}

          {status === 'probing' && (
            <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[13px] font-medium text-white">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white"
                />
                Анализ…
              </div>
            </div>
          )}

          {meta?.duration > 0 && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
              <div className="text-[11px] font-semibold text-white/90">
                {formatDuration(meta.duration)}
              </div>
            </div>
          )}
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-ink-tertiary flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase">
                <Sparkles className="h-3 w-3" />
                Характеристики определены
              </p>
              <h3 className="mt-1.5 truncate text-lg font-semibold tracking-tight sm:text-xl">
                {meta?.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={onReplace}
              className="btn-ghost flex h-9 shrink-0 items-center gap-1.5 px-3.5 text-[13px]"
            >
              <Replace className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Заменить</span>
            </button>
          </div>

          {meta?.unreadable && (
            <p className="text-apple-orange mt-2 text-[13px]">
              Не удалось прочитать метаданные — параметры определены приблизительно.
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Stat icon={MonitorPlay} label="Разрешение" value={dims} delay={0.02} />
            <Stat icon={Ratio} label="Соотношение" value={ratio} delay={0.05} />
            <Stat icon={Clock} label="Длительность" value={formatDuration(meta?.duration)} delay={0.08} />
            <Stat icon={HardDrive} label="Размер" value={formatBytes(meta?.size)} delay={0.11} />
            <Stat icon={Gauge} label="Битрейт" value={bitrate} delay={0.14} />
            <Stat icon={Music2} label="Формат" value={meta?.mimeLabel ?? '—'} delay={0.17} />
          </div>

          {meta?.isVertical && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-gold-ink mt-4 flex items-center gap-1.5 text-[13px] font-medium"
            >
              <Maximize className="h-3.5 w-3.5" />
              Вертикальное видео — отличный кандидат для Reels, Shorts и Stories
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function SectionHeading({ eyebrow, title, description, icon: Icon, align = 'center' }) {
  return (
    <div
      className={
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left'
      }
    >
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="eyebrow"
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, delay: 0.05, ease: [0.32, 0.72, 0, 1] }}
        className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
          className="text-ink-secondary mt-4 text-lg leading-relaxed text-balance"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}