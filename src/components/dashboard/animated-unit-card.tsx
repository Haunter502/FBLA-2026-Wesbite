'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ReactNode } from 'react'

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
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.1, 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.25, 1]
        }}
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="cursor-pointer overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  className="bg-primary h-2 rounded-full"
                />
              </div>
              {grade !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex justify-between items-center pt-2 border-t"
                >
                  <span className="text-sm text-muted-foreground">Grade</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      {grade}%
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      ({letterGrade})
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}

