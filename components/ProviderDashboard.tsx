'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createService, updateAvailability } from '@/lib/actions'

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
})

type ServiceFormData = z.infer<typeof serviceSchema>

const availabilitySchema = z.object({
  monday: z.object({
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean(),
  }),
  tuesday: z.object({
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean(),
  }),
  wednesday: z.object({
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean(),
  }),
  thursday: z.object({
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean(),
  }),
  friday: z.object({
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean(),
  }),
  saturday: z.object({
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean(),
  }),
  sunday: z.object({
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean(),
  }),
})

type AvailabilityFormData = z.infer<typeof availabilitySchema>

interface ProviderDashboardProps {
  user: any
  business: any
}

export default function ProviderDashboard({ user, business }: ProviderDashboardProps) {
  const [serviceMessage, setServiceMessage] = useState('')
  const [availabilityMessage, setAvailabilityMessage] = useState('')

  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      price: 0,
      duration: 60,
    },
  })

  const availabilityForm = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      monday: { startTime: '08:00', endTime: '18:00', isActive: true },
      tuesday: { startTime: '08:00', endTime: '18:00', isActive: true },
      wednesday: { startTime: '08:00', endTime: '18:00', isActive: true },
      thursday: { startTime: '08:00', endTime: '18:00', isActive: true },
      friday: { startTime: '08:00', endTime: '18:00', isActive: true },
      saturday: { startTime: '08:00', endTime: '18:00', isActive: false },
      sunday: { startTime: '08:00', endTime: '18:00', isActive: false },
    },
  })

  const onServiceSubmit = async (data: ServiceFormData) => {
    const result = await createService(business.id, data.name, data.price, data.duration)
    if (result.success) {
      setServiceMessage('Service created successfully!')
      serviceForm.reset()
    } else {
      setServiceMessage(result.error || 'Failed to create service')
    }
  }

  const onAvailabilitySubmit = async (data: AvailabilityFormData) => {
    // For simplicity, update each day separately
    const promises = Object.entries(data).map(async ([day, avail]) => {
      const dayOfWeek = day.toUpperCase() as any
      return updateAvailability(business.id, dayOfWeek, avail.startTime, avail.endTime, avail.isActive)
    })

    const results = await Promise.all(promises)
    const failed = results.filter(r => !r.success)
    if (failed.length === 0) {
      setAvailabilityMessage('Availability updated successfully!')
    } else {
      setAvailabilityMessage('Some updates failed')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>
      <p className="mb-8">Welcome, {user.name || user.email}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Create Service</h2>
            <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Service Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  {...serviceForm.register('name')}
                />
                {serviceForm.formState.errors.name && (
                  <span className="text-error text-sm">{serviceForm.formState.errors.name.message}</span>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Price ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full"
                  {...serviceForm.register('price', { valueAsNumber: true })}
                />
                {serviceForm.formState.errors.price && (
                  <span className="text-error text-sm">{serviceForm.formState.errors.price.message}</span>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Duration (minutes)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  {...serviceForm.register('duration', { valueAsNumber: true })}
                />
                {serviceForm.formState.errors.duration && (
                  <span className="text-error text-sm">{serviceForm.formState.errors.duration.message}</span>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={serviceForm.formState.isSubmitting}>
                {serviceForm.formState.isSubmitting ? 'Creating...' : 'Create Service'}
              </button>
            </form>
            {serviceMessage && (
              <div className={`alert mt-4 ${serviceMessage.includes('success') ? 'alert-success' : 'alert-error'}`}>
                <span>{serviceMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Availability Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Set Availability</h2>
            <form onSubmit={availabilityForm.handleSubmit(onAvailabilitySubmit)} className="space-y-4">
              {Object.entries(availabilityForm.getValues()).map(([day, values]) => (
                <div key={day} className="border p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize">{day}</h3>
                    <input
                      type="checkbox"
                      className="checkbox"
                      {...availabilityForm.register(`${day}.isActive` as any)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">
                        <span className="label-text">Start Time</span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered w-full"
                        {...availabilityForm.register(`${day}.startTime` as any)}
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">End Time</span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered w-full"
                        {...availabilityForm.register(`${day}.endTime` as any)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="submit" className="btn btn-primary w-full" disabled={availabilityForm.formState.isSubmitting}>
                {availabilityForm.formState.isSubmitting ? 'Updating...' : 'Update Availability'}
              </button>
            </form>
            {availabilityMessage && (
              <div className={`alert mt-4 ${availabilityMessage.includes('success') ? 'alert-success' : 'alert-error'}`}>
                <span>{availabilityMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}