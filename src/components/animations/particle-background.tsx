'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

export function ParticleBackground({ count = 50 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only generate particles on client side to avoid hydration mismatch
    setMounted(true)
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3, // Larger particles
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.6 + 0.4, // More visible
    }))
    setParticles(newParticles)
  }, [count])

  // Don't render anything on server to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" suppressHydrationWarning>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse" />
      
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/40 shadow-[0_0_10px_rgba(0,242,222,0.8)]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [particle.opacity * 0.5, particle.opacity, particle.opacity * 0.5],
            scale: [1, 1.8, 1],
            boxShadow: [
              '0 0 10px rgba(0,242,222,0.8)',
              '0 0 20px rgba(0,242,222,1)',
              '0 0 10px rgba(0,242,222,0.8)',
            ],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Additional glowing orbs */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl"
          style={{
            width: '300px',
            height: '300px',
            left: `${20 + i * 30}%`,
            top: `${20 + i * 20}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}
    </div>
  )
}
