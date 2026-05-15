'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json()
        setError(data.error || 'Password errata')
      }
    } catch {
      setError('Errore di rete. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <div className="w-full max-w-md px-6">

        {/* Logo / Header */}
        <div className="text-center mb-10">
          <h1
            className="text-5xl font-light mb-2"
            style={{ color: '#faf8f3', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}
          >
            Mezzo Secolo
          </h1>
          <p style={{ color: '#c9a84c', letterSpacing: '4px', fontSize: '12px', textTransform: 'uppercase' }}>
            Area riservata
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{ background: 'rgba(250,248,243,0.05)', border: '1px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(10px)' }}
        >
          <h2
            className="text-xl mb-6 text-center font-light"
            style={{ color: '#faf8f3', fontFamily: 'Georgia, serif' }}
          >
            Accedi alla dashboard
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm mb-2"
                style={{ color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '11px' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(201,168,76,0.4)',
                  color: '#faf8f3',
                  fontSize: '16px',
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all"
              style={{
                background: loading ? 'rgba(201,168,76,0.5)' : '#c9a84c',
                color: '#1a1a2e',
                fontSize: '15px',
                letterSpacing: '1px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Accesso in corso…' : 'Accedi'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(250,248,243,0.3)' }}>
          50° compleanno di Mattia Baldini · 18 Giugno 2026
        </p>
      </div>
    </div>
  )
}
