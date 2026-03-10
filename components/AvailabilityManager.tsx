'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Save, AlertCircle, CheckCircle } from 'lucide-react'

export interface AvailabilityDay {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  isActive: boolean
}

interface AvailabilityManagerProps {
  businessId: string
  businessName: string
  initialAvailability: AvailabilityDay[]
  onSave: (availability: AvailabilityDay[]) => Promise<void>
}

const DAY_LABELS = {
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
  SUNDAY: 'Chủ Nhật',
}

const DAYS_ORDER: AvailabilityDay['dayOfWeek'][] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

export default function AvailabilityManager({
  businessId,
  businessName,
  initialAvailability,
  onSave,
}: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<Map<string, AvailabilityDay>>(
    new Map(initialAvailability.map((a) => [a.dayOfWeek, a]))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Initialize all days if not in map
  const getAllDays = (): AvailabilityDay[] => {
    return DAYS_ORDER.map((day) => {
      const existing = availability.get(day)
      return (
        existing || {
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isActive: false,
        }
      )
    })
  }

  const handleToggleDay = (day: string) => {
    const current = availability.get(day)
    if (current) {
      setAvailability(
        new Map(availability).set(day, {
          ...current,
          isActive: !current.isActive,
        })
      )
    }
  }

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    const current = availability.get(day)
    if (current) {
      setAvailability(
        new Map(availability).set(day, {
          ...current,
          [field]: value,
        })
      )
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const allDays = getAllDays()
      
      // Validate active days
      const activeDays = allDays.filter(d => d.isActive)
      for (const day of activeDays) {
        if (!day.startTime && !day.endTime) {
          throw new Error(`Hãy chọn giờ làm việc cho ${DAY_LABELS[day.dayOfWeek]}`)
        }
        if (day.startTime >= day.endTime) {
          throw new Error(`Thời gian kết thúc phải sau thời gian bắt đầu cho ${DAY_LABELS[day.dayOfWeek]}`)
        }
      }

      await onSave(allDays)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Cấu hình thời gian làm việc</h1>
        <p className="text-slate-600 mt-1">{businessName}</p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm"
        >
          ✓ Cấu hình đã được lưu thành công
        </motion.div>
      )}

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS_ORDER.map((day, index) => {
          const dayData = availability.get(day) || {
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            isActive: false,
          }

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4"
            >
              {/* Day Header with Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{DAY_LABELS[day]}</p>
                    <p className="text-xs text-slate-500">{day}</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dayData.isActive}
                    onChange={() => handleToggleDay(day)}
                    className="checkbox checkbox-indigo checkbox-sm"
                  />
                  <span className="text-sm text-slate-600">
                    {dayData.isActive ? 'Mở cửa' : 'Đóng cửa'}
                  </span>
                </label>
              </div>

              {/* Time Pickers - Show when active */}
              {dayData.isActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-3 border-t border-slate-200"
                >
                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1.5">
                      Giờ mở cửa
                    </label>
                    <input
                      type="time"
                      value={dayData.startTime}
                      onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1.5">
                      Giờ đóng cửa
                    </label>
                    <input
                      type="time"
                      value={dayData.endTime}
                      onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Time Display */}
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-slate-600">
                      Mở cửa:{' '}
                      <span className="font-semibold text-indigo-600">
                        {dayData.startTime} - {dayData.endTime}
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Closed State */}
              {!dayData.isActive && (
                <div className="text-center py-4 text-slate-500 text-sm">
                  Không làm việc ngày này
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 pt-6 border-t border-slate-200"
      >
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </motion.div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-2">💡 Hướng dẫn:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Chọn các ngày bạn muốn mở cửa</li>
          <li>Đặt giờ mở cửa và giờ đóng cửa cho mỗi ngày</li>
          <li>Nhấn "Lưu cấu hình" để cập nhật</li>
        </ul>
      </div>
    </div>
  )
}
