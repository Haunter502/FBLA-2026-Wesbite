'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface DropdownMenuItem {
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownMenuItem[]
  className?: string
}

export function DropdownMenu({ trigger, items, className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle hover on desktop, click on mobile
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150) // Small delay to allow moving to dropdown
  }

  const handleClick = () => {
    // On mobile, toggle on click. On desktop, hover handles it.
    // Check if device supports hover (desktop) vs touch (mobile)
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
      // Mobile/touch device - toggle on click
      setIsOpen(!isOpen)
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isOpen])

  return (
    <div
      className={cn('relative', className)}
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-all duration-200 rounded-md hover:bg-accent flex items-center gap-1 relative',
          isOpen && 'text-foreground bg-accent/80 shadow-md'
        )}
      >
        {trigger}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
        {/* Active indicator */}
        {isOpen && (
          <motion.div
            layoutId="dropdown-indicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
            initial={false}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-border/50 bg-background/98 backdrop-blur-xl shadow-2xl z-50 py-2 overflow-hidden"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 pointer-events-none" />
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none opacity-50" />
            
            {/* Items */}
            <div className="relative">
              {items.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground transition-all duration-200 relative group',
                        'hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10',
                        'hover:pl-5'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {/* Hover indicator bar */}
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-primary rounded-r-full"
                        initial={{ opacity: 0, scaleY: 0 }}
                        whileHover={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                        style={{ transformOrigin: 'center' }}
                      />
                      
                      {Icon && (
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                        >
                          <Icon className="h-4 w-4 mr-3 text-primary/70 group-hover:text-primary transition-all duration-200" />
                        </motion.div>
                      )}
                      <span className="font-medium group-hover:font-semibold transition-all duration-200">{item.label}</span>
                      
                      {/* Arrow indicator on hover */}
                      <motion.div
                        className="ml-auto"
                        initial={{ opacity: 0, x: -8 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3 w-3 rotate-[-90deg] text-primary" />
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

