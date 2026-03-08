import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { flashcardSets, lessons, units } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, BookOpen, AlertCircle } from "lucide-react"
import { eq, asc } from "@/lib/drizzle-helpers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { AnimatedResourceCard } from "@/components/resources/animated-resource-card"

async function getFlashcardSets() {
  const allFlashcardSets = await db
    .select({
      id: flashcardSets.id,
      title: flashcardSets.title,
      description: flashcardSets.description,
      lessonId: flashcardSets.lessonId,
      unitId: flashcardSets.unitId,
      lesson: {
        id: lessons.id,
        slug: lessons.slug,
        title: lessons.title,
      },
      unit: {
        id: units.id,
        slug: units.slug,
        title: units.title,
      },
    })
    .from(flashcardSets)
    .leftJoin(lessons, eq(flashcardSets.lessonId, lessons.id))
    .leftJoin(units, eq(flashcardSets.unitId, units.id))
    .orderBy(asc(flashcardSets.createdAt))

  return allFlashcardSets
}

export default async function FlashcardsPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/auth/sign-in")
  }

  const flashcardSetsList = await getFlashcardSets()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/resources" className="hover:text-foreground transition-colors">
              Resources
            </Link>
            <span>/</span>
            <span className="text-foreground">Flashcards</span>
          </div>
          <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-emerald-500/5 px-6 py-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
                Smart review, one card at a time
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                Work through curated key‑term decks for each unit, then quickly loop back to the
                cards you marked Again.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {flashcardSetsList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-10 pb-12">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No flashcard sets available yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                We&apos;re building card decks for each unit so you can review definitions and
                examples quickly.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {flashcardSetsList.map((set: typeof flashcardSetsList[0]) => {
            const href = `/resources/flashcards/${set.id}`
            return (
              <StaggerItem key={set.id}>
                <AnimatedResourceCard>
                  <Card className="h-full border border-primary/10 bg-gradient-to-b from-primary/5 via-background to-background/80 hover:border-primary/40 hover:shadow-lg transition-all">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary p-2">
                          <Layers className="h-5 w-5" />
                        </div>
                        {set.unit && (
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                            {set.unit.title}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-base md:text-lg line-clamp-2">{set.title}</CardTitle>
                      <CardDescription className="text-xs md:text-sm line-clamp-3">
                        {set.description || "Review key terms and concepts"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <div className="space-y-3 text-xs md:text-sm">
                        {set.lesson && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-muted-foreground">Lesson:</span>
                            <Link
                              href={`/lessons/${set.lesson.slug}`}
                              className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-muted/80 transition-colors"
                            >
                              {set.lesson.title}
                            </Link>
                          </div>
                        )}
                        {set.unit && !set.lesson && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-muted-foreground">Unit:</span>
                            <Link
                              href={`/units/${set.unit.slug}`}
                              className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-muted/80 transition-colors"
                            >
                              {set.unit.title}
                            </Link>
                          </div>
                        )}
                        <Link href={href} className="flex-1 block pt-1">
                          <Button className="w-full justify-center text-sm" variant="default">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Study flashcards
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedResourceCard>
              </StaggerItem>
            )
          })}
        </StaggerChildren>
      )}
    </div>
  )
}

