'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedResourceCardProps {
  children: ReactNode
  delay?: number
}

export function AnimatedResourceCard({ children, delay = 0 }: AnimatedResourceCardProps) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4 }}
    >
      {children}
    </motion.div>
  )
}



