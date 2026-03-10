'use client'

import { motion } from 'framer-motion'
import { Clock, DollarSign } from 'lucide-react'
import { ServiceImage } from '@/components/ServiceImage'

interface ServiceCardProps {
  name: string
  description?: string | null
  price: number
  duration: number
  onSelect: () => void
  isSelected?: boolean
  image?: string | null
}

export function ServiceCard({
  name,
  description,
  price,
  duration,
  onSelect,
  isSelected = false,
  image,
}: ServiceCardProps) {
  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-indigo-600 bg-indigo-50 shadow-lg'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      {/* Image Section */}
      <ServiceImage name={name} image={image} />

      {/* Content Section */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-bold text-lg text-slate-900">{name}</h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 text-slate-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{duration} phút</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-indigo-600">
            <DollarSign className="w-4 h-4" />
            <span>{price}</span>
          </div>
        </div>

        {/* Select Button */}
        <button
          onClick={() => onSelect()}
          className={`w-full mt-3 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
            isSelected
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-900 hover:bg-indigo-50'
          }`}
        >
          {isSelected ? '✓ Đã chọn' : 'Chọn'}
        </button>
      </div>
    </motion.div>
  )
}
