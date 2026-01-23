'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { BookOpen, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface AnimatedUnitCardProps {
  href: string
  title: string
  description: string
  delay?: number
}

export function AnimatedUnitCard({ href, title, description, delay = 0 }: AnimatedUnitCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: delay,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <GlowEffect intensity="medium" className="h-full">
        <GlassCard delay={delay} hover className="h-full flex flex-col group cursor-pointer relative overflow-hidden">
          {/* Animated background gradient on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0"
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Floating particles effect */}
          {isHovered && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/30 rounded-full"
                  initial={{ 
                    x: Math.random() * 100 + '%',
                    y: '100%',
                    opacity: 0
                  }}
                  animate={{ 
                    y: '-20%',
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}

          <Link href={href} className="flex flex-col h-full relative z-10">
            <motion.div 
              className="flex items-start gap-3 mb-3"
              animate={{
                x: isHovered ? 4 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors"
                animate={{
                  rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <BookOpen className="h-5 w-5 text-primary" />
              </motion.div>
              <div className="flex-1">
                <motion.h3 
                  className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors"
                  animate={{
                    scale: isHovered ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {title}
                </motion.h3>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-sm text-muted-foreground leading-relaxed flex-1"
              animate={{
                opacity: isHovered ? 1 : 0.9,
              }}
            >
              {description}
            </motion.p>
            
            <motion.div 
              className="mt-4 pt-4 border-t border-primary/10 flex items-center justify-between"
              animate={{
                borderColor: isHovered ? 'rgba(var(--primary), 0.3)' : 'rgba(var(--primary), 0.1)',
              }}
            >
              <span className="text-xs text-primary font-medium group-hover:underline">
                Explore Unit
              </span>
              <motion.div
                animate={{
                  x: isHovered ? 4 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="h-4 w-4 text-primary inline-block" />
              </motion.div>
            </motion.div>
          </Link>
        </GlassCard>
      </GlowEffect>
    </motion.div>
  )
}



