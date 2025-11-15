import { db } from "@/lib/db"
import { units, lessons } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { eq, asc } from "@/lib/drizzle-helpers"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { GradientText } from "@/components/animations/gradient-text"
import { AnimatedUnitGridCard } from "@/components/units/animated-unit-grid-card"

async function getUnits() {
  const allUnits = await db.select().from(units).orderBy(asc(units.order))

  const unitsWithLessons = await Promise.all(
    allUnits.map(async (unit: typeof allUnits[0]) => {
      const unitLessons = await db
        .select({ id: lessons.id, duration: lessons.duration })
        .from(lessons)
        .where(eq(lessons.unitId, unit.id))

      return {
        ...unit,
        totalLessons: unitLessons.length,
        totalDuration: unitLessons.reduce((sum: number, lesson: typeof unitLessons[0]) => sum + (lesson.duration || 0), 0),
      }
    })
  )

  return unitsWithLessons
}

export default async function UnitsPage() {
  const units = await getUnits()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">
            <GradientText variant="primary">Algebra 1 Units</GradientText>
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore all 14 comprehensive units covering the complete Algebra 1 curriculum
          </p>
        </div>
      </ScrollReveal>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit: typeof units[0], index: number) => (
          <StaggerItem key={unit.id}>
            <AnimatedUnitGridCard
              href={`/units/${unit.slug}`}
              order={unit.order}
              title={unit.title}
              description={unit.description}
              totalLessons={unit.totalLessons}
              totalDuration={unit.totalDuration}
              delay={index * 0.05}
            />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </div>
  )
}
