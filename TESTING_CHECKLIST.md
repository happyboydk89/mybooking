# ✅ Dashboard Navigation Testing Checklist

## 🔍 Pre-Testing Setup

- [ ] Dev server running on `http://localhost:3000`
- [ ] Browser opened to homepage
- [ ] `.env.local` has Supabase credentials (for realtime testing)
- [ ] Database has at least 1 provider account

---

## 🏠 Homepage Tests

### Navigation from Home
- [ ] Homepage loads with business listings
- [ ] Can see "Đặt Lịch" button on business cards
- [ ] Header shows "Đăng Nhập" or "📅 Lịch Hẹn" depending on auth

### Login/Registration
- [ ] "Đăng Nhập" link works → goes to `/auth/login`
- [ ] "Đăng Ký" link works → goes to `/auth/signup`
- [ ] After login, redirects to `/dashboard` ✅
- [ ] User name shows in header

---

## 📊 Dashboard Main Page Tests

### Navigation Buttons (NEW)
- [ ] **Blue "🏢 Quản Lý Business" button visible**
  - [ ] Text displays correctly in Vietnamese
  - [ ] Blue gradient color shows
  - [ ] Hover effect works (scale up slightly)
  - [ ] Click → stays on `/dashboard` (same page)

- [ ] **Purple "📅 Quản Lý Bookings" button visible**
  - [ ] Text displays correctly in Vietnamese
  - [ ] Purple gradient color shows
  - [ ] Hover effect works (scale up slightly)
  - [ ] Click → navigates to `/dashboard/bookings`

- [ ] **Business count badge shows** on Business button
  - [ ] Shows correct number of businesses

- [ ] **"Realtime Updates" badge shows** on Bookings button
  - [ ] Badge visible and styled correctly

### Welcome Section
- [ ] Welcome message displays: "Xin chào, [User Name]! 👋"
- [ ] User's name matches logged-in user

### Business List Section
- [ ] "📋 Các Businesses Của Bạn" heading shows
- [ ] Business cards display (if any exist)
  - [ ] Business name displays
  - [ ] Address (📍) shows
  - [ ] Services count (🔧 x services) shows
  - [ ] Services list populated correctly

### Create New Business Section
- [ ] "➕ Tạo Business Mới" form visible
- [ ] Can fill in:
  - [ ] Business Name
  - [ ] Description
  - [ ] Address
  - [ ] Phone
  - [ ] Industry Type
- [ ] Submit button works
- [ ] New business appears in list after creation

---

## 📅 Booking Management Page Tests

### Navigation (To this page)
- [ ] Can reach via:
  - [ ] Click purple "📅 Quản Lý Bookings" button from dashboard
  - [ ] Direct URL: `http://localhost:3000/dashboard/bookings`

### Top Navigation
- [ ] "← Quay Lại Dashboard" button visible
  - [ ] Click → goes back to `/dashboard`
- [ ] Page title: "📅 Quản Lý Bookings" displays

### Business Selector (if multiple businesses)
- [ ] Shows tabs/buttons for each business
- [ ] Can switch between businesses
- [ ] Selected business's bookings display

### Booking List
- [ ] Bookings display in grid/table format
- [ ] Shows:
  - [ ] Customer name
  - [ ] Service name
  - [ ] Booking date
  - [ ] Booking time (timeSlot)
  - [ ] Status (PENDING/CONFIRMED/CANCELLED)

### Filter Controls
- [ ] Filter buttons show: "All", "Day", "Week", "Month"
  - [ ] "All" filters work correctly
  - [ ] "Day" shows only today's bookings
  - [ ] "Week" shows week's bookings (Mon-Sun)
  - [ ] "Month" shows month's bookings
- [ ] Date picker works correctly
- [ ] Active filter highlighted

### Booking Actions
- [ ] **Confirm button works**
  - [ ] Changes booking status to CONFIRMED
  - [ ] UI updates immediately
  - [ ] Status badge changes color

- [ ] **Cancel button works**
  - [ ] Changes booking status to CANCELLED
  - [ ] UI updates immediately
  - [ ] Status badge changes color

---

## 👤 Customer Bookings Page Tests

### Navigation (To this page)
- [ ] Click "📅 Lịch Hẹn" in header (when logged in as customer)
- [ ] Direct URL: `http://localhost:3000/customer/bookings`

### Top Navigation
- [ ] "← Quay Lại Home" button visible
  - [ ] Click → goes back to home (`/`)

### Page Title
- [ ] "📅 Lịch Hẹn Của Bạn" or similar displays

### Booking List
- [ ] Shows all my bookings
- [ ] Organized by status (Pending/Confirmed/Cancelled)
- [ ] Shows:
  - [ ] Business name
  - [ ] Service name
  - [ ] Booking date
  - [ ] Booking time
  - [ ] Status badge

---

## 🎨 UI/UX Tests

### Responsive Design
- [ ] Mobile (375px): Buttons stack vertically
- [ ] Tablet (768px): Side by side layout
- [ ] Desktop (1024px+): Full width with spacing

### Color Consistency
- [ ] Business button: Blue gradient (#3B82F6 to darker blue)
- [ ] Bookings button: Purple gradient (#9333EA to darker purple)
- [ ] Status badges:
  - [ ] PENDING: Yellow/orange
  - [ ] CONFIRMED: Green
  - [ ] CANCELLED: Red/gray

### Animations
- [ ] Hover effects smooth (scale, shadow)
- [ ] Page transitions smooth
- [ ] No flickering or jumpiness

---

## 🔄 Realtime Tests (Requires Supabase Setup)

### Prerequisites
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Replication enabled in Supabase for `bookings` table

### Test Flow
1. **Open two browser windows:**
   - [ ] Window A: Provider logged in → `/dashboard/bookings`
   - [ ] Window B: Customer logged in → `/customer/bookings`

2. **Create booking:**
   - [ ] Customer creates new booking
   - [ ] Booking appears in Provider's list (Window A) automatically
   - [ ] No refresh needed

3. **Confirm booking:**
   - [ ] Provider confirms booking in Window A
   - [ ] Window B updates status to CONFIRMED automatically
   - [ ] No refresh needed

4. **Cancel booking:**
   - [ ] Provider cancels booking in Window A
   - [ ] Window B updates status to CANCELLED automatically
   - [ ] No refresh needed

---

## 🐛 Common Issues & Debug

### "Navigation buttons not showing"
- [ ] Check: Is DashboardNav component imported?
- [ ] Check: Is component exported correctly?
- [ ] Solution: Refresh browser cache (Ctrl+Shift+R)

### "Clicking button does nothing"
- [ ] Check: Are buttons `<Link>` components?
- [ ] Check: Is href correct?
- [ ] Check: Is routing setup in next.config?
- [ ] Solution: Check browser console for errors (F12)

### "Bookings not updating in realtime"
- [ ] Check: Is Supabase configured in `.env.local`?
- [ ] Check: Is Replication enabled in Supabase?
- [ ] Check: Is subscription created in component?
- [ ] Solution: Check browser console for Supabase errors

### "Styles not showing correctly"
- [ ] Check: Is Tailwind CSS working?
- [ ] Check: Is DaisyUI configured?
- [ ] Solution: Run `npm run build` to recompile

---

## 📋 Sign-Off

After passing all tests above, the new Dashboard Navigation is **READY FOR PRODUCTION** ✅

### What Works
- ✅ 2 navigation buttons (Business & Bookings)
- ✅ Smooth animations and transitions
- ✅ Responsive design
- ✅ Clear navigation flow
- ✅ Back buttons for easy return
- ✅ Realtime updates (when configured)

### Next Steps (Optional Enhancements)
- [ ] Add keyboard shortcuts (e.g., `B` for Business, `K` for Bookings)
- [ ] Add mobile hamburger menu
- [ ] Add analytics on dashboard
- [ ] Add export bookings as CSV/PDF
- [ ] Add email notifications

