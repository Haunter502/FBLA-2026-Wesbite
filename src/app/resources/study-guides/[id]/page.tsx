import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { studyGuides, units } from "@/lib/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Download, ArrowLeft } from "lucide-react"
import { eq } from "@/lib/drizzle-helpers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations/scroll-reveal"

async function getStudyGuide(id: string) {
  const [guide] = await db
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
    .where(eq(studyGuides.id, id))
    .limit(1)

  return guide
}

export default async function StudyGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/auth/sign-in")
  }

  const { id } = await params
  const guide = await getStudyGuide(id)

  if (!guide) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ScrollReveal>
        <div className="mb-8">
          <Link
            href="/resources/study-guides"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Study Guides
          </Link>
          <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-sky-500/5 px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
                    {guide.title}
                  </h1>
                  {guide.description && (
                    <p className="text-sm md:text-base text-muted-foreground">
                      {guide.description}
                    </p>
                  )}
                </div>
                {guide.fileUrl && (
                  <a href={guide.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="whitespace-nowrap">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </a>
                )}
              </div>
              {guide.unit && (
                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                  <span className="text-muted-foreground">Unit:</span>
                  <Link
                    href={`/units/${guide.unit.slug}`}
                    className="inline-flex items-center rounded-full bg-background/80 px-3 py-1 text-xs font-medium hover:bg-background transition-colors"
                  >
                    {guide.unit.title}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>

      <Card className="border border-primary/10 bg-gradient-to-b from-background via-background to-background/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Study Guide Content
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {guide.content ? (
            <div
              className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:my-2 prose-ul:my-3 prose-ol:my-3 prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Content coming soon!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



