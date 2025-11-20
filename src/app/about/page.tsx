import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, BookOpen, Sparkles, LineChart, Clock } from "lucide-react"
import { ParticleBackground } from "@/components/animations/particle-background"
import { FadeInUp } from "@/components/animations/fade-in-up"
import { GlowEffect } from "@/components/animations/glow-effect"
import { GradientText } from "@/components/animations/gradient-text"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced background theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>
      <ParticleBackground count={20} />

      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        <FadeInUp delay={0.1}>
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-bold mb-2">
              <span className="text-foreground">About </span>
              <span className="inline-block text-6xl">π</span>
              <GradientText variant="primary" className="text-5xl md:text-6xl">
                umera
              </GradientText>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive learning hub for Algebra&nbsp;1, created by students, for students.
            </p>
          </div>
        </FadeInUp>

        {/* Top content row – bottoms aligned */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 items-stretch">
          {/* Left column: mission cards */}
          <div className="flex flex-col gap-4 h-full justify-between">
            <GlowEffect intensity="medium">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/40 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    To make Algebra&nbsp;1 learning engaging, collaborative, and accessible for all students.
                  </CardDescription>
                </CardContent>
              </Card>
            </GlowEffect>

            <GlowEffect intensity="medium">
              <Card className="bg-gradient-to-br from-background via-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Peer-to-Peer Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    We believe in the power of collaborative learning and peer support through group study,
                    tutoring, and shared resources.
                  </CardDescription>
                </CardContent>
              </Card>
            </GlowEffect>

            <GlowEffect intensity="medium">
              <Card className="bg-gradient-to-br from-background via-background to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Comprehensive Curriculum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    14 units covering all essential Algebra&nbsp;1 topics with videos, practice, quizzes, and
                    challenge problems.
                  </CardDescription>
                </CardContent>
              </Card>
            </GlowEffect>
          </div>

          {/* Right column: extra info */}
          <div className="h-full">
            <GlowEffect intensity="medium">
              <Card className="h-full flex flex-col border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Why πumera works
                  </CardTitle>
                  <CardDescription>
                    Built around how students actually study, not how textbooks expect them to.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    πumera was started by students who struggled with Algebra&nbsp;1 and wanted a space that felt
                    less like homework and more like having a study team by your side. Every feature is designed to
                    reduce stress and make it easier to ask questions, get help, and track progress.
                  </p>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Clock className="h-5 w-5 mt-1 shrink-0" />
                      <div>
                        <p className="font-medium">Study on your schedule</p>
                        <p className="text-sm text-muted-foreground">
                          Quick practice, focused timers, and bite-sized lessons help you fit learning into busy days.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Users className="h-5 w-5 mt-1 shrink-0" />
                      <div>
                        <p className="font-medium">Support from real people</p>
                        <p className="text-sm text-muted-foreground">
                          Connect with tutors and classmates, request immediate help, and learn from others’ strategies.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <LineChart className="h-5 w-5 mt-1 shrink-0" />
                      <div>
                        <p className="font-medium">Data-driven coaching</p>
                        <p className="text-sm text-muted-foreground">
                          Analytics turn your progress into clear next steps so you always know what to review and what
                          to learn next.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </GlowEffect>
          </div>
        </div>

        {/* Our approach */}
        <FadeInUp delay={0.5}>
          <GlowEffect intensity="low">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader>
                <CardTitle>Our Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  πumera is designed to support students at every stage of their Algebra&nbsp;1 journey. We combine video
                  lessons, interactive exercises, quizzes, and live tutoring to create a comprehensive learning
                  experience.
                </p>
                <p className="text-muted-foreground">
                  Our platform tracks your progress, celebrates your achievements, and provides personalized
                  recommendations to help you learn at your own pace.
                </p>
              </CardContent>
            </Card>
          </GlowEffect>
        </FadeInUp>

        {/* Who we support */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-4">
          <StaggerItem>
            <FadeInUp delay={0.6}>
              <Card className="bg-card/60 backdrop-blur border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Stay on top of class, prep for quizzes, and turn confusing topics into clear step-by-step strategies.
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeInUp>
          </StaggerItem>

          <StaggerItem>
            <FadeInUp delay={0.7}>
              <Card className="bg-card/60 backdrop-blur border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">Tutors &amp; Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get insight into what students are stuck on, assign targeted practice, and track growth over time.
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeInUp>
          </StaggerItem>

          <StaggerItem>
            <FadeInUp delay={0.8}>
              <Card className="bg-card/60 backdrop-blur border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">Schools &amp; Clubs</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Use πumera as a hub for Algebra&nbsp;1 support programs, math clubs, and peer-tutoring initiatives.
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeInUp>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </div>
  )
}
