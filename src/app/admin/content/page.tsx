import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { lessons, quizzes, tests, units } from "@/lib/schema"
import { eq, asc } from "@/lib/drizzle-helpers"
import { ContentManagementClient } from "@/components/admin/content-management-client"

async function getUnits() {
  return await db.select().from(units).orderBy(asc(units.order))
}

async function getLessons() {
  return await db.select().from(lessons).orderBy(asc(lessons.order))
}

async function getQuizzes() {
  return await db.select().from(quizzes)
}

async function getTests() {
  return await db.select().from(tests)
}

export default async function AdminContentPage() {
  const session = await auth()

  // Only allow admins and teachers
  if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    redirect("/")
  }

  const [unitsData, lessonsData, quizzesData, testsData] = await Promise.all([
    getUnits(),
    getLessons(),
    getQuizzes(),
    getTests(),
  ])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Content Management</h1>
        <p className="text-muted-foreground text-lg">
          Manage lessons, quizzes, and tests
        </p>
      </div>

      <ContentManagementClient
        units={unitsData}
        lessons={lessonsData}
        quizzes={quizzesData}
        tests={testsData}
      />
    </div>
  )
}



