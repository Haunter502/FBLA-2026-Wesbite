'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GradientTextProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'accent'
}

export function GradientText({ children, className, variant = 'primary' }: GradientTextProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#00F2DE] via-[#00A799] to-[#00F2DE] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease_infinite] font-bold',
    secondary: 'bg-gradient-to-r from-[#00A799] via-[#005049] to-[#00A799] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease_infinite] font-bold',
    accent: 'bg-gradient-to-r from-[#00F2DE] via-[#00A799] to-[#005049] to-[#00A799] to-[#00F2DE] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_4s_ease_infinite] font-bold',
  }

  return (
    <span className={cn(variants[variant], 'drop-shadow-[0_0_8px_rgba(0,242,222,0.5)]', className)}>
      {children}
    </span>
  )
}
