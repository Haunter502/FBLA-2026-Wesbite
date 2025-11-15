import { db } from "@/lib/db"
import { teachers } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Clock } from "lucide-react"
import { asc } from "@/lib/drizzle-helpers"

async function getTeachers() {
  return await db.select().from(teachers).orderBy(asc(teachers.name))
}

export default async function TeachersPage() {
  const teachers = await getTeachers()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Our Teachers</h1>
        <p className="text-muted-foreground">
          Meet our experienced Algebra 1 instructors ready to help you succeed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher: typeof teachers[0]) => (
          <Card key={teacher.id}>
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                  {teacher.name.charAt(0)}
                </div>
                <div>
                  <CardTitle>{teacher.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">{teacher.bio}</CardDescription>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{teacher.email}</span>
                </div>
                {teacher.officeHours && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 mt-0.5" />
                    <span>{teacher.officeHours}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
