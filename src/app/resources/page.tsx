import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, BookOpen, Video } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { worksheets, studyGuides, videoResources } from "@/lib/schema"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
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
  const { worksheetsCount, studyGuidesCount, videosCount } = await getResourceCounts()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Resources</h1>
          <p className="text-muted-foreground text-lg">
            Access worksheets, study guides, and helpful materials to support your learning
          </p>
        </div>
      </ScrollReveal>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StaggerItem>
          <AnimatedResourceCard>
            <Card className="h-full border-2 border-border hover:border-primary transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Worksheets
                </CardTitle>
                <CardDescription>Practice problems and exercises</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Download printable worksheets for extra practice. {worksheetsCount > 0 && `(${worksheetsCount} available)`}
                </p>
                <Link href="/resources/worksheets">
                  <Button className="w-full">
                    Browse Worksheets
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </AnimatedResourceCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedResourceCard>
            <Card className="h-full border-2 border-border hover:border-primary transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Study Guides
                </CardTitle>
                <CardDescription>Comprehensive review materials</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access study guides for each unit. {studyGuidesCount > 0 && `(${studyGuidesCount} available)`}
                </p>
                <Link href="/resources/study-guides">
                  <Button className="w-full">
                    View Study Guides
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </AnimatedResourceCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedResourceCard>
            <Card className="h-full border-2 border-border hover:border-primary transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Resources
                </CardTitle>
                <CardDescription>Additional video content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore supplementary video lessons. {videosCount > 0 && `(${videosCount} available)`}
                </p>
                <Link href="/resources/videos">
                  <Button className="w-full">
                    Watch Videos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </AnimatedResourceCard>
        </StaggerItem>
      </StaggerChildren>
    </div>
  )
}
