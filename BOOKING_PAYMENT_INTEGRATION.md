# Booking Payment Integration Guide

## Overview

The booking system now supports online payments for services. Services can be marked as `requiresPayment = true` to enable payment processing through ZaloPay, VNPay, or MoMo.

## Updated Architecture

### Database Schema Changes

#### Service Model
```prisma
model Service {
  ...
  requiresPayment Boolean  @default(false)  // Toggle payment requirement
  ...
}
```

#### Booking Model
```prisma
model Booking {
  ...
  paymentStatus PaymentStatus @default(PENDING)  // PENDING, SUCCESS, FAILED, CANCELLED
  payment Payment?                               // One-to-one relation
  ...
}
```

#### New Payment Model
```prisma
model Payment {
  id            String          @id @default(cuid())
  bookingId     String          @unique
  booking       Booking         @relation(...)
  provider      PaymentProvider  // ZALOPAY, VNPAY, MOMO
  transactionId String          @unique
  amount        Float
  status        PaymentStatus   @default(PENDING)
  rawResponse   Json?
  updatedAt     DateTime        @updatedAt
}
```

## Booking Flow with Payments

### Step-by-Step Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Booking Flow with Payments                     │
└──────────────────────────────────────────────────────────────────────┘

1. SERVICE SELECTION
   ↓
2. DATE SELECTION
   ↓
3. TIME SELECTION
   ↓
4. CONFIRMATION PAGE
   │
   ├─→ Service has requiresPayment = false
   │   └─→ Show "Confirm Booking" button
   │       └─→ Create booking immediately
   │           └─→ Redirect to dashboard
   │
   └─→ Service has requiresPayment = true
       └─→ Show "💳 Pay Now" button
           └─→ Click initiates payment flow
               ├─→ 1. Create booking (status: PENDING, paymentStatus: PENDING)
               ├─→ 2. Create payment record (status: PENDING)
               ├─→ 3. Call payment provider API (ZaloPay)
               ├─→ 4. Redirect customer to payment gateway
               │
               └─→ Customer completes payment
                   ├─→ SUCCESS: 
                   │   ├─→ Payment sends webhook callback
                   │   ├─→ Update Payment.status = SUCCESS
                   │   ├─→ Update Booking.status = CONFIRMED
                   │   └─→ Redirect to result page (/payments/result)
                   │
                   └─→ FAILED:
                       ├─→ Payment sends webhook callback
                       ├─→ Update Payment.status = FAILED
                       ├─→ Keep Booking.status = PENDING
                       └─→ Redirect to result page with error
```

## Component Updates

### BookingClient.tsx

Enhanced with payment support:

```typescript
interface Service {
  ...
  requiresPayment?: boolean  // NEW FIELD
}

// NEW STATE
const [paymentStatus, setPaymentStatus] = useState<
  'pending' | 'processing' | 'success' | 'failed' | null
>(null)
const [bookingId, setBookingId] = useState<string | null>(null)

// NEW FUNCTION: Initialize payment
const handleInitiatePayment = async (bookingId: string) => {
  // Calls /api/payments/create endpoint
  // Redirects to payment gateway
}
```

**UI Changes:**
- ✅ Shows payment badge if `service.requiresPayment = true`
- ✅ "Pay Now" button (instead of "Confirm Booking")
- ✅ Status indicators (processing, success, failed)
- ✅ Animated alerts for payment states

## Server Actions

### createBookingWithPayment()

New server action for booking with payment creation:

```typescript
export async function createBookingWithPayment(
  userId: string,
  businessId: string,
  serviceId: string,
  date: Date,
  timeSlot: string,
  paymentProvider: 'ZALOPAY' | 'VNPAY' | 'MOMO' = 'ZALOPAY'
)
```

**Returns:**
```typescript
{
  success: boolean
  booking: Booking
  payment?: Payment           // Only if requiresPayment = true
  requiresPayment: boolean
  transactionId?: string
  error?: string
}
```

**Process:**
1. Validates service and user
2. Prevents provider self-booking
3. Creates booking with `paymentStatus: PENDING`
4. Creates payment record if `service.requiresPayment = true`
5. Returns booking + payment info

## API Endpoints

### POST /api/payments/create

Creates a payment order with the payment provider.

**Request:**
```json
{
  "bookingId": "booking-123",
  "paymentProvider": "ZALOPAY"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.zalopay.com.vn/...",
  "transactionId": "255320260310001234",
  "bookingId": "booking-123"
}
```

**Process:**
1. Verifies booking belongs to authenticated user
2. Checks if service requires payment
3. Calls payment provider SDK
4. Updates payment record with transaction ID
5. Returns payment URL for redirect

### GET /api/payments/status?bookingId=...

Checks payment status for a booking.

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "booking-123",
    "status": "CONFIRMED",
    "paymentStatus": "SUCCESS",
    "service": { "name": "...", "price": 500000 },
    "date": "2026-03-15T00:00:00.000Z",
    "timeSlot": "14:00",
    "payment": {
      "status": "SUCCESS",
      "transactionId": "255320260310001234",
      "provider": "ZALOPAY"
    }
  }
}
```

## Webhook Processing

### Payment Success Flow

```
ZaloPay webhook received
    ↓
verifyZaloPayCallback() ← Signature verification
    ↓
Find Payment by transactionId
    ↓
Atomic transaction:
  ├─ Update Payment.status = SUCCESS
  ├─ Update Booking.status = CONFIRMED
  ├─ Update Booking.paymentStatus = SUCCESS
    ↓
Return { return_code: 1 }
```

### Payment Failure Flow

```
ZaloPay webhook received
    ↓
verifyZaloPayCallback() ← Signature verification
    ↓
Find Payment by transactionId
    ↓
Atomic transaction:
  ├─ Update Payment.status = FAILED
  ├─ Keep Booking.status = PENDING
  ├─ Update Booking.paymentStatus = FAILED
    ↓
Return { return_code: 1 }
```

## Pages

### /app/payments/result/page.tsx

Payment result page shown after returning from payment gateway.

**Features:**
- ✅ Automatic status checking
- ✅ Success: Green alert with confirmation message
- ✅ Failed: Red alert with retry option
- ✅ Shows booking details and transaction ID
- ✅ Links to dashboard or retry payment

**Query Parameters:**
- `?bookingId=booking-123` - Booking to check

## Usage Example

### 1. Mark Service as Requiring Payment

**Database seeding or admin panel:**
```typescript
await prisma.service.update({
  where: { id: 'service-123' },
  data: { requiresPayment: true }
})
```

### 2. Customer Books Service

1. Browse and select service (marked with payment badge)
2. Select date and time
3. See confirmation summary
4. Click "💳 Pay Now" button
5. Redirected to ZaloPay payment gateway
6. Complete payment
7. Redirected to `/payments/result?bookingId=...`
8. See success/failure status

### 3. Verify Booking Status

```typescript
const { booking, payment } = await getBookingDetails('booking-123')

if (booking.status === 'CONFIRMED' && payment?.status === 'SUCCESS') {
  // Payment successful - show confirmation
}
```

## Environment Configuration

Add to `.env.local`:

```env
# ZaloPay (for payment processing)
ZALOPAY_APP_ID=2553
ZALOPAY_KEY1=Uat67I5NWnvyY0FIzBaygk8V3EUg992o
ZALOPAY_KEY2=eadqn8MkUmRHsSHf1Y3vXQ8rZPI154S4
ZALOPAY_ENDPOINT=https://sandbox.zalopay.com.vn/v001/tpe/

# Application URLs
APP_URL=http://localhost:3000
PAYMENT_CALLBACK_URL=http://localhost:3000/api/webhooks/zalopay
```

## Testing Payments

### Local Testing with Webhook

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Use ngrok to expose local server:
   ```bash
   ngrok http 3000
   ```

3. Update ZaloPay dashboard webhook URL to:
   ```
   https://your-ngrok-id.ngrok.io/api/webhooks/zalopay
   ```

4. Create test booking with payment
5. Complete payment in ZaloPay sandbox
6. Webhook automatically updates booking status

### Manual Webhook Testing

```bash
curl -X POST http://localhost:3000/api/webhooks/zalopay \
  -H "Content-Type: application/json" \
  -d '{
    "return_code": 1,
    "return_message": "Success",
    "data": "{\"status\":1,...}",
    "mac": "signature123"
  }'
```

## Error Handling

| Error | Cause | Action |
|-------|-------|--------|
| "Service not found" | Invalid service ID | Check service exists |
| "Providers cannot book..." | Provider booking own service | Validate user role |
| "Payment creation failed" | API error from provider | Retry or show error |
| "Invalid signature" | Tampered webhook | Log and reject |
| "Payment not found" | Transaction ID mismatch | Check payment creation |

## Future Enhancements

### Short Term
- [ ] Implement VNPay integration (stub ready)
- [ ] Implement MoMo integration (stub ready)
- [ ] Add payment method selection UI
- [ ] Email notifications for payment status

### Medium Term
- [ ] Refund processing
- [ ] Partial payments
- [ ] Payment history dashboard
- [ ] Invoice generation

### Long Term
- [ ] Subscription bookings with recurring payments
- [ ] Commission management for providers
- [ ] Multi-currency support
- [ ] Payment reconciliation reports

## Security Checklist

- ✅ Signature verification on all webhooks
- ✅ Transaction atomicity (both updates or neither)
- ✅ User authorization checks
- ✅ Idempotent webhook processing
- ✅ Secure credential storage (env vars)
- ✅ Provider self-booking prevention
- ✅ HTTPS only in production
- ✅ Audit logging for all payments

## References

- [ZaloPay Integration Guide](PAYMENT_SYSTEM.md)
- [Webhook Documentation](app/api/webhooks/README.md)
- [Payment Module](lib/payments/)
- [BookingClient Component](components/BookingClient.tsx)
