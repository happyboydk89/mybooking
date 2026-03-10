'use client'

import { useState } from 'react'
import { createUserInDB, updateUser, deleteUser, getAllUsers } from '@/lib/actions'

export default function UserManager({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [formData, setFormData] = useState({ id: '', email: '', name: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const resetForm = () => {
    setFormData({ id: '', email: '', name: '' })
    setIsEditing(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) {
      setMessage('Email là bắt buộc')
      return
    }

    setLoading(true)
    const result = await createUserInDB(formData.email, formData.name)
    setLoading(false)

    if (result.success) {
      setMessage('✅ User tạo thành công!')
      setTimeout(() => setMessage(''), 3000)
      const allUsers = await getAllUsers()
      if (allUsers.success) setUsers(allUsers.users)
      resetForm()
    } else {
      setMessage('❌ ' + result.error)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id || !formData.email) {
      setMessage('Email là bắt buộc')
      return
    }

    setLoading(true)
    const result = await updateUser(formData.id, formData.email, formData.name)
    setLoading(false)

    if (result.success) {
      setMessage('✅ User cập nhật thành công!')
      setTimeout(() => setMessage(''), 3000)
      const allUsers = await getAllUsers()
      if (allUsers.success) setUsers(allUsers.users)
      resetForm()
    } else {
      setMessage('❌ ' + result.error)
    }
  }

  const handleEdit = (user: any) => {
    setFormData({
      id: user.id,
      email: user.email,
      name: user.name || '',
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa user này?')) return

    setLoading(true)
    const result = await deleteUser(id)
    setLoading(false)

    if (result.success) {
      setMessage('✅ User xóa thành công!')
      setTimeout(() => setMessage(''), 3000)
      const allUsers = await getAllUsers()
      if (allUsers.success) setUsers(allUsers.users)
    } else {
      setMessage('❌ ' + result.error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{isEditing ? 'Chỉnh sửa User' : 'Thêm User Mới'}</h2>
            {message && <div className="alert">{message}</div>}

            <form onSubmit={isEditing ? handleUpdate : handleAdd}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email *</span>
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="input input-bordered"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-control mt-4 gap-2">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Thêm'}
                </button>
                {isEditing && (
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="lg:col-span-2">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Danh sách Users ({users.length})</h2>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Bookings</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Không có users
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.name || '-'}</td>
                        <td>{user.bookings?.length || 0}</td>
                        <td className="flex gap-2">
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleEdit(user)}
                            disabled={loading}
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDelete(user.id)}
                            disabled={loading}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}