import { toast } from 'sonner'

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
    })
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
    })
  },

  // Specific messages for booking
  bookingSuccess: (businessName?: string, serviceName?: string) => {
    toast.success('Đặt lịch thành công!', {
      description: `Bạn đã đặt lịch ${serviceName ? `dịch vụ ${serviceName}` : ''} ${businessName ? `tại ${businessName}` : ''} thành công. Kiểm tra email để xác nhận.`,
    })
  },

  bookingError: (error?: string) => {
    toast.error('Đặt lịch thất bại', {
      description: error || 'Vui lòng thử lại hoặc liên hệ hỗ trợ.',
    })
  },

  paymentSuccess: (amount?: string) => {
    toast.success('Thanh toán thành công!', {
      description: `Bạn đã thanh toán ${amount ? `${amount}đ` : ''} thành công.`,
    })
  },

  paymentError: (error?: string) => {
    toast.error('Thanh toán thất bại', {
      description: error || 'Vui lòng kiểm tra thông tin thanh toán và thử lại.',
    })
  },

  loading: (message: string) => {
    return toast.loading(message)
  },

  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId)
  },

  promise: <T,>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) => {
    return toast.promise(promise, {
      loading: msgs.loading,
      success: msgs.success,
      error: msgs.error,
    })
  },
}
