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
      setMessage(data.error || 'Cap nhat that bai')
      setLoading(false)
      return
    }

    setMessage('Cap nhat thong tin thanh cong')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title">Thong tin ca nhan</h2>
        <p className="text-sm text-gray-600">Email: {email}</p>

        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Ten</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="Nhap ten cua ban"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">So dien thoai</span>
            </label>
            <input
              type="tel"
              className="input input-bordered"
              placeholder="Nhap so dien thoai"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Dang cap nhat...' : 'Cap nhat profile'}
            </button>
            {message && <span className="text-sm">{message}</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
