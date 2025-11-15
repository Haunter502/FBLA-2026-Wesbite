'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReactNode } from 'react'

interface AnimatedLessonCardProps {
  children: ReactNode
  delay?: number
}

export function AnimatedLessonCard({ children, delay = 0 }: AnimatedLessonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4 }}
    >
      <Card className="border-2 hover:border-primary/50 transition-colors">
        {children}
      </Card>
    </motion.div>
  )
}



