'use client'

import { useEffect, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  LineChart,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface StatCard {
  title: string
  value: string
  growth: number
  icon: 'revenue' | 'appointments' | 'customers' | 'completion'
  tone: 'emerald' | 'blue' | 'amber' | 'violet'
}

interface RevenuePoint {
  dateLabel: string
  revenue: number
}

interface RecentBooking {
  id: string
  customerName: string
  customerEmail: string
  serviceName: string
  timeLabel: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
}

interface ProviderDashboardOverviewProps {
  userName: string
  stats: StatCard[]
  revenueData: RevenuePoint[]
  recentBookings: RecentBooking[]
}

const toneClasses: Record<StatCard['tone'], string> = {
  emerald: 'from-emerald-500/15 to-emerald-100/10 border-emerald-200 text-emerald-900',
  blue: 'from-blue-500/15 to-blue-100/10 border-blue-200 text-blue-900',
  amber: 'from-amber-500/15 to-amber-100/10 border-amber-200 text-amber-900',
  violet: 'from-violet-500/15 to-violet-100/10 border-violet-200 text-violet-900',
}

const statusClasses: Record<RecentBooking['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-700 border border-slate-200',
}

function formatGrowth(growth: number) {
  const rounded = Number.isFinite(growth) ? Math.abs(growth).toFixed(1) : '0.0'
  return `${rounded}%`
}

function iconForStat(icon: StatCard['icon']) {
  switch (icon) {
    case 'revenue':
      return CircleDollarSign
    case 'appointments':
      return CalendarDays
    case 'customers':
      return Users
    case 'completion':
      return CheckCircle2
    default:
      return LineChart
  }
}

function initialsFromName(name: string, email: string) {
  if (name.trim().length > 0) {
    return name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('')
  }

  return email.slice(0, 2).toUpperCase()
}

function formatCurrencyVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ProviderDashboardOverview({
  userName,
  stats,
  revenueData,
  recentBookings,
}: ProviderDashboardOverviewProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-2xl md:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-300">Business Console</p>
        <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Xin chào, {userName || 'Bạn'}</h1>
        <p className="mt-2 text-sm text-slate-300 md:text-base">
          Tổng quan vận hành business trong tháng này, cập nhật theo thời gian thực.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = iconForStat(stat.icon)
          const isPositive = stat.growth >= 0

          return (
            <article
              key={stat.title}
              className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClasses[stat.tone]}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-75">{stat.title}</p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight">{stat.value}</h2>
                </div>
                <span className="rounded-xl bg-white/70 p-2">
                  <Icon size={18} />
                </span>
              </div>

              <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium">
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{formatGrowth(stat.growth)}</span>
                <span className="opacity-75">so với tháng trước</span>
              </div>
            </article>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Revenue 7 ngày gần nhất</h3>
              <p className="text-sm text-slate-500">Doanh thu từ các lịch hẹn đã xác nhận</p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(15, 118, 110, 0.08)' }}
                    formatter={(value) => formatCurrencyVnd(Number(value))}
                    labelClassName="text-slate-700"
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[8, 8, 0, 0]}
                    fill="url(#revenueGradient)"
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full animate-pulse rounded-xl bg-slate-100" />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent bookings</h3>
            <p className="text-sm text-slate-500">5 lịch hẹn mới nhất</p>
          </div>

          <div className="space-y-3">
            {recentBookings.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                Chưa có lịch hẹn nào trong hệ thống.
              </p>
            )}

            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-semibold text-white">
                  {initialsFromName(booking.customerName, booking.customerEmail)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {booking.customerName || booking.customerEmail}
                  </p>
                  <p className="truncate text-xs text-slate-500">{booking.serviceName}</p>
                  <p className="text-xs text-slate-500">{booking.timeLabel}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClasses[booking.status]}`}>
                  {booking.status === 'PENDING'
                    ? 'Pending'
                    : booking.status === 'CONFIRMED'
                      ? 'Confirmed'
                      : 'Cancelled'}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
