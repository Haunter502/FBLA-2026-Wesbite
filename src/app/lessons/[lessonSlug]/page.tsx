import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { lessons, units, flashcardSets, flashcards, progress } from "../../../../drizzle/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { extractYouTubeId } from "@/lib/utils"
import { Play, BookOpen, Lightbulb, ExternalLink } from "lucide-react"
import Link from "next/link"
import { eq, asc, and } from "@/lib/drizzle-helpers"
import { CompleteLessonButton } from "@/components/lessons/complete-lesson-button"

async function getLesson(slug: string, userId?: string) {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1)

  if (!lesson) return null

  const [unit] = await db
    .select({ id: units.id, slug: units.slug, title: units.title })
    .from(units)
    .where(eq(units.id, lesson.unitId))
    .limit(1)

  const sets = await db.select().from(flashcardSets).where(eq(flashcardSets.lessonId, lesson.id))

  const setsWithCards = await Promise.all(
    sets.map(async (set) => {
      const cards = await db
        .select()
        .from(flashcards)
        .where(eq(flashcards.setId, set.id))
        .orderBy(asc(flashcards.order))

      return { ...set, flashcards: cards }
    })
  )

  // Check if lesson is completed
  let isCompleted = false
  if (userId) {
    const [lessonProgress] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.lessonId, lesson.id),
          eq(progress.status, 'COMPLETED')
        )
      )
      .limit(1)
    isCompleted = !!lessonProgress
  }

  return {
    ...lesson,
    unit,
    flashcardSets: setsWithCards,
    isCompleted,
  }
}

export default async function LessonPage({ params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params
  const session = await auth()
  const lesson = await getLesson(lessonSlug, session?.user?.id)

  if (!lesson) {
    notFound()
  }

  const youtubeId = lesson.youtubeId || (lesson.khanUrl ? extractYouTubeId(lesson.khanUrl) : null)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/units" className="hover:text-foreground">
            Units
          </Link>
          <span>/</span>
          <Link href={`/units/${lesson.unit.slug}`} className="hover:text-foreground">
            {lesson.unit.title}
          </Link>
          <span>/</span>
          <span>{lesson.title}</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
        <p className="text-lg text-muted-foreground">{lesson.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Section */}
          {lesson.type === "VIDEO" && (youtubeId || lesson.khanUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Video Lesson
                </CardTitle>
              </CardHeader>
              <CardContent>
                {youtubeId ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={lesson.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : lesson.khanUrl ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <iframe
                      src={lesson.khanUrl}
                      title={lesson.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : null}
                {lesson.khanUrl && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    asChild
                  >
                    <a href={lesson.khanUrl} target="_blank" rel="noopener noreferrer">
                      Open on Khan Academy
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reading Section */}
          {lesson.type === "READING" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Reading Material
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">{lesson.description}</p>
                  {lesson.khanUrl && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      asChild
                    >
                      <a href={lesson.khanUrl} target="_blank" rel="noopener noreferrer">
                        Read Full Article
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Practice Section */}
          {lesson.type === "EXERCISE" && (
            <Card>
              <CardHeader>
                <CardTitle>Practice Problems</CardTitle>
                <CardDescription>
                  Work through practice problems to reinforce your understanding
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lesson.khanUrl ? (
                  <Button asChild>
                    <a href={lesson.khanUrl} target="_blank" rel="noopener noreferrer">
                      Start Practice
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <p className="text-muted-foreground">
                    Practice problems will be available soon.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Key Concepts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Key Concepts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Understand the core principles covered in this lesson</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Practice applying concepts through examples</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Review flashcards to reinforce learning</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session?.user?.id && (
                <div>
                  <CompleteLessonButton 
                    lessonId={lesson.id} 
                    isCompleted={lesson.isCompleted}
                  />
                </div>
              )}
              {lesson.duration && (
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{lesson.duration} minutes</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-semibold capitalize">{lesson.type.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit</p>
                <Link
                  href={`/units/${lesson.unit.slug}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {lesson.unit.title}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Flashcards */}
          {lesson.flashcardSets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Flashcards</CardTitle>
                <CardDescription>Review key terms and concepts</CardDescription>
              </CardHeader>
              <CardContent>
                {lesson.flashcardSets.map((set) => (
                  <Button
                    key={set.id}
                    variant="outline"
                    className="w-full mb-2"
                    asChild
                  >
                    <Link href={`/lessons/${lesson.slug}/flashcards/${set.id}`}>
                      {set.title}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
