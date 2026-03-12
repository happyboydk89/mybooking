'use client'

import { ServiceCard } from '@/components/ServiceCard'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface ServicesListProps {
  services: any[]
  selectedServiceIds?: Set<string>
  onToggleSelection?: (serviceId: string) => void
}

export function ServicesList({ 
  services, 
  selectedServiceIds: externalSelectedIds,
  onToggleSelection: externalToggle,
}: ServicesListProps) {
  // Use external state if provided, otherwise use local state
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string>>(new Set())
  
  const isControlled = externalSelectedIds !== undefined && externalToggle !== undefined
  const selectedServiceIds = isControlled ? externalSelectedIds : localSelectedIds

  const toggleServiceSelection = (serviceId: string) => {
    if (isControlled) {
      externalToggle(serviceId)
    } else {
      const newSelected = new Set(localSelectedIds)
      if (newSelected.has(serviceId)) {
        newSelected.delete(serviceId)
      } else {
        newSelected.add(serviceId)
      }
      setLocalSelectedIds(newSelected)
    }
  }

  if (services.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <p className="text-amber-800 font-medium">Không có dịch vụ nào được cung cấp</p>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {services.map((service: any) => (
        <ServiceCard
          key={service.id}
          name={service.name}
          description={service.description}
          price={service.price}
          duration={service.duration}
          image={service.image}
          isSelected={selectedServiceIds.has(service.id)}
          onSelect={() => toggleServiceSelection(service.id)}
        />
      ))}
    </motion.div>
  )
}
