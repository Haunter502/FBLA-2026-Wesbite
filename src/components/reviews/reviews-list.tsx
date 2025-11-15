'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: number | Date
  userName: string | null
  userImage: string | null
}

interface ReviewsListProps {
  reviews: Review[]
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (date: number | Date) => {
    const d = typeof date === 'number' ? new Date(date * 1000) : new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="hover:shadow-lg transition-shadow border-primary/10 bg-gradient-to-br from-background via-background/95 to-background">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarImage src={review.userImage || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(review.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold">{review.userName || 'Anonymous'}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}


