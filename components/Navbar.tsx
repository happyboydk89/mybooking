'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Fetch user data from server
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user || null)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const displayName = user?.name || user?.email?.split('@')[0] || ''
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-indigo-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-shadow">
              B
            </div>
            <span className="hidden sm:inline font-bold text-lg bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
              BookingPro
            </span>
          </Link>

          {/* Desktop Menu - Center */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-slate-600 hover:text-indigo-600 font-medium transition-colors relative group"
            >
              Explore
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link
              href="/about"
              className="text-slate-600 hover:text-indigo-600 font-medium transition-colors relative group"
            >
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all"></span>
            </Link>
          </div>

          {/* Right Side - Auth or User Menu */}
          <div className="flex items-center gap-3 md:gap-4">
            {isLoading ? (
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <>
                {/* Desktop User Menu with Dropdown */}
                <div className="hidden md:flex items-center dropdown dropdown-end">
                  <button
                    tabIndex={0}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="avatar placeholder">
                      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                    </div>
                    {/* Username */}
                    <span className="font-medium text-slate-700">{displayName}</span>
                    {/* Dropdown arrow */}
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow-xl bg-white rounded-lg w-48 border border-slate-100"
                  >
                    <li>
                      <Link href="/dashboard" className="hover:bg-indigo-50 hover:text-indigo-600">
                        <span>📊 Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/profile" className="hover:bg-indigo-50 hover:text-indigo-600">
                        <span>👤 Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/services" className="hover:bg-indigo-50 hover:text-indigo-600">
                        <span>⚙️ My Services</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/book-history" className="hover:bg-indigo-50 hover:text-indigo-600">
                        <span>📅 Book History</span>
                      </Link>
                    </li>
                    <li className="border-t border-slate-100 mt-1 pt-1">
                      <form action="/auth/logout" method="post">
                        <button type="submit" className="hover:bg-red-50 hover:text-red-600 w-full text-left">
                          <span>🚪 Logout</span>
                        </button>
                      </form>
                    </li>
                  </ul>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center dropdown dropdown-end">
                  <button
                    tabIndex={0}
                    className="btn btn-ghost btn-circle btn-sm"
                  >
                    <div className="avatar placeholder">
                      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full w-8">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={displayName} />
                        ) : (
                          <span className="text-xs">{initials}</span>
                        )}
                      </div>
                    </div>
                  </button>

                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow-xl bg-white rounded-lg w-48 border border-slate-100"
                  >
                    <li>
                      <Link href="/dashboard">
                        <span>📊 Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/profile">
                        <span>👤 Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/">
                        <span>🔍 Explore</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/about">
                        <span>ℹ️ About</span>
                      </Link>
                    </li>
                    <li className="border-t border-slate-100 mt-1 pt-1">
                      <form action="/auth/logout" method="post">
                        <button type="submit" className="hover:bg-red-50 hover:text-red-600 w-full text-left">
                          <span>🚪 Logout</span>
                        </button>
                      </form>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Auth Buttons - Desktop */}
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all"
                  >
                    Get Started
                  </Link>
                </div>

                {/* Auth Buttons - Mobile */}
                <div className="md:hidden flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="btn btn-sm btn-ghost text-indigo-600"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="btn btn-sm bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-0"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && !user && (
          <div className="md:hidden pb-4 space-y-2 border-t border-slate-100 pt-4">
            <Link
              href="/"
              className="block px-4 py-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
            >
              About Us
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
