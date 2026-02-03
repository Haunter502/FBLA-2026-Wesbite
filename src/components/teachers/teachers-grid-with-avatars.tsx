'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Clock, Star, Upload, Loader2, X } from 'lucide-react'
import { GlowEffect } from '@/components/animations/glow-effect'
import { GlassCard } from '@/components/animations/glass-card'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children'

type TeacherWithReviews = {
  id: string
  name: string
  avatar: string | null
  bio: string
  email: string
  officeHours: string | null
  reviews: Array<{
    id: string
    rating: number
    comment: string | null
    userName: string | null
  }>
  averageRating: number | null
  reviewCount: number
}

interface TeachersGridWithAvatarsProps {
  teachers: TeacherWithReviews[]
  canEditAvatars: boolean
}

export function TeachersGridWithAvatars({ teachers: initialTeachers, canEditAvatars }: TeachersGridWithAvatarsProps) {
  const router = useRouter()
  const [teachers, setTeachers] = useState(initialTeachers)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleUpload = async (teacherId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      if (file) alert('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingId(teacherId)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`/api/teachers/${teacherId}/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setTeachers(prev =>
          prev.map(t => (t.id === teacherId ? { ...t, avatar: data.avatarUrl } : t))
        )
        router.refresh()
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to upload image')
      }
    } catch {
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingId(null)
      const input = fileInputRefs.current[teacherId]
      if (input) input.value = ''
    }
  }

  const handleRemove = async (teacherId: string) => {
    if (!confirm('Remove this teacher\'s profile picture?')) return
    setUploadingId(teacherId)
    try {
      const res = await fetch(`/api/teachers/${teacherId}/avatar`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) {
        setTeachers(prev =>
          prev.map(t => (t.id === teacherId ? { ...t, avatar: null } : t))
        )
        router.refresh()
      } else {
        alert('Failed to remove image')
      }
    } catch {
      alert('Failed to remove image.')
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch" staggerDelay={0.1}>
      {teachers.map((teacher) => (
        <StaggerItem key={teacher.id} className="h-full">
          <GlowEffect intensity="medium" className="h-full">
            <GlassCard className="h-full flex flex-col backdrop-blur-xl bg-gradient-to-br from-primary/10 via-background/90 to-background border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
              <Card className="h-full flex flex-col border-0 bg-transparent shadow-none">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 rounded-full blur-lg animate-pulse" />
                      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-3xl font-bold text-primary shadow-lg shadow-primary/30 ring-4 ring-primary/20">
                        {teacher.avatar ? (
                          <img
                            src={teacher.avatar}
                            alt={teacher.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          teacher.name.charAt(0)
                        )}
                      </div>
                      {canEditAvatars && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                          <input
                            ref={el => { fileInputRefs.current[teacher.id] = el }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleUpload(teacher.id, e)}
                            disabled={uploadingId !== null}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7 rounded-full"
                            onClick={() => fileInputRefs.current[teacher.id]?.click()}
                            disabled={uploadingId !== null}
                            title="Change picture"
                          >
                            {uploadingId === teacher.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Upload className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          {teacher.avatar && (
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-7 w-7 rounded-full"
                              onClick={() => handleRemove(teacher.id)}
                              disabled={uploadingId !== null}
                              title="Remove picture"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{teacher.name}</CardTitle>
                      {teacher.averageRating !== null && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]" />
                          <span className="text-sm font-bold text-yellow-400">{teacher.averageRating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({teacher.reviewCount} review{teacher.reviewCount !== 1 ? 's' : ''})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <CardDescription className="mb-4 text-base leading-relaxed">{teacher.bio}</CardDescription>
                    <div className="space-y-3 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-lg bg-primary/5 border border-primary/10">
                        <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                      {teacher.officeHours && (
                        <div className="flex items-start gap-2 text-muted-foreground p-2 rounded-lg bg-primary/5 border border-primary/10">
                          <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{teacher.officeHours}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {teacher.reviews.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-primary/20">
                      <h4 className="text-sm font-semibold mb-3 text-primary">Recent Reviews</h4>
                      <div className="space-y-3">
                        {teacher.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-background border border-primary/10 hover:border-primary/20 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 transition-all ${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]'
                                        : 'text-muted-foreground/30'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground font-medium">
                                {review.userName || 'Anonymous'}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </GlassCard>
          </GlowEffect>
        </StaggerItem>
      ))}
    </StaggerChildren>
  )
}
