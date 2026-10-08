import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Film, Menu, Moon, Sparkles, Sun, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cx } from '../lib/utils'

const NAV = [
  { label: 'Конвертер', href: '#converter' },
  { label: 'Возможности', href: '#features' },
  { label: 'Сценарии', href: '#scenarios' },
  { label: 'Инструкция', href: '#instructions' },
]

export default function Header({ theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'py-2' : 'py-4',
      )}
      style={{ easeTimingFunction: 'var(--ease-apple)' }}
    >
      <div className="container-page">
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className={cx(
            'flex items-center justify-between gap-4 px-3 py-2.5 transition-all duration-500 sm:px-4',
            scrolled ? 'glass' : 'border border-transparent',
          )}
        >
          <a href="#top" className="group flex shrink-0 items-center gap-2.5">
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-[11px] bg-gradient-to-br from-gold to-gold-dark shadow-[0_4px_14px_-4px_rgba(164,120,8,0.8)] transition-transform duration-500 group-hover:scale-105">
              <Film className="h-[18px] w-[18px] text-white" strokeWidth={2.2} />
              <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.45)_50%,transparent_65%)] bg-[length:200%_100%]" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold tracking-tight">Converter</span>
              <span className="text-ink-tertiary text-[11px] font-medium">Видео конвертер</span>
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-ink-secondary hover:text-ink rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Войти в аккаунт"
              title="Войти в аккаунт"
              className="text-ink-secondary hover:text-ink hover:bg-surface-raised grid h-9 w-9 place-items-center rounded-full transition-all duration-300"
            >
              <User className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Переключить тему"
              className="text-ink-secondary hover:text-ink hover:bg-surface-raised grid h-9 w-9 place-items-center rounded-full transition-all duration-300"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                  className="grid place-items-center"
                >
                  {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                </motion.span>
              </AnimatePresence>
            </button>

            <a
              href="#converter"
              className="btn-primary hidden h-9 items-center gap-1.5 px-4 text-[13px] sm:flex"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Конвертировать
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Меню"
              className="text-ink-secondary hover:text-ink hover:bg-surface-raised grid h-9 w-9 place-items-center rounded-full transition-all duration-300 md:hidden"
            >
              {menuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </motion.nav>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="container-page mt-2 md:hidden"
          >
            <div className="glass flex flex-col overflow-hidden rounded-3xl p-2">
              {NAV.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.35 }}
                  className="text-ink-secondary hover:bg-surface-raised hover:text-ink rounded-2xl px-4 py-3 text-sm font-medium transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export function HeroBadge() {
  return (
    <a
      href="#features"
      className="glass group inline-flex items-center gap-2 py-1.5 pr-3 pl-1.5 text-[13px]"
    >
      <span className="bg-gold/15 text-gold-dark inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold dark:bg-gold/12 dark:text-gold-ink">
        v2.0
      </span>
      <span className="text-ink-secondary font-medium">Конвертация в пару кликов</span>
      <ArrowUpRight className="text-ink-tertiary group-hover:text-ink h-3.5 w-3.5 transition-colors" />
    </a>
  )
}