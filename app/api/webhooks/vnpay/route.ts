/**
 * VNPay Webhook Callback Handler
 * 
 * Receives and processes payment status updates from VNPay
 * 
 * VNPay Webhook Flow:
 * 1. Payment completed/failed by customer
 * 2. VNPay sends POST request to this webhook
 * 3. Verify signature (MD5 hash with secure hash)
 * 4. Update payment and booking status atomically
 * 5. Return JSON response with status code
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * VNPay Webhook Callback Query Parameters
 * VNPay sends data as URL query parameters
 */
interface VNPayWebhookParams {
  vnp_ResponseCode: string // '00' = success
  vnp_TransactionNo: string
  vnp_OrderInfo: string
  vnp_Amount: string
  vnp_TxnRef: string
  vnp_SecureHash: string
  [key: string]: string
}

/**
 * VNPay Response Structure
 */
interface VNPayCallbackData {
  vnp_ResponseCode: string
  vnp_TransactionNo: string
  vnp_OrderInfo: string
  vnp_Amount: number
  vnp_TxnRef: string
}

/**
 * POST handler for VNPay webhook callback
 * 
 * Note: This is a stub implementation.
 * Use this structure to implement the actual VNPay integration:
 * 
 * 1. Verify signature using MD5(params + secret_key)
 * 2. Check vnp_ResponseCode === '00' for success
 * 3. Update Payment and Booking status using Prisma transaction
 * 4. Return { RspCode: '00', Message: 'Success' }
 * 
 * @param request - IncomingRequest with VNPay callback data
 * @returns Response with VNPay response format
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Parse webhook query parameters
    // VNPay sends callback data as URL query parameters
    const searchParams = request.nextUrl.searchParams
    const params: Partial<VNPayWebhookParams> = {}

    searchParams.forEach((value, key) => {
      params[key] = value
    })

    console.log('VNPayWebhook received:', {
      transactionNo: params.vnp_TransactionNo,
      responseCode: params.vnp_ResponseCode,
    })

    // Step 2: Validate required parameters
    const requiredParams = ['vnp_ResponseCode', 'vnp_TransactionNo', 'vnp_SecureHash', 'vnp_TxnRef']
    for (const param of requiredParams) {
      if (!params[param]) {
        console.error(`VNPay webhook missing required parameter: ${param}`)
        return NextResponse.json(
          {
            RspCode: '99',
            Message: 'Invalid parameters',
          },
          { status: 400 }
        )
      }
    }

    // TODO: Step 3: Verify signature
    // VNPaySecureHash = MD5(vnp_Amount|vnp_BankCode|vnp_BankTranNo|vnp_CardType|vnp_OrderInfo|vnp_PayDate|vnp_ResponseCode|vnp_TmnCode|vnp_TransactionNo|vnp_TxnRef|HashSecret)
    // const isSignatureValid = verifyVNPaySignature(params)
    // if (!isSignatureValid) {
    //   console.warn('VNPay webhook signature verification failed')
    //   return NextResponse.json({ RspCode: '97', Message: 'Invalid signature' }, { status: 200 })
    // }

    // Step 4: Extract payment information
    const transactionId = params.vnp_TxnRef
    const responseCode = params.vnp_ResponseCode
    const paymentStatus = responseCode === '00' ? 'SUCCESS' : 'FAILED'

    console.log(`Processing VNPay webhook: transaction=${transactionId}, status=${paymentStatus}`)

    // Step 5: Find payment record
    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      include: { booking: true },
    })

    if (!payment) {
      console.warn(`Payment not found for VNPay transaction: ${transactionId}`)
      // Return success to prevent webhook retries for non-existent payments
      return NextResponse.json(
        {
          RspCode: '00',
          Message: 'Processed',
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
            rawResponse: params, // Store complete webhook response
            updatedAt: new Date(),
          },
        })

        // If payment successful, update booking status
        if (paymentStatus === 'SUCCESS') {
          await tx.booking.update({
            where: { id: payment.booking.id },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'SUCCESS',
              updatedAt: new Date(),
            },
          })
          console.log(`Booking confirmed via VNPay: ${payment.booking.id}`)
        } else {
          // If payment failed, update booking payment status
          await tx.booking.update({
            where: { id: payment.booking.id },
            data: {
              paymentStatus: 'FAILED',
              updatedAt: new Date(),
            },
          })
          console.log(`Booking payment failed via VNPay: ${payment.booking.id}`)
        }
      })

      console.log(`VNPay webhook processed successfully: ${transactionId}`)

      // Step 7: Return success response to VNPay
      return NextResponse.json(
        {
          RspCode: '00',
          Message: 'Success',
        },
        { status: 200 }
      )
    } catch (dbError) {
      console.error(`Database error processing VNPay webhook: ${transactionId}`, dbError)
      // Return error code
      return NextResponse.json(
        {
          RspCode: '99',
          Message: 'System error',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in VNPay webhook handler:', error)
    return NextResponse.json(
      {
        RspCode: '99',
        Message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
