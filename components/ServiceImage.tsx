'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ServiceImageProps {
  name: string
  image?: string | null
}

export function ServiceImage({ name, image }: ServiceImageProps) {
  const [imageError, setImageError] = useState(false)

  const dummyImages: Record<string, string> = {
    'Hair Cut': 'https://picsum.photos/400/300?random=10',
    'Hair Color': 'https://picsum.photos/400/300?random=11',
    'Massage': 'https://picsum.photos/400/300?random=12',
    'Facial': 'https://picsum.photos/400/300?random=13',
    'Consultation': 'https://picsum.photos/400/300?random=14',
  }

  const defaultImage = 'https://picsum.photos/400/300?random=15'
  const displayImage = !imageError ? (image || dummyImages[name] || defaultImage) : defaultImage

  return (
    <div className="relative w-full h-40 bg-slate-200 overflow-hidden">
      <Image
        src={displayImage}
        alt={name}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  )
}
