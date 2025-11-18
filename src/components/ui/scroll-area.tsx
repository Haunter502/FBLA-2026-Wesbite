'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollAreaProps {
  children: ReactNode
  className?: string
}

export function ScrollArea({ children, className }: ScrollAreaProps) {
  return (
    <div
      className={cn(
        'overflow-y-auto overflow-x-hidden',
        'scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent',
        'hover:scrollbar-thumb-primary/40',
        className
      )}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(var(--primary), 0.2) transparent',
      }}
    >
      {children}
    </div>
  )
}

