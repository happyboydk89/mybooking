'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

const serviceSchema = z.object({
  name: z.string().min(1, 'Tên dịch vụ là bắt buộc').min(3, 'Tên dịch vụ phải ít nhất 3 ký tự'),
  description: z.string().optional(),
  price: z
    .any()
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0, 'Giá phải là số dương'),
  duration: z.string().refine((val) => ['15', '30', '60'].includes(val), 'Chọn thời lượng hợp lệ'),
  requiresPayment: z.boolean().optional(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  businessId: string
  onSuccess: () => void
  onClose: () => void
}

export default function ServiceForm({ businessId, onSuccess, onClose }: ServiceFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: '60',
      requiresPayment: false,
    },
  })

  const requiresPayment = watch('requiresPayment')

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('businessId', businessId)
      formData.append('name', data.name)
      formData.append('description', data.description || '')
      formData.append('price', data.price.toString())
      formData.append('duration', data.duration)
      formData.append('requiresPayment', (data.requiresPayment || false).toString())

      const response = await fetch('/api/services', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        reset()
        onClose()
        onSuccess()
      } else {
        const result = await response.json()
        setError(result.error || 'Không thể tạo dịch vụ')
      }
    } catch (err) {
      setError('Lỗi: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Service Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Tên dịch vụ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ví dụ: Cắt tóc"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          {...register('name')}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{(errors.name as any)?.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Mô tả
        </label>
        <textarea
          placeholder="Mô tả chi tiết về dịch vụ..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={3}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{(errors.description as any)?.message}</p>
        )}
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Giá <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            {...register('price')}
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{(errors.price as any)?.message}</p>}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Thời lượng <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            {...register('duration')}
          >
            <option value="15">15 phút</option>
            <option value="30">30 phút</option>
            <option value="60">60 phút</option>
          </select>
          {errors.duration && <p className="text-red-500 text-sm mt-1">{(errors.duration as any)?.message}</p>}
        </div>
      </div>

      {/* Payment Toggle */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">Yêu cầu thanh toán trực tuyến</p>
            <p className="text-sm text-slate-600 mt-1">
              Kích hoạt để yêu cầu khách hàng thanh toán khi đặt lịch
            </p>
          </div>
          <input
            type="checkbox"
            className="checkbox checkbox-indigo"
            {...register('requiresPayment')}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          disabled={loading}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Tạo dịch vụ'}
        </button>
      </div>
    </form>
  )
}
