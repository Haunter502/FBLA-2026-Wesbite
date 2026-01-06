'use client'

import { motion } from 'framer-motion'
import { BookOpen, Video, Award, Users, BarChart3, Zap, Target, TrendingUp } from 'lucide-react'
import { GlassCard } from '@/components/animations/glass-card'
import { ParallaxSection } from '@/components/animations/parallax-section'

const features = [
  {
    icon: BookOpen,
    title: '14 Comprehensive Units',
    description: 'Complete Algebra 1 curriculum covering all essential topics from foundations to advanced concepts.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Video,
    title: 'Interactive Video Lessons',
    description: 'Engaging video content from Khan Academy and YouTube with interactive quizzes and exercises.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Award,
    title: 'Achievement System',
    description: 'Earn badges and track your progress with our comprehensive achievement and gamification system.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Live Tutoring',
    description: 'Connect with expert teachers through scheduled sessions or get immediate help when you need it.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics, progress rings, and performance metrics.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Zap,
    title: 'Quick Learning',
    description: 'Access flashcards, quizzes, and practice problems to reinforce concepts and improve retention.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Target,
    title: 'Personalized Goals',
    description: 'Set and achieve personalized learning goals with our smart recommendation system.',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: TrendingUp,
    title: 'Performance Analytics',
    description: 'Get insights into your strengths and weaknesses with detailed performance analytics.',
    color: 'from-teal-500 to-cyan-500',
  },
]

export function FeatureShowcase() {
  return (
    <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-morph" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-morph" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto max-w-7xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-animated">Powerful Features</span> for Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to master Algebra 1 and excel in your studies
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <ParallaxSection key={index} speed={0.3}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="h-full"
                >
                  <GlassCard
                    hover={true}
                    delay={index * 0.1}
                    className="h-full hover-lift group"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </GlassCard>
                </motion.div>
              </ParallaxSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}

