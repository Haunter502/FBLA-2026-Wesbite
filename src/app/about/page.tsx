"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, BookOpen, Sparkles, GraduationCap, Heart, Award, Zap, TrendingUp, Clock, CheckCircle2, Star } from "lucide-react"
import { motion } from "framer-motion"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { GradientText } from "@/components/animations/gradient-text"
import { GlassCard } from "@/components/animations/glass-card"
import { ParticleBackground } from "@/components/animations/particle-background"
import { GlowEffect } from "@/components/animations/glow-effect"
import { Badge } from "@/components/ui/badge"

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To make Algebra 1 learning engaging, collaborative, and accessible for all students.",
    gradient: "from-blue-500/40 to-cyan-500/40",
    iconColor: "text-blue-300",
    glowColor: "shadow-blue-500/60",
  },
  {
    icon: Users,
    title: "Peer-to-Peer Learning",
    description: "We believe in the power of collaborative learning and peer support.",
    gradient: "from-purple-500/40 to-pink-500/40",
    iconColor: "text-purple-300",
    glowColor: "shadow-purple-500/60",
  },
  {
    icon: BookOpen,
    title: "Comprehensive Curriculum",
    description: "14 units covering all essential Algebra 1 topics with interactive content.",
    gradient: "from-teal-500/40 to-green-500/40",
    iconColor: "text-teal-300",
    glowColor: "shadow-teal-500/60",
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

const stats = [
  { icon: BookOpen, label: "Units", value: "14", color: "text-blue-400" },
  { icon: Zap, label: "Lessons", value: "100+", color: "text-purple-400" },
  { icon: Users, label: "Students", value: "1,000+", color: "text-teal-400" },
  { icon: Award, label: "Badges", value: "50+", color: "text-yellow-400" },
]

const benefits = [
  {
    icon: CheckCircle2,
    title: "Self-Paced Learning",
    description: "Learn at your own speed with flexible scheduling and on-demand content.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your improvement with detailed analytics and personalized insights.",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Study anytime, anywhere with our always-available platform.",
  },
  {
    icon: Star,
    title: "Achievement System",
    description: "Earn badges and rewards as you complete lessons and master concepts.",
  },
]

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-primary/10 to-accent/10">
      {/* VERY VISIBLE Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
        <ParticleBackground count={60} />
        {/* Large animated orbs - VERY VISIBLE */}
        <motion.div
          className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-accent/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-4 max-w-7xl relative z-10">
        {/* Hero Section */}
        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-3"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-3xl opacity-60 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <h1 className="relative text-4xl md:text-6xl font-bold mb-2">
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

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <GlowEffect intensity="high">
            <GlassCard className="p-4 border-primary/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className="text-center p-3 rounded-xl bg-primary/10 border border-primary/30"
                    >
                      <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-2 drop-shadow-lg`} />
                      <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{stat.value}</div>
                      <div className="text-sm text-muted-foreground font-semibold">{stat.label}</div>
                    </motion.div>
                  )
                })}
              </div>
            </GlassCard>
          </GlowEffect>
        </motion.div>

        {/* Values Grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <StaggerItem key={value.title}>
                <motion.div
                  whileHover={{ y: -12, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <GlowEffect intensity="high">
                    <GlassCard className="h-full border-primary/50">
                      <CardHeader className="pb-3">
                        <motion.div
                          whileHover={{ rotate: [0, -15, 15, -15, 0], scale: 1.2 }}
                          transition={{ duration: 0.6 }}
                          className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${value.gradient} mb-3 shadow-lg ${value.glowColor} border-2 border-primary/40`}
                        >
                          <Icon className={`h-8 w-8 ${value.iconColor} drop-shadow-lg`} />
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

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            <GradientText variant="secondary">Key Features</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.08, y: -5 }}
                >
                  <GlowEffect>
                    <GlassCard className="h-full border-primary/40">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                        className="inline-flex p-3 rounded-xl bg-primary/30 mb-3 border border-primary/50"
                      >
                        <Icon className="h-7 w-7 text-primary drop-shadow-lg" />
                      </motion.div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </GlassCard>
                  </GlowEffect>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            <GradientText variant="accent">Why Choose Numera?</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: index % 2 === 0 ? 5 : -5 }}
                >
                  <GlowEffect>
                    <GlassCard className="border-primary/40">
                      <div className="flex gap-4">
                        <motion.div
                          whileHover={{ scale: 1.3, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="flex-shrink-0"
                        >
                          <div className="p-3 rounded-xl bg-primary/30 border border-primary/50">
                            <Icon className="h-6 w-6 text-primary drop-shadow-lg" />
                          </div>
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </GlowEffect>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Approach Section */}
        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-4"
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
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {["Self-Paced", "Interactive", "Gamified", "Personalized", "Comprehensive"].map((tag, i) => (
                      <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                      >
                        <Badge variant="secondary" className="px-4 py-2 bg-primary/30 border-primary/50 text-primary font-semibold text-sm">
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
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
