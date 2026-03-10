import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardSettingsPage() {
  const user = await getUserFromRequest()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Cài đặt</h1>
        <p className="mt-2 text-slate-600">Quản lý cấu hình tài khoản và dashboard của bạn.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Tùy chọn hiển thị</h2>
        <p className="mt-2 text-sm text-slate-600">
          Khu vực này sẵn sàng để tích hợp các thiết lập nâng cao cho Provider.
        </p>
      </div>
    </div>
  )
}
