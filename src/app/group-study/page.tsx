import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, studyGroups, groupMembers, units, progress } from '@/lib/schema'
import { eq, and, desc } from '@/lib/drizzle-helpers'
import { GroupStudyClient } from '@/components/group-study/group-study-client'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { GradientText } from '@/components/animations/gradient-text'
import { Users, MessageSquare, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

async function getAllStudents() {
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      bio: users.bio,
    })
    .from(users)
    .where(eq(users.role, 'STUDENT'))
    .orderBy(users.name)
}

async function getUserUnitProgress(userId: string) {
  const userProgress = await db
    .select({
      unitId: progress.unitId,
      status: progress.status,
    })
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.status, 'COMPLETED')))

  const allUnits = await db.select().from(units)
  const unitProgressMap = new Map<string, string>()

  allUnits.forEach((unit: typeof allUnits[0]) => {
    const unitProg = userProgress.find((p: typeof userProgress[0]) => p.unitId === unit.id)
    if (unitProg) {
      unitProgressMap.set(unit.id, unit.title)
    }
  })

  return Array.from(unitProgressMap.entries()).map(([id, title]) => ({ id, title }))
}

async function getStudyGroups(userId: string) {
  const userGroups = await db
    .select({
      group: {
        id: studyGroups.id,
        name: studyGroups.name,
        description: studyGroups.description,
        createdAt: studyGroups.createdAt,
      },
      member: {
        role: groupMembers.role,
      },
    })
    .from(groupMembers)
    .leftJoin(studyGroups, eq(groupMembers.groupId, studyGroups.id))
    .where(eq(groupMembers.userId, userId))

  return userGroups.map((ug: typeof userGroups[0]) => ({
    id: ug.group.id,
    name: ug.group.name,
    description: ug.group.description,
    createdAt: ug.group.createdAt,
    role: ug.member.role,
  }))
}

export default async function GroupStudyPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/sign-in')
  }

  const [allStudents, userGroups] = await Promise.all([
    getAllStudents(),
    getStudyGroups(session.user.id),
  ])

  // Get unit progress for each student
  const studentsWithProgress = await Promise.all(
    allStudents.map(async (student: typeof allStudents[0]) => {
      const unitProgress = await getUserUnitProgress(student.id)
      return {
        ...student,
        unitProgress,
      }
    })
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-8 text-center">
          <GradientText className="text-4xl md:text-5xl font-bold mb-3">
            Group Study
          </GradientText>
          <p className="text-muted-foreground text-lg">
            Connect with peers, form study groups, and learn together
          </p>
        </div>
      </ScrollReveal>

      {/* Stats */}
      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-primary/20 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{studentsWithProgress.length}</div>
                  <div className="text-sm text-muted-foreground">Active Students</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 via-background to-background border-blue-500/20 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{userGroups.length}</div>
                  <div className="text-sm text-muted-foreground">Your Groups</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 via-background to-background border-green-500/20 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <BookOpen className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {studentsWithProgress.reduce((sum, s) => sum + s.unitProgress.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Units Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollReveal>

      <GroupStudyClient
        students={studentsWithProgress}
        userGroups={userGroups}
        currentUserId={session.user.id}
      />
    </div>
  )
}


