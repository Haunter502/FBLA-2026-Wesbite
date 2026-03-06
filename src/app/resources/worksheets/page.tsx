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
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/resources" className="hover:text-foreground transition-colors">
              Resources
            </Link>
            <span>/</span>
            <span>Worksheets</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Worksheets</h1>
          <p className="text-lg text-muted-foreground">
            Download printable worksheets and practice problems to reinforce your learning
          </p>
        </div>
      </ScrollReveal>

      {worksheetsList.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No worksheets available</h3>
              <p className="text-muted-foreground">
                Worksheets will be added soon. Check back later!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worksheetsList.map((worksheet: typeof worksheetsList[0]) => (
            <StaggerItem key={worksheet.id}>
              <AnimatedResourceCard>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                      {worksheet.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          worksheet.difficulty === 'Easy' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : worksheet.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {worksheet.difficulty}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{worksheet.title}</CardTitle>
                    <CardDescription>
                      {worksheet.description || 'Practice problems and exercises'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {worksheet.unit && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Unit: </span>
                          <Link 
                            href={`/units/${worksheet.unit.slug}`}
                            className="text-primary hover:underline"
                          >
                            {worksheet.unit.title}
                          </Link>
                        </div>
                      )}
                      {worksheet.estimatedTime && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>~{worksheet.estimatedTime} min</span>
                        </div>
                      )}
                      {worksheet.fileUrl ? (
                        <a
                          href={worksheet.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                        </a>
                      ) : (
                        <Button disabled className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      )}
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



