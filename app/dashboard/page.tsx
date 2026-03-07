import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
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
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Welcome, {user.email}</h2>
          <p>User ID: {user.id}</p>
          <p>Email verified: {user.email_confirmed_at ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )
}