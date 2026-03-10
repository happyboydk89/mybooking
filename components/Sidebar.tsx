'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Calendar,
  Wrench,
  Clock,
  PanelRightClose,
  PanelRightOpen,
  Menu,
  X,
  LogOut,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const menuItems: SidebarItem[] = [
  {
    label: 'Tổng quan',
    href: '/dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: 'Lịch hẹn',
    href: '/dashboard/bookings',
    icon: <Calendar className="w-5 h-5" />,
    badge: 3,
  },
  {
    label: 'Dịch vụ',
    href: '/dashboard/services',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    label: 'Cấu hình giờ làm',
    href: '/dashboard/availability',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    label: 'Cài đặt',
    href: '/dashboard/settings',
    icon: <Settings className="w-5 h-5" />,
  },
]

export function Sidebar({
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 280,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-40 transform transition-transform md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-slate-200">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-xl">
                ⚡
              </div>
              <span className="text-slate-900">BookPro</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-xl mx-auto">
              ⚡
            </div>
          )}
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.button
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative group ${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {/* Active indicator */}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"
                    transition={{ type: 'spring', damping: 20 }}
                  />
                )}

                {/* Icon */}
                <span className={`relative ${isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>

                {/* Label */}
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </>
                )}
              </motion.button>
            </Link>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-slate-200 p-3">
          <motion.button
            whileHover={{ x: collapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Đăng xuất</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Toggle Collapse Button (Desktop only) */}
      {onToggleCollapse && (
        <div className="hidden md:flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleCollapse}
            className="fixed left-4 bottom-8 p-2.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 shadow-lg transition-all z-30"
            title={collapsed ? 'Mở rộng' : 'Thu nhỏ'}
          >
            {collapsed ? (
              <PanelRightOpen className="w-5 h-5 text-indigo-600" />
            ) : (
              <PanelRightClose className="w-5 h-5 text-slate-600" />
            )}
          </motion.button>
        </div>
      )}
    </>
  )
}
