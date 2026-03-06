'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { BookOpen, ArrowRight } from 'lucide-react'

interface AnimatedUnitCardProps {
  href: string
  title: string
  percentage: number
  grade: number | null
  letterGrade: string | null
  index: number
}

export function AnimatedUnitCard({ 
  href, 
  title, 
  percentage, 
  grade, 
  letterGrade,
  index 
}: AnimatedUnitCardProps) {
  return (
    <GlowEffect intensity="medium" className="h-full">
      <GlassCard delay={index * 0.1} hover className="h-full flex flex-col group cursor-pointer">
        <Link href={href} className="flex flex-col h-full">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold flex-1 group-hover:text-primary transition-colors">{title}</h3>
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-primary">{percentage}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                className="bg-gradient-to-r from-primary to-primary/80 h-2.5 rounded-full"
              />
            </div>
            {grade !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex justify-between items-center pt-3 border-t border-primary/10"
              >
                <span className="text-sm text-muted-foreground">Grade</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                    {grade}%
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    ({letterGrade})
                  </span>
                </div>
              </motion.div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-primary/10">
            <span className="text-xs text-primary font-medium group-hover:underline flex items-center gap-1">
              View Unit <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </GlassCard>
    </GlowEffect>
  )
}

