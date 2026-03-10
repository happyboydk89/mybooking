import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProviderDashboardOverview } from '@/components/ProviderDashboardOverview'

function toPercentGrowth(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0
  }

  return ((currentValue - previousValue) / previousValue) * 100
}

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  })
}

export default async function Dashboard() {
  const user = await getUserFromRequest()
  if (!user) {
    redirect('/auth/login')
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const businesses = await prisma.business.findMany({
    where: { providerId: user.id },
    select: { id: true },
  })

  const businessIds = businesses.map((business: { id: string }) => business.id)

  if (businessIds.length === 0) {
    return (
      <ProviderDashboardOverview
        userName={user.name || user.email}
        stats={[
          {
            title: 'Tổng doanh thu (VND)',
            value: formatVnd(0),
            growth: 0,
            icon: 'revenue',
            tone: 'emerald',
          },
          {
            title: 'Tổng lịch hẹn',
            value: '0',
            growth: 0,
            icon: 'appointments',
            tone: 'blue',
          },
          {
            title: 'Người dùng mới',
            value: '0',
            growth: 0,
            icon: 'customers',
            tone: 'amber',
          },
          {
            title: 'Tỷ lệ hoàn thành',
            value: '0%',
            growth: 0,
            icon: 'completion',
            tone: 'violet',
          },
        ]}
        revenueData={Array.from({ length: 7 }).map((_, index) => {
          const date = addDays(startOfDay(now), index - 6)
          return {
            dateLabel: formatDateLabel(date),
            revenue: 0,
          }
        })}
        recentBookings={[]}
      />
    )
  }

  const allBookings = await prisma.booking.findMany({
    where: {
      businessId: { in: businessIds },
    },
    include: {
      service: {
        select: {
          name: true,
          price: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const currentMonthBookings = allBookings.filter(
    (booking: any) => booking.createdAt >= monthStart
  )
  const previousMonthBookings = allBookings.filter(
    (booking: any) => booking.createdAt >= previousMonthStart && booking.createdAt < monthStart
  )

  const totalRevenue = allBookings
    .filter((booking: any) => booking.status === 'CONFIRMED')
    .reduce((sum: number, booking: any) => sum + booking.service.price, 0)
  const currentMonthRevenue = currentMonthBookings
    .filter((booking: any) => booking.status === 'CONFIRMED')
    .reduce((sum: number, booking: any) => sum + booking.service.price, 0)
  const previousMonthRevenue = previousMonthBookings
    .filter((booking: any) => booking.status === 'CONFIRMED')
    .reduce((sum: number, booking: any) => sum + booking.service.price, 0)

  const totalAppointments = allBookings.length
  const currentAppointments = currentMonthBookings.length
  const previousAppointments = previousMonthBookings.length

  const currentNewCustomers = new Set(currentMonthBookings.map((booking: any) => booking.userId)).size
  const previousNewCustomers = new Set(previousMonthBookings.map((booking: any) => booking.userId)).size

  const totalCompletionRate =
    totalAppointments === 0
      ? 0
      : (allBookings.filter((booking: any) => booking.status === 'CONFIRMED').length / totalAppointments) * 100
  const currentCompletionRate =
    currentAppointments === 0
      ? 0
      : (currentMonthBookings.filter((booking: any) => booking.status === 'CONFIRMED').length /
          currentAppointments) *
        100
  const previousCompletionRate =
    previousAppointments === 0
      ? 0
      : (previousMonthBookings.filter((booking: any) => booking.status === 'CONFIRMED').length /
          previousAppointments) *
        100

  const sevenDayStart = addDays(startOfDay(now), -6)
  const dailyRevenueMap = new Map<string, number>()

  for (let i = 0; i < 7; i++) {
    const date = addDays(sevenDayStart, i)
    dailyRevenueMap.set(formatDateLabel(date), 0)
  }

  allBookings.forEach((booking: any) => {
    if (booking.status !== 'CONFIRMED') {
      return
    }

    if (booking.createdAt < sevenDayStart) {
      return
    }

    const key = formatDateLabel(startOfDay(booking.createdAt))
    if (!dailyRevenueMap.has(key)) {
      return
    }

    dailyRevenueMap.set(key, (dailyRevenueMap.get(key) || 0) + booking.service.price)
  })

  const revenueData = Array.from(dailyRevenueMap.entries()).map(([dateLabel, revenue]) => ({
    dateLabel,
    revenue,
  }))

  const recentBookings = allBookings.slice(0, 5).map((booking: any) => ({
    id: booking.id,
    customerName: booking.user.name || '',
    customerEmail: booking.user.email,
    serviceName: booking.service.name,
    timeLabel: booking.createdAt.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    status: booking.status,
  }))

  return (
    <ProviderDashboardOverview
      userName={user.name || user.email}
      stats={[
        {
          title: 'Tổng doanh thu (VND)',
          value: formatVnd(totalRevenue),
          growth: toPercentGrowth(currentMonthRevenue, previousMonthRevenue),
          icon: 'revenue',
          tone: 'emerald',
        },
        {
          title: 'Tổng lịch hẹn',
          value: totalAppointments.toLocaleString('vi-VN'),
          growth: toPercentGrowth(currentAppointments, previousAppointments),
          icon: 'appointments',
          tone: 'blue',
        },
        {
          title: 'Người dùng mới',
          value: currentNewCustomers.toLocaleString('vi-VN'),
          growth: toPercentGrowth(currentNewCustomers, previousNewCustomers),
          icon: 'customers',
          tone: 'amber',
        },
        {
          title: 'Tỷ lệ hoàn thành',
          value: `${totalCompletionRate.toFixed(1)}%`,
          growth: toPercentGrowth(currentCompletionRate, previousCompletionRate),
          icon: 'completion',
          tone: 'violet',
        },
      ]}
      revenueData={revenueData}
      recentBookings={recentBookings}
    />
  )
}