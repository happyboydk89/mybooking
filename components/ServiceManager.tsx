'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Zap } from 'lucide-react'
import ServiceDataTable from '@/components/ServiceDataTable'
import ServiceFormModal from '@/components/ServiceFormModal'

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
  industryType: string
  services: Service[]
}

interface ServiceManagerProps {
  businesses: Business[]
  onRefresh: () => void
}

export default function ServiceManager({ businesses, onRefresh }: ServiceManagerProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<string>(businesses[0]?.id || '')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentBusiness = businesses.find((b) => b.id === selectedBusiness)
  const services = currentBusiness?.services || []

  const handleSuccess = useCallback(() => {
    onRefresh()
  }, [onRefresh])

  const handleDelete = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRefresh()
      } else {
        alert('Không thể xóa dịch vụ')
      }
    } catch (error) {
      alert('Lỗi: ' + (error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý dịch vụ</h1>
          <p className="text-slate-600 mt-1">Tạo và quản lý dịch vụ của bạn</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Thêm dịch vụ mới
        </motion.button>
      </div>

      {/* Business Selector */}
      {businesses.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Chọn doanh nghiệp
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {businesses.map((business) => (
              <motion.button
                key={business.id}
                onClick={() => setSelectedBusiness(business.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  selectedBusiness === business.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <p className="font-semibold text-slate-900 text-sm truncate">{business.name}</p>
                <p className="text-xs text-slate-600 mt-1">{business.services.length} dịch vụ</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
        >
          <p className="text-sm text-slate-600 font-medium">Tổng dịch vụ</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{services.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
        >
          <p className="text-sm text-slate-600 font-medium">Yêu cầu thanh toán</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">
            {services.filter((s) => s.requiresPayment).length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
        >
          <p className="text-sm text-slate-600 font-medium">Giá trung bình</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ${
              services.length > 0
                ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(2)
                : '0.00'
            }
          </p>
        </motion.div>
      </div>

      {/* Services Table */}
      {services.length > 0 ? (
        <ServiceDataTable services={services} onDelete={handleDelete} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <Zap className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Chưa có dịch vụ nào</h3>
          <p className="text-slate-600 mb-6">Bắt đầu bằng cách tạo dịch vụ mới cho doanh nghiệp của bạn</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo dịch vụ đầu tiên
          </motion.button>
        </motion.div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Tạo dịch vụ mới</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {currentBusiness && (
              <ServiceFormModal
                businessId={currentBusiness.id}
                onSuccess={handleSuccess}
                onClose={() => setIsModalOpen(false)}
              />
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
