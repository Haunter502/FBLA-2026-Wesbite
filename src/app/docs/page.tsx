import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileText, BookOpen, Presentation } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Documentation</h1>
        <p className="text-muted-foreground">
          Project documentation and resources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/docs/rubric">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Rubric Checklist
              </CardTitle>
              <CardDescription>
                FBLA rubric requirements mapped to implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detailed mapping of each rubric requirement to code locations and features.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Presentation className="h-5 w-5" />
              Demo Script
            </CardTitle>
            <CardDescription>
              2-minute presentation outline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Step-by-step guide for presenting Numera to judges, including key talking points and anticipated questions.
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Student Handbook
            </CardTitle>
            <CardDescription>
              Guide for using Numera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comprehensive guide for students on how to use all features of the platform.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
