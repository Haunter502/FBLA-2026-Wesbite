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
    primary: 'bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent',
    secondary: 'bg-gradient-to-r from-secondary via-secondary/80 to-secondary bg-clip-text text-transparent',
    accent: 'bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent',
  }

  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  )
}



