"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, BookOpen, Sparkles, GraduationCap, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { GradientText } from "@/components/animations/gradient-text"
import { GlassCard } from "@/components/animations/glass-card"
import { ParticleBackground } from "@/components/animations/particle-background"
import { GlowEffect } from "@/components/animations/glow-effect"

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To make Algebra 1 learning engaging, collaborative, and accessible for all students.",
    gradient: "from-blue-500/30 to-cyan-500/30",
    iconColor: "text-blue-400",
    glowColor: "shadow-blue-500/50",
  },
  {
    icon: Users,
    title: "Peer-to-Peer Learning",
    description: "We believe in the power of collaborative learning and peer support.",
    gradient: "from-purple-500/30 to-pink-500/30",
    iconColor: "text-purple-400",
    glowColor: "shadow-purple-500/50",
  },
  {
    icon: BookOpen,
    title: "Comprehensive Curriculum",
    description: "14 units covering all essential Algebra 1 topics with interactive content.",
    gradient: "from-teal-500/30 to-green-500/30",
    iconColor: "text-teal-400",
    glowColor: "shadow-teal-500/50",
  },
]

const features = [
  {
    icon: Sparkles,
    title: "Interactive Learning",
    description: "Engage with video lessons, quizzes, and hands-on exercises",
  },
  {
    icon: GraduationCap,
    title: "Expert Guidance",
    description: "Learn from experienced teachers and get personalized help",
  },
  {
    icon: Heart,
    title: "Student-Centered",
    description: "Built by students, for students - we understand your needs",
  },
]

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <ParticleBackground count={40} />
      
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Hero Section */}
        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-4"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-3xl opacity-50 rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <h1 className="relative text-4xl md:text-6xl font-bold mb-3">
                  <GradientText variant="primary">About Numera</GradientText>
                </h1>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              A comprehensive learning hub for Algebra 1, created by students, for students
            </motion.p>
          </motion.div>
        </ScrollReveal>

        {/* Values Grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <StaggerItem key={value.title}>
                <motion.div
                  whileHover={{ y: -12, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <GlowEffect intensity="high">
                    <GlassCard className="h-full">
                      <CardHeader className="pb-3">
                        <motion.div
                          whileHover={{ rotate: [0, -15, 15, -15, 0], scale: 1.2 }}
                          transition={{ duration: 0.6 }}
                          className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${value.gradient} mb-3 shadow-lg ${value.glowColor}`}
                        >
                          <Icon className={`h-7 w-7 ${value.iconColor} drop-shadow-lg`} />
                        </motion.div>
                        <CardTitle className="text-xl mb-2 font-bold">{value.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-base leading-relaxed">
                          {value.description}
                        </CardDescription>
                      </CardContent>
                    </GlassCard>
                  </GlowEffect>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerChildren>

        {/* Approach Section */}
        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <GlowEffect intensity="high">
              <GlassCard className="border-primary/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl md:text-3xl mb-2">
                    <GradientText variant="accent">Our Approach</GradientText>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-base md:text-lg text-muted-foreground leading-relaxed"
                  >
                    Numera is designed to support students at every stage of their Algebra 1 journey.
                    We combine video lessons, interactive exercises, quizzes, and live tutoring to
                    create a comprehensive learning experience.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-base md:text-lg text-muted-foreground leading-relaxed"
                  >
                    Our platform tracks your progress, celebrates your achievements, and provides
                    personalized recommendations to help you learn at your own pace.
                  </motion.p>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {features.map((feature, index) => {
                      const Icon = feature.icon
                      return (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          whileHover={{ scale: 1.08, y: -5 }}
                          className="p-5 rounded-xl bg-gradient-to-br from-primary/20 via-background/50 to-accent/20 backdrop-blur-sm border-2 border-primary/30 hover:border-primary/60 transition-all shadow-lg hover:shadow-primary/30"
                        >
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                          >
                            <Icon className="h-8 w-8 text-primary mb-3 drop-shadow-lg" />
                          </motion.div>
                          <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </GlassCard>
            </GlowEffect>
          </motion.div>
        </ScrollReveal>
      </div>
    </div>
  )
}
