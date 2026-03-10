import React from 'react'
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface BookingCancelledEmailProps {
  customerName: string
  businessName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  bookingId: string
  cancellationReason?: string
  businessLogo?: string
}

export const BookingCancelledEmail: React.FC<BookingCancelledEmailProps> = ({
  customerName,
  businessName,
  serviceName,
  bookingDate,
  bookingTime,
  bookingId,
  cancellationReason,
  businessLogo,
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://booking.example.com'

  return (
    <Html>
      <Head />
      <Preview>Booking cancellation confirmation</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo Header */}
          {businessLogo && (
            <Section style={{ textAlign: 'center', paddingBottom: '20px' }}>
              <Img
                src={businessLogo}
                alt={businessName}
                style={{
                  width: '120px',
                  height: 'auto',
                  maxWidth: '100%',
                  borderRadius: '8px',
                }}
              />
            </Section>
          )}
          {/* Header */}
          <Section style={box}>
            <Text style={heading}>❌ Booking Cancelled</Text>
            <Text style={paragraph}>
              Hi {customerName},
            </Text>
            <Text style={paragraph}>
              Your booking at <strong>{businessName}</strong> has been cancelled. Here are the details:
            </Text>
          </Section>

          {/* Cancellation Details */}
          <Section style={box}>
            <Text style={sectionHeading}>Cancellation Details</Text>
            <section>
              <Text style={labelText}>Booking ID:</Text>
              <Text style={valueText}>{bookingId}</Text>
            </section>
            <section>
              <Text style={labelText}>Service:</Text>
              <Text style={valueText}>{serviceName}</Text>
            </section>
            <section>
              <Text style={labelText}>Business:</Text>
              <Text style={valueText}>{businessName}</Text>
            </section>
            <section>
              <Text style={labelText}>Original Date:</Text>
              <Text style={valueText}>{bookingDate} at {bookingTime}</Text>
            </section>
            {cancellationReason && (
              <>
                <section>
                  <Text style={labelText}>Reason:</Text>
                  <Text style={valueText}>{cancellationReason}</Text>
                </section>
              </>
            )}
          </Section>

          <Hr style={{ borderColor: '#e0e0e0', margin: '20px 0' }} />

          {/* Next Steps */}
          <Section style={box}>
            <Text style={sectionHeading}>What's Next?</Text>
            <ul style={list}>
              <li>
                <Text style={paragraph}>
                  If payment was made, a refund will be processed within 3-5 business days
                </Text>
              </li>
              <li>
                <Text style={paragraph}>
                  You can browse and book other services anytime
                </Text>
              </li>
              <li>
                <Text style={paragraph}>
                  If you have any questions, please contact the business
                </Text>
              </li>
            </ul>
          </Section>

          {/* CTA Button */}
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link
              href={`${appUrl}/dashboard`}
              style={button}
            >
              Go to Dashboard
            </Link>
          </Section>

          <Hr style={{ borderColor: '#e0e0e0', margin: '20px 0' }} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footer}>
              This is an automated message. Please do not reply to this email.
            </Text>
            <Text style={footer}>
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f4f4f4',
  fontFamily: '"Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '64px',
}

const box = {
  padding: '0 48px',
}

const heading = {
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '16px 0',
  color: '#000',
}

const sectionHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: '20px',
  marginBottom: '12px',
  color: '#333',
}

const paragraph = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#555',
  marginBottom: '12px',
}

const labelText = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#666',
  paddingRight: '12px',
  display: 'inline-block',
  minWidth: '120px',
}

const valueText = {
  fontSize: '14px',
  color: '#000',
  marginBottom: '8px',
}

const list = {
  paddingLeft: '20px',
  margin: '12px 0',
}

const button = {
  backgroundColor: '#0066cc',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  margin: '16px 0',
  cursor: 'pointer',
}

const footerSection = {
  padding: '20px 48px',
  textAlign: 'center' as const,
}

const footer = {
  fontSize: '12px',
  color: '#888',
  marginBottom: '8px',
  lineHeight: '1.5',
}

export default BookingCancelledEmail
