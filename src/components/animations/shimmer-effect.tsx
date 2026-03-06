'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ShimmerEffectProps {
  children: ReactNode
  className?: string
}

export function ShimmerEffect({ children, className }: ShimmerEffectProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  )
}



