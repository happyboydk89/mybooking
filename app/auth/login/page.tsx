'use client'

import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include cookies in request
    })
    const data = await res.json()
    if (!data.success) {
      alert(data.error || 'Login failed')
    } else {
      // Give browser time to receive and set cookie before navigating
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 100)
    }
    setLoading(false)
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        alert('Missing Supabase configuration in environment variables')
        return
      }

      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      })

      if (error) {
        alert(error.message || 'Social login failed')
      }
    } catch (error) {
      console.error('Social login error:', error)
      alert('Social login failed')
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="divider">Hoac</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
            >
              {socialLoading === 'google' ? 'Dang ket noi...' : 'Login with Gmail'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleSocialLogin('facebook')}
              disabled={socialLoading !== null}
            >
              {socialLoading === 'facebook' ? 'Dang ket noi...' : 'Login with Facebook'}
            </button>
          </div>
          <div className="text-center">
            <a href="/auth/signup" className="link link-primary">Don't have an account? Sign up</a>
          </div>
        </div>
      </div>
    </div>
  )
}