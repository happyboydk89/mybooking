/**
 * MoMo Webhook Callback Handler
 * 
 * Receives and processes payment status updates from MoMo
 * 
 * MoMo Webhook Flow:
 * 1. Payment completed/failed by customer
 * 2. MoMo sends POST request to this webhook
 * 3. Verify signature (HMAC-SHA256)
 * 4. Update payment and booking status atomically
 * 5. Return JSON response with status code
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * MoMo Webhook Callback Data Structure
 */
interface MoMoWebhookData {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  orderInfo: string
  orderType: string
  transId: string
  resultCode: number // 0 = success, other = failed
  message: string
  payType: string
  responseTime: number
  extraData: string
  signature: string
}

/**
 * Parsed MoMo Extra Data
 */
interface MoMoExtraData {
  booking_id?: string
  [key: string]: any
}

/**
 * POST handler for MoMo webhook callback
 * 
 * Signature: HMAC-SHA256(partnerCode|orderId|requestId|amount|transId|message|resultCode|payType|responseTime, secretKey)
 * 
 * Note: This is a partial implementation.
 * MoMo uses RSA encryption and HMAC-SHA256 signatures.
 * 
 * @param request - IncomingRequest with MoMo callback payload
 * @returns Response with MoMo response format
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Parse webhook payload
    const webhookPayload: MoMoWebhookData = await request.json()

    // Validate payload structure
    const requiredFields = [
      'partnerCode',
      'orderId',
      'transId',
      'resultCode',
      'signature',
    ]

    for (const field of requiredFields) {
      if (!webhookPayload[field as keyof MoMoWebhookData]) {
        console.error(`MoMo webhook missing required field: ${field}`)
        return NextResponse.json(
          {
            status: 99,
            message: 'Invalid parameters',
          },
          { status: 400 }
        )
      }
    }

    // Step 2: Verify webhook signature
    // TODO: Implement MoMo signature verification
    // MoMo signature = HMAC-SHA256(partnerCode|orderId|requestId|amount|transId|message|resultCode|payType|responseTime, secretKey)
    // const isSignatureValid = verifyMoMoSignature(webhookPayload)
    // if (!isSignatureValid) {
    //   console.warn('MoMo webhook signature verification failed')
    //   return NextResponse.json({ status: 99, message: 'Invalid signature' }, { status: 200 })
    // }

    // Step 3: Extract payment status
    const transactionId = webhookPayload.transId
    const resultCode = webhookPayload.resultCode
    // MoMo: 0 = success, other codes = failed
    const paymentStatus = resultCode === 0 ? 'SUCCESS' : 'FAILED'

    console.log(
      `Processing MoMo webhook: transaction=${transactionId}, status=${paymentStatus}, resultCode=${resultCode}`
    )

    // Step 4: Parse extra data to get booking ID
    // MoMo sends metadata in extraData field (base64 encoded JSON)
    let bookingId: string | null = null
    try {
      if (webhookPayload.extraData) {
        const decodedExtra = Buffer.from(webhookPayload.extraData, 'base64').toString(
          'utf-8'
        )
        const extraData: MoMoExtraData = JSON.parse(decodedExtra)
        bookingId = extraData.booking_id || null
      }
    } catch (error) {
      console.warn('Failed to parse MoMo extra data:', error)
    }

    // Step 5: Find payment record by transaction ID
    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      include: { booking: true },
    })

    if (!payment) {
      console.warn(`Payment not found for MoMo transaction: ${transactionId}`)
      // Still return success to prevent webhook retries
      return NextResponse.json(
        {
          status: 0,
          message: 'Processed',
        },
        { status: 200 }
      )
    }

    // Step 6: Update payment and booking status using transaction
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
          console.log(`Booking confirmed via MoMo: ${payment.booking.id}`)
        } else {
          // If payment failed, update booking payment status
          await tx.booking.update({
            where: { id: payment.booking.id },
            data: {
              paymentStatus: 'FAILED',
              updatedAt: new Date(),
            },
          })
          console.log(`Booking payment failed via MoMo: ${payment.booking.id}`)
        }
      })

      console.log(`MoMo webhook processed successfully: ${transactionId}`)

      // Step 7: Return success response to MoMo
      // MoMo expects: { status: 0, message: 'success' }
      return NextResponse.json(
        {
          status: 0,
          message: 'success',
        },
        { status: 200 }
      )
    } catch (dbError) {
      console.error(`Database error processing MoMo webhook: ${transactionId}`, dbError)
      // Return error status
      return NextResponse.json(
        {
          status: 99,
          message: 'System error',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in MoMo webhook handler:', error)
    return NextResponse.json(
      {
        status: 99,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
