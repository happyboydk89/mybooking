export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id: serviceId } = await params

    if (!serviceId) {
      return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 })
    }

    // Verify the service belongs to the user's business
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { business: true },
    })

    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 })
    }

    if (service.business.providerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this service' },
        { status: 403 }
      )
    }

    // Delete the service
    await prisma.service.delete({
      where: { id: serviceId },
    })

    return NextResponse.json({ success: true, message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
