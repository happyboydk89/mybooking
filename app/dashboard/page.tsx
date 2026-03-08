import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'
import { getUserBusinesses } from '@/lib/actions'
import ProviderDashboard from '@/components/ProviderDashboard'
import CustomerDashboard from '@/components/CustomerDashboard'
import CreateBusinessForm from '@/components/CreateBusinessForm'

export default async function Dashboard() {
  const user = await getUserFromRequest()
  // if (!user) {
  //   redirect('/auth/login')
  // }

  // Get all businesses for this user (regardless of role)
  const businessResult = await getUserBusinesses(user.id)
  const businesses = businessResult.success ? businessResult.businesses : []

  // If user has no business, show create business form
  if (businesses.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <p className="text-lg mb-8">Welcome, {user.name || user.email}!</p>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Create Your First Service Business</h2>
            <p className="mb-4">Get started by creating a business to offer services.</p>
            <CreateBusinessForm userId={user.id} />
          </div>
        </div>
      </div>
    )
  }

  // If user has exactly one business, show its dashboard
  if (businesses.length === 1) {
    return <ProviderDashboard user={user} business={businesses[0]} />
  }

  // If user has multiple businesses, show a list to select from
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <p className="text-lg mb-8">Welcome, {user.name || user.email}!</p>
      
      <div className="grid grid-cols-1 gap-4 mb-8">
        <h2 className="text-2xl font-bold">Your Businesses</h2>
        {businesses.map((business: any) => (
          <div key={business.id} className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title">{business.name}</h3>
              <p>{business.description}</p>
              <p className="text-sm text-gray-600">{business.address}</p>
              <div className="card-actions justify-end">
                <a href={`/dashboard/businesses/${business.id}`} className="btn btn-primary">
                  Manage
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateBusinessForm userId={user.id} />
    </div>
  )
}