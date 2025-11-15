'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ProgressRingAnimatedProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  label?: string
}

export function ProgressRingAnimated({
  progress,
  size = 120,
  strokeWidth = 8,
  className = '',
  showLabel = true,
  label,
}: ProgressRingAnimatedProps) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (displayProgress / 100) * circumference

  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    const startProgress = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progressRatio = Math.min(elapsed / duration, 1)
      
      // Easing function
      const easeOutCubic = 1 - Math.pow(1 - progressRatio, 3)
      const currentProgress = startProgress + (progress - startProgress) * easeOutCubic
      
      setDisplayProgress(currentProgress)

      if (progressRatio < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayProgress(progress)
      }
    }

    animate()
  }, [progress])

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: displayProgress / 100 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="text-2xl font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(displayProgress)}%
            </motion.div>
            {label && (
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


