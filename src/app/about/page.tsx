import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, BookOpen } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">About Numera</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive learning hub for Algebra 1, created by students, for students
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              To make Algebra 1 learning engaging, collaborative, and accessible for all students.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Peer-to-Peer Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              We believe in the power of collaborative learning and peer support.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Comprehensive Curriculum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              14 units covering all essential Algebra 1 topics with interactive content.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Our Approach</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Numera is designed to support students at every stage of their Algebra 1 journey.
            We combine video lessons, interactive exercises, quizzes, and live tutoring to
            create a comprehensive learning experience.
          </p>
          <p className="text-muted-foreground">
            Our platform tracks your progress, celebrates your achievements, and provides
            personalized recommendations to help you learn at your own pace.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
