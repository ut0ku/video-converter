import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, Cpu, Gauge, HardDrive, Plus, RefreshCw, Users } from 'lucide-react'
import { authHeaders } from '../hooks/useAuth'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

function Card({ children, className = '' }) {
  return <div className={`bg-surface-raised rounded-2xl p-4 ${className}`}>{children}</div>
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <Card>
      <div className="text-ink-tertiary flex items-center gap-2 text-xs"><Icon className="h-4 w-4" />{label}</div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail && <p className="text-ink-tertiary mt-1 text-xs">{detail}</p>}
    </Card>
  )
}

export default function AdminDashboard({ token }) {
  const [data, setData] = useState({ stats: null, server: null, users: [] })
  const [error, setError] = useState('')
  const [grant, setGrant] = useState({ email: '', amount: 10 })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const headers = authHeaders(token)
      const [stats, server, users] = await Promise.all([
        fetch(`${API_BASE}/admin/statistics`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/admin/server`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/admin/users`, { headers }).then((r) => r.json()),
      ])
      setData({ stats, server, users })
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Не удалось загрузить данные панели')
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const refreshServer = async () => {
      try {
        const response = await fetch(`${API_BASE}/admin/server`, { headers: authHeaders(token) })
        if (!response.ok) throw new Error('Не удалось получить нагрузку сервера')
        const server = await response.json()
        setData((current) => ({ ...current, server }))
      } catch (requestError) {
        setError(requestError.message || 'Не удалось получить нагрузку сервера')
      }
    }
    refreshServer()
    const timer = window.setInterval(refreshServer, 1000)
    return () => window.clearInterval(timer)
  }, [token])

  useEffect(() => {
    const timer = window.setInterval(load, 10000)
    return () => window.clearInterval(timer)
  }, [load])

  const daily = useMemo(() => Object.entries(data.stats?.dailyConversions || {}).slice(-7), [data.stats])
  const formats = Object.entries(data.stats?.conversionTypeUsage || {})
  const maxFormat = Math.max(1, ...formats.map(([, value]) => value))
  const maxDaily = Math.max(1, ...daily.map(([, value]) => value))
  const activeJobs = Object.entries(data.server?.jobs || {}).filter(([state]) => ['queued', 'running'].includes(state))
    .reduce((sum, [, count]) => sum + count, 0)
  const memoryPercent = data.server?.memoryMaxMb ? Math.round(data.server.memoryUsedMb * 100 / data.server.memoryMaxMb) : 0

  const submitGrant = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(grant.email)}/limit`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(grant.amount) }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Не удалось выдать лимит')
      setGrant({ email: '', amount: 10 })
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <div><p className="text-ink-tertiary text-xs">Панель администратора</p><h3 className="text-lg font-semibold">Мониторинг и управление</h3></div>
        <button type="button" onClick={load} className="btn-ghost grid h-9 w-9 place-items-center" title="Обновить"><RefreshCw className="h-4 w-4" /></button>
      </div>
      {error && <p className="text-apple-pink text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Metric icon={BarChart3} label="Конвертаций" value={data.stats?.totalConversions ?? 0} detail="за всё время работы" />
        <Metric icon={Activity} label="Активных задач" value={activeJobs} detail="в очереди и выполняются" />
        <Metric icon={Cpu} label="CPU load" value={data.server?.cpuLoadAvailable === false ? 'Н/Д' : `${data.server?.cpuLoad ?? 0}%`} detail={`${data.server?.availableProcessors ?? 0} ядер`} />
        <Metric icon={HardDrive} label="Память JVM" value={`${memoryPercent}%`} detail={`${data.server?.memoryUsedMb ?? 0} / ${data.server?.memoryMaxMb ?? 0} MB`} />
      </div>

      <Card>
        <p className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4" />Конвертации за последние дни</p>
        <div className="mt-4 flex h-28 items-end gap-2">
          {daily.length ? daily.map(([date, value]) => (
            <div key={date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="text-ink-tertiary text-[10px]">{value}</span>
              <div className="from-gold w-full rounded-t-md bg-gradient-to-t to-gold-light" style={{ height: `${Math.max(8, value * 100 / maxDaily)}%` }} />
              <span className="text-ink-tertiary text-[9px]">{date.slice(5)}</span>
            </div>
          )) : <p className="text-ink-tertiary text-sm">Данных пока нет</p>}
        </div>
      </Card>

      <Card>
        <p className="font-semibold">Форматы</p>
        <div className="mt-3 space-y-2">
          {formats.length ? formats.map(([format, value]) => <div key={format} className="flex items-center gap-2 text-sm"><span className="w-10">{format.toUpperCase()}</span><div className="bg-surface h-2 flex-1 overflow-hidden rounded-full"><div className="bg-gold h-full rounded-full" style={{ width: `${value * 100 / maxFormat}%` }} /></div><b className="w-8 text-right">{value}</b></div>) : <p className="text-ink-tertiary text-sm">Данных пока нет</p>}
        </div>
      </Card>

      <Card>
        <p className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" />Лимиты пользователей</p>
        <div className="mt-3 space-y-2">
          {data.users.map((user) => <div key={user.email} className="flex items-center justify-between gap-2 text-sm"><span className="min-w-0 truncate">{user.email}</span><span className="text-ink-secondary shrink-0">{user.used}/{user.limit}{user.extraLimit ? ` (+${user.extraLimit})` : ''}</span></div>)}
        </div>
        <form onSubmit={submitGrant} className="mt-4 flex gap-2">
          <input required type="email" value={grant.email} onChange={(event) => setGrant({ ...grant, email: event.target.value })} placeholder="user@example.com" className="field min-w-0 flex-1" />
          <input required min="1" max="100000" type="number" value={grant.amount} onChange={(event) => setGrant({ ...grant, amount: event.target.value })} className="field w-20" />
          <button disabled={busy} className="btn-primary grid h-11 w-11 shrink-0 place-items-center" title="Выдать лимит"><Plus className="h-4 w-4" /></button>
        </form>
      </Card>
    </div>
  )
}
