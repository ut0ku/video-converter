import { AnimatePresence, motion } from 'framer-motion'
import { CircleHelp, Gauge, Minus, MonitorPlay, Plus, Timer } from 'lucide-react'
import { useState } from 'react'
import { FPS_MODES, RESOLUTIONS } from '../data/catalog'
import { cx, estimateOutputSize, formatBytes } from '../lib/utils'

const FPS_PRESETS = [23.976, 24, 30, 60, 120]
const FPS_MIN = 1
const FPS_MAX = 240

const COLS_CLASS = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

function Segmented({ group, options, value, onChange, cols = 'flex', compact = false }) {
  const isGrid = cols !== 'flex'
  return (
    <div
      className={cx(
        'bg-surface-raised border-hairline gap-1 rounded-2xl border p-1',
        isGrid ? `grid ${COLS_CLASS[cols] ?? 'grid-cols-3'}` : 'flex flex-wrap',
      )}
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            title={option.hint ? `${option.label}: ${option.hint}` : option.label}
            className={cx(
              cx(
                'relative rounded-xl font-medium transition-colors duration-300',
                compact
                  ? 'px-1 py-1.5 text-sm lg:py-1'
                  : 'px-3 py-2.5 text-sm',
                !compact && 'whitespace-nowrap',
              ),
              isGrid ? 'w-full' : 'flex-1',
              selected ? 'text-[#2b1c00]' : 'text-ink-secondary hover:text-ink',
            )}
          >
            {selected && (
              <motion.span
                layoutId={`seg-${group}`}
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                className="pill-gold absolute inset-0 rounded-xl"
              />
            )}
            <span className="relative z-10 flex flex-col items-center leading-tight">
              <span>{option.label}</span>
              {option.hint && (
                <span
                  className={cx(
                    'text-[11px] font-normal',
                    compact && 'lg:hidden',
                    selected ? 'text-[#2b1c00]/70' : 'text-ink-tertiary',
                  )}
                >
                  {option.hint}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function QuestionHint({ children }) {
  return (
    <span className="group relative inline-flex shrink-0" tabIndex={0} title={children}>
      <CircleHelp
        className="text-ink-tertiary h-4 w-4 cursor-help"
        aria-label={children}
        strokeWidth={1.8}
      />
      <span
        role="tooltip"
        className="bg-tooltip text-tooltip-ink border-tooltip-hairline pointer-events-none absolute right-0 bottom-full z-50 mb-2 hidden w-64 rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed shadow-[var(--shadow-elevated)] group-hover:block group-focus:block"
      >
        {children}
      </span>
    </span>
  )
}

function Field({ icon: Icon, label, hint, help, className, children }) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-ink-secondary flex items-center gap-2 text-sm font-semibold">
          <Icon className="text-ink-tertiary h-4 w-4" strokeWidth={2} />
          {label}
        </span>
        <span className="flex items-center gap-2">
          {hint && <span className="text-ink-tertiary text-xs font-medium">{hint}</span>}
          {help && <QuestionHint>{help}</QuestionHint>}
        </span>
      </div>
      {children}
    </div>
  )
}

function clampFps(value) {
  if (!Number.isFinite(value)) return FPS_MIN
  return Math.min(FPS_MAX, Math.max(FPS_MIN, Math.round(value * 1000) / 1000))
}

function FpsInput({ value, onChange }) {
  const [draft, setDraft] = useState(() => String(value))
  const [syncedValue, setSyncedValue] = useState(value)
  const [focused, setFocused] = useState(false)

  if (value !== syncedValue && !focused) {
    setSyncedValue(value)
    setDraft(String(value))
  }

  const commit = (raw) => {
    const parsed = Number.parseFloat(raw.replace(',', '.'))
    if (!Number.isFinite(parsed)) {
      setDraft(String(value))
      return
    }
    const next = clampFps(parsed)
    setDraft(String(next))
    onChange(next)
  }

  const step = (direction) => {
    const delta = value >= 50 ? 5 : 1
    const next = clampFps(value + direction * delta)
    setDraft(String(next))
    onChange(next)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      step(1)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      step(-1)
    }
  }

  const invalid = draft.trim() !== '' && !Number.isFinite(Number.parseFloat(draft.replace(',', '.')))

return (
    <div>
      <label className="text-ink-secondary block min-w-0 text-xs font-medium">Количество кадров в секунду</label>
      <div className="mt-1 flex items-center gap-2">
        <StepperButton onClick={() => step(-1)} label="Уменьшить частоту кадров">
          <Minus className="h-4 w-4" />
        </StepperButton>

        <div className="relative flex-1">
          <input
            type="text"
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={(e) => {
              commit(e.target.value)
              setFocused(false)
            }}
            onKeyDown={onKeyDown}
            aria-label="Значение частоты кадров, fps"
            className={cx(
              'field py-2 text-center text-sm font-semibold tabular-nums',
              invalid && 'border-apple-pink focus:border-apple-pink',
            )}
            style={
              invalid
                ? { boxShadow: '0 0 0 4px color-mix(in oklab, #ff2d55 18%, transparent)' }
                : undefined
            }
          />
          <span className="text-ink-tertiary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium">
            fps
          </span>
        </div>

        <StepperButton onClick={() => step(1)} label="Увеличить частоту кадров">
          <Plus className="h-4 w-4" />
        </StepperButton>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {FPS_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              const next = clampFps(preset)
              setDraft(String(next))
              onChange(next)
            }}
            className={cx(
              'rounded-xl px-2.5 py-1.5 text-xs font-semibold tabular-nums transition-colors duration-300',
              value === preset
                ? 'pill-gold'
                : 'text-ink-tertiary hover:text-ink hover:bg-surface',
            )}
          >
            {preset}
          </button>
        ))}
      </div>

    </div>
  )
}

function ResolutionInput({ width, height, onChange, onPreset }) {
  const [draft, setDraft] = useState({ width: String(width), height: String(height) })
  const [synced, setSynced] = useState({ width, height })
  const [focused, setFocused] = useState(null)

  if ((width !== synced.width || height !== synced.height) && !focused) {
    setSynced({ width, height })
    setDraft({ width: String(width), height: String(height) })
  }

  const updateDraft = (dimension, raw) => {
    setDraft((current) => ({ ...current, [dimension]: raw }))
    if (!/^\d+$/.test(raw)) return

    const next = Number(raw)
    if (next < 1 || next > 16384) return
    onChange(dimension, next)
    onChange('resolution', 'custom')
  }

  const commit = (dimension) => {
    const next = Number(draft[dimension])
    if (!Number.isInteger(next) || next < 1 || next > 16384) {
      setDraft((current) => ({ ...current, [dimension]: String(dimension === 'width' ? width : height) }))
    } else {
      onChange(dimension, next)
      onChange('resolution', 'custom')
    }
    setFocused(null)
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {[
          { key: 'width', label: 'Ширина, px' },
          { key: 'height', label: 'Высота, px' },
        ].map(({ key, label }) => (
          <label key={key} className="text-ink-secondary block min-w-0 text-xs font-medium">
            {label}
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={16384}
              step={1}
              value={draft[key]}
              onChange={(event) => updateDraft(key, event.target.value)}
              onFocus={() => setFocused(key)}
              onBlur={() => commit(key)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur()
              }}
              aria-label={label}
              className="field mt-1 py-2 text-center text-sm font-semibold tabular-nums"
            />
          </label>
        ))}
      </div>

              <div className="flex flex-wrap gap-0.5" aria-label="Готовые разрешения">
        {RESOLUTIONS.filter((preset) => preset.width).map((preset) => (
          <button
            key={preset.id}
            type="button"
            title={preset.hint}
            aria-pressed={width === preset.width && height === preset.height}
            onClick={() => onPreset(preset)}
            className={cx(
              'rounded-xl px-1.5 py-1.5 text-xs font-semibold transition-colors duration-300',
              width === preset.width && height === preset.height
                ? 'pill-gold'
                : 'text-ink-tertiary hover:text-ink hover:bg-surface',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepperButton({ children, onClick, label }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      className="border-hairline bg-surface text-ink-secondary hover:text-ink hover:border-ink-tertiary grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition-colors duration-300"
    >
      <span className="grid place-items-center [&>svg]:h-[18px] [&>svg]:w-[18px]">{children}</span>
    </motion.button>
  )
}

export default function CustomSettings({ settings, meta, onChange }) {
  const { resolutionMode, resolution, width, height, fpsMode, fps, quality } = settings
  const effectiveResolution = resolutionMode === 'source' ? 'source' : resolution

  const estimated = estimateOutputSize({
    sourceBytes: meta?.size,
    duration: meta?.duration,
    resolution: effectiveResolution,
    resolutionWidth: resolutionMode === 'custom' ? width : undefined,
    resolutionHeight: resolutionMode === 'custom' ? height : undefined,
    quality,
    format: settings.format,
  })

  const qualityLabel =
    quality >= 90 ? 'Максимальное' : quality >= 75 ? 'Высокое' : quality >= 60 ? 'Среднее' : 'Низкое'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05, ease: [0.32, 0.72, 0, 1] }}
      className="border-hairline mt-3 space-y-4 rounded-3xl border p-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-4 lg:gap-y-4 lg:space-y-0"
    >
      <Field
        icon={MonitorPlay}
        label="Разрешение вывода"
        help="Введите ширину и высоту кадра в пикселях (от 1 до 16384) или выберите готовый пресет ниже."
      >
        <Segmented
          group="resolution-mode"
          cols={2}
          options={FPS_MODES}
          value={resolutionMode}
          onChange={(v) => onChange('resolutionMode', v)}
          compact
        />

        <AnimatePresence initial={false}>
          {resolutionMode === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <ResolutionInput
                width={width}
                height={height}
                onChange={onChange}
                onPreset={(preset) => {
                  onChange('resolution', preset.id)
                  onChange('width', preset.width)
                  onChange('height', preset.height)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Field>

      <Field
        icon={Timer}
        label="Частота кадров"
        help={`Введите значение с клавиатуры: от ${FPS_MIN} до ${FPS_MAX} fps. Дробные значения поддерживаются, например 23.976.`}
      >
        <Segmented
          group="fps-mode"
          cols={2}
          options={FPS_MODES}
          value={fpsMode}
          onChange={(v) => onChange('fpsMode', v)}
          compact
        />

        <AnimatePresence initial={false}>
          {fpsMode === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <FpsInput value={fps} onChange={(v) => onChange('fps', v)} />
            </motion.div>
          )}
        </AnimatePresence>
      </Field>

      <Field
        className="lg:col-span-2"
        icon={Gauge}
        label="Качество кодирования"
        hint={`${quality} · ${qualityLabel}`}
      >
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={30}
            max={100}
            step={1}
            value={quality}
            onChange={(e) => onChange('quality', Number(e.target.value))}
            style={{ backgroundSize: `${((quality - 30) / 70) * 100}% 100%` }}
            className="slider flex-1"
            aria-label="Качество кодирования"
          />
          <span className="text-ink-secondary w-14 shrink-0 text-right text-base font-semibold tabular-nums">
            {quality}%
          </span>
        </div>
      </Field>

      <AnimatePresence mode="popLayout">
        {estimated && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="border-gold-dark/25 bg-gold/[0.06] flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 lg:col-span-2"
          >
            <span className="text-ink-secondary text-sm font-medium">
              Ожидаемый размер файла
            </span>
            <span className="text-gold-ink text-base font-semibold tabular-nums">
              ≈ {formatBytes(estimated)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}