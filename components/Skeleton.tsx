'use client'

import { motion } from 'framer-motion'

export function BookingSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="bg-white rounded-lg border border-slate-200 p-4 space-y-3"
    >
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-100 rounded w-full"></div>
      <div className="h-4 bg-slate-100 rounded w-2/3"></div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-slate-200 rounded w-24"></div>
        <div className="h-8 bg-slate-200 rounded w-28"></div>
      </div>
    </motion.div>
  )
}

export function ServiceSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="bg-white rounded-lg border border-slate-200 overflow-hidden"
    >
      <div className="h-40 bg-slate-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-100 rounded w-full"></div>
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-full"></div>
      </div>
    </motion.div>
  )
}

export function BookingListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <BookingSkeleton key={i} />
      ))}
    </div>
  )
}

export function ServiceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <ServiceSkeleton key={i} />
      ))}
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="bg-white rounded-lg border border-slate-200 p-6 space-y-4"
    >
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      <div className="pt-2 space-y-2">
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-3/4"></div>
      </div>
    </motion.div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-10 bg-slate-200 rounded w-1/3"
      ></motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-6 bg-slate-200 rounded w-1/4 mb-4"
          ></motion.div>
          <BookingListSkeleton />
        </div>
        <div>
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-6 bg-slate-200 rounded w-1/3 mb-4"
          ></motion.div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-12 bg-slate-200 rounded"
              ></motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-5 gap-4 p-4 bg-slate-50 border-b border-slate-200">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-4 bg-slate-200 rounded"
          ></motion.div>
        ))}
      </div>

      {/* Rows */}
      {[...Array(5)].map((_, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-5 gap-4 p-4 border-b border-slate-200 last:border-b-0">
          {[...Array(5)].map((_, colIdx) => (
            <motion.div
              key={colIdx}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-4 bg-slate-100 rounded"
            ></motion.div>
          ))}
        </div>
      ))}
    </div>
  )
}
