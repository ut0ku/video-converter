import { FORMATS } from '../data/catalog'

const TICKER = [
  'MP4 / H.264',
  'WebM / VP9',
  'MKV',
  'MOV / ProRes',
  'AVI',
  'GIF',
  'AV1',
  'HEVC',
  'Opus',
  'AAC',
  '4K 60fps',
  'Пакетный рендер',
  'Локально и приватно',
]

export default function Marquee() {
  const items = [...TICKER, ...TICKER]

  return (
    <div className="mask-fade-x border-hairline relative overflow-hidden border-y py-4">
      <div className="animate-marquee flex w-max items-center gap-8">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="text-ink-tertiary flex shrink-0 items-center gap-8 text-[13px] font-semibold tracking-wide whitespace-nowrap"
          >
            {item}
            <span className="bg-hairline h-1 w-1 rounded-full" />
          </span>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="glass px-4 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
          {FORMATS.length} форматов
        </span>
      </div>
    </div>
  )
}