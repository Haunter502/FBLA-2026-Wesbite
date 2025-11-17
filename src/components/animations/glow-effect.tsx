'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlowEffectProps {
  children: ReactNode
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export function GlowEffect({ children, className, intensity = 'medium' }: GlowEffectProps) {
  const intensityClasses = {
    low: 'shadow-primary/20',
    medium: 'shadow-primary/30 shadow-lg',
    high: 'shadow-primary/40 shadow-xl shadow-2xl',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('relative', intensityClasses[intensity], className)}
    >
      {children}
    </motion.div>
  )
}



