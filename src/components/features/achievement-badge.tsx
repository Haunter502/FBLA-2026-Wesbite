'use client'

import { motion } from 'framer-motion'
import { Award, Sparkles } from 'lucide-react'
import { ConfettiEffect } from '@/components/animations/confetti-effect'
import { useState } from 'react'

interface AchievementBadgeProps {
  title: string
  description: string
  icon?: React.ReactNode
  unlocked?: boolean
  onUnlock?: () => void
}

export function AchievementBadge({ title, description, icon, unlocked = false, onUnlock }: AchievementBadgeProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  const handleClick = () => {
    if (!unlocked && onUnlock) {
      setShowConfetti(true)
      onUnlock()
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }

  return (
    <>
      <ConfettiEffect trigger={showConfetti} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`
          relative p-6 rounded-xl border-2 transition-all cursor-pointer
          ${unlocked 
            ? 'border-primary bg-primary/10 shadow-lg' 
            : 'border-muted bg-muted/50 opacity-60'
          }
        `}
      >
        {unlocked && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-3 -right-3"
          >
            <div className="bg-primary text-primary-foreground rounded-full p-2">
              <Sparkles className="h-4 w-4" />
            </div>
          </motion.div>
        )}
        
        <div className="flex items-start gap-4">
          <div className={`
            p-3 rounded-lg
            ${unlocked ? 'bg-primary/20' : 'bg-muted'}
          `}>
            {icon || <Award className={`h-6 w-6 ${unlocked ? 'text-primary' : 'text-muted-foreground'}`} />}
          </div>
          
          <div className="flex-1">
            <h3 className={`font-semibold mb-1 ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {unlocked && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-b-xl"
          />
        )}
      </motion.div>
    </>
  )
}


