import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
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
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/auth/sign-in")
  }

  const studyGuidesList = await getStudyGuides()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/resources" className="hover:text-foreground transition-colors">
              Resources
            </Link>
            <span>/</span>
            <span className="text-foreground">Study Guides</span>
          </div>
          <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-sky-500/5 px-6 py-5 shadow-sm">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
              Deep‑dive guides for every unit
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Read friendly, structured explanations with key ideas, common mistakes, and worked
              examples—perfect for test prep or catching up after class.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {studyGuidesList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-10 pb-12">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No study guides available yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                We&apos;re still writing full explanations and examples for each unit. New guides
                will appear here as they&apos;re finished.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {studyGuidesList.map((guide: typeof studyGuidesList[0]) => (
            <StaggerItem key={guide.id}>
              <AnimatedResourceCard>
                <Card className="h-full border border-primary/10 bg-gradient-to-b from-primary/5 via-background to-background/80 hover:border-primary/40 hover:shadow-lg transition-all">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary p-2">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      {guide.unit && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                          {guide.unit.title}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base md:text-lg line-clamp-2">{guide.title}</CardTitle>
                    <CardDescription className="text-xs md:text-sm line-clamp-3">
                      {guide.description || "Comprehensive review materials"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-3 text-xs md:text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/resources/study-guides/${guide.id}`} className="flex-1 min-w-[8rem]">
                          <Button className="w-full justify-center text-sm">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Read online
                          </Button>
                        </Link>
                        {guide.fileUrl && (
                          <a
                            href={guide.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[3rem]"
                          >
                            <Button variant="outline" className="w-full justify-center text-sm">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
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



