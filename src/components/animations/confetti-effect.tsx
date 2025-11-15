'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  delay: number
}

const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']

export function ConfettiEffect({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (trigger) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
      }))
      setPieces(newPieces)

      // Reset after animation
      setTimeout(() => setPieces([]), 3000)
    }
  }, [trigger])

  if (pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
          }}
          initial={{
            y: piece.y,
            rotate: piece.rotation,
            opacity: 1,
          }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000,
            rotate: piece.rotation + 720,
            x: piece.x + (Math.random() - 0.5) * 200,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

