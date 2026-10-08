export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 Б'
  const units = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** i
  return `${value.toFixed(i === 0 ? 0 : value < 10 ? 2 : 1)} ${units[i]}`
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function formatTimecode(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function estimateOutputSize({
  sourceBytes,
  duration,
  resolution,
  resolutionWidth,
  resolutionHeight,
  quality,
  format,
}) {
  if (!sourceBytes || !duration) return null
  const presetFactor = {
    source: 1,
    '2160p': 4.2,
    '1440p': 2.4,
    '1080p': 1.6,
    '720p': 1,
    '480p': 0.55,
    '360p': 0.32,
  }[resolution]
  const customFactor =
    resolution === 'custom' && resolutionWidth > 0 && resolutionHeight > 0
      ? (resolutionWidth * resolutionHeight) / (1280 * 720)
      : null
  const resFactor = customFactor ?? presetFactor ?? 1
  const qualityFactor = 0.35 + (quality / 100) * 1.3
  const formatFactor = { mp4: 1, webm: 0.82, mkv: 1.08, mov: 1.95, avi: 1.12, gif: 1.5 }[format] ?? 1
  const bitsPerSecond = (sourceBytes * 8) / duration
  return bitsPerSecond * resFactor * qualityFactor * formatFactor
}

export function simplifyRatio(width, height) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
  if (!width || !height) return '—'
  const g = gcd(width, height) || 1
  const w = Math.round(width / g)
  const h = Math.round(height / g)
  return w <= 40 && h <= 40 ? `${w}:${h}` : (width / height).toFixed(2).replace(/\.?0+$/, '') + ':1'
}

export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}