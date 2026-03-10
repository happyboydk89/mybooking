# 📚 Server Actions & API Reference

## Server Actions (lib/actions.ts)

### 1. Get Bookings with Filter
```typescript
getBookingsForBusiness(
  businessId: string,
  filterType: 'all' | 'day' | 'week' | 'month' = 'all',
  startDate?: Date
) -> { success: boolean, bookings: Booking[] }
```

**Example:**
```typescript
// Get all bookings for today
const result = await getBookingsForBusiness(businessId, 'day', new Date())

// Get bookings for selected week
const result = await getBookingsForBusiness(businessId, 'week', new Date('2026-03-10'))

// Get all bookings without filter
const result = await getBookingsForBusiness(businessId, 'all')
```

### 2. Update Booking Status
```typescript
updateBookingStatus(
  bookingId: string,
  status: 'CONFIRMED' | 'CANCELLED'
) -> { success: boolean, booking: Booking }
```

**Example:**
```typescript
// Confirm a booking
const result = await updateBookingStatus(bookingId, 'CONFIRMED')

// Cancel a booking
const result = await updateBookingStatus(bookingId, 'CANCELLED')
```

### 3. Get Single Booking
```typescript
getBookingById(bookingId: string) -> { success: boolean, booking: Booking }
```

### 4. Create Booking
```typescript
createBooking(
  userId: string,
  businessId: string,
  serviceId: string,
  date: Date,
  timeSlot: string
) -> { success: boolean, booking: Booking }
```

---

## Supabase Realtime Subscriptions

### Subscribe to Business Bookings
```typescript
import { subscribeToBookings } from '@/lib/supabase-client'

const subscription = subscribeToBookings(businessId, (booking) => {
  console.log('New/Updated booking:', booking)
})

// Cleanup
subscription.unsubscribe()
```

### Manual Supabase Query
```typescript
import { supabase } from '@/lib/supabase-client'

// Get bookings
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('businessId', businessId)

// Subscribe to changes
const subscription = supabase
  .channel('custom-channel')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'bookings',
      filter: `businessId=eq.${businessId}`
    },
    (payload) => {
      console.log('Change:', payload)
    }
  )
  .subscribe()
```

---

## Booking Data Structure

```typescript
interface Booking {
  id: string
  userId: string
  businessId: string
  serviceId: string
  date: DateTime
  timeSlot: string              // Format: "HH:MM"
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  notes?: string
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  user?: {
    id: string
    name?: string
    email: string
  }
  service?: {
    id: string
    name: string
    price: number
    duration: number
  }
  business?: {
    id: string
    name: string
    address?: string
  }
}
```

---

## Filter Types

### Day Filter
```typescript
// Lấy tất cả bookings trong 1 ngày
// Time range: 00:00:00 to 23:59:59
const result = await getBookingsForBusiness(businessId, 'day', date)
```

### Week Filter
```typescript
// Lấy bookings trong tuần (Monday to Sunday)
// Nếu selected date là Wednesday, sẽ lấy Monday-Sunday của tuần đó
const result = await getBookingsForBusiness(businessId, 'week', date)
```

### Month Filter
```typescript
// Lấy bookings trong tháng
// Time range: FirstDay 00:00 to LastDay 23:59
const result = await getBookingsForBusiness(businessId, 'month', date)
```

### All Filter
```typescript
// Lấy tất cả bookings không phân theo thời gian
const result = await getBookingsForBusiness(businessId, 'all')
```

---

## Component Usage

### Provider Dashboard
```tsx
import BookingManagementDashboard from '@/components/BookingManagementDashboard'

export default function Page() {
  return (
    <BookingManagementDashboard businessId={businessId} />
  )
}
```

**Features:**
- Auto-refreshes on new bookings
- Confirm/Cancel buttons
- Date/Week/Month filtering
- Realtime status updates

### Customer Bookings
```tsx
import CustomerBookingsList from '@/components/CustomerBookingsList'

export default function Page() {
  return (
    <CustomerBookingsList userId={userId} />
  )
}
```

**Features:**
- Shows user's bookings only
- Realtime status updates
- Organized by status

### Booking Filter
```tsx
import BookingFilter from '@/components/BookingFilter'

export default function Page() {
  const [filterType, setFilterType] = useState<'all' | 'day' | 'week' | 'month'>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <BookingFilter
      filterType={filterType}
      onFilterChange={setFilterType}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  )
}
```

---

## Error Handling

All server actions return:
```typescript
{
  success: boolean
  data?: T
  error?: string
}
```

**Example:**
```typescript
const result = await updateBookingStatus(bookingId, 'CONFIRMED')

if (result.success) {
  console.log('Booking updated:', result.booking)
} else {
  console.error('Error:', result.error)
}
```

---

## Troubleshooting Common Issues

### Bookings not updating in realtime?
1. Check WebSocket connection: Open DevTools → Network → Filter by "WS"
2. Verify Supabase Replication is enabled for `bookings` table
3. Check browser console for subscription errors

### Filter not working?
1. Ensure database has bookings with `date` field
2. Verify `getBookingsForBusiness` parameters are passed correctly
3. Check if `startDate` is a valid Date object

### Old data showing?
1. Clear browser cache (Ctrl + Shift + Delete)
2. Check if realtime subscription is active
3. Verify user has permission to access booking data

