'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SmoothHoverProps {
  children: ReactNode
  className?: string
  scale?: number
}

export function SmoothHover({ children, className, scale = 1.02 }: SmoothHoverProps) {
  return (
    <motion.div
      whileHover={{ scale, y: -4 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}



