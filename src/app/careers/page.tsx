"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, GraduationCap, Calculator, TrendingUp, ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { GradientText } from "@/components/animations/gradient-text"
import { GlassCard } from "@/components/animations/glass-card"
import { ParticleBackground } from "@/components/animations/particle-background"
import { GlowEffect } from "@/components/animations/glow-effect"
import { Badge } from "@/components/ui/badge"

const careers = [
  {
    title: "Data Analyst",
    icon: TrendingUp,
    description: "Use algebraic skills to analyze data and make informed business decisions.",
    skills: ["Statistics", "Algebra", "Data Visualization"],
    gradient: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
    iconColor: "text-blue-500",
    hoverGradient: "hover:from-blue-500/30 hover:via-cyan-500/30 hover:to-teal-500/30",
  },
  {
    title: "Engineer",
    icon: Calculator,
    description: "Apply mathematical principles to design and solve complex problems.",
    skills: ["Problem Solving", "Algebra", "Calculus"],
    gradient: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
    iconColor: "text-purple-500",
    hoverGradient: "hover:from-purple-500/30 hover:via-pink-500/30 hover:to-rose-500/30",
  },
  {
    title: "Actuary",
    icon: Briefcase,
    description: "Use mathematics to assess risk and uncertainty in insurance and finance.",
    skills: ["Statistics", "Probability", "Algebra"],
    gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
    iconColor: "text-green-500",
    hoverGradient: "hover:from-green-500/30 hover:via-emerald-500/30 hover:to-teal-500/30",
  },
  {
    title: "Teacher",
    icon: GraduationCap,
    description: "Share your passion for mathematics and help students succeed.",
    skills: ["Communication", "Algebra", "Education"],
    gradient: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
    iconColor: "text-orange-500",
    hoverGradient: "hover:from-orange-500/30 hover:via-amber-500/30 hover:to-yellow-500/30",
  },
]

export default function CareersPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground count={20} />
      
      <div className="container mx-auto px-4 py-16 max-w-7xl relative z-10">
        {/* Hero Section */}
        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-12 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-2xl opacity-30 rounded-full" />
                <h1 className="relative text-5xl md:text-6xl font-bold mb-4">
                  <GradientText variant="primary">Math Careers</GradientText>
                </h1>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
            >
              Discover exciting career paths that use Algebra 1 skills
            </motion.p>
          </motion.div>
        </ScrollReveal>

        {/* Careers Grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {careers.map((career, index) => {
            const Icon = career.icon
            return (
              <StaggerItem key={career.title}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                >
                  <GlowEffect>
                    <GlassCard className={`h-full backdrop-blur-xl bg-gradient-to-br ${career.gradient} ${career.hoverGradient} border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 group`}>
                      <CardHeader>
                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-sm mb-4 group-hover:shadow-lg transition-shadow"
                        >
                          <Icon className={`h-8 w-8 ${career.iconColor}`} />
                        </motion.div>
                        <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                          {career.title}
                          <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            whileHover={{ x: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <ArrowRight className="h-5 w-5 text-primary" />
                          </motion.div>
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {career.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Key Skills:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {career.skills.map((skill, skillIndex) => (
                              <motion.div
                                key={skill}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + skillIndex * 0.1 }}
                                whileHover={{ scale: 1.1, rotate: 2 }}
                              >
                                <Badge 
                                  variant="secondary" 
                                  className="px-3 py-1.5 text-sm bg-background/60 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:bg-background/80 transition-all cursor-default"
                                >
                                  {skill}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </GlassCard>
                  </GlowEffect>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerChildren>
      </div>
    </div>
  )
}
