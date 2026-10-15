import { useState } from 'react'
import { LogOut, X } from 'lucide-react'
import AdminDashboard from './AdminDashboard'

export default function AccountModal({ open, onClose, auth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) return null

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') await auth.login(email, password)
      else await auth.register(email, password)
      setPassword('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="card max-h-[90vh] w-full max-w-md overflow-auto p-6" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{auth.user ? 'Личный кабинет' : mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
          <button type="button" onClick={onClose} className="btn-ghost grid h-9 w-9 place-items-center"><X className="h-4 w-4" /></button>
        </div>

        {auth.user ? (
          <div className="mt-6 space-y-4">
            <div className="bg-surface-raised rounded-2xl p-4">
              <p className="text-ink-tertiary text-xs">Аккаунт</p>
              <p className="mt-1 font-semibold">{auth.user.email}</p>
              <p className="text-ink-secondary mt-2 text-sm">{auth.user.admin ? 'Администратор' : 'Зарегистрированный пользователь'}</p>
            </div>
            <div className="bg-surface-raised rounded-2xl p-4">
              <p className="text-ink-tertiary text-xs">Лимит на сегодня</p>
              <p className="mt-1 text-2xl font-semibold">{auth.usage?.remaining ?? 0} / {auth.usage?.limit ?? 100}</p>
              {(auth.usage?.remaining ?? 0) === 0 && <p className="text-apple-orange mt-2 text-sm">Лимит исчерпан. Возвращайтесь завтра.</p>}
            </div>
            {auth.user.admin && <AdminDashboard token={auth.token} />}
            <button type="button" onClick={() => { auth.logout(); onClose() }} className="btn-ghost flex w-full items-center justify-center gap-2 py-3"><LogOut className="h-4 w-4" /> Выйти</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="text-ink-secondary block text-sm">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field mt-1" /></label>
            <label className="text-ink-secondary block text-sm">Пароль<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field mt-1" /></label>
            {error && <p className="text-apple-pink text-sm">{error}</p>}
            <button disabled={busy} className="btn-primary w-full py-3">{busy ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</button>
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-gold-ink w-full py-2 text-sm">
              {mode === 'login' ? 'Создать аккаунт' : 'У меня уже есть аккаунт'}
            </button>
            <p className="text-ink-tertiary text-center text-xs">Почта не подтверждается и используется только для входа.</p>
          </form>
        )}
      </div>
    </div>
  )
}
