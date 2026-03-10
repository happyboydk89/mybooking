'use client'

import { motion } from 'framer-motion'
import { Trash2, Edit2, Lock, Unlock } from 'lucide-react'

interface Service {
  id: string
  name: string
  description?: string | null
  price: number
  duration: number
  requiresPayment: boolean
}

interface ServiceDataTableProps {
  services: Service[]
  onEdit?: (service: Service) => void
  onDelete?: (serviceId: string) => void
}

export default function ServiceDataTable({ services, onEdit, onDelete }: ServiceDataTableProps) {
  const handleDelete = (serviceId: string) => {
    if (confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      onDelete?.(serviceId)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm"
    >
      <table className="w-full">
        {/* Table Head */}
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Tên dịch vụ
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Giá
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Thời lượng
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Thanh toán
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-200">
          {services.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8">
                <div className="text-center">
                  <p className="text-slate-600 font-medium">Chưa có dịch vụ nào</p>
                  <p className="text-slate-500 text-sm mt-1">Bắt đầu bằng cách thêm dịch vụ mới</p>
                </div>
              </td>
            </tr>
          ) : (
            services.map((service, index) => (
              <motion.tr
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-slate-50 transition-colors"
              >
                {/* Service Name */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-slate-600 line-clamp-1">{service.description}</p>
                    )}
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4">
                  <p className="font-semibold text-indigo-600">${service.price.toFixed(2)}</p>
                </td>

                {/* Duration */}
                <td className="px-6 py-4">
                  <p className="text-slate-700">{service.duration} phút</p>
                </td>

                {/* Payment Required */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {service.requiresPayment ? (
                      <>
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-600">Bắt buộc</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Tùy chọn</span>
                      </>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit?.(service)}
                      className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(service.id)}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  )
}
