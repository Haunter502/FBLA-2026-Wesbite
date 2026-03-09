'use client'

import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { GradientText } from '@/components/animations/gradient-text'

export function AnimatedAnalyticsHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <BarChart3 className="h-10 w-10 text-primary" />
        </motion.div>
        <h1 className="text-5xl font-bold">
          <GradientText variant="primary" className="text-5xl md:text-6xl">
            Progress Analytics
          </GradientText>
        </h1>
      </div>
      <p className="text-muted-foreground text-lg">
        Deep insights into your learning performance and trends
      </p>
    </div>
  )
}


