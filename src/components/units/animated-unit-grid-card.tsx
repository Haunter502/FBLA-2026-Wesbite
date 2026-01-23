'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'

interface AnimatedUnitGridCardProps {
  href: string
  order: number
  title: string
  description: string
  totalLessons: number
  totalDuration: number
  delay?: number
}

export function AnimatedUnitGridCard({
  href,
  order,
  title,
  description,
  totalLessons,
  totalDuration,
  delay = 0,
}: AnimatedUnitGridCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <GlowEffect intensity="medium" className="h-full">
        <GlassCard delay={delay} hover className="h-full flex flex-col group cursor-pointer">
          <Link href={href} className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="text-sm font-semibold text-primary bg-primary/20 px-3 py-1.5 rounded-full border border-primary/30"
              >
                Unit {order}
              </motion.span>
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6 flex-1">
              {description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 pb-4 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>{totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'}</span>
              </div>
              {totalDuration > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{Math.round(totalDuration / 60)}h</span>
                </div>
              )}
            </div>
            
            <Button className="w-full group/btn border-primary/30 hover:border-primary/50" variant="outline">
              View Unit
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </GlassCard>
      </GlowEffect>
    </motion.div>
  )
}



