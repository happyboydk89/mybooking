'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Mail } from 'lucide-react'

interface BookingConfirmationModalProps {
  isOpen: boolean
  booking: {
    id: string
    customerName: string
    customerEmail: string
    serviceName: string
    dateTimeLabel: string
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
    payment: 'PAID' | 'UNPAID'
  } | null
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
  onSendReminder: () => void
  onClose: () => void
}

export function BookingConfirmationModal({
  isOpen,
  booking,
  isPending,
  onConfirm,
  onCancel,
  onSendReminder,
  onClose,
}: BookingConfirmationModalProps) {
  if (!booking) return null

  const statusColor = {
    PENDING: 'bg-amber-50 border-amber-200 text-amber-700',
    CONFIRMED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    CANCELLED: 'bg-rose-50 border-rose-200 text-rose-700',
  }

  const statusLabel = {
    PENDING: 'Đang chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    CANCELLED: 'Đã hủy',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl border border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">Chi tiết lịch hẹn</h2>
              <button
                onClick={onClose}
                disabled={isPending}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 px-6 py-4">
              {/* Customer Info */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">Khách hàng</label>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{booking.customerName}</p>
                  <p className="text-sm text-slate-600">{booking.customerEmail}</p>
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">Dịch vụ</label>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{booking.serviceName}</p>
                </div>
              </div>

              {/* DateTime Info */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">Ngày & Giờ</label>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{booking.dateTimeLabel}</p>
                </div>
              </div>

              {/* Status & Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">Trạng thái</label>
                  <div className={`rounded-lg border p-3 text-center ${statusColor[booking.status]}`}>
                    <p className="text-sm font-semibold">{statusLabel[booking.status]}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">Thanh toán</label>
                  <div className={`rounded-lg border p-3 text-center ${
                    booking.payment === 'PAID'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <p className="text-sm font-semibold">{booking.payment === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 space-y-3">
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onConfirm}
                  disabled={isPending || booking.status === 'CONFIRMED'}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <CheckCircle size={18} />
                  <span>Xác nhận</span>
                </button>
                <button
                  onClick={onCancel}
                  disabled={isPending || booking.status === 'CANCELLED'}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <XCircle size={18} />
                  <span>Hủy</span>
                </button>
              </div>

              {/* Secondary Action */}
              <button
                onClick={onSendReminder}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Mail size={18} />
                <span>Gửi email nhắc lịch</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isPending}
                className="w-full rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
