export const FORMATS = [
  {
    id: 'mp4',
    ext: 'MP4',
    label: 'MP4',
    blurb: 'Универсальный формат. Идеален для веба, соцсетей и большинства плееров.',
    videoCodec: 'H.264 / H.265',
    audioCodec: 'AAC',
    kind: 'video',
    accent: '#e0a009',
    tags: ['Совместимость', 'Стриминг'],
  },
  {
    id: 'webm',
    ext: 'WEBM',
    label: 'WebM',
    blurb: 'Открытый формат для сайтов. Лучшее сжатие для VP9 и AV1.',
    videoCodec: 'VP9 / AV1',
    audioCodec: 'Opus',
    kind: 'video',
    accent: '#30d158',
    tags: ['Веб', 'Сжатие'],
  },
  {
    id: 'mkv',
    ext: 'MKV',
    label: 'MKV',
    blurb: 'Гибкий контейнер: несколько дорожек, субтитры, главы. Для архивов.',
    videoCodec: 'Любой',
    audioCodec: 'Любой',
    kind: 'video',
    accent: '#ff9f0a',
    tags: ['Архив', 'Дорожки'],
  },
  {
    id: 'mov',
    ext: 'MOV',
    label: 'MOV',
    blurb: 'Нативный формат Apple. ProRes и 10-бит для монтажа.',
    videoCodec: 'ProRes / H.265',
    audioCodec: 'PCM / AAC',
    kind: 'video',
    accent: '#5e5ce6',
    tags: ['Про', 'Монтаж'],
  },
  {
    id: 'avi',
    ext: 'AVI',
    label: 'AVI',
    blurb: 'Старый добрый контейнер с огромной совместимостью с legacy-софтом.',
    videoCodec: 'MPEG-4',
    audioCodec: 'MP3',
    kind: 'video',
    accent: '#ff2d55',
    tags: ['Legacy'],
  },
  {
    id: 'gif',
    ext: 'GIF',
    label: 'GIF',
    blurb: 'Анимированное изображение без звука. Для реакций и превью.',
    videoCodec: 'GIF-89a',
    audioCodec: '—',
    kind: 'image',
    accent: '#ff375f',
    tags: ['Сторис', 'Превью'],
  },
]

export const RESOLUTIONS = [
  { id: 'source', label: 'Оригинал', hint: 'Без изменения' },
  { id: '2160p', label: '4K', hint: '3840 × 2160', width: 3840, height: 2160 },
  { id: '1440p', label: '2K', hint: '2560 × 1440', width: 2560, height: 1440 },
  { id: '1080p', label: 'Full HD', hint: '1920 × 1080', width: 1920, height: 1080 },
  { id: '720p', label: 'HD', hint: '1280 × 720', width: 1280, height: 720 },
  { id: '480p', label: 'SD', hint: '854 × 480', width: 854, height: 480 },
  { id: '360p', label: '360p', hint: '640 × 360', width: 640, height: 360 },
]

export const FPS_MODES = [
  { value: 'source', label: 'Оригинал' },
  { value: 'custom', label: 'Кастом' },
]

export const FEATURES = [
  {
    icon: 'bolt',
    title: 'Мгновенная обработка',
    text: 'Рендер идёт на сервере — быстро, без очередей и ожиданий.',
    color: '#ff9f0a',
  },
  {
    icon: 'shield',
    title: 'Файлы не покидают устройство',
    text: 'Файлы загружаются на сервер для обработки и удаляются после рендера.',
    color: '#30d158',
  },
  {
    icon: 'wand',
    title: 'Умные значения по умолчанию',
    text: 'Кодек, битрейт и разрешение подбираются автоматически под выбранный формат.',
    color: '#5e5ce6',
  },
  {
    icon: 'layers',
    title: 'Пакетная обработка',
    text: 'До 10 файлов за один проход с общей очередью рендера.',
    color: '#f7d774',
  },
  {
    icon: 'scissors',
    title: 'Гибкие настройки',
    text: 'Настройте разрешение, частоту кадров, качество и формат вывода под любые задачи.',
    color: '#ff2d55',
  },
  {
    icon: 'cloud',
    title: 'Прогресс в реальном времени',
    text: 'Следите за этапами рендеринга: анализ, декодирование, кодирование и сборка контейнера.',
    color: '#e0a009',
  },
]

export const FORMAT_BY_ID = Object.fromEntries(FORMATS.map((f) => [f.id, f]))