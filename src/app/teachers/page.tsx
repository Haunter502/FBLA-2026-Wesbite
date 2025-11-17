"use client"

import { useEffect, useState } from "react"
import { teachers } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Clock, GraduationCap, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { GradientText } from "@/components/animations/gradient-text"
import { GlassCard } from "@/components/animations/glass-card"
import { ParticleBackground } from "@/components/animations/particle-background"
import { GlowEffect } from "@/components/animations/glow-effect"
import { LoadingSpinner } from "@/components/animations/loading-spinner"

type Teacher = typeof teachers.$inferSelect

export default function TeachersPage() {
  const [teachersList, setTeachersList] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const response = await fetch("/api/teachers")
        if (response.ok) {
          const data = await response.json()
          setTeachersList(data.teachers || [])
        }
      } catch (error) {
        console.error("Error fetching teachers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

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
                  <GradientText variant="primary">Our Teachers</GradientText>
                </h1>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
            >
              Meet our experienced Algebra 1 instructors ready to help you succeed
            </motion.p>
          </motion.div>
        </ScrollReveal>

        {/* Teachers Grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachersList.map((teacher, index: number) => (
            <StaggerItem key={teacher.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <GlowEffect>
                  <GlassCard className="h-full backdrop-blur-xl bg-gradient-to-br from-background/80 via-primary/5 to-background/80 border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 group">
                    <CardHeader>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-4 mb-4"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 blur-xl rounded-full" />
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg"
                          >
                            {teacher.name.charAt(0)}
                          </motion.div>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1 flex items-center gap-2">
                            {teacher.name}
                            <motion.div
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3, type: "spring" }}
                            >
                              <GraduationCap className="h-5 w-5 text-primary" />
                            </motion.div>
                          </CardTitle>
                        </div>
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-6 text-base leading-relaxed min-h-[60px]">
                        {teacher.bio}
                      </CardDescription>
                      <div className="space-y-3">
                        <motion.div
                          whileHover={{ x: 4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-primary/10 hover:border-primary/30 hover:bg-background/60 transition-all group/item"
                        >
                          <div className="p-2 rounded-full bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                            {teacher.email}
                          </span>
                        </motion.div>
                        {teacher.officeHours && (
                          <motion.div
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-primary/10 hover:border-primary/30 hover:bg-background/60 transition-all group/item"
                          >
                            <div className="p-2 rounded-full bg-primary/10 group-hover/item:bg-primary/20 transition-colors mt-0.5">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground/60 mb-1">Office Hours</p>
                              <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                                {teacher.officeHours}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </GlassCard>
                </GlowEffect>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </div>
  )
}
