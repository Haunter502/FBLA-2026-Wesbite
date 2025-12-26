'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface KhanAcademyEmbedProps {
  url: string
  title: string
}

export function KhanAcademyEmbed({ url, title }: KhanAcademyEmbedProps) {
  return (
    <div className="mt-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full rounded-lg overflow-hidden shadow-lg"
        style={{ minHeight: '600px' }}
      >
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0"
          style={{ minHeight: '600px' }}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </motion.div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            Open in New Tab
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}

