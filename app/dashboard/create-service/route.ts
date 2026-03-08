export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import { createService } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.redirect('/auth/login')
  }

  const form = await request.formData()
  const businessId = form.get('businessId') as string
  const name = form.get('name') as string
  const price = parseFloat(form.get('price') as string)
  const duration = parseInt(form.get('duration') as string, 10)

  if (!businessId || !name || isNaN(price) || isNaN(duration)) {
    return NextResponse.redirect('/dashboard')
  }

  await createService(businessId, name, price, duration)
  return NextResponse.redirect('/dashboard')
}
