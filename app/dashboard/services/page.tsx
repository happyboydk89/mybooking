import { getUserFromRequest } from '@/lib/auth'
import { getUserBusinesses } from '@/lib/actions'
import { redirect } from 'next/navigation'
import CreateServiceForm from '@/components/CreateServiceForm'

export default async function ServicesPage() {
  const user = await getUserFromRequest()
  if (!user) {
    redirect('/auth/login')
  }

  const businessResult = await getUserBusinesses(user.id)
  const businesses = businessResult.success ? businessResult.businesses : []

  if (businesses.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">My Services</h1>
        <p className="text-gray-600">You need to create a business first to add services.</p>
        <a href="/dashboard" className="btn btn-primary mt-4">
          Go to Dashboard
        </a>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Manage Services</h1>

      {businesses.map((business: any) => (
        <div key={business.id} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{business.name}</h2>

          {/* List existing services */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Your Services</h3>
            {business.services && business.services.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {business.services.map((service: any) => (
                  <div key={service.id} className="card bg-base-100 shadow-md">
                    <div className="card-body">
                      <h4 className="card-title">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <div className="flex justify-between mt-2">
                        <span className="font-semibold text-blue-600">${service.price}</span>
                        <span className="text-sm text-gray-500">{service.duration} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No services yet</p>
            )}
          </div>

          {/* Create new service form */}
          <CreateServiceForm businessId={business.id} />
        </div>
      ))}
    </div>
  )
}
