'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (!data.user) { setError('Login failed'); setLoading(false); return }

    // Determine redirect
    const { data: adminUser } = await supabase
      .from('admin_users').select('id').eq('auth_user_id', data.user.id).eq('active', true).single()
    if (adminUser) { router.push('/admin'); return }

    const { data: client } = await supabase
      .from('clients').select('id').eq('email', data.user.email).single()
    if (client) { router.push(`/portal/${client.id}`); return }

    setError('No account found. Contact your Sanctuary consultant.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-5xl shadow-lg">
              🕊
            </div>
            <div>
              <div className="text-3xl font-bold text-white tracking-tight font-serif">SANCTUARY</div>
              <div className="text-xs tracking-[3px] text-goldLt uppercase mt-1">Consulting</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-xl font-bold text-darkText mb-1">Sign in to your portal</h1>
          <p className="text-sm text-midGray mb-6">Admin staff and clients use the same login</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red border border-red-200 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-tan text-center">
            <p className="text-xs text-midGray">
              Need access? Contact Sanctuary at{' '}
              <a href="tel:6126004034" className="text-forest font-bold">612-600-4034</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
