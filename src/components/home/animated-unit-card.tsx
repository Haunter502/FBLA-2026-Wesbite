'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { BookOpen } from 'lucide-react'

interface AnimatedUnitCardProps {
  href: string
  title: string
  description: string
  delay?: number
}

export function AnimatedUnitCard({ href, title, description, delay = 0 }: AnimatedUnitCardProps) {
  return (
    <GlowEffect intensity="medium" className="h-full">
      <GlassCard delay={delay} hover className="h-full flex flex-col group cursor-pointer">
        <Link href={href} className="flex flex-col h-full">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
            {description}
          </p>
          <div className="mt-4 pt-4 border-t border-primary/10">
            <span className="text-xs text-primary font-medium group-hover:underline">
              Explore Unit →
            </span>
          </div>
        </Link>
      </GlassCard>
    </GlowEffect>
  )
}



