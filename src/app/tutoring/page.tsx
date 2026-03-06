import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tutoringSlots, teachers } from "@/lib/schema"
import { TutoringCalendar } from "@/components/tutoring/tutoring-calendar"
import { ImmediateHelp } from "@/components/tutoring/immediate-help"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageCircle, Clock, Users } from "lucide-react"
import { gte, gt, asc, eq } from "@/lib/drizzle-helpers"
import { GradientText } from "@/components/animations/gradient-text"
import { GlowEffect } from "@/components/animations/glow-effect"

async function getTutoringData() {
  const now = new Date()
  const upcomingSlots = await db
    .select({
      id: tutoringSlots.id,
      teacherId: tutoringSlots.teacherId,
      start: tutoringSlots.start,
      end: tutoringSlots.end,
      capacity: tutoringSlots.capacity,
      spotsLeft: tutoringSlots.spotsLeft,
      teacherName: teachers.name,
      teacherEmail: teachers.email,
    })
    .from(tutoringSlots)
    .leftJoin(teachers, eq(tutoringSlots.teacherId, teachers.id))
    .where(gte(tutoringSlots.start, now))
    .orderBy(asc(tutoringSlots.start))
    .limit(10)

  return { upcomingSlots }
}

export default async function TutoringPage() {
  const session = await auth()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">
          <GradientText variant="primary">Live Tutoring</GradientText>
        </h1>
        <p className="text-xl text-muted-foreground">
          Get help from expert teachers through scheduled sessions or immediate assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8 items-stretch">
        <Card className="h-full flex flex-col lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule a Session
            </CardTitle>
            <CardDescription>
              Book a tutoring session with an available teacher
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground mb-4">
              View available time slots and reserve your spot for personalized help.
            </p>
            <div className="flex-1">
              {session ? (
                <TutoringCalendar />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Please sign in to schedule a session.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Immediate Help
            </CardTitle>
            <CardDescription>
              Request immediate assistance when you need it
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground mb-4">
              Get matched with an available teacher for on-demand help.
            </p>
            <div className="flex-1">
              {session?.user?.id ? (
                <ImmediateHelp userId={session.user.id} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Please sign in to request immediate help.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
