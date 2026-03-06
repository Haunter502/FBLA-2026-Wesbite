import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { units, lessons, skills } from "@/lib/schema"
import { or, eq, like, sql } from "@/lib/drizzle-helpers"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] }, { status: 200 })
    }

    // For SQLite, we'll search case-insensitively by using LIKE with a pattern
    // SQLite's LIKE is case-insensitive for ASCII characters by default
    const searchTerm = `%${query.trim()}%`

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
            like(units.title, searchTerm),
            like(units.description, searchTerm)
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
        .leftJoin(units, eq(lessons.unitId, units.id))
        .where(
          or(
            like(lessons.title, searchTerm),
            like(lessons.description, searchTerm)
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
        .leftJoin(units, eq(skills.unitId, units.id))
        .where(
          or(
            like(skills.name, searchTerm),
            like(skills.description, searchTerm)
          )
        )
        .limit(10),
    ])

    const results = [
      ...foundUnits.map((unit: typeof foundUnits[0]) => ({
        id: unit.id,
        type: "unit" as const,
        title: unit.title,
        description: unit.description,
        href: `/units/${unit.slug}`,
      })),
      ...foundLessons.map((lesson: typeof foundLessons[0]) => ({
        id: lesson.id,
        type: "lesson" as const,
        title: lesson.title,
        description: lesson.description,
        href: `/lessons/${lesson.slug}`,
      })),
      ...foundSkills.map((skill: typeof foundSkills[0]) => ({
        id: skill.id,
        type: "skill" as const,
        title: skill.name,
        description: skill.description || `Skill in ${skill.unitSlug}`,
        href: `/units/${skill.unitSlug}`,
      })),
    ]

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { results: [], error: "An error occurred while searching" },
      { status: 500 }
    )
  }
}
