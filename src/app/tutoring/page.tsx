import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tutoringSlots, teachers } from "@/lib/schema"
import { TutoringSchedule } from "@/components/tutoring/tutoring-schedule"
import { ImmediateHelp } from "@/components/tutoring/immediate-help"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageCircle, Clock, Users } from "lucide-react"
import { gte, gt, asc, eq } from "@/lib/drizzle-helpers"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
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
      <ScrollReveal>
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">
            <GradientText variant="primary">Live Tutoring</GradientText>
          </h1>
          <p className="text-xl text-muted-foreground">
            Get help from expert teachers through scheduled sessions or immediate assistance
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule a Session
            </CardTitle>
            <CardDescription>
              Book a tutoring session with an available teacher
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View available time slots and reserve your spot for personalized help.
            </p>
            {session ? (
              <TutoringCalendar />
            ) : (
              <p className="text-sm text-muted-foreground">
                Please sign in to schedule a session.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Immediate Help
            </CardTitle>
            <CardDescription>
              Request immediate assistance when you need it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get matched with an available teacher for on-demand help.
            </p>
            {session?.user?.id ? (
              <ImmediateHelp userId={session.user.id} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Please sign in to request immediate help.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                  1
                </div>
                <h3 className="font-semibold">Choose Your Option</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Schedule a session in advance or request immediate help
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                  2
                </div>
                <h3 className="font-semibold">Get Matched</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We'll connect you with an available teacher based on your needs
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                  3
                </div>
                <h3 className="font-semibold">Learn Together</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Join your session and get personalized help with your questions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
