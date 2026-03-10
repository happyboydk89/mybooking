'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface Business {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  services: Service[]
  provider?: {
    name?: string
    email: string
  }
}

export default function BusinessCard({
  business,
  userLoggedIn,
}: {
  business: Business
  userLoggedIn: boolean
}) {
  const serviceCount = business.services?.length || 0
  const avgPrice =
    serviceCount > 0
      ? (business.services.reduce((sum: number, s: Service) => sum + s.price, 0) / serviceCount).toFixed(0)
      : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all"
    >
      <div className="card-body">
        {/* Business Name */}
        <h2 className="card-title text-xl">{business.name}</h2>

        {/* Description */}
        {business.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{business.description}</p>
        )}

        {/* Info */}
        <div className="space-y-1 text-sm">
          {business.address && (
            <p className="text-gray-700">
              📍 <span className="text-gray-600">{business.address}</span>
            </p>
          )}
          {business.phone && (
            <p className="text-gray-700">
              📞 <span className="text-gray-600">{business.phone}</span>
            </p>
          )}
        </div>

        {/* Services Info */}
        <div className="divider my-2"></div>
        <div className="grid grid-cols-2 gap-2 text-center py-2 bg-base-200 rounded">
          <div>
            <p className="text-xs opacity-70">Dịch Vụ</p>
            <p className="font-bold text-lg">{serviceCount}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Từ</p>
            <p className="font-bold text-lg">${avgPrice}</p>
          </div>
        </div>

        {/* Services List Preview */}
        {serviceCount > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold opacity-70 mb-2">Dịch vụ nổi bật:</p>
            <ul className="text-xs space-y-1">
              {business.services.slice(0, 3).map((service: Service) => (
                <li key={service.id} className="flex justify-between">
                  <span>{service.name}</span>
                  <span className="font-semibold">${service.price}</span>
                </li>
              ))}
              {serviceCount > 3 && (
                <li className="text-gray-500 italic">+{serviceCount - 3} dịch vụ khác</li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions justify-between mt-4">
          <Link
            href={`/business/${business.id}`}
            className="btn btn-outline btn-sm flex-1"
          >
            Xem Chi Tiết
          </Link>
          {userLoggedIn && (
            <Link
              href={`/business/${business.id}`}
              className="btn btn-primary btn-sm flex-1"
            >
              Đặt Lịch
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
