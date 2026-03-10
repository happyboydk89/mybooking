'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  onAction?: () => void
  actionLabel?: string
  gradient?: string
  bgGradient?: string
}

export function EmptyState({
  icon,
  title,
  description,
  onAction,
  actionLabel,
  gradient = 'from-indigo-600 to-indigo-700',
  bgGradient = 'from-indigo-100 to-indigo-100',
}: EmptyStateProps) {
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
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center`}>
          {icon}
        </div>
      </motion.div>

      {/* Text */}
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-sm">{description}</p>

      {/* CTA Button */}
      {onAction && actionLabel && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${gradient} text-white font-semibold rounded-lg hover:shadow-lg transition-shadow`}
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  )
}
