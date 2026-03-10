'use client'

import { motion } from 'framer-motion'

type FilterType = 'all' | 'day' | 'week' | 'month'

export default function BookingFilter({
  filterType,
  onFilterChange,
  selectedDate,
  onDateChange,
}: {
  filterType: FilterType
  onFilterChange: (type: FilterType) => void
  selectedDate: Date
  onDateChange: (date: Date) => void
}) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    onDateChange(newDate)
  }

  const dateStr = selectedDate.toISOString().split('T')[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-lg"
    >
      <div className="card-body">
        <h3 className="card-title mb-4">🔍 Bộ Lọc Lịch Hẹn</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filter Type Buttons */}
          <div className="lg:col-span-2">
            <label className="label">
              <span className="label-text font-semibold">Loại Lịch</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: 'all' as FilterType, label: '📅 Tất Cả' },
                  { value: 'day' as FilterType, label: '☀️ Ngày' },
                  { value: 'week' as FilterType, label: '📋 Tuần' },
                  { value: 'month' as FilterType, label: '🗓️ Tháng' },
                ] as const
              ).map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`btn btn-sm ${
                    filterType === option.value
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Date Picker - Only show for day/week/month views */}
          {filterType !== 'all' && (
            <div>
              <label className="label">
                <span className="label-text font-semibold">Chọn Ngày</span>
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={handleDateChange}
                className="input input-bordered input-sm w-full"
              />
            </div>
          )}
        </div>

        {/* Info Text */}
        <div className="mt-4 p-3 bg-base-200 rounded-lg text-sm">
          {filterType === 'all' && '📊 Hiển thị: Tất cả lịch hẹn'}
          {filterType === 'day' && `📊 Hiển thị: Lịch hẹn ngày ${selectedDate.toLocaleDateString('vi-VN')}`}
          {filterType === 'week' && `📊 Hiển thị: Lịch hẹn tuần có chứa ngày ${selectedDate.toLocaleDateString('vi-VN')}`}
          {filterType === 'month' && `📊 Hiển thị: Lịch hẹn tháng ${selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}`}
        </div>
      </div>
    </motion.div>
  )
}
