# Resend Email Integration Guide

## Overview

This application uses **Resend** for transactional email delivery. Resend is a modern email API built for developers with excellent deliverability and developer experience.

## Features

✅ **Booking Confirmation Emails** - Professional booking details with confirmation
✅ **Payment Receipt Emails** - Transaction details and payment information
✅ **Booking Cancellation Emails** - Cancellation confirmation with refund info
✅ **React Email Templates** - Beautiful, responsive email templates
✅ **Automatic Webhook Integration** - Emails sent automatically on payment success
✅ **Production-Ready** - Proper error handling, logging, and type safety

## Installation & Setup

### 1. Install Dependencies

Already installed with:
```bash
npm install resend react-email @react-email/components @react-email/render
```

### 2. Create Resend Account

1. Sign up at https://resend.com
2. Create a new project
3. Verify your domain (or use provided domain)
4. Get your API key

### 3. Configure Environment Variables

Add to `.env.local`:

```
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:**
- `RESEND_API_KEY` - Your API key from Resend dashboard
- `RESEND_FROM_EMAIL` - Must match verified domain in Resend
- `NEXT_PUBLIC_APP_URL` - Used in email links (make it public for production)

## Project Structure

```
lib/
├── email.ts                          # Main email service
├── emails/
│   ├── BookingConfirmationEmail.tsx  # Booking confirmation template
│   ├── PaymentConfirmationEmail.tsx  # Payment receipt template
│   └── BookingCancelledEmail.tsx     # Cancellation notice template
```

## API Reference

### sendBookingConfirmationEmail()

Sends booking confirmation email to customer.

```typescript
import { sendBookingConfirmationEmail } from '@/lib/email'

const result = await sendBookingConfirmationEmail({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  businessName: 'Hair Salon ABC',
  serviceName: 'Haircut & Styling',
  bookingDate: 'March 15, 2026',
  bookingTime: '14:00',
  bookingId: 'booking-123',
  businessAddress: '123 Main St, City',
  businessPhone: '+1-555-1234',
  price: 45.00,
  duration: 45,
})

if (result.success) {
  console.log('Email sent:', result.messageId)
} else {
  console.error('Email failed:', result.error)
}
```

### sendPaymentConfirmationEmail()

Sends payment receipt email to customer.

```typescript
import { sendPaymentConfirmationEmail } from '@/lib/email'

const result = await sendPaymentConfirmationEmail({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  businessName: 'Hair Salon ABC',
  serviceName: 'Haircut & Styling',
  bookingDate: 'March 15, 2026',
  bookingTime: '14:00',
  bookingId: 'booking-123',
  amount: 45.00,
  transactionId: '255320260310001234',
  paymentDate: 'March 10, 2026',
  paymentProvider: 'ZALOPAY',
})

if (!result.success) {
  console.error('Email failed:', result.error)
}
```

### sendBookingCancelledEmail()

Sends booking cancellation email.

```typescript
import { sendBookingCancelledEmail } from '@/lib/email'

const result = await sendBookingCancelledEmail({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  businessName: 'Hair Salon ABC',
  serviceName: 'Haircut & Styling',
  bookingDate: 'March 15, 2026',
  bookingTime: '14:00',
  bookingId: 'booking-123',
  cancellationReason: 'Customer requested cancellation',
})
```

### sendBatchEmails()

Sends multiple emails at once (useful for notifications).

```typescript
import { sendBatchEmails } from '@/lib/email'

const result = await sendBatchEmails({
  emails: [
    {
      to: 'user1@example.com',
      subject: 'New Service Available',
      html: '<h1>Check out our new services</h1>',
    },
    {
      to: 'user2@example.com',
      subject: 'New Service Available',
      html: '<h1>Check out our new services</h1>',
    },
  ],
})

console.log(result.results) // Array with email status for each recipient
```

## Email Templates

### Using React Email Components

All templates use React Email components for maximum compatibility:

```tsx
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Section,
  Text,
} from '@react-email/components'

export const MyEmail = () => (
  <Html>
    <Head />
    <Body>
      <Container>
        <Text>Hello World</Text>
      </Container>
    </Body>
  </Html>
)
```

### Template Customization

To modify templates:

1. Edit `lib/emails/*.tsx` files
2. Update component props and content
3. Styles are defined at bottom of each file
4. Re-render happens automatically on function call

### Adding New Templates

1. Create new file in `lib/emails/MyTemplate.tsx`:

```typescript
import React from 'react'
import { Body, Container, Html } from '@react-email/components'

interface MyTemplateProps {
  // Your props here
}

export const MyTemplate: React.FC<MyTemplateProps> = (props) => (
  <Html>
    {/* Template content */}
  </Html>
)
```

2. Add function in `lib/email.ts`:

```typescript
export async function sendMyEmail(
  params: SendMyEmailParams
): Promise<{ success: boolean; error?: string }> {
  const html = await render(MyTemplate(params))
  // Send email...
}
```

## Workflow Integration

### Automatic Email on Payment Success

When a payment is confirmed via webhook:

```
Payment Success → Webhook Received
    ↓
Signature Verified
    ↓
Update Database
    ↓
Send Payment Confirmation Email
    ↓
Send Booking Confirmation Email
    ↓
Return Success Response
```

### Manual Email Sending

```typescript
// In your application code
const result = await sendBookingConfirmationEmail({
  customerName: user.name,
  customerEmail: user.email,
  businessName: booking.business.name,
  serviceName: booking.service.name,
  bookingDate: booking.date.toLocaleDateString(),
  bookingTime: booking.timeSlot,
  bookingId: booking.id,
  price: booking.service.price,
  duration: booking.service.duration,
})

if (!result.success) {
  console.error(`Failed to send email: ${result.error}`)
}
```

## Testing Emails

### Method 1: Resend Dashboard

1. Go to https://resend.com/dashboard
2. View "Emails" section
3. See all sent emails with delivery status

### Method 2: Console Logging

All email functions log to console:

```
Booking confirmation email sent to john@example.com
```

### Method 3: Test Email

Resend provides a test email:

```typescript
const result = await sendBookingConfirmationEmail({
  customerEmail: 'delivered@resend.dev', // Test email
  // ... other params
})
```

### Method 4: Email Preview

Use Resend's email preview feature:

```bash
npx resend preview
```

## Production Configuration

### 1. Set Up Custom Domain

In Resend Dashboard:
1. Go to Domains
2. Add your domain
3. Verify with DNS records
4. Update `RESEND_FROM_EMAIL`

### 2. Update Environment Variables

```
RESEND_API_KEY=re_live_xxxxxxxxxxxx  # Production key
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Monitor Deliverability

Resend Dashboard shows:
- Delivery rates
- Bounce rates
- Spam reports
- Click-through rates

### 4. Set Up Reply-To Address

Update in `lib/email.ts`:

```typescript
const response = await resend.emails.send({
  from: fromEmail,
  to: customerEmail,
  subject: 'Your Subject',
  html,
  replyTo: 'support@yourdomain.com', // ← Update this
})
```

## Error Handling

### Check for Missing Credentials

```typescript
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not configured')
}
```

### Retry Logic

For failed emails, implement retry:

```typescript
async function sendEmailWithRetry(
  params: SendBookingConfirmationParams,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await sendBookingConfirmationEmail(params)
    if (result.success) return result
    
    // Exponential backoff
    await new Promise(resolve => 
      setTimeout(resolve, Math.pow(2, i) * 1000)
    )
  }
}
```

### Monitoring & Alerting

```typescript
const result = await sendBookingConfirmationEmail(params)

if (!result.success) {
  // Log to monitoring service
  logger.error('Email send failed', {
    error: result.error,
    customerEmail: params.customerEmail,
    bookingId: params.bookingId,
  })
  
  // Alert admin
  await alertAdmin(`Email delivery failure: ${result.error}`)
}
```

## Best Practices

### Security

1. ✅ Never hardcode API keys - use environment variables
2. ✅ Validate email addresses before sending
3. ✅ Use secure Email from address
4. ✅ Don't include sensitive data in subject line
5. ✅ Use reply-to address for support

### Deliverability

1. ✅ Keep authentication current (SPF, DKIM, DMARC)
2. ✅ Monitor bounce and complaint rates
3. ✅ Use double opt-in for newsletters
4. ✅ Provide unsubscribe option
5. ✅ Segment email lists by type

### Performance

1. ✅ Send emails asynchronously (don't await)
2. ✅ Batch emails when possible
3. ✅ Use queue system for high volume
4. ✅ Cache rendered templates
5. ✅ Monitor API rate limits

### Content

1. ✅ Use clear, professional templates
2. ✅ Include booking reference numbers
3. ✅ Add clear call-to-action buttons
4. ✅ Provide customer support contact
5. ✅ Test on multiple email clients

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "API key not configured" | Missing RESEND_API_KEY | Add to `.env.local` |
| "Invalid from address" | Domain not verified | Verify domain in Resend |
| Emails not received | Domain reputation | Check spam folder, increase domain age |
| Rate limit exceeded | Too many API calls | Implement queue/batch system |
| Invalid template rendering | React component error | Check template syntax |

## Monitoring

### Email Delivery Metrics

Monitor these metrics in Resend:

- **Delivered**: Successfully delivered
- **Bounced**: Invalid email address
- **Complained**: Marked as spam
- **Delivery Rate**: Should be > 95%
- **Bounce Rate**: Should be < 5%

### Log Queries

Check logs in production:

```typescript
// Log sent emails
console.log(`Email sent: ${result.messageId} to ${customerEmail}`)

// Log failures
console.error(`Email failed: ${result.error}`)
```

## Cost

Resend pricing:
- **Free**: 100 emails/day
- **Paid**: $0.0005 per email (pay as you go)

See https://resend.com/pricing for details.

## References

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/)
- [Email Best Practices](https://resend.com/blog/email-best-practices)
- [SPF/DKIM/DMARC Setup](https://resend.com/docs/dashboard/domains)

## Next Steps

1. ✅ Set up Resend account
2. ✅ Verify domain
3. ✅ Add API credentials to `.env.local`
4. ✅ Test with sample booking
5. ✅ Monitor delivery in console
6. ✅ Configure reply-to address
7. ✅ Set up monitoring/alerting
8. ✅ Go live with production settings
