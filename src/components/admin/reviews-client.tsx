'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle2, XCircle, Star, Clock, AlertCircle, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'

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

  const renderReview = (review: Review, index: number) => (
    <motion.div
      key={review.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlowEffect intensity={review.moderated ? 'low' : 'medium'}>
        <GlassCard className={`backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${
          review.moderated 
            ? 'border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background' 
            : 'border-2 border-orange-500/50 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background shadow-lg shadow-orange-500/20'
        }`}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="h-14 w-14 border-2 border-primary/30">
                  <AvatarImage src={review.user?.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                    {getInitials(review.user?.name || null)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">{review.user?.name || 'Anonymous'}</div>
                  <div className="text-sm text-muted-foreground font-medium">{review.user?.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + star * 0.05 }}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
                <Badge 
                  variant={review.moderated ? 'default' : 'destructive'}
                  className={`text-xs font-semibold px-3 py-1 ${
                    review.moderated 
                      ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                      : 'bg-orange-500/20 text-orange-500 border-orange-500/30 animate-pulse'
                  }`}
                >
                  {review.moderated ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Approved
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {review.comment && (
              <div className="p-4 bg-gradient-to-br from-background/80 to-background/50 rounded-xl border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed flex-1 whitespace-pre-wrap font-medium">
                    {review.comment}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4" />
                {formatDate(review.createdAt)}
              </div>
              {!review.moderated && (
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(review.id)}
                    disabled={loading === review.id}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(review.id)}
                    disabled={loading === review.id}
                    className="shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </GlassCard>
      </GlowEffect>
    </motion.div>
  )

  return (
    <Tabs defaultValue="pending" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 bg-muted/30 backdrop-blur-xl p-1.5 rounded-xl border border-primary/20 shadow-lg">
        <TabsTrigger 
          value="pending" 
          className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-orange-600/10 data-[state=active]:border-orange-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 transition-all duration-300 rounded-lg border border-transparent"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-semibold">Pending</span>
            <Badge variant="secondary" className="ml-1 bg-orange-500/20 text-orange-500 border-orange-500/30">
              {pendingReviews.length}
            </Badge>
          </div>
          {pendingReviews.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background animate-pulse" />
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="approved" 
          className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-green-600/10 data-[state=active]:border-green-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20 transition-all duration-300 rounded-lg border border-transparent"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-semibold">Approved</span>
            <Badge variant="secondary" className="ml-1 bg-green-500/20 text-green-500 border-green-500/30">
              {approvedReviews.length}
            </Badge>
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        <AnimatePresence mode="wait">
          {pendingReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlowEffect intensity="low">
                <GlassCard className="backdrop-blur-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="pt-16 pb-16">
                    <div className="text-center">
                      <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6">
                        <CheckCircle2 className="h-12 w-12 text-primary mx-auto opacity-70" />
                      </div>
                      <p className="text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">No Pending Reviews</p>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        All reviews have been processed. Great job staying on top of moderation!
                      </p>
                    </div>
                  </CardContent>
                </GlassCard>
              </GlowEffect>
            </motion.div>
          ) : (
            pendingReviews.map((review, index) => renderReview(review, index))
          )}
        </AnimatePresence>
      </TabsContent>

      <TabsContent value="approved" className="space-y-4">
        <AnimatePresence mode="wait">
          {approvedReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlowEffect intensity="low">
                <GlassCard className="backdrop-blur-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="pt-16 pb-16">
                    <div className="text-center">
                      <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6">
                        <MessageSquare className="h-12 w-12 text-primary mx-auto opacity-70" />
                      </div>
                      <p className="text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">No Approved Reviews Yet</p>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Approved reviews will appear here once you start moderating submissions.
                      </p>
                    </div>
                  </CardContent>
                </GlassCard>
              </GlowEffect>
            </motion.div>
          ) : (
            approvedReviews.map((review, index) => renderReview(review, index))
          )}
        </AnimatePresence>
      </TabsContent>
    </Tabs>
  )
}

