import Link from 'next/link'
import { getUserFromRequest } from '@/lib/auth'

export default async function Header() {
  const user = await getUserFromRequest()
  return (
    <header className="bg-base-200 shadow p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          BookingApp
        </Link>
        <nav className="space-x-4 flex items-center">
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-sm btn-outline">
                Dashboard
              </Link>
              <Link href="/dashboard/bookings" className="btn btn-sm btn-outline">
                📅 Lịch Hẹn
              </Link>
              <span className="font-medium">{user.name ?? user.email}</span>
              <form action="/auth/logout" method="post" className="inline">
                <button type="submit" className="btn btn-sm btn-outline">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-sm btn-primary">
                Login
              </Link>
              <Link href="/auth/signup" className="btn btn-sm btn-secondary">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
