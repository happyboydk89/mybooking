'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBusiness } from '@/lib/actions'

const INDUSTRY_TYPES = ['HAIR_SALON', 'CLINIC', 'SPA_MASSAGE']

export default function CreateBusinessForm({ userId }: { userId: string }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    industryType: 'HAIR_SALON',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await createBusiness(
        userId,
        formData.name,
        formData.description,
        formData.address,
        formData.phone,
        formData.industryType
      )

      if (result.success) {
        // Refresh the page to show the new business
        router.refresh()
      } else {
        setError(result.error || 'Failed to create business')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text">Business Name</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="Enter business name"
          className="input input-bordered"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          name="description"
          placeholder="Enter business description"
          className="textarea textarea-bordered"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Address</span>
        </label>
        <input
          type="text"
          name="address"
          placeholder="Enter business address"
          className="input input-bordered"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Phone</span>
        </label>
        <input
          type="tel"
          name="phone"
          placeholder="Enter phone number"
          className="input input-bordered"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Industry Type</span>
        </label>
        <select
          name="industryType"
          className="select select-bordered"
          value={formData.industryType}
          onChange={handleChange}
        >
          {INDUSTRY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading || !formData.name}
      >
        {loading ? 'Creating...' : 'Create Business'}
      </button>
    </form>
  )
}
