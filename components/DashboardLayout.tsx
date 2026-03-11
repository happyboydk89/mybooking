'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { DashboardHeader } from '@/components/DashboardHeader'
import { motion } from 'framer-motion'
import { getPendingBookingsCountForUser, getNotificationsForUser } from '@/lib/actions'

interface Notification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userName?: string
  userEmail?: string
  userId?: string
}

export function DashboardLayout({
  children,
  userName,
  userEmail,
  userId,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch pending bookings count and notifications
  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [countResult, notificationsResult] = await Promise.all([
          getPendingBookingsCountForUser(userId),
          getNotificationsForUser(userId),
        ])

        if (countResult.success) {
          setPendingBookingsCount(countResult.count)
        }

        if (notificationsResult.success) {
          setNotifications(notificationsResult.notifications)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [userId])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        pendingBookingsCount={pendingBookingsCount}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          userEmail={userEmail}
          pendingBookingsCount={pendingBookingsCount}
          notifications={notifications}
        />

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto"
        >
          <div className="px-4 md:px-6 py-6">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  )
}
