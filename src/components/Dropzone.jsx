import { motion } from 'framer-motion'
import { FileVideo, Sparkles, UploadCloud } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { cx } from '../lib/utils'

const ACCEPT = 'video/*,.mp4,.webm,.mkv,.mov,.avi,.m4v,.wmv,.flv,.mpg,.mpeg,.3gp'

export default function Dropzone({ onFile, disabled, className, containerRef }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  const depthRef = useRef(0)

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      depthRef.current = 0
      setDragging(false)
      if (disabled) return
      const file = e.dataTransfer.files?.[0]
      if (file) onFile(file)
    },
    [disabled, onFile],
  )

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    depthRef.current += 1
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    depthRef.current -= 1
    if (depthRef.current <= 0) {
      depthRef.current = 0
      setDragging(false)
    }
  }, [])

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [disabled],
  )

  const handlePick = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (file) onFile(file)
      e.target.value = ''
    },
    [onFile],
  )

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      role="button"
      tabIndex={0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      aria-disabled={disabled}
      className={cx(
        'group relative isolate flex flex-col items-center justify-center overflow-hidden rounded-[28px] border-2 border-dashed',
        'px-6 py-14 text-center transition-[border-color,background-color,box-shadow,transform,opacity] duration-500 outline-none sm:px-10 sm:py-20',
        dragging
          ? 'border-gold scale-[1.01] bg-gold/[0.06]'
          : 'border-hairline hover:border-gold-dark/45 hover:bg-surface-raised/60',
        disabled && 'pointer-events-none opacity-40',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handlePick}
        tabIndex={-1}
      />

      <div
        className={cx(
          'pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500',
          dragging ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,160,23,0.28),transparent_70%)] blur-2xl" />
      </div>

      <motion.div
        animate={dragging ? { scale: 1.08, y: -6 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={cx(
          'mx-auto grid h-[72px] w-[72px] shrink-0 place-items-center rounded-[22px] transition-colors duration-500',
          dragging
            ? 'bg-gold text-[#1d1d1f] shadow-[0_16px_40px_-12px_rgba(164,120,8,0.9)]'
            : 'border-hairline bg-surface-raised text-ink-secondary group-hover:border-gold-dark/30 group-hover:text-gold-ink border',
        )}
      >
        {dragging ? (
          <UploadCloud className="h-8 w-8" strokeWidth={2} />
        ) : (
          <FileVideo className="h-8 w-8" strokeWidth={1.8} />
        )}
      </motion.div>

      <p className="mt-7 shrink-0 text-xl font-semibold tracking-tight sm:text-2xl">
        {dragging ? 'Отпускайте файл' : 'Перетащите видео сюда'}
      </p>
      <p className="text-ink-secondary mt-2.5 shrink-0 text-[15px]">
        или <span className="text-gold-ink font-medium">выберите файл</span> на компьютере
      </p>

      <div className="mt-7 flex shrink-0 flex-wrap items-center justify-center gap-2">
        {['MP4', 'WebM', 'MKV', 'MOV', 'AVI', 'GIF', 'до 4 ГБ'].map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
      </div>

      <p className="text-ink-tertiary mt-6 flex shrink-0 items-center justify-center gap-1.5 text-xs">
        <Sparkles className="h-3.5 w-3.5" />
        Характеристики определятся автоматически
      </p>
    </motion.div>
  )
}