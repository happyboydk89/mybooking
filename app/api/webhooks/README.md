# Payment Webhook Handlers

This directory contains webhook handlers for payment gateway callbacks from ZaloPay, VNPay, and MoMo.

## Overview

```
app/api/webhooks/
├── zalopay/route.ts      # ZaloPay webhook (FULLY IMPLEMENTED)
├── vnpay/route.ts        # VNPay webhook (PARTIALLY IMPLEMENTED)
└── momo/route.ts         # MoMo webhook (PARTIALLY IMPLEMENTED)
```

## Webhook Flow

### Payment Lifecycle

```
1. Customer initiates booking → Creates Payment record (PENDING status)
2. Redirects to payment provider
3. Customer completes payment
4. Payment provider sends webhook callback
5. Webhook handler receives callback
6. Verifies signature (security check)
7. Updates Payment.status → SUCCESS/FAILED
8. Updates Booking.status → CONFIRMED (if payment SUCCESS)
9. Returns response to payment provider
```

## ZaloPay Webhook (✅ Fully Implemented)

### Endpoint
`POST /api/webhooks/zalopay`

### Features
- ✅ Signature verification (HMAC-SHA256 with Key2)
- ✅ Atomic transaction updates (payment + booking)
- ✅ Proper error handling and logging
- ✅ Idempotent webhook processing
- ✅ Returns ZaloPay-compliant response codes

### Request Format
```json
{
  "return_code": 1,
  "return_message": "Success",
  "data": "{\"app_id\":2553,\"app_trans_id\":\"255320260310001234\",\"status\":1,...}",
  "mac": "2b27d5f0e0..."
}
```

### Response Format
```json
{
  "return_code": 1,
  "return_message": "Webhook processed successfully"
}
```

### Configuration
```env
ZALOPAY_KEY2=your_zalopay_key2  # Used for signature verification
```

### Database Updates

#### If Payment SUCCESS (status = 1)
```typescript
Payment {
  status: 'SUCCESS'
  rawResponse: { ...webhook }
}
Booking {
  status: 'CONFIRMED'
  paymentStatus: 'SUCCESS'
}
```

#### If Payment FAILED (status ≠ 1)
```typescript
Payment {
  status: 'FAILED'
  rawResponse: { ...webhook }
}
Booking {
  paymentStatus: 'FAILED'
  // status remains PENDING
}
```

## VNPay Webhook (🔄 Partial Implementation)

### Endpoint
`POST /api/webhooks/vnpay`

### Features
- ✅ Basic structure and transaction handling
- 🔄 TODO: Implement MD5 signature verification
- 🔄 TODO: Full integration testing
- ✅ Query parameter parsing
- ✅ Atomic database updates

### Request Format
VNPay sends callback as URL query parameters:
```
POST /api/webhooks/vnpay?vnp_ResponseCode=00&vnp_TransactionNo=123456&vnp_SecureHash=abc123...
```

### Response Format
```json
{
  "RspCode": "00",
  "Message": "Success"
}
```

### Implementation Checklist
- [ ] Import VNPay secret key from environment
- [ ] Implement MD5 signature verification
- [ ] Test with VNPay sandbox
- [ ] Handle duplicate webhooks (idempotency)

## MoMo Webhook (🔄 Partial Implementation)

### Endpoint
`POST /api/webhooks/momo`

### Features
- ✅ Basic structure and transaction handling
- 🔄 TODO: Implement HMAC-SHA256 verification
- 🔄 TODO: RSA encryption support
- ✅ Extra data parsing (base64 JSON)
- ✅ Atomic database updates

### Request Format
```json
{
  "partnerCode": "MOMO",
  "orderId": "booking-123",
  "requestId": "1234567890",
  "amount": 500000,
  "orderInfo": "Payment for booking",
  "orderType": "momo_wallet",
  "transId": "2104277341",
  "resultCode": 0,
  "message": "Successful",
  "payType": "wallet",
  "responseTime": 1604277341,
  "extraData": "base64_encoded_json",
  "signature": "abc123..."
}
```

### Response Format
```json
{
  "status": 0,
  "message": "success"
}
```

### Extra Data Format
MoMo sends additional metadata in `extraData` (base64 encoded JSON):
```json
{
  "booking_id": "booking-123",
  "customer_id": "user-456"
}
```

### Implementation Checklist
- [ ] Import MoMo merchant credentials from environment
- [ ] Implement HMAC-SHA256 signature verification
- [ ] Handle RSA encryption if needed
- [ ] Test with MoMo sandbox
- [ ] Validate extra data parsing

## Security Considerations

### Signature Verification
✅ **CRITICAL**: All webhooks verify signatures before processing. Never process a webhook without verifying the sender.

```typescript
// ZaloPay verification process
const data = JSON.parse(webhookPayload.data)
const isValid = verifyZaloPayCallback(data, signature)
if (!isValid) {
  console.warn('Invalid signature')
  return NextResponse.json({ return_code: 0 })
}
```

### Webhook Secret Keys
- Never commit `.env` files with real secret keys
- Use environment variables for all sensitive data
- Rotate keys periodically
- Log all webhook processing for audit trails

### Idempotency
Webhooks may be retried if a timeout occurs. Handlers are idempotent:
- Check if payment already exists before updating
- Use unique constraints on `transactionId` to prevent duplicates
- Return success even if payment already processed

## Testing Webhooks Locally

### Option 1: Use ngrok
```bash
# Start your Next.js dev server
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Register ngrok URL in payment provider dashboard
# https://xxxxxxx.ngrok.io/api/webhooks/zalopay
```

### Option 2: Use Webhook Testing Tool
- **ZaloPay**: Use sandbox dashboard to trigger test webhooks
- **VNPay**: Use VNPay sandbox to manually trigger webhook
- **MoMo**: Use MoMo developer portal test tools

### Option 3: cURL
```bash
curl -X POST http://localhost:3000/api/webhooks/zalopay \
  -H "Content-Type: application/json" \
  -d '{
    "return_code": 1,
    "data": "{\"app_id\":2553,...}",
    "mac": "abc123..."
  }'
```

## Database Schema

### Payment Model
```prisma
model Payment {
  id            String          @id
  bookingId     String          @unique       // Foreign key to Booking
  provider      PaymentProvider               // ZALOPAY, VNPAY, MOMO
  transactionId String          @unique       // External transaction ID
  amount        Float
  status        PaymentStatus   @default(PENDING) // PENDING, SUCCESS, FAILED
  rawResponse   Json?           // Complete webhook response
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}
```

### Booking Model (Payment Fields)
```prisma
model Booking {
  ...
  status        BookingStatus   @default(PENDING)    // PENDING, CONFIRMED, CANCELLED
  paymentStatus PaymentStatus   @default(PENDING)    // PENDING, SUCCESS, FAILED, CANCELLED
  payment       Payment?        // One-to-one relation
  ...
}
```

### Payment Status Values
- `PENDING` - Payment created, awaiting customer action
- `SUCCESS` - Payment completed successfully
- `FAILED` - Payment failed or rejected
- `CANCELLED` - Payment cancelled by customer or admin

## Common Issues & Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid signature" | Wrong secret key or corrupted data | Verify correct `ZALOPAY_KEY2` in `.env` |
| "Payment not found" | Transaction ID mismatch | Check if Payment was created before webhook |
| "Database transaction failed" | Concurrent updates or constraints | Implement retry logic with exponential backoff |
| Webhook not triggered | URL not registered in provider | Update Payment Provider settings with correct webhook URL |
| "Unauthorized" error | Missing API authentication | Ensure webhook endpoint is public (no auth middleware) |

## Monitoring & Logging

All webhooks log important events:

```typescript
console.log(`Processing ZaloPay webhook: transaction=${transactionId}, status=${paymentStatus}`)
console.log(`Booking confirmed: ${payment.booking.id}`)
console.error(`Database error processing webhook:`, dbError)
```

Check logs with:
```bash
# Development
npm run dev   # Check terminal output

# Production
# Use your hosting provider's log viewer (Vercel, AWS, etc.)
```

## Next Steps

1. **Implement VNPay webhook signature verification**
   - Create `lib/payments/vnpay-verify.ts`
   - Implement MD5 hash verification
   - Add comprehensive error handling

2. **Implement MoMo webhook signature verification**
   - Create `lib/payments/momo-verify.ts`
   - Implement HMAC-SHA256 verification
   - Handle RSA encryption if required

3. **Add webhook retry logic**
   - Implement exponential backoff
   - Store failed webhooks for manual processing
   - Add monitoring/alerting

4. **Create webhook testing utilities**
   - Mock webhook generators for testing
   - Integration tests for each provider
   - E2E test scenarios

5. **Deploy and configure**
   - Register webhook URLs in each provider's dashboard
   - Configure environment variables in production
   - Set up monitoring/alerting
