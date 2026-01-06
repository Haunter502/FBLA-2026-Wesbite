'use client'

import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'

interface AnimatedReviewCardProps {
  rating: number
  userName: string | null
  comment: string
  delay?: number
}

export function AnimatedReviewCard({ rating, userName, comment, delay = 0 }: AnimatedReviewCardProps) {
  return (
    <GlowEffect intensity="low" className="h-full">
      <GlassCard delay={delay} hover className="h-full flex flex-col">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <Quote className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: delay + i * 0.1, 
                    type: "spring", 
                    stiffness: 200,
                    damping: 10
                  }}
                >
                  <Star
                    className={`h-4 w-4 ${
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </motion.div>
              ))}
            </div>
            <h4 className="font-semibold text-foreground">{userName || "Student"}</h4>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic">
          "{comment}"
        </p>
      </GlassCard>
    </GlowEffect>
  )
}



