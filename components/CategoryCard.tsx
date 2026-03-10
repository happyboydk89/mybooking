'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Scissors, Stethoscope, Droplet } from 'lucide-react'

interface CategoryCardProps {
  industry: 'HAIR_SALON' | 'CLINIC' | 'SPA_MASSAGE'
  index?: number
}

const categoryConfig = {
  HAIR_SALON: {
    name: 'Hair Salon',
    icon: Scissors,
    color: 'from-rose-500 to-pink-500',
    bgLight: 'bg-rose-50',
    description: 'Haircuts, coloring & styling',
    href: '/search?category=HAIR_SALON'
  },
  CLINIC: {
    name: 'Clinic',
    icon: Stethoscope,
    color: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50',
    description: 'Medical consultations & services',
    href: '/search?category=CLINIC'
  },
  SPA_MASSAGE: {
    name: 'Spa & Massage',
    icon: Droplet,
    color: 'from-purple-500 to-indigo-500',
    bgLight: 'bg-purple-50',
    description: 'Relaxation & wellness',
    href: '/search?category=SPA_MASSAGE'
  }
}

export default function CategoryCard({ industry, index = 0 }: CategoryCardProps) {
  const config = categoryConfig[industry]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Link href={config.href}>
        <div className={`${config.bgLight} rounded-xl p-8 cursor-pointer group transition-all hover:shadow-xl border-2 border-transparent hover:border-indigo-200`}>
          {/* Icon Background */}
          <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{config.name}</h3>
          <p className="text-slate-600 text-sm mb-4">{config.description}</p>

          {/* Link Indicator */}
          <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
            <span>Browse Services</span>
            <span className="ml-2">→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
