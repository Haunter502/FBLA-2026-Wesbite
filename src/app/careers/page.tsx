import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, GraduationCap, Calculator, TrendingUp } from "lucide-react"

const careers = [
  {
    title: "Data Analyst",
    icon: TrendingUp,
    description: "Use algebraic skills to analyze data and make informed business decisions.",
    skills: ["Statistics", "Algebra", "Data Visualization"],
  },
  {
    title: "Engineer",
    icon: Calculator,
    description: "Apply mathematical principles to design and solve complex problems.",
    skills: ["Problem Solving", "Algebra", "Calculus"],
  },
  {
    title: "Actuary",
    icon: Briefcase,
    description: "Use mathematics to assess risk and uncertainty in insurance and finance.",
    skills: ["Statistics", "Probability", "Algebra"],
  },
  {
    title: "Teacher",
    icon: GraduationCap,
    description: "Share your passion for mathematics and help students succeed.",
    skills: ["Communication", "Algebra", "Education"],
  },
]

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Math Careers</h1>
        <p className="text-muted-foreground">
          Discover exciting career paths that use Algebra 1 skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careers.map((career) => {
          const Icon = career.icon
          return (
            <Card key={career.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {career.title}
                </CardTitle>
                <CardDescription>{career.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Key Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {career.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-muted rounded-md text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
