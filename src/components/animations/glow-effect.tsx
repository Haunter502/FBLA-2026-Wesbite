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
    low: 'shadow-[0_0_20px_rgba(0,242,222,0.3)]',
    medium: 'shadow-[0_0_30px_rgba(0,242,222,0.4),0_0_60px_rgba(0,167,153,0.2)]',
    high: 'shadow-[0_0_40px_rgba(0,242,222,0.6),0_0_80px_rgba(0,167,153,0.4),0_0_120px_rgba(0,80,73,0.2)]',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative',
        intensityClasses[intensity],
        'transition-all duration-300',
        'hover:shadow-[0_0_50px_rgba(0,242,222,0.7),0_0_100px_rgba(0,167,153,0.5)]',
        className
      )}
    >
      {/* Animated glow ring */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#00F2DE] via-[#00A799] to-[#00F2DE] rounded-lg blur-xl opacity-30 animate-pulse -z-10" />
      {children}
    </motion.div>
  )
}
