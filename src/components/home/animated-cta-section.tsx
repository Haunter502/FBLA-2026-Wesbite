'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCTASectionProps {
  children: ReactNode
}

export function AnimatedCTASection({ children }: AnimatedCTASectionProps) {
  return (
    <>
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
      />
      <div className="container mx-auto max-w-4xl text-center space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
      </div>
    </>
  )
}


