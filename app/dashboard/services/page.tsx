'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  description?: string | null
  price: number
  duration: number
  requiresPayment: boolean
}

interface Business {
  id: string
  name: string
  services: Service[]
}

type IndustryType = 'HAIR_SALON' | 'CLINIC' | 'SPA_MASSAGE'

const serviceSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên dịch vụ'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  duration: z.number().refine((value) => [15, 30, 60, 120].includes(value), {
    message: 'Thời lượng không hợp lệ',
  }),
  requiresPayment: z.boolean(),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

const durationOptions = [15, 30, 60, 120]

export default function ServicesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState('')
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBusinessDialogOpen, setIsBusinessDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [creatingBusiness, setCreatingBusiness] = useState(false)
  const [loading, setLoading] = useState(true)
  const [businessForm, setBusinessForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    industryType: 'HAIR_SALON' as IndustryType,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 60,
      requiresPayment: false,
    },
  })

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedBusinessId),
    [businesses, selectedBusinessId]
  )

  const activeServices = selectedBusiness?.services || []

  const storageKey = useMemo(
    () => (selectedBusinessId ? `service-enabled-${selectedBusinessId}` : ''),
    [selectedBusinessId]
  )

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await fetch('/api/auth/me')
        if (!userRes.ok) {
          window.location.href = '/auth/login'
          return
        }

        await userRes.json()

        const businessRes = await fetch('/api/user/businesses')
        if (businessRes.ok) {
          const businessData = await businessRes.json()
          const loadedBusinesses = (businessData.businesses || []) as Business[]
          setBusinesses(loadedBusinesses)

          if (loadedBusinesses.length > 0) {
            setSelectedBusinessId(loadedBusinesses[0].id)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!storageKey) {
      return
    }

    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        setEnabledMap(JSON.parse(raw) as Record<string, boolean>)
        return
      }

      const defaults = Object.fromEntries(activeServices.map((service) => [service.id, true]))
      setEnabledMap(defaults)
    } catch {
      const defaults = Object.fromEntries(activeServices.map((service) => [service.id, true]))
      setEnabledMap(defaults)
    }
  }, [activeServices, storageKey])

  const updateEnabledMap = (nextMap: Record<string, boolean>) => {
    setEnabledMap(nextMap)
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(nextMap))
    }
  }

  const toggleService = (serviceId: string) => {
    const nextMap = {
      ...enabledMap,
      [serviceId]: !(enabledMap[serviceId] ?? true),
    }
    updateEnabledMap(nextMap)
  }

  const onCreateService = async (values: ServiceFormValues) => {
    if (!selectedBusinessId) {
      toast.error('Vui lòng chọn doanh nghiệp trước khi thêm dịch vụ.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('businessId', selectedBusinessId)
      formData.append('name', values.name)
      formData.append('description', values.description || '')
      formData.append('price', String(values.price))
      formData.append('duration', String(values.duration))
      formData.append('requiresPayment', String(values.requiresPayment))

      const response = await fetch('/api/services', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Không thể thêm dịch vụ')
      }

      const newService = result.service as Service

      setBusinesses((prev) =>
        prev.map((business) =>
          business.id === selectedBusinessId
            ? { ...business, services: [newService, ...(business.services || [])] }
            : business
        )
      )

      updateEnabledMap({ ...enabledMap, [newService.id]: true })
      setIsDialogOpen(false)
      reset()

      toast.success('Đã thêm thành công', {
        description: `Dịch vụ "${newService.name}" đã được tạo.`,
      })
    } catch (error) {
      toast.error('Thêm dịch vụ thất bại', {
        description: (error as Error).message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const onCreateBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!businessForm.name.trim()) {
      toast.error('Vui lòng nhập tên doanh nghiệp')
      return
    }

    setCreatingBusiness(true)
    try {
      const response = await fetch('/api/user/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: businessForm.name,
          description: businessForm.description,
          address: businessForm.address,
          phone: businessForm.phone,
          industryType: businessForm.industryType,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Không thể tạo doanh nghiệp')
      }

      const newBusiness = {
        ...result.business,
        services: [],
      } as Business

      setBusinesses((prev) => [newBusiness, ...prev])
      setSelectedBusinessId(newBusiness.id)
      setIsBusinessDialogOpen(false)
      setBusinessForm({
        name: '',
        description: '',
        address: '',
        phone: '',
        industryType: 'HAIR_SALON',
      })

      toast.success('Tạo doanh nghiệp thành công', {
        description: 'Bạn có thể thêm dịch vụ ngay bây giờ.',
      })
    } catch (error) {
      toast.error('Tạo doanh nghiệp thất bại', {
        description: (error as Error).message,
      })
    } finally {
      setCreatingBusiness(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
          <p className="mt-4 text-slate-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <>
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Quản lý dịch vụ</h1>
          <p className="mt-2 text-slate-600">Bạn chưa có doanh nghiệp. Tạo mới để thêm dịch vụ của riêng bạn.</p>
          <button
            type="button"
            onClick={() => setIsBusinessDialogOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={18} />
            Tạo doanh nghiệp ngay
          </button>
        </div>

        {isBusinessDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Tạo doanh nghiệp</h2>
                <button
                  type="button"
                  onClick={() => setIsBusinessDialogOpen(false)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={onCreateBusiness} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Tên doanh nghiệp</label>
                  <input
                    type="text"
                    value={businessForm.name}
                    onChange={(e) => setBusinessForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Ngành nghề</label>
                  <select
                    value={businessForm.industryType}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({ ...prev, industryType: e.target.value as IndustryType }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2"
                  >
                    <option value="HAIR_SALON">Hair Salon</option>
                    <option value="CLINIC">Clinic</option>
                    <option value="SPA_MASSAGE">Spa Massage</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
                  <textarea
                    rows={3}
                    value={businessForm.description}
                    onChange={(e) => setBusinessForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Địa chỉ</label>
                    <input
                      type="text"
                      value={businessForm.address}
                      onChange={(e) => setBusinessForm((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
                    <input
                      type="text"
                      value={businessForm.phone}
                      onChange={(e) => setBusinessForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creatingBusiness}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingBusiness ? 'Đang tạo...' : 'Tạo doanh nghiệp'}
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dịch vụ</h1>
          <p className="mt-1 text-slate-600">Quản lý danh sách dịch vụ theo từng doanh nghiệp.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
        >
          <Plus size={18} />
          Thêm dịch vụ
        </button>
      </div>

      {businesses.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {businesses.map((business) => (
            <button
              key={business.id}
              type="button"
              onClick={() => setSelectedBusinessId(business.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedBusinessId === business.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {business.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activeServices.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Chưa có dịch vụ nào. Hãy thêm dịch vụ đầu tiên cho doanh nghiệp của bạn.
          </div>
        )}

        {activeServices.map((service) => {
          const isEnabled = enabledMap[service.id] ?? true

          return (
            <article
              key={service.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                isEnabled ? 'border-slate-200' : 'border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {service.description || 'Chưa có mô tả cho dịch vụ này.'}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  onClick={() => toggleService(service.id)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                    isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <div>
                  <p className="text-slate-500">Giá</p>
                  <p className="font-semibold text-slate-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0,
                    }).format(service.price)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Thời lượng</p>
                  <p className="font-semibold text-slate-900">{service.duration} phút</p>
                </div>
                <div>
                  <p className="text-slate-500">Thanh toán trước</p>
                  <p className={`font-semibold ${service.requiresPayment ? 'text-amber-600' : 'text-slate-700'}`}>
                    {service.requiresPayment ? 'Có' : 'Không'}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Thêm dịch vụ</h2>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreateService)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tên dịch vụ</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
                <textarea
                  rows={3}
                  {...register('description')}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Giá</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2"
                  />
                  {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Thời lượng</label>
                  <select
                    {...register('duration', { setValueAs: (value) => Number(value) })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2"
                  >
                    {durationOptions.map((duration) => (
                      <option key={duration} value={duration}>
                        {duration} phút
                      </option>
                    ))}
                  </select>
                  {errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration.message}</p>}
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <input type="checkbox" {...register('requiresPayment')} className="h-4 w-4 rounded border-slate-300" />
                <span className="text-sm text-slate-700">Yêu cầu thanh toán trước</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Đang thêm...' : 'Thêm dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
