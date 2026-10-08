import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Download, Loader2, Play, X } from 'lucide-react'
import { RENDER_STAGES } from '../hooks/useFakeRender'
import { formatTimecode } from '../lib/utils'
import { cx } from '../lib/utils'

function StageList({ stage, done }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {RENDER_STAGES.map((s, i) => {
        const stages = RENDER_STAGES.map((x) => x.id)
        const currentIndex = stage === 'done' ? stages.length : stages.indexOf(stage)
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'todo'

        return (
          <span key={s.id} className="flex items-center gap-2">
            <span
              className={cx(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-500',
                state === 'done' && 'text-apple-green bg-apple-green/10',
                state === 'active' && 'text-gold-ink bg-gold/10',
                state === 'todo' && 'text-ink-tertiary bg-surface-raised',
              )}
            >
              {state === 'done' ? (
                <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
              ) : state === 'active' ? (
                <Loader2 className="h-3 w-3 animate-spin" strokeWidth={3} />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
              {s.label}
            </span>
            {i < RENDER_STAGES.length - 1 && <span className="text-ink-tertiary text-xs">→</span>}
          </span>
        )
      })}
      {done && (
        <span className="flex items-center gap-2">
          <span className="text-ink-tertiary text-xs">→</span>
          <span className="text-apple-green bg-apple-green/10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold">
            <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
            Готово
          </span>
        </span>
      )}
    </div>
  )
}

export default function ProgressBar({ progress, stage, state, elapsed, onCancel, onReset, meta }) {
  const running = state === 'running'
  const done = state === 'done'
  const pct = Math.round(progress)

  const estimatedTotal = done ? elapsed : elapsed / Math.max(progress / 100, 0.02)
  const remaining = Math.max(0, estimatedTotal - elapsed)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      className="card relative overflow-hidden p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-ink-tertiary text-[11px] font-semibold tracking-[0.14em] uppercase">
            {done ? 'Готово' : running ? 'Рендеринг' : 'Ожидание'}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
            {done ? 'Файл сконвертирован' : running ? `${pct}%` : 'Не запущено'}
          </p>
        </div>

        <div className="text-ink-tertiary flex items-center gap-4 text-xs font-medium tabular-nums">
          <span>Прошло: {formatTimecode(elapsed)}</span>
          {running && <span>Осталось: ~{formatTimecode(remaining)}</span>}
        </div>
      </div>

      {/* Track */}
      <div className="bg-surface-raised border-hairline relative mt-5 h-3 overflow-hidden rounded-full border">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: done
              ? 'linear-gradient(90deg, #d4a017, #f7d774)'
              : 'linear-gradient(90deg, #f7d774, #d4a017, #a67808)',
            backgroundSize: done ? '100% 100%' : '200% 100%',
          }}
          animate={{
            width: `${progress}%`,
            backgroundPosition: running ? ['0% 50%', '200% 50%'] : '0% 50%',
          }}
          transition={{
            width: { duration: 0.25, ease: 'linear' },
            backgroundPosition: { duration: 2.2, repeat: running ? Infinity : 0, ease: 'linear' },
          }}
        >
          {running && (
            <span className="animate-shimmer absolute inset-0 rounded-full bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.55)_50%,transparent_70%)] bg-[length:200%_100%]" />
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0"
          >
            <motion.div
              className="h-3 w-16 bg-white/45 blur-[6px]"
              animate={{ x: [0, 240, 480, 720, 960] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5">
        <StageList stage={stage} done={done} />
      </div>

      {meta?.duration > 0 && (
        <div className="mt-5">
          <div className="text-ink-tertiary flex items-center justify-between text-[11px] font-medium">
            <span>Таймкод</span>
            <span className="tabular-nums">
              {running ? formatTimecode((progress / 100) * meta.duration) : '0:00'} /{' '}
              {formatTimecode(meta.duration)}
            </span>
          </div>
          <div className="bg-surface-raised border-hairline relative mt-1.5 h-1.5 overflow-hidden rounded-full border">
            <motion.div
              className="bg-ink-tertiary absolute inset-y-0 left-0 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25, ease: 'linear' }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <button type="button" className="btn-primary flex h-12 flex-1 items-center justify-center gap-2 text-[15px]">
              <Download className="h-[18px] w-[18px]" />
              Скачать файл
            </button>
            <button type="button" onClick={onReset} className="btn-ghost flex h-12 items-center justify-center gap-2 px-6 text-[15px]">
              <Play className="h-4 w-4" />
              Конвертировать заново
            </button>
          </motion.div>
        ) : running ? (
          <motion.button
            key="cancel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            type="button"
            onClick={onCancel}
            className="btn-ghost mt-6 flex h-12 w-full items-center justify-center gap-2 text-[15px]"
          >
            <X className="h-4 w-4" />
            Отменить
          </motion.button>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}