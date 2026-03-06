'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface GodRay {
  id: number
  x: number
  width: number
  opacity: number
  duration: number
  delay: number
}

export function GodRays({ count = 5 }: { count?: number }) {
  const [rays, setRays] = useState<GodRay[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const newRays: GodRay[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position
      width: Math.random() * 3 + 1, // Width between 1-4%
      opacity: Math.random() * 0.15 + 0.05, // Opacity between 5-20%
      duration: Math.random() * 20 + 15, // Duration between 15-35 seconds
      delay: Math.random() * 5, // Random delay
    }))
    setRays(newRays)
  }, [count])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" suppressHydrationWarning>
      {/* Grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      
      {/* Animated god rays */}
      {rays.map((ray) => (
        <motion.div
          key={ray.id}
          className="absolute top-0 bottom-0"
          style={{
            left: `${ray.x}%`,
            width: `${ray.width}%`,
            background: `linear-gradient(
              to bottom,
              transparent 0%,
              hsl(var(--primary) / ${ray.opacity}) 20%,
              hsl(var(--primary) / ${ray.opacity * 1.5}) 50%,
              hsl(var(--primary) / ${ray.opacity}) 80%,
              transparent 100%
            )`,
            filter: 'blur(40px)',
            transformOrigin: 'center',
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [ray.opacity * 0.5, ray.opacity, ray.opacity * 0.5],
            scaleX: [1, 1.2, 1],
          }}
          transition={{
            duration: ray.duration,
            delay: ray.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Additional subtle rays for depth */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`subtle-${i}`}
          className="absolute top-0 bottom-0"
          style={{
            left: `${20 + i * 30}%`,
            width: '2%',
            background: `linear-gradient(
              to bottom,
              transparent 0%,
              hsl(var(--primary) / 0.08) 30%,
              hsl(var(--primary) / 0.12) 50%,
              hsl(var(--primary) / 0.08) 70%,
              transparent 100%
            )`,
            filter: 'blur(60px)',
          }}
          animate={{
            opacity: [0.05, 0.15, 0.05],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 25 + i * 5,
            delay: i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

