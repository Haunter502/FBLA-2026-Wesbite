'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, ExternalLink } from 'lucide-react'
import { GlowEffect } from '@/components/animations/glow-effect'

interface AnimatedVideoCardProps {
  title: string
  youtubeId?: string | null
  khanUrl?: string | null
}

export function AnimatedVideoCard({ title, youtubeId, khanUrl }: AnimatedVideoCardProps) {
  return (
    <GlowEffect>
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Video Lesson
          </CardTitle>
        </CardHeader>
        <CardContent>
          {youtubeId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-video w-full rounded-lg overflow-hidden shadow-lg"
            >
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          ) : khanUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-video w-full rounded-lg overflow-hidden shadow-lg"
            >
              <iframe
                src={khanUrl}
                title={title}
                className="w-full h-full"
                allowFullScreen
              />
            </motion.div>
          ) : null}
          {khanUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <Button
                variant="outline"
                className="group"
                asChild
              >
                <a href={khanUrl} target="_blank" rel="noopener noreferrer">
                  Open on Khan Academy
                  <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </GlowEffect>
  )
}



