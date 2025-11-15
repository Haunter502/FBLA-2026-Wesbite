'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedButtonWrapperProps {
  children: ReactNode
}

export function AnimatedButtonWrapper({ children }: AnimatedButtonWrapperProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  )
}


