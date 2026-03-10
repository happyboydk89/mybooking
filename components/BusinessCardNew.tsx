'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'

interface Business {
  id: string
  name: string
  address?: string
  description?: string
  logo?: string
  rating?: number
  reviewCount?: number
  industryType?: string
}

interface BusinessCardProps {
  business: Business
  index?: number
  userLoggedIn?: boolean
}

export default function BusinessCard({ business, index = 0, userLoggedIn }: BusinessCardProps) {
  const rating = business.rating || 4.5
  const reviewCount = business.reviewCount || 128
  const imageUrl = business.logo || `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1560066183-f2a2dc50d266' : '1516321496550-f36967e38d12'}?w=500&h=300&fit=crop`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index || 0) * 0.1 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Link href={`/business/${business.id}`}>
        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-200 hover:border-indigo-300 h-full flex flex-col group">
          {/* Image Container */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
            <motion.img
              src={imageUrl}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              whileHover={{ scale: 1.05 }}
            />
            {/* Industry Badge */}
            {business.industryType && (
              <div className="absolute top-3 right-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {business.industryType === 'HAIR_SALON'
                  ? 'Hair Salon'
                  : business.industryType === 'CLINIC'
                    ? 'Clinic'
                    : 'Spa'}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex-grow flex flex-col">
            {/* Name */}
            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {business.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-900">{rating}</span>
              <span className="text-xs text-slate-500">({reviewCount} reviews)</span>
            </div>

            {/* Address */}
            {business.address && (
              <div className="flex items-start gap-2 mb-4 text-sm text-slate-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-600" />
                <span className="line-clamp-2">{business.address}</span>
              </div>
            )}

            {/* Description */}
            {business.description && (
              <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-grow">
                {business.description}
              </p>
            )}

            {/* CTA Button */}
            <button
              className={`w-full py-2.5 rounded-lg font-semibold transition-all ${
                userLoggedIn
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              {userLoggedIn ? 'Book Now' : 'View Details'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
