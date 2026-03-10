'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme="light"
      expand
      duration={4000}
      gap={12}
    />
  )
}
