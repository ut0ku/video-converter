import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, Clapperboard, ShieldCheck, Sparkles } from 'lucide-react'
import { useRef } from 'react'
import { HeroBadge } from './Header'

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: 'Файлы остаются на устройстве' },
  { icon: Clapperboard, label: '6 форматов на выбор' },
  { icon: Sparkles, label: 'Мгновенный рендер' },
]

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="top" className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-18rem] left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,160,23,0.22),transparent_65%)] blur-3xl dark:opacity-60" />
        <div className="animate-float absolute top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,160,23,0.20),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,45,85,0.14),transparent_65%)] blur-3xl" />
        <div className="grid-lines mask-fade-x absolute inset-0 opacity-[0.55]" />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="container-page flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <HeroBadge />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
          className="section-title mt-7 max-w-4xl"
        >
          Видео в любой формат
          <br />
          <span className="text-gradient">за пару секунд</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.16, ease: [0.32, 0.72, 0, 1] }}
          className="text-ink-secondary mt-6 max-w-2xl text-lg leading-relaxed text-balance sm:text-xl"
        >
          Перетащите файл — характеристики определятся автоматически.<br />
          Выберите формат, настройте качество и нажмите «Рендерить».<br />
          Обработка идёт на сервере — быстро и безопасно.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24, ease: [0.32, 0.72, 0, 1] }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a
            href="#converter"
            className="btn-primary flex h-12 items-center justify-center px-7 text-[15px] text-center"
          >
            Загрузить видео
          </a>
          <a
            href="#features"
            className="btn-ghost flex h-12 items-center justify-center px-7 text-[15px] text-center"
          >
            Как это работает
          </a>
        </motion.div>

        <motion.ul
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.4 } } }}
          initial="hidden"
          inView="show"
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <motion.li
              key={label}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] } },
              }}
              className="text-ink-tertiary flex items-center gap-2 text-sm font-medium"
            >
              <Icon className="text-gold-ink h-4 w-4" strokeWidth={2.2} />
              {label}
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>

      <motion.div
        initial={{ opacity: inView ? 0 : 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6 }}
        className="mt-16 flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-ink-tertiary flex flex-col items-center gap-1.5"
        >
          <span className="text-[11px] font-medium tracking-wide uppercase">Листайте вниз</span>
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  )
}