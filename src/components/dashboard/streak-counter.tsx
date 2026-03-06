'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StreakCounterProps {
  current: number;
  longest: number;
}

export function StreakCounter({ current, longest }: StreakCounterProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="flex items-baseline gap-2"
            >
              <span className="text-4xl font-bold text-orange-500">{current}</span>
              <span className="text-sm text-muted-foreground">
                day{current !== 1 ? 's' : ''}
              </span>
            </motion.div>
            <p className="text-xs text-muted-foreground mt-1">Current streak</p>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Longest streak:</span>
            <span className="font-semibold">{longest} days</span>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {current > 0
                ? 'Keep it up! Complete a lesson today to maintain your streak.'
                : 'Start a streak by completing a lesson today!'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

