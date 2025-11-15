'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ReactNode } from 'react'

interface AnimatedFeatureCardProps {
  children: ReactNode
  delay?: number
}

export function AnimatedFeatureCard({ children, delay = 0 }: AnimatedFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {children}
    </motion.div>
  )
}

