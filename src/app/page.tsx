import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Users, Award, TrendingUp, Star, ArrowRight } from "lucide-react"
import { db } from "@/lib/db"
import { units as unitsTable, reviews as reviewsTable, users as usersTable } from "@/lib/schema"
import { eq, desc, asc } from "@/lib/drizzle-helpers"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { AnimatedFeatureCard } from "@/components/home/animated-feature-card"
import { AnimatedUnitCard } from "@/components/home/animated-unit-card"
import { AnimatedReviewCard } from "@/components/home/animated-review-card"
import { AnimatedHero } from "@/components/home/animated-hero"
import { AnimatedHeading } from "@/components/animations/animated-heading"
import { FeatureShowcase } from "@/components/features/feature-showcase"
import { StatsShowcase } from "@/components/features/stats-showcase"
import { ParticleBackground } from "@/components/animations/particle-background"
import { ToastContainer } from "@/components/animations/toast-notification"
import { AnimatedSectionHeader } from "@/components/home/animated-section-header"
import { AnimatedCTASection } from "@/components/home/animated-cta-section"
import { AnimatedButtonWrapper } from "@/components/home/animated-button-wrapper"

async function getUnits() {
  return await db.select().from(unitsTable).orderBy(asc(unitsTable.order)).limit(6)
}

async function getReviews() {
  return await db
    .select({
      id: reviewsTable.id,
      rating: reviewsTable.rating,
      comment: reviewsTable.comment,
      createdAt: reviewsTable.createdAt,
      userName: usersTable.name,
    })
    .from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(eq(reviewsTable.moderated, true))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(5)
}

export default async function Home() {
  const [units, reviews] = await Promise.all([getUnits(), getReviews()])

  return (
    <div className="flex flex-col relative">
      <ToastContainer />
      <ParticleBackground count={30} />
      
      {/* Hero Section */}
      <AnimatedHero />

      {/* Stats Showcase */}
      <StatsShowcase />

      {/* Enhanced Features Section */}
      <FeatureShowcase />

      {/* Units Preview */}
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-muted/10 to-background relative z-10">
        <div className="container mx-auto max-w-7xl">
          <AnimatedSectionHeader className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Explore Our Units
            </h2>
            <Link href="/units">
              <Button variant="outline" className="group hover-lift">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </AnimatedSectionHeader>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit: typeof units[0], index: number) => (
              <StaggerItem key={unit.id}>
                <AnimatedUnitCard
                  href={`/units/${unit.slug}`}
                  title={unit.title}
                  description={unit.description}
                  delay={index * 0.1}
                />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-primary/5 to-background relative z-10">
          <div className="container mx-auto max-w-7xl">
            <AnimatedSectionHeader className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What <span className="text-gradient-animated">Students</span> Say
              </h2>
              <p className="text-muted-foreground text-lg">Real feedback from our learning community</p>
            </AnimatedSectionHeader>
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review: typeof reviews[0], index: number) => (
                <StaggerItem key={review.id}>
                  <AnimatedReviewCard
                    rating={review.rating}
                    userName={review.userName}
                    comment={review.comment}
                    delay={index * 0.1}
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* Enhanced CTA Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden mt-12">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary/50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <AnimatedCTASection>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of students mastering Algebra 1 with Numera.
          </p>
          <Link href="/auth/sign-up">
            <AnimatedButtonWrapper>
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-6 hover-lift animate-pulse-glow group"
              >
                Sign Up Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </AnimatedButtonWrapper>
          </Link>
        </AnimatedCTASection>
      </section>
    </div>
  )
}