'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'

interface AnimatedReviewCardProps {
  rating: number
  userName: string | null
  comment: string
  delay?: number
}

export function AnimatedReviewCard({ rating, userName, comment, delay = 0 }: AnimatedReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + i * 0.1, type: "spring", stiffness: 200 }}
              >
                <Star
                  className={`h-4 w-4 ${
                    i < rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </motion.div>
            ))}
          </div>
          <CardTitle className="text-lg">{userName || "Student"}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{comment}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}



