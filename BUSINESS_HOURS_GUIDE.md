# Business Hours Configuration Guide

## Overview

The Business Hours Configuration page allows service providers to manage and configure their business operating hours for each day of the week. This feature helps automate availability management and prevents customers from booking during closed hours.

## Features

### 1. **Day-by-Day Configuration**
- Configure hours for each day of the week (Monday through Sunday)
- Toggle business open/closed status for each day
- Set custom opening and closing times
- Time in HH:MM format (24-hour format)

### 2. **Visual Interface**
- Clean, intuitive dashboard with per-day cards
- Color-coded sections with visual indicators
- Real-time validation of time inputs
- Vietnamese language support

### 3. **Data Persistence**
- Automatic saving to database
- Server-side validation
- Error handling and user feedback
- Success notifications

## How to Access

1. Log in to your account as a service provider (PROVIDER role)
2. Go to Dashboard
3. Click on the "Thời Gian Làm Việc" (Business Hours) button
4. Or navigate to `/dashboard/business-hours`

## How to Use

### Setting Business Hours

1. **Select Days**: 
   - Check the checkbox next to each day you want your business to be open
   - Uncheck to mark a day as closed

2. **Set Times**:
   - For each open day, set the opening time (Giờ mở cửa)
   - Set the closing time (Giờ đóng cửa)
   - Times must be in HH:MM format (e.g., 09:00, 17:00)

3. **Validation Rules**:
   - Opening time must be before closing time
   - Both times are required for active days
   - Times are stored in 24-hour format

4. **Save Configuration**:
   - Click "Lưu cấu hình" (Save Configuration) button
   - Wait for success confirmation
   - Errors will be displayed if validation fails

### Example Configurations

#### Standard Business Hours
- Monday to Friday: 09:00 - 17:00
- Saturday: 10:00 - 15:00
- Sunday: Closed

#### Split Shift
- Monday to Friday: 09:00 - 12:00, then 13:00 - 18:00
- (Note: Current system only supports single continuous shifts per day)

## Technical Details

### Backend Implementation

**Server Actions** (`lib/actions.ts`):
- `getBusinessAvailabilities(businessId)` - Fetch current availability settings
- `updateBusinessAvailabilities(businessId, availabilities)` - Update all availabilities at once
- `updateAvailability(businessId, dayOfWeek, startTime, endTime, isActive)` - Update single day

**Database Schema** (`prisma/schema.prisma`):
```prisma
model Availability {
  id         String     @id @default(cuid())
  businessId String
  business   Business   @relation(...)
  dayOfWeek  DayOfWeek  // ENUM: MONDAY-SUNDAY
  startTime  String     // HH:MM format
  endTime    String     // HH:MM format
  isActive   Boolean    @default(true)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  @@unique([businessId, dayOfWeek])
  @@map("availabilities")
}
```

### Frontend Implementation

**Components**:
- `components/AvailabilityManager.tsx` - Main client component
- `app/dashboard/business-hours/page.tsx` - Server page component
- `app/dashboard/business-hours/client.tsx` - Client wrapper for server actions

**Features**:
- Animated transitions using Framer Motion
- Real-time validation
- Error and success message display
- Responsive grid layout (mobile, tablet, desktop)

## API Endpoints

Not applicable for this feature as it uses server actions and doesn't expose REST endpoints.

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Hãy chọn giờ làm việc cho [ngày]" | Missing time for active day | Set both opening and closing times |
| "Thời gian kết thúc phải sau thời gian bắt đầu" | Invalid time range | Ensure end time > start time |
| "Bạn cần tạo một doanh nghiệp" | No business created | Create a business first |
| Network/Database errors | Server issues | Retry or contact support |

## Best Practices

1. **Consistency**: Set consistent hours across work days for clarity
2. **Buffer Time**: Consider adding buffer time before/after your availability
3. **Special Hours**: Plan ahead for holidays or special events
4. **Communication**: Let customers know about your schedule through other channels
5. **Regular Review**: Periodically review and update your business hours

## Future Enhancements

- [ ] Support for split shifts (e.g., 9:00-12:00, 13:00-18:00)
- [ ] Holiday and special date exceptions
- [ ] Service-specific hours (different times for different services)
- [ ] Recurring special hours (e.g., seasonal hours)
- [ ] Integration with calendar events
- [ ] Auto-adjustment for daylight saving time
- [ ] Bulk operations (apply same hours to multiple days)

## Troubleshooting

### Changes not saving
- Check internet connection
- Verify no validation errors are displayed
- Refresh page and try again
- Check browser console for errors

### Can't access the page
- Ensure you're logged in as a provider
- Verify that at least one business exists
- Check that business is properly associated with your account

### Times not showing correctly
- Ensure you're using HH:MM format
- Check timezone settings
- Verify database migrations have completed

## Related Pages

- [Dashboard Management Guide](DASHBOARD_NAVIGATION_GUIDE.md)
- [API Reference](API_REFERENCE.md)
- [README.md](README.md)
