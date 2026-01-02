import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tutoringRequests, contacts, users } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, HelpCircle, Mail, Clock, Zap, Calendar } from "lucide-react"
import { eq, desc } from "@/lib/drizzle-helpers"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { AdminSubmissionsClient } from "@/components/admin/submissions-client"
import { GlassCard } from "@/components/animations/glass-card"
import { GlowEffect } from "@/components/animations/glow-effect"

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

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <GlowEffect intensity="low">
          <GlassCard className="backdrop-blur-xl border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Immediate Help
                </CardTitle>
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Zap className="h-4 w-4 text-orange-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{immediateRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                {unreadRequests.filter((r: { type: string }) => r.type === 'IMMEDIATE').length > 0 ? (
                  <span className="text-orange-500 font-semibold">
                    {unreadRequests.filter((r: { type: string }) => r.type === 'IMMEDIATE').length} urgent
                  </span>
                ) : (
                  'All handled'
                )}
              </p>
            </CardContent>
          </GlassCard>
        </GlowEffect>

        <GlowEffect intensity="low">
          <GlassCard className="backdrop-blur-xl border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Contact Forms
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{contactSubmissions.length}</div>
              <p className="text-xs text-muted-foreground">
                {unreadContacts.length > 0 ? (
                  <span className="text-blue-500 font-semibold">
                    {unreadContacts.length} unread
                  </span>
                ) : (
                  'All read'
                )}
              </p>
            </CardContent>
          </GlassCard>
        </GlowEffect>

        <GlowEffect intensity="low">
          <GlassCard className="backdrop-blur-xl border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Scheduled Sessions
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/20">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{scheduledRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                {scheduledRequests.filter((r: { status: string }) => r.status === 'PENDING').length > 0 ? (
                  <span className="text-orange-500 font-semibold">
                    {scheduledRequests.filter((r: { status: string }) => r.status === 'PENDING').length} pending
                  </span>
                ) : (
                  'All scheduled'
                )}
              </p>
            </CardContent>
          </GlassCard>
        </GlowEffect>

        <GlowEffect intensity="low">
          <GlassCard className="backdrop-blur-xl border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Requests
                </CardTitle>
                <div className="p-2 rounded-lg bg-secondary/20">
                  <MessageSquare className="h-4 w-4 text-secondary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{tutoringRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                {unreadRequests.length > 0 ? (
                  <span className="text-orange-500 font-semibold">
                    {unreadRequests.length} need attention
                  </span>
                ) : (
                  'All handled'
                )}
              </p>
            </CardContent>
          </GlassCard>
        </GlowEffect>
      </div>

      <AdminSubmissionsClient 
        tutoringRequests={tutoringRequests}
        contactSubmissions={contactSubmissions}
      />
    </div>
  )
}

