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
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/resources" className="hover:text-foreground transition-colors">
              Resources
            </Link>
            <span>/</span>
            <span>Flashcards</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Flashcards</h1>
          <p className="text-muted-foreground">
            Review key terms and concepts with interactive flashcards
          </p>
        </div>
      </ScrollReveal>

      {flashcardSetsList.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No flashcards available</h3>
              <p className="text-muted-foreground">
                Flashcards will be added soon. Check back later!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSetsList.map((set: typeof flashcardSetsList[0]) => {
            const href = set.lesson
              ? `/lessons/${set.lesson.slug}/flashcards/${set.id}`
              : set.unit
              ? `/units/${set.unit.slug}/flashcards/${set.id}`
              : `/resources/flashcards/${set.id}`
            
            return (
              <StaggerItem key={set.id}>
                <AnimatedResourceCard>
                  <Card className="h-full">
                    <CardHeader>
                      <Layers className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">{set.title}</CardTitle>
                      <CardDescription>
                        {set.description || 'Review key terms and concepts'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {set.lesson && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Lesson: </span>
                            <Link 
                              href={`/lessons/${set.lesson.slug}`}
                              className="text-primary hover:underline"
                            >
                              {set.lesson.title}
                            </Link>
                          </div>
                        )}
                        {set.unit && !set.lesson && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Unit: </span>
                            <Link 
                              href={`/units/${set.unit.slug}`}
                              className="text-primary hover:underline"
                            >
                              {set.unit.title}
                            </Link>
                          </div>
                        )}
                        <Link href={href} className="flex-1">
                          <Button className="w-full" variant="default">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Study Flashcards
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

