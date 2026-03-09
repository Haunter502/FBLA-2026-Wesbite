'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target } from 'lucide-react'
import { GlowEffect } from '@/components/animations/glow-effect'

interface UnitProgress {
  id: string
  title: string
  completed: number
  total: number
  averageScore: number | null
  completionRate: number
}

interface UnitPerformanceListProps {
  unitProgress: UnitProgress[]
}

export function UnitPerformanceList({ unitProgress }: UnitPerformanceListProps) {
  return (
    <GlowEffect intensity="low">
      <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Unit Performance Analysis
          </CardTitle>
          <CardDescription>Detailed performance metrics for each unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {unitProgress.map((unit) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{unit.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {unit.completed}/{unit.total} completed
                      </span>
                      {unit.averageScore !== null && (
                        <span className={`text-sm font-semibold ${
                          unit.averageScore >= 90 ? 'text-green-500' :
                          unit.averageScore >= 80 ? 'text-primary' :
                          unit.averageScore >= 70 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          Avg Score: {unit.averageScore}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{unit.completionRate}%</div>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${unit.completionRate}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full rounded-full ${
                      unit.completionRate === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                      unit.completionRate >= 75 ? 'bg-gradient-to-r from-primary to-primary/80' :
                      unit.completionRate >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                      'bg-gradient-to-r from-red-500 to-pink-400'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </GlowEffect>
  )
}


