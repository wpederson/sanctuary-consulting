'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PortalLoginPage({ params }: { params: { clientId: string } }) {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Invalid email or password'); setLoading(false); return }
    router.push(`/portal/${params.clientId}`)
  }

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🕊</div>
          <div className="text-2xl font-bold text-white font-serif">SANCTUARY</div>
          <div className="text-xs tracking-widest text-goldLt uppercase mt-1">Client Portal</div>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-lg font-bold text-darkText mb-4">Sign in to your portal</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="input" />
            </div>
            {error && <div className="text-red text-sm bg-red-50 rounded-lg px-4 py-3">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Signing in…' : 'Access My Portal →'}
            </button>
          </form>
          <div className="mt-5 pt-4 border-t border-tan text-center text-xs text-midGray">
            Need help? <a href="tel:6126004034" className="text-forest font-bold">612-600-4034</a>
          </div>
        </div>
      </div>
    </div>
  )
}
