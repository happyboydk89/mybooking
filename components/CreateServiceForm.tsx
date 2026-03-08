'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  price: z.any().transform((val) => (typeof val === 'string' ? parseFloat(val) : val)).refine((val) => !isNaN(val) && val >= 0, 'Price must be a positive number'),
  duration: z.any().transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)).refine((val) => !isNaN(val) && val >= 1, 'Duration must be at least 1 minute'),
})

type ServiceFormData = z.infer<typeof serviceSchema>

export default function CreateServiceForm({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 60,
    },
  })

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('businessId', businessId)
      formData.append('name', data.name)
      formData.append('description', data.description || '')
      formData.append('price', data.price.toString())
      formData.append('duration', data.duration.toString())

      const response = await fetch('/api/services', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setSuccess(true)
        reset()
        setTimeout(() => {
          setSuccess(false)
          window.location.reload()
        }, 2000)
      } else {
        const result = await response.json()
        setError(result.error || 'Failed to create service')
      }
    } catch (err) {
      setError('An error occurred: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-lg"
    >
      <div className="card-body">
        <h3 className="card-title">Create New Service</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Service Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Service Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Haircut"
              className="input input-bordered"
              {...register('name')}
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description (Optional)</span>
            </label>
            <textarea
              placeholder="Service description"
              className="textarea textarea-bordered"
              {...register('description')}
            />
          </div>

          {/* Price */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Price (USD) *</span>
            </label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              className="input input-bordered"
              {...register('price')}
            />
            {errors.price && (
              <span className="text-red-500 text-sm">{errors.price.message as string}</span>
            )}
          </div>

          {/* Duration */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Duration (minutes) *</span>
            </label>
            <input
              type="number"
              placeholder="60"
              min="1"
              className="input input-bordered"
              {...register('duration')}
            />
            {errors.duration && (
              <span className="text-red-500 text-sm">{errors.duration.message as string}</span>
            )}
          </div>

          {/* Status Messages */}
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert alert-success">
              <span>Service created successfully!</span>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert alert-error">
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="card-actions justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
