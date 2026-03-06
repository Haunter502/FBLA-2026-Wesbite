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
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{guide.title}</h1>
              {guide.description && (
                <p className="text-lg text-muted-foreground">{guide.description}</p>
              )}
            </div>
            {guide.fileUrl && (
              <a
                href={guide.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </a>
            )}
          </div>
          {guide.unit && (
            <div className="text-sm mb-4">
              <span className="text-muted-foreground">Unit: </span>
              <Link 
                href={`/units/${guide.unit.slug}`}
                className="text-primary hover:underline"
              >
                {guide.unit.title}
              </Link>
            </div>
          )}
        </div>
      </ScrollReveal>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Study Guide Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          {guide.content ? (
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
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



