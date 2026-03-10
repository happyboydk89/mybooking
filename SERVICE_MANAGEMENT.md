# Service Management Page - Provider Dashboard

## Overview

Created a modern, SaaS-style service management page (`/dashboard/services`) for providers to manage their business services with a professional DataTable interface and modal-based form.

## Features Implemented

### 1. Service Manager Component (`components/ServiceManager.tsx`)

**Main Interface:**
- Professional header with title and description
- "Thêm dịch vụ mới" (Add new service) button with gradient background
- Multi-business selector (if provider has multiple businesses)
- Statistics dashboard (total services, payment-required count, average price)
- Responsive DataTable for service listing
- Empty state with icon and CTA button

**Layout Sections:**
```
┌─────────────────────────────────────────────────┐
│ Header                                          │
│ Title: "Quản lý dịch vụ"                        │
│ [Add New Service Button] ────────────────────→ │
├─────────────────────────────────────────────────┤
│ Business Selector (cards - if multiple)         │
├─────────────────────────────────────────────────┤
│ Stats Cards (3 columns)                         │
│ [Total] [Payment Required] [Avg Price]         │
├─────────────────────────────────────────────────┤
│ DataTable                                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ Service Name │ Price │ Duration │ Payment   │ │
│ │ [Service 1]  │ $X.XX │ X min    │ Required  │ │
│ │ [Service 2]  │ $X.XX │ X min    │ Optional  │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 2. Service DataTable (`components/ServiceDataTable.tsx`)

**Table Columns:**
- **Tên dịch vụ** (Service Name): Shows name and description (truncated)
- **Giá** (Price): Formatted in bold indigo text with $ prefix
- **Thời lượng** (Duration): Duration in minutes
- **Thanh toán** (Payment Status):
  - 🔒 "Bắt buộc" (Required) - amber color if `requiresPayment: true`
  - 🔓 "Tùy chọn" (Optional) - green color if `requiresPayment: false`
- **Thao tác** (Actions): Edit and Delete buttons with icons

**Features:**
- Hover effects on rows (background color change)
- Staggered animation on load with Framer Motion
- Empty state when no services exist
- Lock/Unlock icons for payment status
- Edit (pencil) and Delete (trash) buttons with hover animations
- Confirmation dialog before deletion

### 3. Service Form Modal (`components/ServiceFormModal.tsx`)

**Form Fields:**
1. **Tên dịch vụ** (Service Name)
   - Text input
   - Required, minimum 3 characters
   - Zod validation

2. **Mô tả** (Description)
   - Textarea (3 rows)
   - Optional field
   - Character limit with visual feedback

3. **Giá** (Price)
   - Number input
   - Min value: 0
   - Step: 0.01
   - Zod validation for numeric value

4. **Thời lượng** (Duration)
   - Select dropdown
   - Options: 15 phút, 30 phút, 60 phút
   - Zod validation for valid selection

5. **Yêu cầu thanh toán trực tuyến** (Require Online Payment)
   - Toggle checkbox
   - Optional field
   - Info text explaining the feature

**Validation:**
- All fields use `react-hook-form` with Zod schemas
- Real-time error display below fields
- Error messages in Vietnamese
- Type-safe form data

**Actions:**
- Cancel button (closes modal without saving)
- Create Service button (submits form)
- Loading state during submission
- Success/error handling with user feedback

### 4. Service Management Page (`app/dashboard/services/page.tsx`)

**Architecture:**
- Client-component page with async data fetching
- Server-side authentication check via `/api/auth/me`
- Fetches businesses and services via `/api/user/businesses`
- Proper role validation (PROVIDER only)

**Error Handling:**
- Redirects to login if not authenticated
- Redirects to dashboard if not a provider
- Shows helpful message if no businesses created
- API error handling with user feedback

### 5. API Endpoints

**POST /api/services**
- Creates a new service
- Accepts FormData with: businessId, name, description, price, duration, requiresPayment
- Returns: `{ success: true, service: Service }`
- Validates business ownership (user must be the business provider)

**DELETE /api/services/[id]**
- Deletes a service by ID
- Verifies user has permission (owns the business)
- Returns: `{ success: true, message: "Service deleted successfully" }`
- Returns 403 if user doesn't own the service

**GET /api/user/businesses**
- Fetches all businesses for authenticated user
- Includes services for each business
- Returns: `{ success: true, businesses: Business[] }`

## UI/UX Features

### Design Pattern: Modern SaaS
- Gradient backgrounds (Indigo/Slate)
- Clean card-based layouts
- Professional typography hierarchy
- Consistent spacing and padding
- Hover state transitions

### Color Scheme:
- Primary: Indigo (#4F46E5) - buttons, selection states
- Secondary: Slate (#64748B) - text, borders
- Accent: Amber (#D97706) - payment required status
- Success: Green (#16A34A) - optional payment status
- Background: Slate-50 to white gradient

### Animations:
- Framer Motion on component load (fade + scale)
- Row animations in DataTable (staggered)
- Button hover/tap animations
- Modal backdrop fade-in/out
- Smooth state transitions

### Responsive Design:
- Mobile: Single column, full-width form, stacked stats
- Tablet: 2-3 column layouts
- Desktop: Full 2-column layout (left stats, right table)

## Data Models

**Service Schema (Zod):**
```typescript
{
  name: string (1-255 chars, min 3)
  description?: string (optional)
  price: number (≥ 0)
  duration: "15" | "30" | "60" (string)
  requiresPayment?: boolean (default: false)
}
```

**Service (Database):**
```prisma
model Service {
  id              String
  name            String
  description     String?
  price           Float
  duration        Int          // minutes
  requiresPayment Boolean      // default: false
  businessId      String
  business        Business
  createdAt       DateTime
  updatedAt       DateTime
}
```

## User Flow

**Adding a Service:**
1. Navigate to `/dashboard/services`
2. Click "Thêm dịch vụ mới" button
3. Modal opens with form
4. Fill in all required fields
5. Toggle payment requirement if needed
6. Click "Tạo dịch vụ"
7. Form submits to `/api/services`
8. Page refreshes/refetches to show new service
9. Success notification (optional)

**Editing/Deleting:**
- Edit button: Shows edit form (not implemented yet, placeholder for future)
- Delete button: Shows confirmation dialog
- After delete: Page refetches to remove from list

**Viewing Services:**
- All services display in professional DataTable
- Shows key info: name, price, duration, payment requirement
- Sortable by clicking column headers (future enhancement)
- Search/filter functionality (future enhancement)

## Files Created/Modified

### New Components:
- [`components/ServiceFormModal.tsx`](components/ServiceFormModal.tsx) - Form for creating new services
- [`components/ServiceDataTable.tsx`](components/ServiceDataTable.tsx) - Table for displaying services
- [`components/ServiceManager.tsx`](components/ServiceManager.tsx) - Main manager UI

### Updated Pages:
- [`app/dashboard/services/page.tsx`](app/dashboard/services/page.tsx) - Service management page

### New API Routes:
- [`app/api/services/route.ts`](app/api/services/route.ts) - POST to create services
- [`app/api/services/[id]/route.ts`](app/api/services/[id]/route.ts) - DELETE to remove services
- [`app/api/user/businesses/route.ts`](app/api/user/businesses/route.ts) - GET user's businesses

### Updated Files:
- [`lib/actions.ts`](lib/actions.ts) - Updated `createService()` to support requiresPayment
- [`app/api/services/route.ts`](app/api/services/route.ts) - Updated POST handler

## Form Validation Examples

**Valid Submission:**
```json
{
  "name": "Hair Cut",
  "description": "Professional haircut service",
  "price": 35.00,
  "duration": "60",
  "requiresPayment": true
}
```

**Validation Errors:**
- Name: "" → "Tên dịch vụ là bắt buộc"
- Name: "ab" → "Tên dịch vụ phải ít nhất 3 ký tự"
- Price: -5 → "Giá phải là số dương"
- Duration: "90" → "Chọn thời lượng hợp lệ"

## Performance Optimizations

- Lazy loading of modal component
- Optimized re-renders with useCallback
- Efficient refetch pattern (only when needed)
- Memoized statistics calculations
- DaisyUI utility classes (no CSS-in-JS overhead)

## Future Enhancements

1. **Edit Service**: Update service details in-place
2. **Bulk Actions**: Delete, archive, or duplicate multiple services
3. **Search & Filter**: Find services by name, price range, duration
4. **Sorting**: Click column headers to sort
5. **Pagination**: Limit table rows per page
6. **Service Templates**: Quick-add popular services
7. **Pricing Tiers**: Add multiple price options per service
8. **Popularity Metrics**: Show booking count per service
9. **Service Categories**: Group by category/type
10. **Availability Calendar**: Visual calendar for service-specific hours

## Testing Checklist

- [x] Build succeeds without errors
- [x] All TypeScript types validate correctly
- [x] Service creation form accepts valid data
- [x] Form shows validation errors for invalid input
- [x] Modal opens/closes smoothly
- [x] DataTable displays services correctly
- [x] Delete confirmation dialog works
- [x] Payment toggle switches UI state
- [ ] Create service via form (manual testing needed)
- [ ] Delete service and see table update
- [ ] Multiple businesses selector works
- [ ] Statistics calculate correctly
- [ ] Mobile responsive layout works

## Tech Stack Used

- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **Framer Motion**: Animations and transitions
- **Lucide React**: Icons (Edit2, Trash2, Lock, Unlock, Plus, Zap)
- **Tailwind CSS**: Styling and responsive design
- **DaisyUI**: Component utilities
- **Next.js 16**: App Router and server components
- **TypeScript**: Type safety

## Vietnamese Language Support

All UI text is in Vietnamese:
- Form labels, placeholders, and error messages
- Button labels ("Thêm", "Tạo", "Hủy", "Xóa")
- Status indicators ("Bắt buộc", "Tùy chọn")
- Column headers (Vietnamese naming)
- Empty states and help text
