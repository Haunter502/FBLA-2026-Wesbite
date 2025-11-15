"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, TrendingUp, Award } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "14 Comprehensive Units",
    description:
      "Complete Algebra 1 curriculum covering all essential topics from foundations to advanced concepts.",
  },
  {
    icon: Calendar,
    title: "Live Tutoring",
    description:
      "Schedule sessions with expert teachers or request immediate help when you need it most.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description:
      "Monitor your learning journey with detailed progress tracking, streaks, and achievement badges.",
  },
  {
    icon: Award,
    title: "Interactive Learning",
    description:
      "Engage with videos, quizzes, flashcards, and exercises designed to make learning math enjoyable.",
  },
]

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => {
        const Icon = feature.icon
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow hover:-translate-y-1">
              <CardHeader>
                <Icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

