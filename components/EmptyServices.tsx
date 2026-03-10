'use client'

import { motion } from 'framer-motion'
import { Zap, ArrowRight } from 'lucide-react'

interface EmptyServicesProps {
  title?: string
  description?: string
  onAction?: () => void
  actionLabel?: string
}

export function EmptyServices({
  title = 'Chưa có dịch vụ',
  description = 'Doanh nghiệp chưa cập nhật danh sách dịch vụ. Hãy quay lại sau hoặc liên hệ trực tiếp.',
  onAction,
  actionLabel = 'Liên hệ',
}: EmptyServicesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {/* Icon Animation */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
          <Zap className="w-10 h-10 text-amber-600" />
        </div>
      </motion.div>

      {/* Text */}
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-sm">{description}</p>

      {/* CTA Button */}
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  )
}
