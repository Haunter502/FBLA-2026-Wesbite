import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, BookOpen, Video } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { worksheets, studyGuides, videoResources } from "@/lib/schema"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { ParticleBackground } from "@/components/animations/particle-background"
import { FadeInUp } from "@/components/animations/fade-in-up"
import { GradientText } from "@/components/animations/gradient-text"
import { GlowEffect } from "@/components/animations/glow-effect"
import { AnimatedResourceCard } from "@/components/resources/animated-resource-card"

async function getResourceCounts() {
  const [worksheetsCount, studyGuidesCount, videosCount] = await Promise.all([
    db.select().from(worksheets).then((rows: typeof worksheets.$inferSelect[]) => rows.length),
    db.select().from(studyGuides).then((rows: typeof studyGuides.$inferSelect[]) => rows.length),
    db.select().from(videoResources).then((rows: typeof videoResources.$inferSelect[]) => rows.length),
  ])

  return { worksheetsCount, studyGuidesCount, videosCount }
}

export default async function ResourcesPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/auth/sign-in")
  }

  const { worksheetsCount, studyGuidesCount, videosCount } = await getResourceCounts()

  return (
    <div className="relative overflow-hidden">
      {/* Enhanced background theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <ParticleBackground count={20} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10 pb-16">
        <FadeInUp delay={0.1}>
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-2">
              <GradientText variant="primary" className="text-5xl md:text-6xl">Resources</GradientText>
            </h1>
            <p className="text-muted-foreground text-lg">
              Access worksheets, study guides, and helpful materials to support your learning
            </p>
          </div>
        </FadeInUp>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <StaggerItem>
          <FadeInUp delay={0.2}>
            <GlowEffect intensity="medium">
              <AnimatedResourceCard>
                <Card className="h-full flex flex-col border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/40 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Worksheets
                </CardTitle>
                <CardDescription>Practice problems and exercises</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4">
                  Download printable worksheets for extra practice. {worksheetsCount > 0 && `(${worksheetsCount} available)`}
                </p>
                <Link href="/resources/worksheets">
                  <Button className="w-full mt-auto">
                    Browse Worksheets
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </AnimatedResourceCard>
        </GlowEffect>
      </FadeInUp>
    </StaggerItem>

    <StaggerItem>
      <FadeInUp delay={0.3}>
        <GlowEffect intensity="medium">
          <AnimatedResourceCard>
            <Card className="h-full flex flex-col border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/40 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Study Guides
                </CardTitle>
                <CardDescription>Comprehensive review materials</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4">
                  Access study guides for each unit. {studyGuidesCount > 0 && `(${studyGuidesCount} available)`}
                </p>
                <Link href="/resources/study-guides">
                  <Button className="w-full mt-auto">
                    View Study Guides
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </AnimatedResourceCard>
        </GlowEffect>
      </FadeInUp>
    </StaggerItem>

    <StaggerItem>
      <FadeInUp delay={0.4}>
        <GlowEffect intensity="medium">
          <AnimatedResourceCard>
            <Card className="h-full flex flex-col border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/40 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Resources
                </CardTitle>
                <CardDescription>Additional video content</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4">
                  Explore supplementary video lessons. {videosCount > 0 && `(${videosCount} available)`}
                </p>
                <Link href="/resources/videos">
                  <Button className="w-full mt-auto">
                    Watch Videos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </AnimatedResourceCard>
        </GlowEffect>
      </FadeInUp>
    </StaggerItem>
      </StaggerChildren>
      </div>
    </div>
  )
}
