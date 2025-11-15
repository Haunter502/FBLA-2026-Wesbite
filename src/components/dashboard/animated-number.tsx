'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedNumberProps {
  children: ReactNode
  delay?: number
}

export function AnimatedNumber({ children, delay = 0.2 }: AnimatedNumberProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
    >
      {children}
    </motion.div>
  )
}



