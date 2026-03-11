import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ToastProvider } from '@/components/ToastProvider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - BookingPro',
  description: 'Manage your businesses and bookings',
}

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserFromRequest()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <>
      <ToastProvider />
      <DashboardLayout 
        userName={user.name} 
        userEmail={user.email}
        userId={user.id}
      >
        {children}
      </DashboardLayout>
    </>
  )
}
