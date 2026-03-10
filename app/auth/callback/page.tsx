'use client'

import { useEffect, useState } from 'react'

const OAUTH_ERROR = 'Khong the dang nhap bang mang xa hoi. Vui long thu lai.'

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Dang xu ly dang nhap...')

  useEffect(() => {
    const completeLogin = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          setMessage('Thieu cau hinh Supabase. Vui long kiem tra env.')
          return
        }

        const [{ createClient }] = await Promise.all([import('@supabase/supabase-js')])
        const supabase = createClient(supabaseUrl, supabaseKey)

        const searchParams = new URLSearchParams(window.location.search)
        const code = searchParams.get('code')

        if (code) {
          const exchangeResult = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeResult.error) {
            setMessage(OAUTH_ERROR)
            return
          }
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user?.email) {
          setMessage(OAUTH_ERROR)
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          setMessage(OAUTH_ERROR)
          return
        }

        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.preferred_username ||
          ''

        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          ''

        const bridgeRes = await fetch('/api/auth/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: session.access_token, name, avatarUrl }),
          credentials: 'include',
        })

        const bridgeData = await bridgeRes.json()
        if (!bridgeData.success) {
          setMessage(bridgeData.error || OAUTH_ERROR)
          return
        }

        const nextPath = searchParams.get('next') || '/dashboard'
        window.location.href = nextPath
      } catch (error) {
        console.error('OAuth callback error:', error)
        setMessage(OAUTH_ERROR)
      }
    }

    completeLogin()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body text-center">
          <h1 className="text-xl font-semibold">Dang dang nhap</h1>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  )
}
