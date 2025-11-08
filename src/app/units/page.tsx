import { db } from "@/lib/db"
import { units, lessons } from "../../../drizzle/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { eq, asc } from "@/lib/drizzle-helpers"

async function getUnits() {
  const allUnits = await db.select().from(units).orderBy(asc(units.order))

  const unitsWithLessons = await Promise.all(
    allUnits.map(async (unit) => {
      const unitLessons = await db
        .select({ id: lessons.id, duration: lessons.duration })
        .from(lessons)
        .where(eq(lessons.unitId, unit.id))

      return {
        ...unit,
        totalLessons: unitLessons.length,
        totalDuration: unitLessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0),
      }
    })
  )

  return unitsWithLessons
}

export default async function UnitsPage() {
  const units = await getUnits()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Algebra 1 Units</h1>
        <p className="text-muted-foreground">
          Explore all 14 comprehensive units covering the complete Algebra 1 curriculum
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <Link key={unit.id} href={`/units/${unit.slug}`}>
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-primary">
                    Unit {unit.order}
                  </span>
                </div>
                <CardTitle className="text-xl">{unit.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {unit.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{unit.totalLessons} lessons</span>
                  </div>
                  {unit.totalDuration > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{Math.round(unit.totalDuration / 60)}h</span>
                    </div>
                  )}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View Unit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
