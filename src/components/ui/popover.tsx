'use client'

import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PopoverProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface PopoverTriggerProps {
  asChild?: boolean
  children: ReactNode
}

interface PopoverContentProps {
  children: ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
}

export function Popover({ children, open: controlledOpen, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </PopoverContext.Provider>
  )
}

const PopoverContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null)

function usePopoverContext() {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error('Popover components must be used within Popover')
  }
  return context
}

export function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  const { open, onOpenChange } = usePopoverContext()
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    onOpenChange(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ref: triggerRef,
    } as any)
  }

  return (
    <div ref={triggerRef} onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  )
}

export function PopoverContent({ children, className, align = 'end' }: PopoverContentProps) {
  const { open, onOpenChange } = usePopoverContext()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onOpenChange])

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'absolute top-full mt-2 rounded-xl border border-border/50 bg-background/98 backdrop-blur-xl shadow-2xl z-50',
            alignClasses[align],
            className
          )}
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}


