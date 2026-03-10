'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function DashboardNav({ businessCount }: { businessCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Management Button */}
        <Link href="/dashboard">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="card bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg cursor-pointer text-white hover:shadow-xl transition-shadow"
          >
            <div className="card-body items-center text-center py-8">
              <div className="text-5xl mb-4">🏢</div>
              <h2 className="card-title text-2xl mb-2">Quản Lý Business</h2>
              <p className="text-blue-100 mb-4">Tạo, sửa đổi và quản lý các dịch vụ kinh doanh của bạn</p>
              <div className="badge badge-lg badge-ghost">{businessCount} Business</div>
            </div>
          </motion.div>
        </Link>

        {/* Booking Management Button */}
        <Link href="/dashboard/bookings">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="card bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg cursor-pointer text-white hover:shadow-xl transition-shadow"
          >
            <div className="card-body items-center text-center py-8">
              <div className="text-5xl mb-4">📅</div>
              <h2 className="card-title text-2xl mb-2">Quản Lý Bookings</h2>
              <p className="text-purple-100 mb-4">Xem, xác nhận hoặc hủy các lịch hẹn của khách hàng</p>
              <div className="badge badge-lg badge-ghost">Realtime Updates</div>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  )
}
