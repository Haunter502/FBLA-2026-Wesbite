import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, studyGroups, groupMembers, units, progress } from '@/lib/schema'
import { eq, and, desc } from '@/lib/drizzle-helpers'
import { GroupStudyClient } from '@/components/group-study/group-study-client'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children'
import { GradientText } from '@/components/animations/gradient-text'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { ParticleBackground } from '@/components/animations/particle-background'
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
    .where(eq(progress.userId, userId))

  const allUnits = await db.select().from(units)
  const completedUnits: { id: string; title: string }[] = []
  const inProgressUnits: { id: string; title: string }[] = []

  allUnits.forEach((unit: typeof allUnits[0]) => {
    const unitProg = userProgress.find((p: typeof userProgress[0]) => p.unitId === unit.id)
    if (unitProg) {
      if (unitProg.status === 'COMPLETED') {
        completedUnits.push({ id: unit.id, title: unit.title })
      } else if (unitProg.status === 'IN_PROGRESS') {
        inProgressUnits.push({ id: unit.id, title: unit.title })
      }
    }
  })

  return { completed: completedUnits, inProgress: inProgressUnits }
}

async function getStudyGroups(userId: string, userRole: string) {
  // If admin, get all groups
  if (userRole === 'ADMIN') {
    const allGroups = await db
      .select({
        id: studyGroups.id,
        name: studyGroups.name,
        description: studyGroups.description,
        createdAt: studyGroups.createdAt,
        createdBy: studyGroups.createdBy,
      })
      .from(studyGroups)
      .orderBy(desc(studyGroups.createdAt))

    // Get member info for each group to show member count
    const groupsWithInfo = await Promise.all(
      allGroups.map(async (group: typeof allGroups[0]) => {
        const memberCount = await db
          .select()
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id))
        
        // Check if admin is a member
        const adminMembership = await db
          .select()
          .from(groupMembers)
          .where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, userId)))
          .limit(1)

        return {
          id: group.id,
          name: group.name,
          description: group.description,
          createdAt: group.createdAt,
          role: adminMembership.length > 0 ? adminMembership[0].role : 'VIEWER',
          memberCount: memberCount.length,
          createdBy: group.createdBy,
        }
      })
    )

    return groupsWithInfo
  }

  // For non-admins, get only their groups
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
    memberCount: 0, // Will be calculated if needed
  }))
}

export default async function GroupStudyPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/sign-in')
  }

  const [allStudents, userGroups] = await Promise.all([
    getAllStudents(),
    getStudyGroups(session.user.id, session.user.role || 'STUDENT'),
  ])

  // Get unit progress for each student
  const studentsWithProgress = await Promise.all(
    allStudents.map(async (student: typeof allStudents[0]) => {
      const unitProgress = await getUserUnitProgress(student.id)
      return {
        ...student,
        unitProgress: unitProgress.completed,
        inProgressUnits: unitProgress.inProgress,
      }
    })
  )

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground count={30} />
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-2xl opacity-30 rounded-full" />
              <h1 className="relative text-5xl md:text-6xl font-bold mb-4">
                <GradientText variant="primary" className="text-5xl md:text-6xl">
                  Group Study
                </GradientText>
              </h1>
            </div>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Connect with peers, form study groups, and learn together
            </p>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" staggerDelay={0.1}>
          <StaggerItem>
            <GlowEffect intensity="medium">
              <GlassCard className="backdrop-blur-xl bg-gradient-to-br from-primary/10 via-background/80 to-background border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">{studentsWithProgress.length}</div>
                      <div className="text-sm text-muted-foreground font-medium">Active Students</div>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            </GlowEffect>
          </StaggerItem>

          <StaggerItem>
            <GlowEffect intensity="medium">
              <GlassCard className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 via-background/80 to-background border-2 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 shadow-lg">
                      <MessageSquare className="h-7 w-7 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-500">{userGroups.length}</div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {session.user.role === 'ADMIN' ? 'All Groups' : 'Your Groups'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            </GlowEffect>
          </StaggerItem>

          <StaggerItem>
            <GlowEffect intensity="medium">
              <GlassCard className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 via-background/80 to-background border-2 border-green-500/30 hover:border-green-500/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 shadow-lg">
                      <BookOpen className="h-7 w-7 text-green-500" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-500">
                        {studentsWithProgress.reduce((sum, s) => sum + (s.unitProgress?.length || 0), 0)}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">Units Completed</div>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            </GlowEffect>
          </StaggerItem>
        </StaggerChildren>

        <GroupStudyClient
          students={studentsWithProgress}
          userGroups={userGroups}
          currentUserId={session.user.id}
          isAdmin={session.user.role === 'ADMIN'}
        />
      </div>
    </div>
  )
}


