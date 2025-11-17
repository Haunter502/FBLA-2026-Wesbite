'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  delay?: number
}

export function GlassCard({ children, className, hover = true, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      className={cn(
        'backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20',
        'rounded-xl p-6 shadow-2xl',
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  )
}


