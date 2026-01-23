import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tutoringRequests, contacts, users, teachers, tutoringSlots } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, HelpCircle, Mail, Clock, Zap, Calendar } from "lucide-react"
import { eq, desc, inArray } from "@/lib/drizzle-helpers"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { AdminSubmissionsClient } from "@/components/admin/submissions-client"
import { GlassCard } from "@/components/animations/glass-card"
import { GlowEffect } from "@/components/animations/glow-effect"

async function getTutoringRequests() {
  // First get all requests with user info
  const requests = await db
    .select({
      id: tutoringRequests.id,
      type: tutoringRequests.type,
      topic: tutoringRequests.topic,
      status: tutoringRequests.status,
      matchedTeacherId: tutoringRequests.matchedTeacherId,
      matchedSlotId: tutoringRequests.matchedSlotId,
      scheduledSlotId: tutoringRequests.scheduledSlotId,
      matchStatus: tutoringRequests.matchStatus,
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

  // Then fetch matched teachers and slots separately
  const teacherIds = [...new Set(requests.map(r => r.matchedTeacherId).filter(Boolean) as string[])]
  const slotIds = [...new Set(requests.map(r => r.matchedSlotId).filter(Boolean) as string[])]
  const scheduledSlotIds = [...new Set(requests.map(r => r.scheduledSlotId).filter(Boolean) as string[])]

  const matchedTeachers = teacherIds.length > 0
    ? await db
        .select({
          id: teachers.id,
          name: teachers.name,
          email: teachers.email,
        })
        .from(teachers)
        .where(inArray(teachers.id, teacherIds))
    : []

  const matchedSlots = slotIds.length > 0
    ? await db
        .select({
          id: tutoringSlots.id,
          start: tutoringSlots.start,
          end: tutoringSlots.end,
          teacherId: tutoringSlots.teacherId,
        })
        .from(tutoringSlots)
        .where(inArray(tutoringSlots.id, slotIds))
    : []

  const scheduledSlots = scheduledSlotIds.length > 0
    ? await db
        .select({
          id: tutoringSlots.id,
          start: tutoringSlots.start,
          end: tutoringSlots.end,
          teacherId: tutoringSlots.teacherId,
        })
        .from(tutoringSlots)
        .where(inArray(tutoringSlots.id, scheduledSlotIds))
    : []

  // Get slot teachers (for both matched and scheduled slots)
  const allSlotIds = [...slotIds, ...scheduledSlotIds]
  const allSlots = [...matchedSlots, ...scheduledSlots]
  const slotTeacherIds = [...new Set(allSlots.map(s => s.teacherId).filter(Boolean) as string[])]
  const slotTeachers = slotTeacherIds.length > 0
    ? await db
        .select({
          id: teachers.id,
          name: teachers.name,
        })
        .from(teachers)
        .where(inArray(teachers.id, slotTeacherIds))
    : []

  // Helper function to normalize timestamps to Unix seconds
  const normalizeTimestamp = (ts: number | Date): number => {
    if (typeof ts === 'number') {
      // If it's already in seconds (less than year 2286), return as is
      // If it's in milliseconds (greater than that), convert to seconds
      return ts < 10000000000 ? ts : Math.floor(ts / 1000)
    }
    // If it's a Date object, convert to Unix seconds
    return Math.floor(new Date(ts).getTime() / 1000)
  }

  // Combine the data
  return requests.map(request => ({
    ...request,
    matchedTeacher: request.matchedTeacherId
      ? matchedTeachers.find(t => t.id === request.matchedTeacherId) || null
      : null,
    matchedSlot: request.matchedSlotId
      ? (() => {
          const slot = matchedSlots.find(s => s.id === request.matchedSlotId)
          if (!slot) return null
          const teacher = slotTeachers.find(t => t.id === slot.teacherId)
          return {
            id: slot.id,
            start: normalizeTimestamp(slot.start),
            end: normalizeTimestamp(slot.end),
            teacher: teacher ? { name: teacher.name } : null,
          }
        })()
      : null,
    scheduledSlot: request.scheduledSlotId
      ? (() => {
          const slot = scheduledSlots.find(s => s.id === request.scheduledSlotId)
          if (!slot) return null
          const teacher = slotTeachers.find(t => t.id === slot.teacherId)
          return {
            id: slot.id,
            start: normalizeTimestamp(slot.start),
            end: normalizeTimestamp(slot.end),
            teacher: teacher ? { name: teacher.name } : null,
          }
        })()
      : null,
  }))
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <ScrollReveal>
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/30">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                  View and manage tutoring requests and contact form submissions
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 items-end">
        <GlowEffect intensity="medium" className="h-full">
          <GlassCard className="backdrop-blur-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-background/50 to-background hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 group h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Immediate Help
                </CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
                {immediateRequests.length}
              </div>
              <p className="text-xs font-medium">
                {unreadRequests.filter((r: { type: string }) => r.type === 'IMMEDIATE').length > 0 ? (
                  <span className="text-orange-500 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
                    {unreadRequests.filter((r: { type: string }) => r.type === 'IMMEDIATE').length} urgent
                  </span>
                ) : (
                  <span className="text-green-500 font-semibold">All handled</span>
                )}
              </p>
            </CardContent>
          </GlassCard>
        </GlowEffect>

        <GlowEffect intensity="medium" className="h-full">
          <GlassCard className="backdrop-blur-xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-background/50 to-background hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Contact Forms
                </CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-2">
                {contactSubmissions.length}
              </div>
              <p className="text-xs font-medium">
                {unreadContacts.length > 0 ? (
                  <span className="text-blue-500 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                    {unreadContacts.length} unread
                  </span>
                ) : (
                  <span className="text-green-500 font-semibold">All read</span>
                )}
              </p>
            </CardContent>
          </GlassCard>
        </GlowEffect>

        <GlowEffect intensity="medium" className="h-full">
          <GlassCard className="backdrop-blur-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background/50 to-background hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Scheduled Sessions
                </CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-primary/20 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
                {scheduledRequests.length}
              </div>
              <p className="text-xs font-medium">
                {scheduledRequests.filter((r: { status: string }) => r.status === 'PENDING').length > 0 ? (
                  <span className="text-orange-500 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
                    {scheduledRequests.filter((r: { status: string }) => r.status === 'PENDING').length} pending
                  </span>
                ) : (
                  <span className="text-green-500 font-semibold">All scheduled</span>
                )}
              </p>
            </CardContent>
          </GlassCard>
        </GlowEffect>

        <GlowEffect intensity="medium" className="h-full">
          <GlassCard className="backdrop-blur-xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 via-background/50 to-background hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20 group h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Requests
                </CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/20 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="text-4xl font-bold bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent mb-2">
                {tutoringRequests.length}
              </div>
              <p className="text-xs font-medium">
                {unreadRequests.length > 0 ? (
                  <span className="text-orange-500 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
                    {unreadRequests.length} need attention
                  </span>
                ) : (
                  <span className="text-green-500 font-semibold">All handled</span>
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
    </div>
  )
}

