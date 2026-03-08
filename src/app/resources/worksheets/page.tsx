import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { worksheets, units } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Clock, AlertCircle } from "lucide-react"
import { eq, asc } from "@/lib/drizzle-helpers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { AnimatedResourceCard } from "@/components/resources/animated-resource-card"

async function getWorksheets() {
  const allWorksheets = await db
    .select({
      id: worksheets.id,
      title: worksheets.title,
      description: worksheets.description,
      fileUrl: worksheets.fileUrl,
      difficulty: worksheets.difficulty,
      estimatedTime: worksheets.estimatedTime,
      unitId: worksheets.unitId,
      unit: {
        id: units.id,
        title: units.title,
        slug: units.slug,
      },
    })
    .from(worksheets)
    .leftJoin(units, eq(worksheets.unitId, units.id))
    .orderBy(asc(worksheets.createdAt))

  return allWorksheets
}

export default async function WorksheetsPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/auth/sign-in")
  }

  const worksheetsList = await getWorksheets()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/resources" className="hover:text-foreground transition-colors">
              Resources
            </Link>
            <span>/</span>
            <span className="text-foreground">Worksheets</span>
          </div>
          <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-emerald-500/5 px-6 py-5 shadow-sm">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
              Targeted practice, one page at a time
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Download clean, classroom-ready worksheets grouped by unit. Great for quick warm‑ups,
              homework, or focused review before a quiz.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {worksheetsList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-10 pb-12">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No worksheets available yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                We&apos;re designing printable practice sets for each unit. Check back soon for a
                growing library of Algebra 1 worksheets.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {worksheetsList.map((worksheet: typeof worksheetsList[0]) => (
            <StaggerItem key={worksheet.id}>
              <AnimatedResourceCard>
                <Card className="h-full border border-primary/10 bg-gradient-to-b from-primary/5 via-background to-background/80 hover:border-primary/40 hover:shadow-lg transition-all">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary p-2">
                        <FileText className="h-5 w-5" />
                      </div>
                      {worksheet.difficulty && (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            worksheet.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : worksheet.difficulty === "Medium"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {worksheet.difficulty} practice
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base md:text-lg line-clamp-2">{worksheet.title}</CardTitle>
                    <CardDescription className="text-xs md:text-sm line-clamp-3">
                      {worksheet.description || "Practice problems and exercises"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-3 text-xs md:text-sm">
                      {worksheet.unit && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-muted-foreground">Unit:</span>
                          <Link
                            href={`/units/${worksheet.unit.slug}`}
                            className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-muted/80 transition-colors"
                          >
                            {worksheet.unit.title}
                          </Link>
                        </div>
                      )}
                      {worksheet.estimatedTime && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>~{worksheet.estimatedTime} min to complete</span>
                        </div>
                      )}
                      <div className="pt-1">
                        {worksheet.fileUrl ? (
                          <a
                            href={worksheet.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button className="w-full justify-center text-sm">
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </Button>
                          </a>
                        ) : (
                          <Button disabled className="w-full justify-center text-sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Coming soon
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedResourceCard>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  )
}



