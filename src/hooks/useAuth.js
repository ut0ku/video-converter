import { useCallback, useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'converter-token'

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || payload.error || 'Ошибка запроса')
  return payload
}

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  const refresh = useCallback(async () => {
    try {
      const headers = authHeaders(token)
      if (token) {
        const profile = await request('/auth/me', { headers })
        setUser(profile.user || profile)
      } else {
        setUser(null)
      }
      setUsage(await request('/usage', { headers }))
    } catch {
      if (token) {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      }
      setUsage(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { refresh() }, [refresh])

  const authenticate = useCallback(async (path, email, password) => {
    const result = await request(path, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem(TOKEN_KEY, result.token)
    setToken(result.token)
    setUser({ email: result.email, admin: false })
    setUsage(await request('/usage', { headers: authHeaders(result.token) }))
    return result
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setUsage(null)
  }, [])

  return {
    token,
    user,
    usage,
    loading,
    login: (email, password) => authenticate('/auth/login', email, password),
    register: (email, password) => authenticate('/auth/register', email, password),
    logout,
    refresh,
  }
}
