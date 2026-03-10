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

interface BookingConfirmationEmailProps {
  customerName: string
  customerEmail: string
  businessName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  bookingId: string
  businessAddress?: string
  businessPhone?: string
  businessLogo?: string
  price: number
  duration: number
}

export const BookingConfirmationEmail: React.FC<BookingConfirmationEmailProps> = ({
  customerName,
  businessName,
  serviceName,
  bookingDate,
  bookingTime,
  bookingId,
  businessAddress,
  businessPhone,
  businessLogo,
  price,
  duration,
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://booking.example.com'

  return (
    <Html>
      <Head />
      <Preview>Booking confirmation for {serviceName} at {businessName}</Preview>
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
            <Text style={heading}>✅ Booking Confirmed!</Text>
            <Text style={paragraph}>
              Hi {customerName},
            </Text>
            <Text style={paragraph}>
              Your booking at <strong>{businessName}</strong> has been confirmed. Here are your booking details:
            </Text>
          </Section>

          {/* Booking Details */}
          <Section style={box}>
            <Text style={sectionHeading}>Booking Details</Text>
            <Row>
              <Text style={labelText}>Booking ID:</Text>
              <Text style={valueText}>{bookingId}</Text>
            </Row>
            <Row>
              <Text style={labelText}>Service:</Text>
              <Text style={valueText}>{serviceName}</Text>
            </Row>
            <Row>
              <Text style={labelText}>Business:</Text>
              <Text style={valueText}>{businessName}</Text>
            </Row>
            <Row>
              <Text style={labelText}>Date:</Text>
              <Text style={valueText}>{bookingDate}</Text>
            </Row>
            <Row>
              <Text style={labelText}>Time:</Text>
              <Text style={valueText}>{bookingTime}</Text>
            </Row>
            <Row>
              <Text style={labelText}>Duration:</Text>
              <Text style={valueText}>{duration} minutes</Text>
            </Row>
            <Row>
              <Text style={{ ...labelText, fontWeight: 'bold' }}>Price:</Text>
              <Text style={{ ...valueText, fontWeight: 'bold', color: '#0066cc' }}>
                ${price.toFixed(2)}
              </Text>
            </Row>
          </Section>

          {/* Business Information */}
          {(businessAddress || businessPhone) && (
            <Section style={box}>
              <Text style={sectionHeading}>Business Information</Text>
              {businessAddress && (
                <>
                  <Text style={labelText}>Address:</Text>
                  <Text style={valueText}>{businessAddress}</Text>
                </>
              )}
              {businessPhone && (
                <>
                  <Text style={labelText}>Contact:</Text>
                  <Text style={valueText}>{businessPhone}</Text>
                </>
              )}
            </Section>
          )}

          <Hr style={{ borderColor: '#e0e0e0', margin: '20px 0' }} />

          {/* Important Notes */}
          <Section style={box}>
            <Text style={sectionHeading}>Important Notes</Text>
            <ul style={list}>
              <li>
                <Text style={paragraph}>
                  Please arrive 5-10 minutes before your appointment
                </Text>
              </li>
              <li>
                <Text style={paragraph}>
                  If you need to cancel or reschedule, please do so at least 24 hours in advance
                </Text>
              </li>
              <li>
                <Text style={paragraph}>
                  You can manage your booking from your dashboard
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
              This is an automated message from {businessName}. Please do not reply to this email.
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

export default BookingConfirmationEmail
