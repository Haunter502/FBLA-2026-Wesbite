import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tutoringRequests, contacts, users } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, HelpCircle, Mail, Clock } from "lucide-react"
import { eq, desc } from "@/lib/drizzle-helpers"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { AdminSubmissionsClient } from "@/components/admin/submissions-client"

async function getTutoringRequests() {
  const requests = await db
    .select({
      id: tutoringRequests.id,
      type: tutoringRequests.type,
      topic: tutoringRequests.topic,
      status: tutoringRequests.status,
      createdAt: tutoringRequests.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(tutoringRequests)
    .leftJoin(users, eq(tutoringRequests.userId, users.id))
    .orderBy(desc(tutoringRequests.createdAt))

  return requests
}

async function getContactSubmissions() {
  const submissions = await db
    .select()
    .from(contacts)
    .orderBy(desc(contacts.createdAt))

  return submissions
}

export default async function AdminSubmissionsPage() {
  const session = await auth()

  // Only allow admins and teachers
  if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    redirect("/")
  }

  const [tutoringRequests, contactSubmissions] = await Promise.all([
    getTutoringRequests(),
    getContactSubmissions(),
  ])

  const immediateRequests = tutoringRequests.filter((r: { type: string }) => r.type === 'IMMEDIATE')
  const scheduledRequests = tutoringRequests.filter((r: { type: string }) => r.type === 'SCHEDULED')
  const unreadContacts = contactSubmissions.filter((c: { read: boolean }) => !c.read)
  const unreadRequests = tutoringRequests.filter((r: { status: string }) => r.status === 'PENDING')

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            View and manage tutoring requests and contact form submissions
          </p>
        </div>
      </ScrollReveal>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Immediate Help Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{immediateRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadRequests.filter((r: { type: string }) => r.type === 'IMMEDIATE').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contact Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactSubmissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadContacts.length} unread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {scheduledRequests.filter((r: { status: string }) => r.status === 'PENDING').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tutoringRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadRequests.length} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <AdminSubmissionsClient 
        tutoringRequests={tutoringRequests}
        contactSubmissions={contactSubmissions}
      />
    </div>
  )
}

