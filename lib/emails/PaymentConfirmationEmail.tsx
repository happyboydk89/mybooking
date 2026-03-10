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
  Row,
  Section,
  Text,
} from '@react-email/components'

interface PaymentConfirmationEmailProps {
  customerName: string
  businessName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  bookingId: string
  amount: number
  transactionId: string
  paymentDate: string
  paymentProvider: string
  businessLogo?: string
}

export const PaymentConfirmationEmail: React.FC<PaymentConfirmationEmailProps> = ({
  customerName,
  businessName,
  serviceName,
  bookingDate,
  bookingTime,
  bookingId,
  amount,
  transactionId,
  paymentDate,
  paymentProvider,
  businessLogo,
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://booking.example.com'

  return (
    <Html>
      <Head />
      <Preview>Payment receipt for your booking at {businessName}</Preview>
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
            <Text style={heading}>💳 Payment Confirmed</Text>
            <Text style={paragraph}>
              Hi {customerName},
            </Text>
            <Text style={paragraph}>
              Your payment for the booking at <strong>{businessName}</strong> has been successfully processed. Below is your receipt:
            </Text>
          </Section>

          {/* Payment Details */}
          <Section style={box}>
            <Text style={sectionHeading}>Payment Receipt</Text>
            <Row>
              <Text style={labelText}>Booking ID:</Text>
              <Text style={valueText}>{bookingId}</Text>
            </Row>
            <Row>
              <Text style={labelText}>Service:</Text>
              <Text style={valueText}>{serviceName}</Text>
            </Row>
            <Row>
              <Text style={labelText}>Booking Date:</Text>
              <Text style={valueText}>{bookingDate} at {bookingTime}</Text>
            </Row>
            <Row>
              <Text style={labelText}>Payment Date:</Text>
              <Text style={valueText}>{paymentDate}</Text>
            </Row>
            <Row>
              <Text style={labelText}>Payment Method:</Text>
              <Text style={valueText}>{paymentProvider}</Text>
            </Row>
            <Row>
              <Text style={labelText}>Transaction ID:</Text>
              <Text style={{ ...valueText, fontFamily: 'monospace', fontSize: '12px' }}>
                {transactionId}
              </Text>
            </Row>
          </Section>

          {/* Amount */}
          <Section style={{ ...box, backgroundColor: '#f9f9f9', borderRadius: '6px', padding: '16px', textAlign: 'center', marginTop: '20px' }}>
            <Text style={sectionHeading}>Amount Paid</Text>
            <Text style={{ fontSize: '36px', fontWeight: 'bold', color: '#0066cc', margin: '10px 0' }}>
              ${amount.toFixed(2)}
            </Text>
          </Section>

          <Hr style={{ borderColor: '#e0e0e0', margin: '20px 0' }} />

          {/* Important Information */}
          <Section style={box}>
            <Text style={sectionHeading}>What's Next?</Text>
            <ul style={list}>
              <li>
                <Text style={paragraph}>
                  Your booking has been confirmed and is ready
                </Text>
              </li>
              <li>
                <Text style={paragraph}>
                  You will receive a reminder email 24 hours before your appointment
                </Text>
              </li>
              <li>
                <Text style={paragraph}>
                  If you need to cancel or reschedule, please contact the business directly
                </Text>
              </li>
            </ul>
          </Section>

          {/* CTA Button */}
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link
              href={`${appUrl}/dashboard/customer/bookings/${bookingId}`}
              style={button}
            >
              View Your Booking
            </Link>
          </Section>

          <Hr style={{ borderColor: '#e0e0e0', margin: '20px 0' }} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footer}>
              This payment receipt is for your records. Please keep it in a safe place.
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

export default PaymentConfirmationEmail
