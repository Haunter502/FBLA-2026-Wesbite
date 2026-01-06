'use client'

import { motion } from 'framer-motion'
import { AnimatedStat } from '@/components/animations/animated-stats'
import { Users, BookOpen, Award, TrendingUp, Video } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: 5000,
    label: 'Active Students',
    suffix: '+',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Video,
    value: 112,
    label: 'Video Lessons',
    suffix: '+',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Award,
    value: 14,
    label: 'Comprehensive Units',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: TrendingUp,
    value: 95,
    label: 'Success Rate',
    suffix: '%',
    color: 'from-green-500 to-emerald-500',
  },
]

export function StatsShowcase() {
  return (
    <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by <span className="text-gradient-animated">Thousands</span> of Students
          </h2>
          <p className="text-xl text-muted-foreground">
            Join the growing community of learners achieving their goals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative"
              >
                <div className="glass-gradient rounded-2xl p-8 text-center hover-lift h-full">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} p-4 mx-auto mb-6 flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <AnimatedStat
                    value={stat.value}
                    label={stat.label}
                    suffix={stat.suffix}
                    duration={2}
                    delay={index * 0.2}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

