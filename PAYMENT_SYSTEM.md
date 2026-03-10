# Payment System Documentation

## Overview

The payment system supports multiple Vietnamese payment gateways:
- **ZaloPay** ✅ Fully Implemented
- **VNPay** (Stub, ready for implementation)
- **MoMo** (Stub, ready for implementation)

## Architecture

```
lib/payments/
├── index.ts          # Central export hub
├── zalopay.ts        # ZaloPay integration (IMPLEMENTED)
├── vnpay.ts          # VNPay integration (TODO)
└── momo.ts           # MoMo integration (TODO)
```

### Payment Flow

1. **Order Creation** → Payment provider creates order → Returns payment URL
2. **Customer Redirect** → Customer redirected to payment gateway
3. **Payment Processing** → Customer completes payment
4. **Callback Webhook** → Payment provider sends confirmation
5. **Order Confirmation** → System updates booking status to CONFIRMED

```
┌─────────────┐
│   Booking   │
│   Created   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Create Payment   │
│ Order w/Gateway  │
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ Return Payment URL   │
│ (Redirect Customer)  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────┐
│  Register Webhook│
│   Callback       │
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ Payment Complete     │
│ Verify Signature     │
│ Update Booking       │
└──────────────────────┘
```

## ZaloPay Implementation

### Features Implemented

✅ Signature generation (HMAC-SHA256)
✅ Order creation with unique transaction ID
✅ Callback verification
✅ Proper error handling
✅ Environment variable configuration
✅ Type-safe TypeScript implementation
✅ Detailed code comments

### Setup Instructions

#### 1. Get ZaloPay Credentials

1. Sign up at [ZaloPay Sandbox](https://sandbox.zalopay.com.vn/)
2. Navigate to Merchant Dashboard
3. Find your credentials:
   - App ID
   - Key 1 (for creating orders)
   - Key 2 (for webhook verification)

#### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
ZALOPAY_APP_ID=2553
ZALOPAY_KEY1=Uat67I5NWnvyY0FIzBaygk8V3EUg992o
ZALOPAY_KEY2=eadqn8MkUmRHsSHf1Y3vXQ8rZPI154S4
ZALOPAY_ENDPOINT=https://sandbox.zalopay.com.vn/v001/tpe/
```

#### 3. Create Payment API Endpoint

Create `app/api/payments/create/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createZaloPayOrder } from '@/lib/payments'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, paymentProvider } = await request.json()

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, service: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Create payment based on provider
    if (paymentProvider === 'ZALOPAY') {
      const result = await createZaloPayOrder(
        {
          id: booking.id,
          userId: booking.userId,
          serviceId: booking.serviceId,
          amount: booking.service.price,
          date: booking.date.toISOString(),
          timeSlot: booking.timeSlot || '',
        },
        {
          id: booking.user.id,
          email: booking.user.email,
          name: booking.user.name || '',
          phone: booking.user.phone,
        }
      )

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      // Save payment record
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: 'ZALOPAY',
          transactionId: result.transactionId || '',
          amount: booking.service.price,
          status: 'PENDING',
        },
      })

      // Update booking payment status
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'PENDING' },
      })

      return NextResponse.json({
        success: true,
        paymentUrl: result.paymentUrl,
        bookingId,
      })
    }

    return NextResponse.json(
      { error: 'Payment provider not supported' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
```

#### 4. Create Webhook Handler

Create `app/api/payments/callback/zalopay/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { verifyZaloPayCallback } from '@/lib/payments'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Verify signature
    if (!verifyZaloPayCallback(data.data, data.mac)) {
      console.warn('Invalid ZaloPay signature')
      return NextResponse.json({ return_code: 0 })
    }

    // Parse callback data
    const callbackData = JSON.parse(data.data)

    // Find payment
    const payment = await prisma.payment.findUnique({
      where: { transactionId: callbackData.app_trans_id },
      include: { booking: true },
    })

    if (!payment) {
      console.warn('Payment not found:', callbackData.app_trans_id)
      return NextResponse.json({ return_code: 0 })
    }

    // Check if payment successful
    if (callbackData.status === 1) {
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          rawResponse: data,
        },
      })

      // Update booking payment status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'SUCCESS' },
      })

      return NextResponse.json({ return_code: 1 })
    }

    // Payment failed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        rawResponse: data,
      },
    })

    return NextResponse.json({ return_code: 0 })
  } catch (error) {
    console.error('ZaloPay callback error:', error)
    return NextResponse.json({ return_code: 0 })
  }
}
```

## API Reference

### createZaloPayOrder

```typescript
async function createZaloPayOrder(
  booking: BookingInfo,
  user: UserInfo
): Promise<PaymentResult>
```

**Parameters:**
- `booking`: Booking details (id, userId, serviceId, amount, date, timeSlot)
- `user`: User details (id, email, name, phone)

**Returns:**
```typescript
{
  success: boolean
  paymentUrl?: string      // URL to redirect customer
  transactionId?: string   // Unique transaction ID
  error?: string          // Error message if failed
}
```

### verifyZaloPayCallback

```typescript
function verifyZaloPayCallback(
  data: Record<string, any>,
  signature: string
): boolean
```

Verifies webhook signature using HMAC-SHA256 with Key2.

## Best Practices

### Security

1. **Never hardcode credentials** - Always use environment variables
2. **Verify signatures** - Always verify callback signatures to ensure authenticity
3. **Use HTTPS** - Only use HTTPS URLs in production
4. **Secure webhook endpoints** - Validate API keys for webhook calls
5. **Data validation** - Validate all user input before processing

### Implementation

1. **Error handling** - Always handle payment failures gracefully
2. **Idempotency** - Webhook handlers should be idempotent (safe to call multiple times)
3. **Logging** - Log all payment transactions for audit trails
4. **Atomic updates** - Use transactions for payment status updates
5. **Timeout handling** - Implement retry logic for failed requests

## Testing

### Sandbox Mode

ZaloPay sandboxes are configured by default. To test:

1. Use test merchant credentials from dashboard
2. Use sandbox payment cards (ZaloPay provides test cards)
3. Check transaction status in sandbox dashboard

### Test Card Numbers

ZaloPay provides test cards through their dashboard.

## Environment Variables

```
ZALOPAY_APP_ID           # Merchant App ID
ZALOPAY_KEY1             # Key for order creation
ZALOPAY_KEY2             # Key for callback verification
ZALOPAY_ENDPOINT         # API endpoint (sandbox/production)
APP_URL                  # Your application URL
PAYMENT_CALLBACK_URL     # Webhook callback URL
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing ZaloPay configuration" | Check all required env vars are set |
| Invalid signature on callback | Verify Key2 is correct and callback data matches |
| Payment order creation fails | Check merchant credentials and amount value |
| Transaction ID conflicts | Ensure unique timestamp/random generation |

## Future Implementations

### VNPay
- [ ] Secure hash signature generation
- [ ] Order URL creation
- [ ] Callback verification
- [ ] Response handling

### MoMo
- [ ] RSA encryption for sensitive data
- [ ] Order creation via API
- [ ] Callback verification
- [ ] Response handling

## References

- [ZaloPay Developer Docs](https://developers.zalopay.vn/)
- [VNPay Documentation](https://sandbox.vnpayment.vn/)
- [MoMo Developer Portal](https://developers.momo.vn/)
