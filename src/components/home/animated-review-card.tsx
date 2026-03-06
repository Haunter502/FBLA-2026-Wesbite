'use client'

import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface AnimatedReviewCardProps {
  rating: number
  userName: string | null
  comment: string
  delay?: number
}

export function AnimatedReviewCard({ rating, userName, comment, delay = 0 }: AnimatedReviewCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
      transition={{
        delay: delay,
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        y: -10,
        scale: 1.03,
        rotateY: 2,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <GlowEffect intensity="low" className="h-full">
        <GlassCard delay={delay} hover className="h-full flex flex-col relative overflow-hidden">
          {/* Animated quote icon background */}
          <motion.div
            className="absolute top-4 right-4 opacity-5"
            animate={{
              rotate: isHovered ? 360 : 0,
              scale: isHovered ? 1.5 : 1,
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <Quote className="h-24 w-24 text-primary" />
          </motion.div>

          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
            initial={{ x: '-100%' }}
            animate={{
              x: isHovered ? '100%' : '-100%',
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              ease: "linear"
            }}
          />

          <div className="relative z-10 flex flex-col h-full">
            <motion.div 
              className="flex items-start gap-3 mb-4"
              animate={{
                x: isHovered ? 4 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="p-2 rounded-lg bg-primary/20"
                animate={{
                  rotate: isHovered ? [0, -5, 5, -5, 0] : 0,
                  scale: isHovered ? 1.15 : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <Quote className="h-5 w-5 text-primary" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: 1, 
                        rotate: 0,
                        y: isHovered && i < rating ? [0, -4, 0] : 0,
                      }}
                      transition={{ 
                        delay: delay + i * 0.1, 
                        type: "spring", 
                        stiffness: 200,
                        damping: 10,
                        y: {
                          duration: 0.5,
                          repeat: isHovered && i < rating ? Infinity : 0,
                          repeatDelay: i * 0.1,
                        }
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: isHovered && i < rating ? [1, 1.2, 1] : 1,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: i * 0.05,
                          repeat: isHovered && i < rating ? Infinity : 0,
                          repeatDelay: 0.5,
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
                    </motion.div>
                  ))}
                </div>
                <motion.h4 
                  className="font-semibold text-foreground"
                  animate={{
                    scale: isHovered ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {userName || "Student"}
                </motion.h4>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-sm text-muted-foreground leading-relaxed flex-1 italic relative"
              animate={{
                opacity: isHovered ? 1 : 0.9,
              }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.3, duration: 0.5 }}
              >
                "{comment}"
              </motion.span>
            </motion.p>
          </div>
        </GlassCard>
      </GlowEffect>
    </motion.div>
  )
}



