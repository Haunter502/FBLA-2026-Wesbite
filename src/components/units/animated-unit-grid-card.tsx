'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'

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
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={href}>
        <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 border-border hover:border-primary group">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full"
              >
                Unit {order}
              </motion.span>
            </div>
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{totalLessons} lessons</span>
              </div>
              {totalDuration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{Math.round(totalDuration / 60)}h</span>
                </div>
              )}
            </div>
            <Button className="w-full group/btn" variant="outline">
              View Unit
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}



