import crypto from 'crypto'

/**
 * ZaloPay Payment Configuration Interface
 */
interface ZaloPayConfig {
  appId: number
  key1: string
  key2: string
  endpoint: string
}

/**
 * Booking information passed to ZaloPay
 */
interface BookingInfo {
  id: string
  userId: string
  serviceName?: string
  serviceId?: string
  amount: number
  date: string
  timeSlot: string
  duration?: number
}

/**
 * User information for ZaloPay
 */
interface UserInfo {
  id: string
  email: string
  name: string
  phone?: string
}

/**
 * ZaloPay API Response structure
 */
interface ZaloPayResponse {
  return_code: number
  return_message: string
  sub_return_code?: number
  sub_return_message?: string
  zp_trans_token?: string
  order_url?: string
  order_token?: string
}

/**
 * Payment creation result returned to client
 */
interface PaymentResult {
  success: boolean
  paymentUrl?: string
  transactionId?: string
  error?: string
}

/**
 * Get ZaloPay configuration from environment variables
 */
function getConfig(): ZaloPayConfig {
  const appId = process.env.ZALOPAY_APP_ID
  const key1 = process.env.ZALOPAY_KEY1
  const key2 = process.env.ZALOPAY_KEY2

  if (!appId || !key1 || !key2) {
    throw new Error('Missing ZaloPay configuration. Please set ZALOPAY_APP_ID, ZALOPAY_KEY1, and ZALOPAY_KEY2 environment variables.')
  }

  return {
    appId: parseInt(appId),
    key1,
    key2,
    endpoint: process.env.ZALOPAY_ENDPOINT || 'https://sandbox.zalopay.com.vn/v001/tpe/',
  }
}

/**
 * Generate HMAC SHA256 signature for ZaloPay request
 * According to ZaloPay documentation, signature is calculated as:
 * HMAC_SHA256(data, key1)
 *
 * @param data - Data string to sign (concatenated ordered parameters)
 * @param key - Secret key (key1 for request, key2 for callback verification)
 * @returns Hex-encoded signature
 */
function generateSignature(data: string, key: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex')
}

/**
 * Create a ZaloPay payment order for a booking
 *
 * Flow:
 * 1. Validate input parameters
 * 2. Prepare order data with unique transaction ID
 * 3. Generate MAC signature according to ZaloPay specs
 * 4. Send API request to ZaloPay
 * 5. Return payment URL for customer redirect
 *
 * @param booking - Booking information
 * @param user - User information
 * @returns PaymentResult with payment URL or error
 */
export async function createZaloPayOrder(
  booking: BookingInfo,
  user: UserInfo
): Promise<PaymentResult> {
  try {
    // Step 1: Validate inputs
    if (!booking?.id || !booking?.amount || booking.amount <= 0) {
      return {
        success: false,
        error: 'Invalid booking data: id and positive amount are required',
      }
    }

    if (!user?.email) {
      return {
        success: false,
        error: 'Invalid user data: email is required',
      }
    }

    // Step 2: Get configuration
    const config = getConfig()

    // Step 3: Generate unique transaction ID
    // Format: {appId}{timestamp}{randomNumber}
    // This ensures uniqueness across multiple orders
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString().substring(2, 8)
    const transactionId = `${config.appId}${timestamp}${randomSuffix}`

    // Step 4: Prepare order data
    const orderData = {
      app_id: config.appId,
      app_trans_id: transactionId, // Transaction ID from merchant
      app_user: user.id,
      app_time: timestamp,
      amount: Math.round(booking.amount * 100), // Convert to smallest unit (xu) - ZaloPay expects in xu
      app_data: JSON.stringify({
        booking_id: booking.id,
        service_id: booking.serviceId,
        date: booking.date,
        time_slot: booking.timeSlot,
      }),
      embed_data: JSON.stringify({
        merchant_id: config.appId,
        promotioninfo: '',
      }),
      item: '[]',
      bank_code: '',
      description: `Booking service - ${booking.id}`,
      call_summary_api: 1,
      mac: '', // Will be calculated below
    }

    // Step 5: Calculate MAC signature
    // Data string format: {app_id}|{app_trans_id}|{app_user}|{amount}|{app_time}|{embed_data}|{item}
    const macData = [
      orderData.app_id,
      orderData.app_trans_id,
      orderData.app_user,
      orderData.amount,
      orderData.app_time,
      orderData.embed_data,
      orderData.item,
    ].join('|')

    const mac = generateSignature(macData, config.key1)
    orderData.mac = mac

    // Step 6: Send request to ZaloPay API
    const response = await fetch(`${config.endpoint}create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(
        Object.entries(orderData).reduce((acc, [key, value]) => {
          acc[key] = typeof value === 'string' ? value : String(value)
          return acc
        }, {} as Record<string, string>)
      ).toString(),
    })

    if (!response.ok) {
      console.error(`ZaloPay API error: ${response.status} ${response.statusText}`)
      return {
        success: false,
        error: `ZaloPay API returned status ${response.status}`,
      }
    }

    const zaloPayResponse: ZaloPayResponse = await response.json()

    // Step 7: Check response status
    if (zaloPayResponse.return_code !== 1) {
      console.error('ZaloPay order creation failed:', zaloPayResponse)
      return {
        success: false,
        error: `ZaloPay error: ${zaloPayResponse.return_message}`,
      }
    }

    // Step 8: Return success with payment URL
    return {
      success: true,
      transactionId,
      // ZaloPay provides order_url for QR code or use zp_trans_token for payment page
      paymentUrl: zaloPayResponse.order_url || `https://sandbox.zalopay.com.vn/web/payment?token=${zaloPayResponse.zp_trans_token}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('ZaloPay order creation error:', errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Verify ZaloPay callback signature
 * Used to validate webhook notifications from ZaloPay
 *
 * @param data - Callback data from ZaloPay
 * @param signature - Signature provided by ZaloPay
 * @returns boolean indicating if signature is valid
 */
export function verifyZaloPayCallback(
  data: Record<string, any>,
  signature: string
): boolean {
  try {
    const config = getConfig()

    // Reconstruct the data string in the same order ZaloPay used
    const macData = [
      data.data,
      data.type,
      data.event_id,
      data.timestamp,
    ].join('|')

    const expectedSignature = generateSignature(macData, config.key2)

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )
  } catch (error) {
    console.error('ZaloPay signature verification error:', error)
    return false
  }
}

/**
 * Export types for use in other modules
 */
export type { ZaloPayConfig, BookingInfo, UserInfo, ZaloPayResponse, PaymentResult }
