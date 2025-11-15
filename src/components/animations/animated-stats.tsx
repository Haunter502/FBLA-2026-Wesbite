'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

interface AnimatedStatProps {
  value: number
  label: string
  suffix?: string
  prefix?: string
  duration?: number
  delay?: number
}

export function AnimatedStat({ value, label, suffix = '', prefix = '', duration = 2, delay = 0 }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + (value - startValue) * easeOutQuart)
      
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    const timeout = setTimeout(() => {
      animate()
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [isInView, value, duration, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <motion.div
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
        key={displayValue}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </motion.div>
      <p className="text-sm md:text-base text-muted-foreground mt-2">{label}</p>
    </motion.div>
  )
}


