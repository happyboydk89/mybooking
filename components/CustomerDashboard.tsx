'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface CustomerDashboardProps {
  user: any
}

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch user's bookings from API
    setLoading(false)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-lg">Welcome, {user.name || user.email}!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Bookings */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">My Bookings</h2>
            {loading ? (
              <p>Loading...</p>
            ) : bookings.length === 0 ? (
              <div>
                <p className="mb-4">You don't have any bookings yet.</p>
                <Link href="/bookings" className="btn btn-primary">
                  Browse Services
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* TODO: Display bookings */}
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Profile</h2>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Name:</strong> {user.name || 'Not set'}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>Member Since:</strong>{' '}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
