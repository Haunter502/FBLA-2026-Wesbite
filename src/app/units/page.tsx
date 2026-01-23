import { db } from "@/lib/db"
import { units, lessons } from "@/lib/schema"
import { eq, asc } from "@/lib/drizzle-helpers"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { GradientText } from "@/components/animations/gradient-text"
import { AnimatedUnitGridCard } from "@/components/units/animated-unit-grid-card"
import { ParticleBackground } from "@/components/animations/particle-background"
import { GodRays } from "@/components/animations/god-rays"
import { FadeInUp } from "@/components/animations/fade-in-up"

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
    <div className="flex flex-col relative min-h-screen bg-background">
      {/* Background effects */}
      <ParticleBackground count={30} />
      <GodRays count={5} />
      <div className="god-rays-css fixed inset-0 pointer-events-none z-0" />
      
      {/* Main content */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-clip">
        {/* Gradient background with animated blur orbs */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 isolate" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Header */}
          <FadeInUp delay={0.1}>
            <div className="mb-16 text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <GradientText variant="primary" className="text-5xl md:text-6xl">
                  Algebra 1 Units
                </GradientText>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Explore all 14 comprehensive units covering the complete Algebra 1 curriculum
              </p>
            </div>
          </FadeInUp>

          {/* Units Grid */}
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
      </section>
    </div>
  )
}
