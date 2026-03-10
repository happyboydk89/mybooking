# 📅 Provider Booking Management Guide

## Overview

The **Provider Booking Management** page allows service providers to view, filter, and manage all customer bookings for their businesses. It provides both card and table views with real-time updates, comprehensive filtering, and action buttons for confirming or cancelling bookings.

## Features

### ✅ **Dashboard Overview**
- **Today's Bookings**: Quick count of bookings scheduled for today
- **Pending Confirmations**: Bookings awaiting provider confirmation
- **Confirmed Bookings**: Approved bookings ready for service
- **Revenue Display**: Total confirmed and paid revenue

### ✅ **Multiple View Options**
- **Card View** (📋 Thẻ): Organized by booking status with detailed information
- **Table View** (📊 Bảng): Compact spreadsheet format for quick scanning

### ✅ **Advanced Filtering**
- **All** - View all bookings across all time periods
- **Today** (Hôm Nay) - Only today's bookings with date picker
- **This Week** (Tuần Này) - Current week's bookings
- **This Month** (Tháng Này) - Current month's bookings

### ✅ **Real-Time Updates**
- Automatic refresh when new bookings arrive
- Live status changes from other sessions
- Payment status updates in real-time

### ✅ **Quick Actions**
- **View Details** (👁️ Chi Tiết) - Open detailed booking information
- **Confirm** (✅ Xác Nhận) - Approve a pending booking
- **Cancel** (❌ Hủy) - Cancel a booking
- Actions only available for pending bookings

### ✅ **Status Badges**
- **Pending** (⏳ Chờ Xác Nhận) - Awaiting confirmation
- **Confirmed** (✅ Đã Xác Nhận) - Approved and ready
- **Cancelled** (❌ Đã Hủy) - Cancelled booking

### ✅ **Payment Status Tracking**
- **Pending** (Chờ Thanh Toán) - Awaiting payment
- **Success** (Đã Thanh Toán) - Payment completed
- **Failed** (Thanh Toán Thất Bại) - Payment failed
- **Cancelled** (Bị Hủy) - Payment cancelled

## How to Access

1. Log in as a service provider
2. Go to **Dashboard** → **Quản Lý Bookings** (Manage Bookings)
3. Or navigate to `/dashboard/bookings`

## How to Use

### View Bookings

**Card View (Default)**:
1. Bookings are grouped by status (Pending, Confirmed, Cancelled)
2. Each card shows:
   - Service name
   - Customer name & email
   - Date, time, and duration
   - Price
   - Status and payment status badges

**Table View**:
1. Click the "📊 Bảng" (Table) button
2. View all bookings in a compact table format
3. Columns: Customer, Service, Date & Time, Price, Status, Payment, Actions

### Filter Bookings

**By Time Period**:
```
- Tất Cả (All)      → Show all bookings
- Hôm Nay (Today)   → Show only today's bookings
- Tuần Này (Week)   → Show current week
- Tháng Này (Month) → Show current month
```

**Select Specific Date** (for Day filter):
- Click the date input field when "Hôm Nay" filter is active
- Pick any date to view bookings for that day

### Manage Bookings

#### Confirm a Booking
1. Find a booking with **"Chờ Xác Nhận"** (Pending) status
2. Click the **"✅ Xác Nhận"** (Confirm) button
3. Confirm the action
4. Status will change to **"✅ Đã Xác Nhận"** (Confirmed)

#### Cancel a Booking
1. Find a booking with **"Chờ Xác Nhận"** (Pending) status
2. Click the **"❌ Hủy"** (Cancel) button
3. Confirm the action
4. Status will change to **"❌ Đã Hủy"** (Cancelled)

#### View Booking Details
1. Click **"👁️ Chi Tiết"** (View Details) on any booking
2. Modal opens showing:
   - Service name and duration
   - Customer name, email, phone
   - Booking date and time
   - Booking and payment status
   - Service price
   - Special notes (if any)

### Interpret the Dashboard

**Stat Cards**:
- 📅 **Hôm Nay**: Count of bookings today
- ⏳ **Chờ Xác Nhận**: Count of pending confirmations (requires action)
- ✅ **Đã Xác Nhận**: Count of confirmed bookings
- 💰 **Tổng Doanh Thu**: Total revenue from confirmed & paid bookings

## Booking Status Workflow

```
New Booking Created
        ↓
    PENDING
    (Chờ Xác Nhận)
        ↓
   Choose Action
    /        \
   /          \
Confirm      Cancel
  ↓            ↓
CONFIRMED    CANCELLED
  ↓            ↓
Ready for   No Action
Service     Needed
  ↓
COMPLETED
(After service)
```

## Color Scheme

| Element | Color | Meaning |
|---------|-------|---------|
| Card Border (Pending) | 🟡 Yellow | Requires attention |
| Card Border (Confirmed) | 🟢 Green | Approved |
| Badge (Pending) | 🟡 Warning | Action needed |
| Badge (Confirmed) | 🟢 Success | Completed |
| Badge (Cancelled) | 🔴 Error | No longer active |
| Stat Card (Today) | 🔵 Blue | Information |
| Stat Card (Pending) | 🟡 Warning | Action needed |
| Stat Card (Confirmed) | 🟢 Success | Good |
| Stat Card (Revenue) | 🟣 Purple | Financial info |

## Business Multi-Management

If you manage multiple businesses:

1. Tabs appear at the top showing all your businesses
2. Click a business tab to view its bookings
3. Or use URL: `/dashboard/bookings?business=[businessId]`

**Features**:
- Each business has separate booking list
- Filters apply to selected business only
- Revenue calculations per business

## Real-Time Features

### Automatic Updates
- When new bookings are made by customers, they appear instantly
- When status changes in another session, updates appear automatically
- Payment status updates propagate in real-time

### WebSocket Connection
- Component subscribes to Supabase realtime events
- Maintains live connection while viewing page
- Unsubscribes when leaving page to conserve resources

## Responsive Design

### Mobile (< 768px)
- Single column card layout
- Scrollable table
- Stacked action buttons
- Touch-friendly buttons

### Tablet (768px - 1024px)
- 1-2 column grid
- Readable table
- Properly spaced buttons

### Desktop (> 1024px)
- Full table view available
- Side-by-side comparison
- Optimal spacing

## Performance Tips

1. **Use Filters**: Filter by "Today" or specific date to reduce load
2. **Switch to Table View**: If managing many bookings (< 1 second load)
3. **Check Regularly**: New bookings appear in real-time
4. **Archive Old**: Cancelled/completed bookings can be ignored

## Troubleshooting

### Bookings Not Appearing
- Check if correct business is selected
- Verify filter dates
- Refresh the page
- Check internet connection

### Status Update Fails
- Verify booking details haven't changed
- Check payment status isn't blocking action
- Try again in a few seconds
- Refresh page if stuck

### Real-Time Updates Not Working
- Check your internet connection
- Verify Supabase connection
- Try refreshing the page
- Check browser console for errors

### Can't See Payment Status
- Some bookings may not have payment
- Non-required payment services show "N/A"
- Contact support if status seems wrong

## Keyboard Shortcuts (Coming Soon)

Future shortcuts for power users:
- `C` - Confirm selected booking
- `X` - Cancel selected booking
- `D` - View details
- `F` - Focus filter input
- `T` - Toggle view type
- `?` - Show help

## API Integration

### Data Sources
- Bookings: From `prisma.booking` model
- Customer Info: From `prisma.user` model
- Service Info: From `prisma.service` model
- Real-time: Supabase PostgreSQL subscriptions

### Server Actions Used
- `getBookingsForBusiness()` - Fetch bookings with filtering
- `updateBookingStatus()` - Confirm or cancel booking
- `subscribeToBookings()` - Real-time subscription

## Export & Reporting (Future Features)

Planned enhancements:
- [ ] Export bookings to CSV/PDF
- [ ] Booking statistics dashboard
- [ ] Revenue reports
- [ ] Customer analytics
- [ ] Automated reminders

## Best Practices

✅ **DO**:
- Check bookings regularly
- Confirm or cancel promptly
- Monitor payment status
- Keep customer contact info updated
- Review daily/weekly totals

❌ **DON'T**:
- Forget to confirm important bookings
- Leave pending bookings unattended for too long
- Assume automatic confirmation (always manual)
- Ignore payment failures
- Delete booking history

## Advanced Features

### Batch Operations (Coming Soon)
- Select multiple bookings
- Confirm all at once
- Cancel in bulk
- Export selected

### Scheduling
- Calendar view
- Drag-and-drop to reschedule
- Conflict detection
- Time slot management

### Notifications
- New booking alerts
- Payment failed notifications
- Daily reminder summary
- Booking confirmation reminder

## Support

### Common Questions

**Q: Can I reschedule a booking?**  
A: Not directly. Customer must cancel and rebook, or contact support for manual rescheduling.

**Q: What happens when I confirm a booking?**  
A: Status changes to "Confirmed", customer receives notification, service is reserved.

**Q: Can I undo a cancellation?**  
A: Currently no. Plan ahead before cancelling. Contact support for special cases.

**Q: How do I see customer phone numbers?**  
A: Click "Chi Tiết" (Details) modal to see full customer information including phone.

**Q: Where are past bookings?**  
A: Use "Tất Cả" (All) filter. Past confirmed bookings remain visible for record-keeping.

### Contact Support
- For issues, see [API_REFERENCE.md](API_REFERENCE.md)
- For general help, see [README.md](README.md)
- For dashboard navigation, see [DASHBOARD_NAVIGATION_GUIDE.md](DASHBOARD_NAVIGATION_GUIDE.md)

---

**Version**: 2.0 (Enhanced)  
**Status**: ✅ Production Ready  
**Last Updated**: Q1 2026  
**Language**: Tiếng Việt (Vietnamese)
