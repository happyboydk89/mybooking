# 🚀 Supabase Realtime Booking Integration - Setup Guide

## ✅ Setup Checklist

### 1. Environment Variables
Thêm vào file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Lấy từ Supabase Dashboard > Project Settings > API

### 2. Enable Realtime in Supabase

**Bước 1:** Đăng nhập vào [Supabase Dashboard](https://supabase.com)

**Bước 2:** Vào phần **Replication** (ngoài cùng bên trái)

**Bước 3:** Enable realtime cho các bảng:
- ✅ `bookings`
- ✅ `users`
- ✅ `services`
- ✅ `businesses`

**Bước 4:** Đảm bảo các events được chọn:
- ✅ INSERT
- ✅ UPDATE
- ✅ DELETE

### 3. Restart Development Server

```bash
# Dừng server hiện tại
Ctrl + C

# Cài dependencies mới (nếu chưa)
npm install @supabase/supabase-js

# Chạy lại
npm run dev
```

---

## 🎯 Tính Năng Đã Triển Khai

### 1. **Provider Dashboard - Quản Lý Lịch Hẹn** 
📍 Route: `/dashboard/bookings`

**Tính năng:**
- ✅ Xem toàn bộ bookings realtime (tự cập nhật khi khách hàng đặt chỗ)
- ✅ Filter theo:
  - 📅 **Toàn bộ** - Xem tất cả bookings
  - ☀️ **Ngày** - Xem bookings của 1 ngày cụ thể
  - 📋 **Tuần** - Xem bookings của tuần (7 ngày)
  - 🗓️ **Tháng** - Xem bookings của tháng
- ✅ **Xác Nhận (Confirm)** booking - chuyển status thành CONFIRMED
- ✅ **Hủy (Cancel)** booking - chuyển status thành CANCELLED
- ✅ Sắp xếp theo:
  - ⏳ Chờ Xác Nhận (PENDING)
  - ✓ Đã Xác Nhận (CONFIRMED)
  - ✗ Đã Hủy (CANCELLED)

**Cách hoạt động Realtime:**
```
Khách hàng đặt chỗ
    ↓
Server tạo booking trong DB
    ↓
Supabase broadcast change event
    ↓
Provider dashboard tự động cập nhật
    ↓
Danh sách lịch hẹn hiển thị ngay (không cần F5)
```

### 2. **Provider Status Updates - Cập nhật Realtime cho Khách Hàng**
📍 Route: `/customer/bookings`

**Tính năng:**
- ✅ Khách hàng xem các bookings của họ
- ✅ Tự động cập nhật khi provider confirm/cancel
- ✅ Phân loại theo trạng thái:
  - ✓ Đã Xác Nhận
  - ⏳ Chờ Xác Nhận
  - ✗ Đã Hủy

**Cách hoạt động Realtime:**
```
Provider click "Xác Nhận"
    ↓
Server action cập nhật booking status
    ↓
Supabase broadcast change event
    ↓
Customer bookings page tự động cập nhật
    ↓
Khách hàng thấy "Đã Xác Nhận" ngay (không cần F5)
```

### 3. **Server Actions - Booking Management**
📍 File: `lib/actions.ts`

**Hàm mới:**

```typescript
// Cập nhật trạng thái booking
updateBookingStatus(bookingId, status: 'CONFIRMED' | 'CANCELLED')

// Lấy bookings với filter
getBookingsForBusiness(businessId, filterType: 'all' | 'day' | 'week' | 'month', startDate?)

// Lấy booking chi tiết
getBookingById(bookingId)
```

### 4. **Filtering System - Bộ Lọc Lịch Hẹn**
📍 Component: `BookingFilter.tsx`

**Loại bộ lọc:**
- 📅 **Tất Cả** - Hiển thị toàn bộ bookings
- ☀️ **Ngày** - Chọn 1 ngày cụ thể
- 📋 **Tuần** - Tư thứ 2 đến Chủ Nhật (7 ngày)
- 🗓️ **Tháng** - Từ ngày 1 đến hết tháng

---

## 📱 Navigation Updates

### Header thêm links:
- 📅 **Lịch Hẹn** - Cho Provider (`/dashboard/bookings`)

### Dashboard Navigation:
```
Home (/) 
├── Danh Sách Business (hiển thị card)
│   └── Nhấn "Đặt Lịch" → /business/[id]
│
Auth
├── Login (/auth/login)
├── Signup (/auth/signup)
└── Logout
│
Dashboard (/dashboard)
├── Tạo Business
├── Tạo Service (/dashboard/services)
└── Quản Lý Bookings (/dashboard/bookings) ← NEW
│
Customer
└── Xem Lịch Hẹn (/customer/bookings) ← NEW
```

---

## 🧪 Testing Realtime

### Test 1: Booking Creation
1. Mở 2 tab browser:
   - Tab 1: Provider tại `/dashboard/bookings`
   - Tab 2: Customer tại home page
2. Customer đặt booking ở Tab 2
3. Tab 1 tự động cập nhật ngay (không cần F5)

### Test 2: Confirm/Cancel
1. Mở 2 tab browser:
   - Tab 1: Provider tại `/dashboard/bookings`
   - Tab 2: Customer tại `/customer/bookings`
2. Provider click "Xác Nhận" ở Tab 1
3. Tab 2 tự động cập nhật status (không cần F5)

### Test 3: Filtering
1. Vendor vào `/dashboard/bookings`
2. Click các filter buttons:
   - ☀️ Ngày → Chọn ngày cụ thể
   - 📋 Tuần → Chọn ngày bất kỳ trong tuần
   - 🗓️ Tháng → Chọn ngày bất kỳ trong tháng
3. Danh sách bookings thay đổi theo bộ lọc

---

## 📁 New Files Created

```
lib/
  └── supabase-client.ts          # Supabase client & realtime subscriptions

components/
  ├── BookingManagementDashboard.tsx  # Provider dashboard
  ├── BookingFilter.tsx               # Filter controls
  └── CustomerBookingsList.tsx        # Customer bookings view

app/
  ├── dashboard/bookings/
  │   └── page.tsx                    # Provider bookings page
  └── customer/bookings/
      └── page.tsx                    # Customer bookings page
```

---

## 🔧 Troubleshooting

### Realtime không hoạt động?
1. ✅ Check `.env.local` có đủ `NEXT_PUBLIC_SUPABASE_*` keys
2. ✅ Kiểm tra Supabase Replication có enable cho bảng `bookings`
3. ✅ Kiểm tra Console browser (F12) có errors không
4. ✅ Restart dev server: `npm run dev`

### Filter không hoạt động?
1. ✅ Kiểm tra database có booking records không
2. ✅ Kiểm tra booking table có `date` field không

### Status update không hiển thị?
1. ✅ Kiểm tra customer page đã enable realtime subscription
2. ✅ Kiểm tra `userId` filter đúng không

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Realtime)                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Provider Dashboard      ←→ Supabase Client ←→ Customer     │
│  (BookingManagement)     Real-time Channel   (Bookings)     │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │ WebSocket
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL + Realtime)                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Tables: bookings, users, services, businesses              │
│  Events: INSERT, UPDATE, DELETE                             │
│  Broadcasting: Through postgres_changes channel             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎓 Key Concepts

**Supabase Realtime:**
- Dùng PostgreSQL LISTEN/NOTIFY
- Broadcast changes qua WebSocket
- Subscribe from client-side
- Auto reconnect khi mất connection

**Server Actions:**
- Update bookings từ Provider UI
- Trigger change events
- Linked to realtime subscriptions

**Filtering:**
- Server-side date filtering
- Client-side state management
- Responsive to date changes

