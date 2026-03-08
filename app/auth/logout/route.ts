export const runtime = 'nodejs';

import { clearTokenCookie } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function POST() {
  await clearTokenCookie()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}