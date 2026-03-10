import Link from 'next/link'
import { getAllUsers, getAllBusinesses } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import BusinessCard from '@/components/BusinessCard'

export default async function Home() {
  const result = await getAllUsers()
  const users = result.success ? result.users : []
  const totalBookings = users.reduce((sum: number, user: any) => sum + (user.bookings?.length || 0), 0)

  // Get current user if logged in
  const user = await getUserFromRequest()

  // Get all businesses
  const businessResult = await getAllBusinesses()
  const businesses = businessResult.success ? businessResult.businesses : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 bg-clip-text text-transparent mb-4 leading-tight">
            Professional Booking Made Simple
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
            Connect with top service providers across all industries. Book appointments, manage payments, and streamline your business operations effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  href="/auth/signup"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:from-indigo-700 hover:to-indigo-800"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/auth/login"
                  className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-indigo-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl md:text-4xl font-bold text-indigo-600 mt-2">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center text-2xl">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-cyan-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl md:text-4xl font-bold text-cyan-600 mt-2">{totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-purple-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Services</p>
                <p className="text-3xl md:text-4xl font-bold text-purple-600 mt-2">{businesses.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center text-2xl">
                ⚙️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-t border-slate-200 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-900">
            Why Choose BookingPro?
          </h2>
          <p className="text-center text-slate-600 text-lg mb-12 max-w-2xl mx-auto">
            Everything you need to manage bookings, payments, and customer relationships in one place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Secure Payments',
                description: 'Multiple payment gateways with bank-level security'
              },
              {
                icon: '📱',
                title: 'Responsive Design',
                description: 'Works perfectly on mobile, tablet, and desktop'
              },
              {
                icon: '⏰',
                title: 'Real-time Notifications',
                description: 'Instant alerts for bookings and payment updates'
              },
              {
                icon: '📊',
                title: 'Business Analytics',
                description: 'Track performance with detailed insights and reports'
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-50 to-transparent rounded-lg p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Businesses Section */}
      {businesses.length > 0 && (
        <section className="container mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            Featured Service Providers
          </h2>
          <p className="text-slate-600 text-lg mb-12">
            Discover professional service providers in your area
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.slice(0, 6).map((business: any) => (
              <BusinessCard key={business.id} business={business} userLoggedIn={!!user} />
            ))}
          </div>

          {businesses.length > 6 && (
            <div className="text-center mt-12">
              <Link
                href="/businesses"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all inline-block"
              >
                View All Providers
              </Link>
            </div>
          )}
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-700 py-16 md:py-24 mt-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Booking Experience?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses and customers already using BookingPro to streamline their operations.
          </p>
          {!user && (
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:shadow-lg transition-all inline-block hover:bg-indigo-50"
            >
              Start Your Free Trial
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
