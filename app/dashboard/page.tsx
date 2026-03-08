import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'

export default async function Dashboard() {
  const user = await getUserFromRequest()
  console.log('[Dashboard] Current user:', user)
  if (!user) {
    console.log('[Dashboard] No user found, redirecting to login')
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form action="/auth/logout" method="post">
          <button className="btn btn-outline" type="submit">Logout</button>
        </form>
      </div>

      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">Welcome, {(user as any).email || user.id}</h2>
          <p>User ID: {user.id}</p>
        </div>
      </div>

      <div className="alert alert-success">
        <p>✅ You are successfully logged in!</p>
      </div>
    </div>
  )
}
}