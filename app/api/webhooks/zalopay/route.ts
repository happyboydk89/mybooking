/**
 * ZaloPay Webhook Callback Handler
 * 
 * Receives and processes payment status updates from ZaloPay
 * 
 * ZaloPay Webhook Flow:
 * 1. Payment completed/failed by customer
 * 2. ZaloPay sends POST request to this webhook
 * 3. Verify signature (HMAC-SHA256 with Key2)
 * 4. Update payment and booking status atomically
 * 5. Return success response code
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyZaloPayCallback } from '@/lib/payments/zalopay'
import {
  sendPaymentConfirmationEmail,
  sendBookingConfirmationEmail,
  sendProviderNotificationEmail,
} from '@/lib/email'

export const runtime = 'nodejs'

/**
 * ZaloPay Webhook Callback Data Structure
 */
interface ZaloPayWebhookData {
  return_code: number
  return_message: string
  sub_return_code?: number
  sub_return_message?: string
  data: string // JSON string containing callback data
  mac: string // Signature for verification
}

/**
 * Parsed ZaloPay Callback Data
 */
interface ZaloPayCallbackData {
  app_id: number
  app_trans_id: string
  server_time: string
  status: number // 1 = success, 2 = failed
  amount: number
  discount?: number
  fee?: number
  timestamp: number
  type: string
}

/**
 * POST handler for ZaloPay webhook callback
 * 
 * Signature: HMAC-SHA256(data|type|event_id|timestamp, key2)
 * 
 * @param request - IncomingRequest with ZaloPay callback payload
 * @returns Response with return_code (1 = success, 0 = error)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Parse webhook payload
    const webhookPayload: ZaloPayWebhookData = await request.json()

    // Validate payload structure
    if (!webhookPayload.data || !webhookPayload.mac) {
      console.error('Invalid ZaloPay webhook payload: missing data or mac')
      // Return 0 to indicate processing failed, but don't retry webhook
      return NextResponse.json({ return_code: 0 }, { status: 200 })
    }

    // Step 2: Verify webhook signature
    // This ensures the webhook is genuinely from ZaloPay
    const isSignatureValid = verifyZaloPayCallback(
      JSON.parse(webhookPayload.data),
      webhookPayload.mac
    )

    if (!isSignatureValid) {
      console.warn('ZaloPay webhook signature verification failed')
      return NextResponse.json({ return_code: 0 }, { status: 200 })
    }

    // Step 3: Parse callback data
    let callbackData: ZaloPayCallbackData
    try {
      callbackData = JSON.parse(webhookPayload.data)
    } catch (error) {
      console.error('Failed to parse ZaloPay callback data:', error)
      return NextResponse.json({ return_code: 0 }, { status: 200 })
    }

    // Step 4: Extract transaction ID and payment status
    const transactionId = callbackData.app_trans_id
    const paymentStatus = callbackData.status === 1 ? 'SUCCESS' : 'FAILED'

    console.log(`Processing ZaloPay webhook: transaction=${transactionId}, status=${paymentStatus}`)

    // Step 5: Find payment record by transaction ID
    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      include: {
        booking: {
          include: {
            user: true,
            services: {
              include: {
                service: true,
              },
            },
            business: {
              include: {
                provider: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      console.warn(`Payment not found for transaction: ${transactionId}`)
      // Still return success to prevent webhook retries for non-existent payments
      return NextResponse.json({ return_code: 1 }, { status: 200 })
    }

    // Step 6: Update payment and booking status using transaction
    // This ensures atomicity: both succeed or both fail together
    let updateSuccess = false
    let emailData: any = null

    try {
      await prisma.$transaction(async (tx: any) => {
        // Update payment record with status and raw response
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: paymentStatus as 'SUCCESS' | 'FAILED',
            rawResponse: webhookPayload, // Store complete webhook response
            updatedAt: new Date(),
          },
        })

        // If payment successful, update booking status
        if (paymentStatus === 'SUCCESS') {
          await tx.booking.update({
            where: { id: payment.booking.id },
            data: {
              status: 'CONFIRMED', // Mark booking as confirmed
              paymentStatus: 'SUCCESS',
              updatedAt: new Date(),
            },
          })
          console.log(`Booking confirmed: ${payment.booking.id}`)

          // Store email data to send after transaction completes
          // This prevents email failures from rolling back the payment transaction
          emailData = {
            customer: payment.booking.user,
            booking: payment.booking,
            payment: payment,
            business: payment.booking.business,
            services: payment.booking.services,
          }
        } else {
          // If payment failed, update booking payment status
          await tx.booking.update({
            where: { id: payment.booking.id },
            data: {
              paymentStatus: 'FAILED',
              updatedAt: new Date(),
            },
          })
          console.log(`Booking payment failed: ${payment.booking.id}`)
        }
      })

      updateSuccess = true
    } catch (dbError) {
      console.error(`Database error processing ZaloPay webhook: ${transactionId}`, dbError)
      // Return 0 to signal processing failed
      // ZaloPay will retry the webhook
      return NextResponse.json({ return_code: 0 }, { status: 200 })
    }

    // Step 7: Send confirmation emails AFTER successful transaction
    // Email failures will NOT rollback the payment transaction
    // This ensures payment processing is not affected by email service issues
    if (updateSuccess && emailData && paymentStatus === 'SUCCESS') {
      try {
        // Format date and time for emails
        const bookingDate = new Date(emailData.booking.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        const paymentDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        const emailPromises = []

        // Send payment confirmation email to customer
        if (emailData.customer && emailData.customer.email) {
          emailPromises.push(
            sendPaymentConfirmationEmail({
              customerName: emailData.customer.name || 'Customer',
              customerEmail: emailData.customer.email,
              businessName: emailData.business.name,
              serviceName: emailData.service.name,
              bookingDate,
              bookingTime: emailData.booking.timeSlot || 'TBD',
              bookingId: emailData.booking.id,
              amount: emailData.payment.amount,
              transactionId: emailData.payment.transactionId,
              paymentDate,
              paymentProvider: 'ZALOPAY',
              businessLogo: emailData.business.logo,
            }).catch((error) => {
              console.error('Failed to send payment confirmation email:', error)
              return { success: false, error: error.message }
            })
          )
        }

        // Send booking confirmation email to customer
        if (emailData.customer && emailData.customer.email) {
          emailPromises.push(
            sendBookingConfirmationEmail({
              customerName: emailData.customer.name || 'Customer',
              customerEmail: emailData.customer.email,
              businessName: emailData.business.name,
              serviceName: emailData.service.name,
              bookingDate,
              bookingTime: emailData.booking.timeSlot || 'TBD',
              bookingId: emailData.booking.id,
              businessAddress: emailData.business.address,
              businessPhone: emailData.business.phone,
              price: emailData.service.price,
              duration: emailData.service.duration,
              businessLogo: emailData.business.logo,
            }).catch((error) => {
              console.error('Failed to send booking confirmation email:', error)
              return { success: false, error: error.message }
            })
          )
        }

        // Send provider notification email
        if (
          emailData.business.provider &&
          emailData.business.provider.email &&
          emailData.customer
        ) {
          emailPromises.push(
            sendProviderNotificationEmail({
              providerName: emailData.business.provider.name || 'Provider',
              providerEmail: emailData.business.provider.email,
              customerName: emailData.customer.name || 'Customer',
              customerEmail: emailData.customer.email,
              businessName: emailData.business.name,
              serviceName: emailData.service.name,
              bookingDate,
              bookingTime: emailData.booking.timeSlot || 'TBD',
              bookingId: emailData.booking.id,
              amount: emailData.payment.amount,
              transactionId: emailData.payment.transactionId,
              businessLogo: emailData.business.logo,
            }).catch((error) => {
              console.error('Failed to send provider notification email:', error)
              return { success: false, error: error.message }
            })
          )
        }

        // Wait for all emails to send (non-blocking for payment)
        if (emailPromises.length > 0) {
          await Promise.all(emailPromises)
          console.log('All notification emails sent successfully')
        }
      } catch (emailError) {
        // Log email errors but don't fail the webhook response
        // Payment transaction is already successful
        console.warn('Email sending encountered an error (payment not affected):', emailError)
      }
    }

    console.log(`ZaloPay webhook processed successfully: ${transactionId}`)

    // Step 8: Return success response to ZaloPay
    // ZaloPay expects return_code: 1 for successful processing
    // Emails are sent asynchronously, so payment success is not affected by email failures
    return NextResponse.json(
      { return_code: 1, return_message: 'Webhook processed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in ZaloPay webhook handler:', error)
    return NextResponse.json(
      { return_code: 0, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
