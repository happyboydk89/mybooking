'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ProfileSettingsFormProps = {
  email: string
  initialName?: string | null
  initialPhone?: string | null
}

export default function ProfileSettingsForm({
  email,
  initialName,
  initialPhone,
}: ProfileSettingsFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName ?? '')
  const [phone, setPhone] = useState(initialPhone ?? '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone }),
        credentials: 'include',
      })

      const data = await res.json()
      if (!data.success) {
        setMessage(`❌ ${data.error || 'Failed to update profile'}`)
        setLoading(false)
        return
      }

      setMessage('✅ Profile updated successfully!')
      setLoading(false)
      setTimeout(() => {
        router.refresh()
        setMessage('')
      }, 1500)
    } catch (error) {
      setMessage('❌ An error occurred while updating your profile')
      setLoading(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-xl font-bold text-slate-900">Personal Information</h2>
        <p className="text-sm text-slate-600 mb-4">Email: <span className="font-medium">{email}</span></p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-slate-700">Full Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered focus:input-primary"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-slate-700">Phone Number</span>
              </label>
              <input
                type="tel"
                className="input input-bordered focus:input-primary"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 pt-4">
            <button 
              type="submit" 
              className="btn btn-primary btn-wide md:btn-md"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            {message && (
              <span className={`text-sm font-medium ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
