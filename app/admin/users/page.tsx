import { getAllUsers } from '@/lib/actions'
import UserManager from '@/components/UserManager'

export default async function UsersPage() {
  const result = await getAllUsers()
  const users = result.success ? result.users : []

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600">Manage users: Create, Read, Update, Delete</p>
      </div>
      
      <UserManager initialUsers={users} />
    </div>
  )
}