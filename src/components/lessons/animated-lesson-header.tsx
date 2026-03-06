'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { GradientText } from '@/components/animations/gradient-text'

interface AnimatedLessonHeaderProps {
  unitTitle: string
  unitSlug: string
  lessonTitle: string
  description: string
}

export function AnimatedLessonHeader({
  unitTitle,
  unitSlug,
  lessonTitle,
  description,
}: AnimatedLessonHeaderProps) {
  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
      >
        <Link href="/units" className="hover:text-foreground transition-colors">
          Units
        </Link>
        <span>/</span>
        <Link href={`/units/${unitSlug}`} className="hover:text-foreground transition-colors">
          {unitTitle}
        </Link>
        <span>/</span>
        <span>{lessonTitle}</span>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl font-bold mb-2"
      >
        <GradientText variant="primary">{lessonTitle}</GradientText>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg text-muted-foreground"
      >
        {description}
      </motion.p>
    </div>
  )
}



