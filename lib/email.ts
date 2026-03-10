/**
 * Email Service Module
 *
 * Handles all email communications using Resend
 * All functions are production-ready with proper error handling and logging
 */

import { Resend } from 'resend'
import { render } from '@react-email/render'
import React from 'react'
import { BookingConfirmationEmail } from './emails/BookingConfirmationEmail'
import { PaymentConfirmationEmail } from './emails/PaymentConfirmationEmail'
import { BookingCancelledEmail } from './emails/BookingCancelledEmail'

/**
 * Initialize Resend client
 * API key is loaded from RESEND_API_KEY environment variable
 */
const getResendClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY environment variable is not set. Please configure it in your .env.local'
    )
  }

  return new Resend(apiKey)
}

/**
 * Get the "From" email address
 * Should be verified in Resend dashboard
 */
const getFromEmail = (): string => {
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!fromEmail) {
    throw new Error(
      'RESEND_FROM_EMAIL environment variable is not set. Please configure it in your .env.local'
    )
  }

  return fromEmail
}

/**
 * Interface for booking confirmation email parameters
 */
interface SendBookingConfirmationParams {
  customerName: string
  customerEmail: string
  businessName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  bookingId: string
  businessAddress?: string
  businessPhone?: string
  price: number
  duration: number
}

/**
 * Send booking confirmation email
 *
 * Called after a booking is successfully created
 * Sends a professional confirmation email with booking details
 *
 * @param params - Booking information
 * @returns Promise with send result
 */
export async function sendBookingConfirmationEmail(
  params: SendBookingConfirmationParams & { businessLogo?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient()
    const fromEmail = getFromEmail()

    // Render React Email template to HTML
    const html = await render(
      React.createElement(BookingConfirmationEmail, {
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        businessName: params.businessName,
        serviceName: params.serviceName,
        bookingDate: params.bookingDate,
        bookingTime: params.bookingTime,
        bookingId: params.bookingId,
        businessAddress: params.businessAddress,
        businessPhone: params.businessPhone,
        businessLogo: params.businessLogo,
        price: params.price,
        duration: params.duration,
      })
    )

    // Send email via Resend
    const response = await resend.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      subject: `Booking Confirmed - ${params.serviceName} at ${params.businessName}`,
      html,
      replyTo: 'support@example.com', // Change to your support email
    })

    if (response.error) {
      console.error('Failed to send booking confirmation email:', response.error)
      return {
        success: false,
        error: response.error.message,
      }
    }

    console.log(`Booking confirmation email sent to ${params.customerEmail}`)

    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error sending booking confirmation email:', errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Interface for payment confirmation email parameters
 */
interface SendPaymentConfirmationParams {
  customerName: string
  customerEmail: string
  businessName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  bookingId: string
  amount: number
  transactionId: string
  paymentDate: string
  paymentProvider: 'ZALOPAY' | 'VNPAY' | 'MOMO'
}

/**
 * Send payment confirmation email
 *
 * Called after a payment is successfully processed
 * Sends an email with payment receipt and transaction details
 *
 * @param params - Payment information
 * @returns Promise with send result
 */
export async function sendPaymentConfirmationEmail(
  params: SendPaymentConfirmationParams & { businessLogo?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient()
    const fromEmail = getFromEmail()

    // Format payment provider name
    const providerName = {
      ZALOPAY: 'ZaloPay',
      VNPAY: 'VNPay',
      MOMO: 'MoMo',
    }[params.paymentProvider] || params.paymentProvider

    // Render React Email template to HTML
    const html = await render(
      React.createElement(PaymentConfirmationEmail, {
        customerName: params.customerName,
        businessName: params.businessName,
        serviceName: params.serviceName,
        bookingDate: params.bookingDate,
        bookingTime: params.bookingTime,
        bookingId: params.bookingId,
        amount: params.amount,
        transactionId: params.transactionId,
        paymentDate: params.paymentDate,
        paymentProvider: providerName,
        businessLogo: params.businessLogo,
      })
    )

    // Send email via Resend
    const response = await resend.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      subject: `Payment Receipt - ${params.serviceName} at ${params.businessName}`,
      html,
      replyTo: 'support@example.com', // Change to your support email
    })

    if (response.error) {
      console.error('Failed to send payment confirmation email:', response.error)
      return {
        success: false,
        error: response.error.message,
      }
    }

    console.log(`Payment confirmation email sent to ${params.customerEmail}`)

    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error sending payment confirmation email:', errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Interface for booking cancellation email parameters
 */
interface SendBookingCancelledParams {
  customerName: string
  customerEmail: string
  businessName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  bookingId: string
  cancellationReason?: string
}

/**
 * Send booking cancellation email
 *
 * Called when a booking is cancelled
 * Sends an email confirming the cancellation with refund information
 *
 * @param params - Booking cancellation information
 * @returns Promise with send result
 */
export async function sendBookingCancelledEmail(
  params: SendBookingCancelledParams & { businessLogo?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient()
    const fromEmail = getFromEmail()

    // Render React Email template to HTML
    const html = await render(
      React.createElement(BookingCancelledEmail, {
        customerName: params.customerName,
        businessName: params.businessName,
        serviceName: params.serviceName,
        bookingDate: params.bookingDate,
        bookingTime: params.bookingTime,
        bookingId: params.bookingId,
        cancellationReason: params.cancellationReason,
        businessLogo: params.businessLogo,
      })
    )

    // Send email via Resend
    const response = await resend.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      subject: `Booking Cancelled - ${params.serviceName}`,
      html,
      replyTo: 'support@example.com', // Change to your support email
    })

    if (response.error) {
      console.error('Failed to send booking cancelled email:', response.error)
      return {
        success: false,
        error: response.error.message,
      }
    }

    console.log(`Booking cancellation email sent to ${params.customerEmail}`)

    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error sending booking cancellation email:', errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Interface for provider payment notification email
 */
interface SendProviderNotificationParams {
  providerName: string
  providerEmail: string
  customerName: string
  customerEmail: string
  businessName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  bookingId: string
  amount: number
  transactionId: string
  businessLogo?: string
}

/**
 * Send payment notification email to Provider
 *
 * Called when a booking with payment is confirmed
 * Notifies the provider about the new confirmed booking with payment details
 *
 * @param params - Provider and booking information
 * @returns Promise with send result
 */
export async function sendProviderNotificationEmail(
  params: SendProviderNotificationParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient()
    const fromEmail = getFromEmail()

    // Create provider notification email HTML (simple but professional)
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 30px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-bottom: 12px;
              border-bottom: 2px solid #667eea;
              padding-bottom: 8px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .detail-label {
              font-weight: 500;
              color: #666;
            }
            .detail-value {
              text-align: right;
              color: #333;
            }
            .amount-highlight {
              background-color: #f0f7ff;
              padding: 15px;
              border-radius: 6px;
              text-align: center;
              margin: 20px 0;
            }
            .amount-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 8px;
            }
            .amount-value {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
            }
            .button {
              display: inline-block;
              background-color: #667eea;
              color: white;
              padding: 12px 30px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              margin-top: 20px;
            }
            .footer {
              background-color: #f9f9f9;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #e0e0e0;
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo img {
              max-width: 120px;
              height: auto;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 New Booking Confirmed</h1>
              <p>Payment received - Ready to serve!</p>
            </div>
            
            <div class="content">
              ${
                params.businessLogo
                  ? `
                <div class="logo">
                  <img src="${params.businessLogo}" alt="${params.businessName}" />
                </div>
              `
                  : ''
              }

              <p>Hi ${params.providerName},</p>
              <p>Great news! You have a new confirmed booking with payment received. Here are the details:</p>

              <div class="section">
                <div class="section-title">Booking Information</div>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">${params.bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${params.serviceName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Customer:</span>
                  <span class="detail-value">${params.customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Customer Email:</span>
                  <span class="detail-value">${params.customerEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${params.bookingDate} at ${params.bookingTime}</span>
                </div>
              </div>

              <div class="amount-highlight">
                <div class="amount-label">Amount Received</div>
                <div class="amount-value">$${params.amount.toFixed(2)}</div>
              </div>

              <div class="section">
                <div class="section-title">Payment Details</div>
                <div class="detail-row">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value">${params.transactionId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value" style="color: #4caf50; font-weight: bold;">✓ Confirmed</span>
                </div>
              </div>

              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                The customer will receive a confirmation email shortly. Please ensure you're prepared to provide the service at the scheduled date and time.
              </p>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://booking.example.com'}/dashboard/provider/bookings/${params.bookingId}" class="button">
                View Booking Details
              </a>
            </div>

            <div class="footer">
              <p>This is an automated notification from your booking system. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Booking Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const response = await resend.emails.send({
      from: fromEmail,
      to: params.providerEmail,
      subject: `New Confirmed Booking - ${params.serviceName} (${params.bookingDate})`,
      html,
      replyTo: 'support@example.com',
    })

    if (response.error) {
      console.error('Failed to send provider notification email:', response.error)
      return {
        success: false,
        error: response.error.message,
      }
    }

    console.log(`Provider notification email sent to ${params.providerEmail}`)

    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error sending provider notification email:', errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Interface for batch email sending
 */
interface BatchEmailParams {
  emails: Array<{
    to: string
    subject: string
    html: string
  }>
}

/**
 * Send batch emails
 *
 * Used for sending emails to multiple recipients
 * Useful for notifications to business about new bookings
 *
 * @param params - Array of emails to send
 * @returns Promise with send results
 */
export async function sendBatchEmails(
  params: BatchEmailParams
): Promise<{ success: boolean; results: Array<{ email: string; messageId?: string; error?: string }> }> {
  try {
    const resend = getResendClient()
    const fromEmail = getFromEmail()

    const results = await Promise.all(
      params.emails.map(async (email) => {
        try {
          const response = await resend.emails.send({
            from: fromEmail,
            to: email.to,
            subject: email.subject,
            html: email.html,
            replyTo: 'support@example.com',
          })

          if (response.error) {
            return {
              email: email.to,
              error: response.error.message,
            }
          }

          return {
            email: email.to,
            messageId: response.data?.id,
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return {
            email: email.to,
            error: errorMessage,
          }
        }
      })
    )

    const allSuccessful = results.every((r) => !r.error)
    console.log(`Batch email sending completed. Success: ${allSuccessful}`)

    return {
      success: allSuccessful,
      results,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error sending batch emails:', errorMessage)
    return {
      success: false,
      results: [],
    }
  }
}

/**
 * Send welcome email to new user
 * (Template available, implement as needed)
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient()
    const fromEmail = getFromEmail()

    const html = `
      <html>
        <head></head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
            <h1 style="color: #333;">Welcome, ${userName}!</h1>
            <p>Thank you for joining our booking platform. You can now browse services and make bookings.</p>
            <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
            <p>Best regards,<br />The Booking Team</p>
          </div>
        </body>
      </html>
    `

    const response = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Welcome to Our Booking Platform, ${userName}!`,
      html,
      replyTo: 'support@example.com',
    })

    if (response.error) {
      console.error('Failed to send welcome email:', response.error)
      return { success: false, error: response.error.message }
    }

    return { success: true, messageId: response.data?.id }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error sending welcome email:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

export type { SendBookingConfirmationParams, SendPaymentConfirmationParams, SendBookingCancelledParams }
