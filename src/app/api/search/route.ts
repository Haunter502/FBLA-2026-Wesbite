import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { units, lessons, skills } from "../../../../drizzle/schema"
import { like, or, sql } from "@/lib/drizzle-helpers"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] })
  }

  const searchTerm = `%${query.toLowerCase().trim()}%`

  const [foundUnits, foundLessons, foundSkills] = await Promise.all([
    db
      .select({
        id: units.id,
        title: units.title,
        description: units.description,
        slug: units.slug,
      })
      .from(units)
      .where(
        or(
          sql`lower(${units.title}) like ${searchTerm}`,
          sql`lower(${units.description}) like ${searchTerm}`
        )
      )
      .limit(10),
    db
      .select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        slug: lessons.slug,
        unitSlug: units.slug,
      })
      .from(lessons)
      .leftJoin(units, sql`${lessons.unitId} = ${units.id}`)
      .where(
        or(
          sql`lower(${lessons.title}) like ${searchTerm}`,
          sql`lower(${lessons.description}) like ${searchTerm}`
        )
      )
      .limit(10),
    db
      .select({
        id: skills.id,
        name: skills.name,
        description: skills.description,
        slug: skills.slug,
        unitSlug: units.slug,
      })
      .from(skills)
      .leftJoin(units, sql`${skills.unitId} = ${units.id}`)
      .where(
        or(
          sql`lower(${skills.name}) like ${searchTerm}`,
          sql`lower(${skills.description}) like ${searchTerm}`
        )
      )
      .limit(10),
  ])

  const results = [
    ...foundUnits.map((unit) => ({
      id: unit.id,
      type: "unit" as const,
      title: unit.title,
      description: unit.description,
      href: `/units/${unit.slug}`,
    })),
    ...foundLessons.map((lesson) => ({
      id: lesson.id,
      type: "lesson" as const,
      title: lesson.title,
      description: lesson.description,
      href: `/lessons/${lesson.slug}`,
    })),
    ...foundSkills.map((skill) => ({
      id: skill.id,
      type: "skill" as const,
      title: skill.name,
      description: skill.description || `Skill in ${skill.unitSlug}`,
      href: `/units/${skill.unitSlug}`,
    })),
  ]

  return NextResponse.json({ results })
}
