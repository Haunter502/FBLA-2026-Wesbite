'use client'

import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { ReactNode } from 'react'

interface AnimatedStatCardProps {
  children: ReactNode
  delay?: number
}

export function AnimatedStatCard({ children, delay = 0 }: AnimatedStatCardProps) {
  return (
    <GlowEffect intensity="medium" className="h-full">
      <GlassCard delay={delay} hover className="h-full">
        {children}
      </GlassCard>
    </GlowEffect>
  )
}
