import { motion } from 'framer-motion'
import { Cloud, HardDriveDownload, Layers, Scissors, ShieldCheck, Sparkles, Wand2, Zap } from 'lucide-react'
import { FEATURES } from '../data/catalog'
import { SectionHeading } from './FileInfo'

function AfterEffectsIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8.54 10.73c-.1-.31-.19-.61-.29-.92s-.19-.6-.27-.89c-.08-.28-.15-.54-.22-.78h-.02c-.09.43-.2.86-.34 1.29-.15.48-.3.98-.46 1.48-.13.51-.29.98-.44 1.4h2.54c-.06-.21-.14-.46-.23-.72-.09-.27-.18-.56-.27-.86zm8.58-.29c-.55-.03-1.07.26-1.33.76-.12.23-.19.47-.22.72h2.109c.26 0 .45 0 .57-.01.08-.01.16-.03.23-.08v-.1c0-.13-.021-.25-.061-.37-.178-.56-.708-.94-1.298-.92zM19.75.3H4.25C1.9.3 0 2.2 0 4.55v14.9c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.04 16.511h-2.09c-.07.01-.14-.041-.16-.11l-.82-2.4H5.92l-.76 2.36c-.02.09-.1.15-.19.14H3.09c-.11 0-.14-.06-.11-.18L6.2 7.39c.03-.1.06-.19.1-.31.04-.21.06-.43.06-.65-.01-.05.03-.1.08-.11h2.59c.07 0 .12.03.13.08l3.65 10.25c.03.11.001.161-.1.161zm7.851-3.991c-.021.189-.031.33-.041.42-.01.07-.069.13-.14.13-.06 0-.17.01-.33.021-.159.02-.35.029-.579.029-.23 0-.471-.04-.73-.04h-3.17c.039.31.14.62.31.89.181.271.431.48.729.601.4.17.841.26 1.281.25.35-.011.699-.04 1.039-.11.311-.039.61-.119.891-.23.05-.039.08-.02.08.08v1.531c0 .039-.01.08-.021.119-.021.03-.04.051-.069.07-.32.14-.65.24-1 .3-.471.09-.94.13-1.42.12-.761 0-1.4-.12-1.92-.35-.49-.211-.921-.541-1.261-.95-.319-.39-.55-.83-.69-1.31-.14-.471-.209-.961-.209-1.461 0-.539.08-1.07.25-1.59.16-.5.41-.96.75-1.37.33-.4.739-.72 1.209-.95.471-.23 1.03-.31 1.67-.31.531-.01 1.06.09 1.55.31.41.18.77.45 1.05.8.26.34.47.72.601 1.14.129.4.189.81.189 1.22 0 .24-.01.45-.019.64z" />
    </svg>
  )
}

function TikTokIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

const ICONS = {
  bolt: Zap,
  shield: ShieldCheck,
  wand: Wand2,
  layers: Layers,
  scissors: Scissors,
  cloud: Cloud,
}

export default function Features() {
  return (
    <section id="features" className="scroll-mt-24 pt-8 pb-16 sm:pt-9 sm:pb-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Возможности"
          icon={Sparkles}
          title="Всё, что нужно для работы с видео"
          description="Конвертер построен так, чтобы рутинные операции не занимали время."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = ICONS[feature.icon] ?? Sparkles
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
                whileHover={{ y: -6 }}
                className="border-hairline group relative overflow-hidden rounded-3xl border p-6"
              >
                <motion.div
                  initial={false}
                  whileHover={{ opacity: 1 }}
                  className="pointer-events-none absolute inset-0 opacity-0"
                  style={{
                    background: `radial-gradient(110% 80% at 10% 0%, ${feature.color}1a, transparent 60%)`,
                  }}
                />
                <span
                  className="relative grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: `color-mix(in oklab, ${feature.color} 16%, transparent)`,
                    color: feature.color,
                  }}
                >
                  <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
                </span>
                <h3 className="relative mt-5 text-[17px] font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-ink-secondary relative mt-2.5 text-[14px] leading-relaxed">
                  {feature.text}
                </p>
              </motion.article>
            )
          })}
        </div>

        <FeatureBanners />
      </div>
    </section>
  )
}

const STEPS = [
  { n: '01', title: 'Перетащите файл', text: 'Drag & drop или выбор из проводника. Метаданные читаются автоматически.' },
  { n: '02', title: 'Настройте вывод', text: 'Формат, разрешение, частота кадров и качество.' },
  { n: '03', title: 'Нажмите «Рендерить»', text: 'Прогресс в реальном времени, возможность отмены в любой момент.' },
]

const USE_CASES = [
  {
    icon: AfterEffectsIcon,
    title: 'Видеомонтажа',
    text: 'Конвертация видео для совместимости с After Effects, Premiere Pro, DaVinci Resolve.',
  },
  {
    icon: TikTokIcon,
    title: 'Соцсетей',
    text: 'Подгонка видеороликов под требования Instagram, TikTok, YouTube.',
  },
  {
    icon: HardDriveDownload,
    title: 'Хранения & Отправки',
    text: 'Сжатие видео для удобного хранения и быстрой отправки.',
  },
]

function FeatureBanners() {
  return (
    <>
      <div id="scenarios" className="mt-16 scroll-mt-24">
        <SectionHeading
          eyebrow="Сценарии"
          icon={Sparkles}
          title="Один конвертер — разные задачи"
          description="Под каждый сценарий подбираются кодек, разрешение и битрейт, чтобы файл точно подошёл под требования."
        />
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {USE_CASES.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}
              className="border-hairline group rounded-3xl border p-6"
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
                style={{
                  background: 'color-mix(in oklab, var(--color-gold) 16%, transparent)',
                  color: 'var(--color-gold)',
                }}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
              </span>
              <h3 className="mt-5 text-[17px] font-semibold tracking-tight">{item.title}</h3>
              <p className="text-ink-secondary mt-2.5 text-[14px] leading-relaxed">{item.text}</p>
            </motion.div>
          )
        })}
      </div>

      <div id="instructions" className="mt-16 scroll-mt-24">
        <SectionHeading
          eyebrow="Как это работает"
          icon={Wand2}
          title="Три шага до готового файла"
          description="От перетаскивания до результата — без очередей, настроек сервера и лишних шагов."
        />
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.32, 0.72, 0, 1] }}
            className="border-hairline relative rounded-3xl border p-6"
          >
            <span className="text-gold-ink text-[13px] font-bold tracking-[0.2em]">{step.n}</span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
            <p className="text-ink-secondary mt-2 text-[14px] leading-relaxed">{step.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="mt-16 flex flex-col items-center text-center"
      >
        <p className="text-gradient text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Хотите пользоваться полными функциями программы без ограничений?
        </p>
        <p className="text-ink-secondary mt-4 max-w-xl text-[15px] leading-relaxed text-balance">
          Зарегистрируйтесь, чтобы рендерить без лимитов, сохранять пресеты и возвращаться к истории
          задач с любого устройства.
        </p>
        <button type="button" className="btn-primary mt-8 px-8 py-3 text-[15px]">
          Зарегистрироваться
        </button>
      </motion.div>
    </>
  )
}