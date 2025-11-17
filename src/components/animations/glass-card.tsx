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
      whileHover={hover ? { scale: 1.03, y: -8 } : {}}
      className={cn(
        'backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/15 to-white/10',
        'dark:from-black/30 dark:via-black/20 dark:to-black/10',
        'border-2 border-primary/40 shadow-[0_8px_32px_0_rgba(0,242,222,0.3)]',
        'dark:shadow-[0_8px_32px_0_rgba(0,242,222,0.4)]',
        'rounded-2xl p-6',
        'transition-all duration-300',
        'hover:border-primary/60 hover:shadow-[0_12px_48px_0_rgba(0,242,222,0.5)]',
        'dark:hover:shadow-[0_12px_48px_0_rgba(0,242,222,0.6)]',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
