import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProfileSettingsForm from '@/components/ProfileSettingsForm'

export const metadata = {
  title: 'Profile - BookingPro',
  description: 'Update your personal information',
}

export default async function ProfilePage() {
  const user = await getUserFromRequest()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600">Update your personal information and settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200">
            <div className="avatar placeholder">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full w-24 h-24 flex items-center justify-center font-semibold text-2xl">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || user.email}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{(user.name || user.email.split('@')[0]).slice(0, 2).toUpperCase()}</span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {user.name || 'Guest User'}
              </h2>
              <p className="text-slate-600">{user.email}</p>
              <p className="text-sm text-slate-500 mt-2">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Profile Settings Form */}
          <ProfileSettingsForm
            email={user.email}
            initialName={user.name}
            initialPhone={user.phone}
          />

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Email</span>
                <span className="text-slate-900 font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Account Status</span>
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Active
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Last Updated</span>
                <span className="text-slate-900 font-medium">
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-700">
            For additional support or account issues, please contact our support team at support@bookingpro.com
          </p>
        </div>
      </div>
    </div>
  )
}
