import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, ExternalLink, BookOpen, Video } from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Resources</h1>
        <p className="text-muted-foreground">
          Access worksheets, study guides, and helpful materials to support your learning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Worksheets
            </CardTitle>
            <CardDescription>Practice problems and exercises</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Download printable worksheets for extra practice
            </p>
            <button className="text-sm text-primary hover:underline">
              Browse Worksheets
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Study Guides
            </CardTitle>
            <CardDescription>Comprehensive review materials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access study guides for each unit
            </p>
            <button className="text-sm text-primary hover:underline">
              View Study Guides
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Resources
            </CardTitle>
            <CardDescription>Additional video content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Explore supplementary video lessons
            </p>
            <button className="text-sm text-primary hover:underline">
              Watch Videos
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
