'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Teacher {
  id: string
  name: string
  email: string
}

interface ReviewFormProps {
  teachers: Teacher[]
}

export function ReviewForm({ teachers }: ReviewFormProps) {
  const router = useRouter()
  const [reviewType, setReviewType] = useState<'website' | 'teacher' | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reviewType || rating === 0 || (reviewType === 'teacher' && !selectedTeacher)) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
          teacherId: reviewType === 'teacher' ? selectedTeacher : undefined,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setReviewType(null)
        setSelectedTeacher('')
        setRating(0)
        setComment('')
        setTimeout(() => {
          setSuccess(false)
          router.refresh()
        }, 3000)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Write a Review
        </CardTitle>
        <CardDescription>
          Share your experience with πumera or a specific teacher
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Review Type Selection */}
          <div className="space-y-2">
            <Label>What would you like to review?</Label>
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={() => {
                  setReviewType('website')
                  setSelectedTeacher('')
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  reviewType === 'website'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className="font-semibold">Website</div>
                <div className="text-xs text-muted-foreground mt-1">Review πumera</div>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setReviewType('teacher')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  reviewType === 'teacher'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className="font-semibold">Teacher</div>
                <div className="text-xs text-muted-foreground mt-1">Review a teacher</div>
              </motion.button>
            </div>
          </div>

          {/* Teacher Selection */}
          <AnimatePresence>
            {reviewType === 'teacher' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="teacher">Select Teacher *</Label>
                <select
                  id="teacher"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Choose a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </motion.button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} out of 5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {comment.length}/500 characters
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={submitting || !reviewType || rating === 0}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            {success && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-green-600"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Review submitted! It will be reviewed before being published.</span>
              </motion.div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


