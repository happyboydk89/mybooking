'use client'

import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'

interface EmptyBookingsProps {
  title?: string
  description?: string
  onAction?: () => void
  actionLabel?: string
}

export function EmptyBookings({
  title = 'Chưa có lịch hẹn',
  description = 'Bạn chưa có lịch hẹn nào. Hãy bắt đầu bằng cách tìm và đặt lịch với các doanh nghiệp yêu thích.',
  onAction,
  actionLabel = 'Tìm dịch vụ',
}: EmptyBookingsProps) {
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
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-indigo-600" />
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  )
}
