'use client'

import { motion } from 'framer-motion'

interface AnimatedUnitHeaderProps {
  title: string
  description: string
}

export function AnimatedUnitHeader({ title, description }: AnimatedUnitHeaderProps) {
  return (
    <div className="mb-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-4xl font-bold mb-2"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-lg text-muted-foreground"
      >
        {description}
      </motion.p>
    </div>
  )
}



