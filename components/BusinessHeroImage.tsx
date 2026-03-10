'use client'

import Image from 'next/image'
import { useState } from 'react'

interface BusinessHeroImageProps {
  businessName: string
  industryType: string
  businessImage: string
}

export function BusinessHeroImage({
  businessName,
  industryType,
  businessImage,
}: BusinessHeroImageProps) {
  const [imageError, setImageError] = useState(false)

  const getIndustryLabel = (type: string) => {
    switch (type) {
      case 'HAIR_SALON':
        return '💇 Salon Tóc'
      case 'CLINIC':
        return '🏥 Phòng Khám'
      case 'SPA_MASSAGE':
        return '🧖 Spa & Massage'
      default:
        return 'Dịch vụ'
    }
  }

  return (
    <div className="relative h-80 bg-gradient-to-br from-indigo-600 to-indigo-700 overflow-hidden">
      {/* Background Image */}
      {!imageError && (
        <div className="absolute inset-0">
          <Image
            src={businessImage}
            alt={businessName}
            fill
            className="object-cover opacity-40"
            priority
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/70 to-indigo-700/70"></div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white">{businessName}</h1>
          <p className="text-indigo-100 text-lg">{getIndustryLabel(industryType)}</p>
        </div>
      </div>
    </div>
  )
}
