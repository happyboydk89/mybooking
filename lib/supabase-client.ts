import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Subscribe to real-time booking changes
export function subscribeToBookings(
  businessId: string,
  callback: (booking: any) => void
) {
  const subscription = supabase
    .channel(`bookings-${businessId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `businessId=eq.${businessId}`,
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()

  return subscription
}
