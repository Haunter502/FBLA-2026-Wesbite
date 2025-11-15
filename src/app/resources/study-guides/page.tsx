import { db } from "@/lib/db"
import { studyGuides, units } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Download, ExternalLink, AlertCircle } from "lucide-react"
import { eq, asc } from "@/lib/drizzle-helpers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { AnimatedResourceCard } from "@/components/resources/animated-resource-card"

async function getStudyGuides() {
  const allStudyGuides = await db
    .select({
      id: studyGuides.id,
      title: studyGuides.title,
      description: studyGuides.description,
      content: studyGuides.content,
      fileUrl: studyGuides.fileUrl,
      unitId: studyGuides.unitId,
      unit: {
        id: units.id,
        title: units.title,
        slug: units.slug,
      },
    })
    .from(studyGuides)
    .leftJoin(units, eq(studyGuides.unitId, units.id))
    .orderBy(asc(studyGuides.createdAt))

  return allStudyGuides
}

export default async function StudyGuidesPage() {
  const studyGuidesList = await getStudyGuides()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/resources" className="hover:text-foreground transition-colors">
              Resources
            </Link>
            <span>/</span>
            <span>Study Guides</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Study Guides</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive study guides covering key concepts, formulas, and problem-solving strategies
          </p>
        </div>
      </ScrollReveal>

      {studyGuidesList.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No study guides available</h3>
              <p className="text-muted-foreground">
                Study guides will be added soon. Check back later!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyGuidesList.map((guide: typeof studyGuidesList[0]) => (
            <StaggerItem key={guide.id}>
              <AnimatedResourceCard>
                <Card className="h-full">
                  <CardHeader>
                    <BookOpen className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <CardDescription>
                      {guide.description || 'Comprehensive review materials'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {guide.unit && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Unit: </span>
                          <Link 
                            href={`/units/${guide.unit.slug}`}
                            className="text-primary hover:underline"
                          >
                            {guide.unit.title}
                          </Link>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/resources/study-guides/${guide.id}`} className="flex-1">
                          <Button className="w-full" variant="default">
                            <BookOpen className="mr-2 h-4 w-4" />
                            View Guide
                          </Button>
                        </Link>
                        {guide.fileUrl && (
                          <a
                            href={guide.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedResourceCard>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  )
}



