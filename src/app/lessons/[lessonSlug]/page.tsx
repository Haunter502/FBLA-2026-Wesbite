import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { lessons, units, flashcardSets, flashcards, progress } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { extractYouTubeId } from "@/lib/utils"
import { Play, BookOpen, Lightbulb, ExternalLink } from "lucide-react"
import Link from "next/link"
import { eq, asc, and } from "@/lib/drizzle-helpers"
import { CompleteLessonButton } from "@/components/lessons/complete-lesson-button"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { ParticleBackground } from "@/components/animations/particle-background"
import { FadeInUp } from "@/components/animations/fade-in-up"
import { GlowEffect } from "@/components/animations/glow-effect"
import { AnimatedLessonHeader } from "@/components/lessons/animated-lesson-header"
import { AnimatedVideoCard } from "@/components/lessons/animated-video-card"
import { AnimatedLessonCard } from "@/components/lessons/animated-lesson-card"

function getKeyConcepts(title: string, type: string, unitTitle?: string): string[] {
  const titleLower = title.toLowerCase()
  const unitLower = (unitTitle || '').toLowerCase()
  
  if (titleLower.includes('introduction') || titleLower.includes('intro')) {
    if (unitLower.includes('linear') && (unitLower.includes('equation') || unitLower.includes('inequalit'))) {
      return [
        'Learn what linear equations and inequalities are and how they differ from other equation types',
        'Understand the standard forms: ax + b = 0 for equations and ax + b < 0 for inequalities',
        'Master key terminology: variables, constants, coefficients, solution sets, and equivalent equations'
      ]
    } else if (unitLower.includes('system')) {
      return [
        'Understand that systems of equations involve multiple equations with the same variables',
        'Learn to identify when a system has one solution, no solution, or infinitely many solutions',
        'Master the concept of finding the point(s) where equations intersect or share common solutions'
      ]
    } else if (unitLower.includes('polynomial')) {
      return [
        'Learn what polynomials are: expressions with variables raised to whole number powers',
        'Understand polynomial terminology: terms, coefficients, degree, leading coefficient, and standard form',
        'Master how to identify and classify polynomials by degree (constant, linear, quadratic, cubic, etc.)'
      ]
    } else if (unitLower.includes('quadratic')) {
      return [
        'Understand that quadratic equations have the form ax² + bx + c = 0 where a ≠ 0',
        'Learn the key features: vertex, axis of symmetry, roots, and the parabolic shape of graphs',
        'Master the relationship between quadratic equations and their graphical representations'
      ]
    } else if (unitLower.includes('function')) {
      return [
        'Learn that a function is a special relationship where each input has exactly one output',
        'Understand function notation f(x) and how to evaluate functions for specific values',
        'Master the concepts of domain (inputs) and range (outputs) and how to identify them'
      ]
    } else {
      return [
        `Learn the fundamental definition and structure of ${unitTitle || 'this topic'}`,
        'Understand how to identify and classify different types of problems and their properties',
        'Master the basic terminology and notation used throughout the unit'
      ]
    }
  } else if (titleLower.includes('fundamental') || titleLower.includes('concept')) {
    if (unitLower.includes('linear') && (unitLower.includes('equation') || unitLower.includes('inequalit'))) {
      return [
        'Explore the properties of equality and inequality that allow us to manipulate equations safely',
        'Develop deep understanding of inverse operations: addition/subtraction and multiplication/division pairs',
        'Learn how the distributive property, combining like terms, and clearing fractions apply to solving equations'
      ]
    } else if (unitLower.includes('system')) {
      return [
        'Explore how systems can be solved by finding where graphs intersect (graphing method)',
        'Develop understanding of substitution: solving one equation for a variable and replacing it in another',
        'Learn elimination: adding or subtracting equations to cancel variables and solve step by step'
      ]
    } else {
      return [
        'Explore the core principles that form the foundation of this mathematical topic',
        'Develop a deep understanding of essential mathematical relationships and their applications',
        'Learn how these fundamental concepts connect to real-world problem solving and mathematical reasoning'
      ]
    }
  } else if (titleLower.includes('example') || titleLower.includes('worked')) {
    if (unitLower.includes('linear') && (unitLower.includes('equation') || unitLower.includes('inequalit'))) {
      return [
        'Follow detailed step-by-step solutions for equations with variables on both sides',
        'Learn strategies for handling equations with fractions: clearing denominators using LCD',
        'Practice solving multi-step equations by systematically applying inverse operations in the correct order'
      ]
    } else if (unitLower.includes('system')) {
      return [
        'Follow step-by-step solutions using substitution method: isolate, substitute, solve, and check',
        'Learn elimination method techniques: aligning variables, multiplying equations, and eliminating systematically',
        'Practice identifying which method (graphing, substitution, elimination) works best for different problem types'
      ]
    } else {
      return [
        'Follow step-by-step solutions to common problem types with detailed explanations',
        'Learn problem-solving strategies and techniques that can be applied to similar problems',
        'Practice identifying which methods and approaches to apply in different mathematical scenarios'
      ]
    }
  } else if (titleLower.includes('advanced') || titleLower.includes('technique')) {
    if (unitLower.includes('linear') && (unitLower.includes('equation') || unitLower.includes('inequalit'))) {
      return [
        'Master solving equations with unknown coefficients and parameters (letters instead of numbers)',
        'Learn to identify and handle special cases: no solution (contradiction) and infinite solutions (identity)',
        'Develop skills for solving complex equations with multiple variables, fractions, and decimals'
      ]
    } else {
      return [
        'Master advanced problem-solving techniques and strategies for complex scenarios',
        'Learn to handle complex problems with multiple variables, unknown coefficients, and constraints',
        'Develop skills for solving problems with parameters and understanding different solution types'
      ]
    }
  } else if (titleLower.includes('application') || titleLower.includes('real-world') || titleLower.includes('real world')) {
    if (unitLower.includes('linear') && (unitLower.includes('equation') || unitLower.includes('inequalit'))) {
      return [
        'Connect linear equations to real scenarios: cost analysis, distance-rate-time problems, and budgeting',
        'Learn to model situations with inequalities: constraints, limits, and "at least" or "at most" scenarios',
        'Practice interpreting solutions in context: checking reasonableness and understanding what answers mean'
      ]
    } else {
      return [
        'Connect mathematical concepts to real-world situations, problems, and applications',
        'Learn to model real scenarios using mathematical equations and functions effectively',
        'Practice interpreting solutions in context, validating results, and understanding their practical meaning'
      ]
    }
  } else if (titleLower.includes('review')) {
    return [
      'Review and consolidate all key concepts, methods, and techniques from this unit',
      'Identify connections between different topics, methods, and problem-solving approaches',
      'Prepare for assessments by reinforcing your understanding and practicing comprehensive problem-solving'
    ]
  } else {
    return [
      'Understand the core principles and methods covered in this lesson',
      'Practice applying concepts through worked examples and interactive exercises',
      'Build confidence by mastering the essential skills and techniques needed for success'
    ]
  }
}

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
    sets.map(async (set: typeof sets[0]) => {
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced background theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <ParticleBackground count={20} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <FadeInUp delay={0.1}>
          <AnimatedLessonHeader
            unitTitle={lesson.unit.title}
            unitSlug={lesson.unit.slug}
            lessonTitle={lesson.title}
            description={lesson.description}
          />
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Video Section */}
            {lesson.type === "VIDEO" && (youtubeId || lesson.khanUrl) && (
              <FadeInUp delay={0.2}>
                <AnimatedVideoCard
                  title={lesson.title}
                  youtubeId={youtubeId}
                  khanUrl={lesson.khanUrl}
                />
              </FadeInUp>
            )}

            {/* Reading Section */}
            {lesson.type === "READING" && (
              <FadeInUp delay={0.2}>
                <GlowEffect intensity="low">
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
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
              </GlowEffect>
            </FadeInUp>
          )}

          {/* Practice Section */}
          {lesson.type === "EXERCISE" && (
            <FadeInUp delay={0.2}>
              <GlowEffect intensity="low">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
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
              </GlowEffect>
            </FadeInUp>
          )}

          {/* Key Concepts */}
          <FadeInUp delay={0.3}>
            <GlowEffect intensity="low">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Key Concepts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {getKeyConcepts(lesson.title, lesson.type, lesson.unit.title).map((concept, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          </GlowEffect>
        </FadeInUp>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FadeInUp delay={0.4}>
              <GlowEffect intensity="low">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
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
            </GlowEffect>
          </FadeInUp>

          {/* Flashcards */}
          {lesson.flashcardSets.length > 0 && (
            <FadeInUp delay={0.5}>
              <GlowEffect intensity="low">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader>
                <CardTitle>Flashcards</CardTitle>
                <CardDescription>Review key terms and concepts</CardDescription>
              </CardHeader>
              <CardContent>
                {lesson.flashcardSets.map((set: typeof lesson.flashcardSets[0]) => (
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
              </GlowEffect>
            </FadeInUp>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
