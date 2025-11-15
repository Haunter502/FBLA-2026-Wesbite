'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle2, XCircle, Star, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Review {
  id: string
  rating: number
  comment: string | null
  moderated: boolean
  createdAt: number | Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  } | null
}

interface AdminReviewsClientProps {
  reviews: Review[]
}

export function AdminReviewsClient({ reviews }: AdminReviewsClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const pendingReviews = reviews.filter(r => !r.moderated)
  const approvedReviews = reviews.filter(r => r.moderated)

  const handleApprove = async (reviewId: string) => {
    setLoading(reviewId)
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
      })
      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to approve review')
      }
    } catch (error) {
      console.error('Error approving review:', error)
      alert('Failed to approve review')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (reviewId: string) => {
    if (!confirm('Are you sure you want to reject this review? It will be permanently deleted.')) {
      return
    }
    
    setLoading(reviewId)
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'POST',
      })
      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to reject review')
      }
    } catch (error) {
      console.error('Error rejecting review:', error)
      alert('Failed to reject review')
    } finally {
      setLoading(null)
    }
  }

  const formatDate = (date: number | Date) => {
    const d = typeof date === 'number' ? new Date(date * 1000) : new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
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

  const renderReview = (review: Review) => (
    <motion.div
      key={review.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="mb-4 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.user?.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(review.user?.name || null)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{review.user?.name || 'Anonymous'}</div>
                <div className="text-sm text-muted-foreground">{review.user?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <Badge variant={review.moderated ? 'default' : 'destructive'}>
                {review.moderated ? 'Approved' : 'Pending'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {review.comment && (
            <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(review.createdAt)}
            </div>
            {!review.moderated && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleApprove(review.id)}
                  disabled={loading === review.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(review.id)}
                  disabled={loading === review.id}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pending">
          Pending ({pendingReviews.length})
        </TabsTrigger>
        <TabsTrigger value="approved">
          Approved ({approvedReviews.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        {pendingReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pending reviews</p>
            </CardContent>
          </Card>
        ) : (
          pendingReviews.map(renderReview)
        )}
      </TabsContent>

      <TabsContent value="approved" className="space-y-4">
        {approvedReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No approved reviews yet</p>
            </CardContent>
          </Card>
        ) : (
          approvedReviews.map(renderReview)
        )}
      </TabsContent>
    </Tabs>
  )
}

