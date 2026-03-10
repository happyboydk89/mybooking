# 🕐 Business Hours Configuration Feature

## Quick Start

### Access the Feature
1. Log in as a service provider
2. Go to Dashboard (`/dashboard`)
3. Click the "Thời Gian Làm Việc" (Business Hours) card
4. Or navigate directly to `/dashboard/business-hours`

### Configure Your Hours
1. **Toggle Days**: Enable/disable business for each day of the week
2. **Set Times**: For each enabled day, set opening and closing times
3. **Save**: Click "Lưu cấu hình" to save changes
4. **Confirm**: Look for the green success message

## 🎯 Features

### ✅ Day-by-Day Configuration
- Toggle open/closed status for each day (Monday-Sunday)
- Independent configuration for each day of the week
- No shared settings needed

### ✅ Time Management
- Set custom opening time (Giờ mở cửa)
- Set custom closing time (Giờ đóng cửa)
- 24-hour format (HH:MM)
- Real-time validation

### ✅ User-Friendly Interface
- Clean, organized card layout
- Color-coded sections
- Smooth animations
- Responsive design (mobile-friendly)
- Vietnamese language interface

### ✅ Error Prevention
- Validates end time > start time
- Requires times for active days
- Shows clear error messages
- Success confirmation after save

## 📋 Example Configurations

### Standard Office Hours
```
Monday-Friday:    09:00 - 17:00
Saturday:         10:00 - 15:00
Sunday:           Closed
```

### Extended Hours
```
Monday-Friday:    08:00 - 20:00
Saturday-Sunday:  09:00 - 18:00
```

### Reduced Schedule
```
Monday-Wednesday: 09:00 - 17:00
Thursday-Friday:  10:00 - 18:00
Saturday-Sunday:  Closed
```

## 🔧 Technical Details

### Components
- **AvailabilityManager.tsx** - Main UI component
- **business-hours/page.tsx** - Server page
- **business-hours/client.tsx** - Client wrapper

### Database
- **Table**: availabilities
- **Fields**: businessId, dayOfWeek, startTime, endTime, isActive
- **Constraint**: Unique (businessId, dayOfWeek)

### API Actions
```typescript
// Fetch availabilities
getBusinessAvailabilities(businessId)

// Update all availabilities at once
updateBusinessAvailabilities(businessId, availabilities)

// Update single day
updateAvailability(businessId, dayOfWeek, startTime, endTime, isActive)
```

## 🎨 UI Components Used

### Layout
- Tailwind CSS Grid (responsive columns)
- Card components (DaisyUI)
- Flexbox for alignment

### Interactions
- Checkbox toggles (DaisyUI)
- Time input fields (HTML5)
- Button with loading state (DaisyUI)
- Animated transitions (Framer Motion)

### Feedback
- Error alerts (red background)
- Success messages (green background)
- Loading indicator on button
- Visual status for each day

## 🚀 Workflow

```
1. User navigates to /dashboard/business-hours
   ↓
2. Server loads user business & availabilities
   ↓
3. Page renders with current availability data
   ↓
4. User modifies times or toggles days
   ↓
5. User clicks "Lưu cấu hình"
   ↓
6. Client validates input (end > start, required fields)
   ↓
7. Server action updates database
   ↓
8. Success notification shown
   ↓
9. Page reflects saved changes
```

## ⚙️ Configuration

### Default Values
```javascript
startTime: '09:00'   // Default opening time
endTime: '17:00'     // Default closing time
isActive: false      // Days start as closed
```

### Environment Setup
No special environment variables needed. Uses existing Supabase configuration.

### Database Migration
```bash
# Already applied
# Adds unique constraint on (businessId, dayOfWeek)
```

## 🐛 Troubleshooting

### "Can't access the page"
✓ Solution: Ensure you're logged in as a provider and have created a business

### "Changes not saving"
✓ Solution: Check internet connection and verify no error messages appear

### "Invalid time format"
✓ Solution: Use HH:MM format (e.g., 09:00, 14:30, 17:00)

### "End time error"
✓ Solution: Make sure closing time is after opening time

## 📱 Responsive Design

### Mobile (< 768px)
- Single column layout
- Full-width cards
- Touch-friendly inputs
- Stacked buttons

### Tablet (768px - 1024px)
- 2 column layout
- Cards with padding
- Optimized spacing

### Desktop (> 1024px)
- 3 column layout
- Cards with shadows
- Maximum content width

## ♿ Accessibility

- Proper form labels
- Color contrast compliance
- Keyboard navigation support
- Clear error messages
- Loading state indication
- Focus indicators

## 📊 Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
┌──────▼──────────────────────────┐
│  AvailabilityManager Component   │
│  - Manage state                  │
│  - Handle user input             │
│  - Show errors/success           │
└──────┬──────────────────────────┘
       │
┌──────▼──────────────────────────┐
│    Server Action                 │
│  - Validate input                │
│  - Update database               │
│  - Return result                 │
└──────┬──────────────────────────┘
       │
┌──────▼──────────────────────────┐
│  Prisma ORM                      │
│  - Query/Update database         │
│  - Handle constraints            │
└──────┬──────────────────────────┘
       │
┌──────▼──────────────────────────┐
│  PostgreSQL (Supabase)           │
│  - Store availabilities          │
│  - Enforce constraints           │
└──────────────────────────────────┘
```

## 🔒 Security

- ✅ Server-side validation required
- ✅ User authentication check
- ✅ Provider role verification
- ✅ Business ownership check
- ✅ Database constraints enforced
- ✅ Input sanitization

## 🎯 Use Cases

### Salon/Barbershop
```
Mon-Fri: 09:00 - 18:00
Sat: 08:00 - 16:00
Sun: Closed
```

### Medical Clinic
```
Mon-Thu: 08:00 - 17:00
Fri: 08:00 - 16:00
Sat-Sun: Closed
```

### Spa/Wellness
```
Mon-Thu: 10:00 - 20:00
Fri-Sat: 10:00 - 21:00
Sun: 12:00 - 20:00
```

## 📈 Future Enhancements

### Phase 2
- [ ] Holiday exceptions
- [ ] Split shift support (e.g., 9-12, 14-18)
- [ ] Service-specific hours

### Phase 3
- [ ] Bulk operations
- [ ] Schedule templates
- [ ] Calendar sync

### Phase 4
- [ ] Automated reminders
- [ ] Capacity management
- [ ] Analytics dashboard

## 🔗 Related Documentation

- **User Guide**: [BUSINESS_HOURS_GUIDE.md](BUSINESS_HOURS_GUIDE.md)
- **Implementation**: [BUSINESS_HOURS_IMPLEMENTATION.md](BUSINESS_HOURS_IMPLEMENTATION.md)
- **Features Index**: [FEATURES_INDEX.md](FEATURES_INDEX.md)
- **Dashboard Guide**: [DASHBOARD_NAVIGATION_GUIDE.md](DASHBOARD_NAVIGATION_GUIDE.md)

## ❓ FAQ

**Q: Can I set different hours for different services?**  
A: Not in the current version. You can configure one set for the entire business.

**Q: What if I have a lunch break?**  
A: Currently only single continuous shifts are supported. Feature coming soon.

**Q: Can I have different hours for weekends?**  
A: Yes! Configure each day independently.

**Q: Are my hours affected by timezone changes?**  
A: Hours are stored in 24-hour format. Timezone handling is server-side.

**Q: What happens if I don't set any hours?**  
A: All days will be marked as closed until you configure them.

## 📞 Support

- Report issues: Contact development team
- Documentation: See [BUSINESS_HOURS_GUIDE.md](BUSINESS_HOURS_GUIDE.md)
- API Help: See [API_REFERENCE.md](API_REFERENCE.md)

---

**Current Version**: 1.0.0  
**Last Updated**: Q1 2025  
**Status**: ✅ Production Ready  
**Feature**: Complete & Tested
