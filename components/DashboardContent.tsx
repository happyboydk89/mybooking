'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import CreateBusinessForm from '@/components/CreateBusinessForm'
import ProfileSettingsForm from '@/components/ProfileSettingsForm'

interface DashboardContentProps {
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
  }
  businesses: any[]
}

export function DashboardContent({ user, businesses }: DashboardContentProps) {
  // Generate user avatar URL
  const userInitials = (user.name || user.email).substring(0, 2).toUpperCase()
  const avatarBgColors = [
    'from-indigo-500 to-indigo-600',
    'from-purple-500 to-purple-600',
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
  ]
  const avatarColor = avatarBgColors[user.email?.length % 5 || 0]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 md:py-16"
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative flex items-center gap-6">
          <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white shadow-xl flex-shrink-0`}>
            <span className="text-3xl md:text-4xl font-bold">{userInitials}</span>
          </div>
          <div className="text-white flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-bold">
              Xin chào, {user.name || 'Bạn'}! 👋
            </h1>
            <p className="text-indigo-100 mt-2 text-sm md:text-base">
              Đây là không gian quản lý doanh nghiệp của bạn
            </p>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <span className="text-indigo-100">{businesses.length} doanh nghiệp</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Hồ Sơ Cá Nhân</h2>
        <ProfileSettingsForm
          email={user.email}
          initialName={user.name}
          initialPhone={user.phone}
        />
      </div>

      {/* If user has no business, show create form first */}
      {businesses.length === 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-amber-900">🚀 Hãy bắt đầu ngay</h2>
              <p className="text-amber-800 mt-2">
                Tạo business đầu tiên của bạn để bắt đầu nhận lịch hẹn từ khách hàng.
              </p>
            </div>
            <CreateBusinessForm userId={user.id} />
          </div>
        </div>
      )}

      {/* Businesses Overview */}
      {businesses.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">📋 Các Doanh Nghiệp Của Bạn</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business: any, index: number) => {
              // Generate unique but consistent dummy images for each business
              const dummyImageIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
              const imageId = dummyImageIds[index % dummyImageIds.length]
              const businessInitials = business.name?.substring(0, 2).toUpperCase() || '🏢'
              const businessBgColor = avatarBgColors[index % avatarBgColors.length]

              return (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                    <Image
                      src={`https://picsum.photos/400/200?random=${imageId}`}
                      alt={business.name}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    {/* Fallback gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${businessBgColor} flex items-center justify-center text-white`}>
                      <span className="text-4xl font-bold opacity-20">{businessInitials}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{business.name}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{business.description || 'Không có mô tả'}</p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-lg">📍</span>
                        <span className="line-clamp-1">{business.address || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-lg">🔧</span>
                        <span>{business.services?.length || 0} dịch vụ</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-lg">📅</span>
                        <span>0 lịch hẹn</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <a
                        href={`/dashboard/services?business=${business.id}`}
                        className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium text-sm transition-colors text-center"
                      >
                        Dịch Vụ
                      </a>
                      <a
                        href={`/dashboard/bookings?business=${business.id}`}
                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-medium text-sm transition-colors text-center"
                      >
                        Lịch Hẹn
                      </a>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Add New Business */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-indigo-900">➕ Tạo Doanh Nghiệp Mới</h3>
              </div>
              <CreateBusinessForm userId={user.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
