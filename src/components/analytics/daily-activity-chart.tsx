'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { GlowEffect } from '@/components/animations/glow-effect'

interface DailyActivityChartProps {
  dailyActivity: { day: string; count: number }[]
  weeklyActivity: number
  improvement: number
}

export function DailyActivityChart({ dailyActivity, weeklyActivity, improvement }: DailyActivityChartProps) {
  return (
    <GlowEffect intensity="low">
      <Card className="mb-8 border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-background to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Daily Activity Trend
          </CardTitle>
          <CardDescription>Your activity over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48">
              {dailyActivity.map((day, index) => {
                const maxCount = Math.max(...dailyActivity.map(d => d.count), 1)
                const height = (day.count / maxCount) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg min-h-[4px] relative group"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded px-2 py-1 text-xs font-semibold shadow-lg">
                        {day.count}
                      </div>
                    </motion.div>
                    <span className="text-xs font-medium text-muted-foreground">{day.day}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{weeklyActivity} items</span>
              </div>
              {improvement !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${improvement > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {improvement > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(improvement)} {improvement > 0 ? 'more' : 'fewer'} than last week</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </GlowEffect>
  )
}


