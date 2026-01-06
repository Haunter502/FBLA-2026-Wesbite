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
import { GodRays } from "@/components/animations/god-rays"
import { ToastContainer } from "@/components/animations/toast-notification"
import { AnimatedSectionHeader } from "@/components/home/animated-section-header"
import { AnimatedCTASection } from "@/components/home/animated-cta-section"
import { AnimatedButtonWrapper } from "@/components/home/animated-button-wrapper"
import { GradientText } from "@/components/animations/gradient-text"
import { FadeInUp } from "@/components/animations/fade-in-up"

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
    <div className="flex flex-col relative min-h-screen bg-background">
      <ToastContainer />
      {/* Background effects - behind everything */}
      <ParticleBackground count={30} />
      <GodRays count={5} />
      {/* CSS-based god rays layer */}
      <div className="god-rays-css fixed inset-0 pointer-events-none z-0" />
      
      {/* Hero Section */}
      <AnimatedHero />

      {/* Stats Showcase */}
      <StatsShowcase />

      {/* Enhanced Features Section */}
      <FeatureShowcase />

      {/* Units Preview */}
      <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="container mx-auto max-w-7xl relative">
          <FadeInUp delay={0.1}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2">
                  <GradientText variant="primary" className="text-4xl md:text-5xl">
                    Explore Our Units
                  </GradientText>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Comprehensive Algebra 1 curriculum designed for your success
                </p>
              </div>
              <Link href="/units">
                <Button variant="outline" className="group hover-lift border-primary/30 hover:border-primary/50">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </FadeInUp>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit: typeof units[0], index: number) => (
              <StaggerItem key={unit.id} className="h-full">
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
        <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-background to-primary/10" />
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
          <div className="container mx-auto max-w-7xl relative">
            <FadeInUp delay={0.1}>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  What <GradientText variant="primary" className="text-4xl md:text-5xl">Students</GradientText> Say
                </h2>
                <p className="text-muted-foreground text-lg">Real feedback from our learning community</p>
              </div>
            </FadeInUp>
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review: typeof reviews[0], index: number) => (
                <StaggerItem key={review.id} className="h-full">
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
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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