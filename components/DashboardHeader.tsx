'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Menu, ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

interface DashboardHeaderProps {
  onMenuClick: () => void
  userName?: string | null
  userEmail?: string | null
  pendingBookingsCount?: number
  notifications?: Notification[]
}

interface Notification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Lịch hẹn mới',
    description: 'Bạn có 1 lịch hẹn mới từ Nguyễn Văn A',
    timestamp: '5 phút trước',
    read: false,
  },
  {
    id: '2',
    title: 'Thanh toán thành công',
    description: 'Bạn nhận được 250.000đ từ lịch hẹn ngày hôm qua',
    timestamp: '1 giờ trước',
    read: false,
  },
  {
    id: '3',
    title: 'Cập nhật hệ thống',
    description: 'Hệ thống đã được cập nhật phiên bản mới',
    timestamp: '1 ngày trước',
    read: true,
  },
]

function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname?.split('/').filter(Boolean) || []

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    ...segments.slice(1).map((segment) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      href: `/dashboard/${segment}`,
    })),
  ]

  return (
    <div className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center gap-2">
          {index > 0 && <span className="text-slate-300">/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-slate-600 font-medium">{breadcrumb.label}</span>
          ) : (
            <Link href={breadcrumb.href}>
              <motion.button
                whileHover={{ color: '#1e293b' }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {breadcrumb.label}
              </motion.button>
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

function NotificationDropdown({ notifications = [] }: { notifications?: Notification[] }) {
  const [open, setOpen] = useState(false)
  // Use passed notifications or fall back to empty array
  const displayNotifications = notifications.length > 0 ? notifications : []
  const unreadCount = displayNotifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 md:absolute md:inset-auto md:right-0 md:top-12 md:left-auto md:w-80"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-lg border border-slate-200 md:w-80 fixed bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-0 max-h-96 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Thông báo</h3>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                  >
                    {unreadCount} mới
                  </motion.div>
                )}
              </div>

              {/* Notifications */}
              {displayNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không có thông báo nào</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {displayNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      whileHover={{ backgroundColor: '#f8fafc' }}
                      className={`p-4 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notification.read ? 'bg-slate-300' : 'bg-blue-600'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-slate-600 text-xs mt-1">
                            {notification.description}
                          </p>
                          <p className="text-slate-400 text-xs mt-2">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-slate-200 p-3">
                <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                  Xem tất cả
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function UserDropdown({
  userName = 'Nguyễn Văn A',
  userEmail = 'user@example.com',
}: {
  userName?: string | null
  userEmail?: string | null
}) {
  const [open, setOpen] = useState(false)
  const safeUserEmail = userEmail || 'user@example.com'
  const safeUserName = userName?.trim() || safeUserEmail
  const userInitials = safeUserName.substring(0, 2).toUpperCase()
  const avatarBgColors = [
    'from-indigo-500 to-indigo-600',
    'from-purple-500 to-purple-600',
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
  ]
  const avatarColor = avatarBgColors[safeUserEmail.length % 5 || 0]

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className={`relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs md:text-sm font-bold overflow-hidden shadow-md`}>
          <span>{userInitials}</span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-slate-900 truncate">{safeUserName}</p>
          <p className="text-xs text-slate-500">{safeUserEmail}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 md:absolute md:inset-auto md:right-0 md:top-14 md:left-auto md:w-56"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-lg border border-slate-200 md:w-56 fixed bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-0"
            >
              {/* User Info */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{safeUserName}</p>
                    <p className="text-xs text-slate-500 truncate">{safeUserEmail}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link href="/dashboard/profile">
                  <motion.button
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm">Hồ sơ cá nhân</span>
                  </motion.button>
                </Link>
                <Link href="/dashboard/settings">
                  <motion.button
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Cài đặt</span>
                  </motion.button>
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-200 p-2">
                <motion.button
                  whileHover={{ backgroundColor: '#fee2e2' }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Đăng xuất</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DashboardHeader({ 
  onMenuClick, 
  userName, 
  userEmail,
  pendingBookingsCount = 0,
  notifications = [],
}: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Menu Button & Breadcrumbs */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </motion.button>

            <div className="hidden md:block flex-1 min-w-0">
              <Breadcrumbs />
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            animate={{ width: searchOpen ? 280 : 40 }}
            className="relative"
          >
            <motion.div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                searchOpen
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              } transition-colors`}
            >
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {searchOpen && (
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                  className="bg-transparent outline-none text-sm w-full text-slate-900"
                />
              )}
            </motion.div>
            {!searchOpen && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className="absolute inset-0"
              />
            )}
          </motion.div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <NotificationDropdown notifications={notifications} />
            <div className="hidden sm:block w-px h-6 bg-slate-200" />
            <UserDropdown userName={userName} userEmail={userEmail} />
          </div>
        </div>
      </div>
    </header>
  )
}
