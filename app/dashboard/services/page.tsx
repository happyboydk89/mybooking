'use client'

import { useState, useCallback } from 'react'
import { getUserFromRequest } from '@/lib/auth'
import { getUserBusinesses } from '@/lib/actions'
import ServiceManager from '@/components/ServiceManager'
import { useEffect } from 'react'

export default function ServicesPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user info from API
        const userRes = await fetch('/api/auth/me')
        if (!userRes.ok) {
          window.location.href = '/auth/login'
          return
        }
        const userData = await userRes.json()
        setUser(userData.user)

        if (userData.user?.role !== 'PROVIDER') {
          window.location.href = '/dashboard'
          return
        }

        // Get businesses
        const businessRes = await fetch('/api/user/businesses')
        if (businessRes.ok) {
          const businessData = await businessRes.json()
          setBusinesses(businessData.businesses || [])
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleRefresh = useCallback(async () => {
    try {
      const response = await fetch('/api/user/businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses || [])
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Quản lý dịch vụ</h1>
            <p className="text-slate-600 mb-8">
              Bạn cần tạo doanh nghiệp trước khi thêm dịch vụ
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Quay lại Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <ServiceManager businesses={businesses} onRefresh={handleRefresh} />
      </div>
    </div>
  )
}
