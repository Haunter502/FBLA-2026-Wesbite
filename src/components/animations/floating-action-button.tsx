'use client'

import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { ReactNode, useState } from 'react'

interface FloatingActionButtonProps {
  mainIcon?: ReactNode
  actions: Array<{
    icon: ReactNode
    label: string
    onClick: () => void
  }>
  className?: string
}

export function FloatingActionButton({ mainIcon, actions, className = '' }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Action buttons */}
      <div className="absolute bottom-16 right-0 flex flex-col gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{
              opacity: isOpen ? 1 : 0,
              scale: isOpen ? 1 : 0,
              y: isOpen ? 0 : 20,
            }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              action.onClick()
              setIsOpen(false)
            }}
            className="p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
            aria-label={action.label}
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
          >
            {action.icon}
          </motion.button>
        ))}
      </div>

      {/* Main button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : (mainIcon || <Plus className="h-6 w-6" />)}
      </motion.button>
    </div>
  )
}


