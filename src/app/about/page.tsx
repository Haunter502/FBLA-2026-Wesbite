import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, BookOpen, Zap, Award, TrendingUp, Clock, CheckCircle2 } from "lucide-react"
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
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      <ParticleBackground count={20} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        <FadeInUp delay={0.1}>
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-2">
              <span className="text-foreground">About </span>
              <span className="inline-block text-6xl">π</span><GradientText variant="primary" className="text-5xl md:text-6xl">umera</GradientText>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive learning hub for Algebra 1, created by students, for students
            </p>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <StaggerChildren className="space-y-6">
              <StaggerItem>
                <FadeInUp delay={0.2}>
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
                          To make Algebra 1 learning engaging, collaborative, and accessible for all students.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </GlowEffect>
                </FadeInUp>
              </StaggerItem>

              <StaggerItem>
                <FadeInUp delay={0.3}>
                  <GlowEffect intensity="medium">
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/40 transition-all">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Peer-to-Peer Learning
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          We believe in the power of collaborative learning and peer support.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </GlowEffect>
                </FadeInUp>
              </StaggerItem>

              <StaggerItem>
                <FadeInUp delay={0.4}>
                  <GlowEffect intensity="medium">
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/40 transition-all">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Comprehensive Curriculum
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          14 units covering all essential Algebra 1 topics with interactive content.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </GlowEffect>
                </FadeInUp>
              </StaggerItem>

              <StaggerItem>
                <FadeInUp delay={0.5}>
                  <GlowEffect intensity="low">
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
                      <CardHeader>
                        <CardTitle>Our Approach</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          πumera is designed to support students at every stage of their Algebra 1 journey.
                          We combine video lessons, interactive exercises, quizzes, and live tutoring to
                          create a comprehensive learning experience.
                        </p>
                        <p className="text-muted-foreground">
                          Our platform tracks your progress, celebrates your achievements, and provides
                          personalized recommendations to help you learn at your own pace.
                        </p>
                      </CardContent>
                    </Card>
                  </GlowEffect>
                </FadeInUp>
              </StaggerItem>

              <StaggerItem>
                <FadeInUp delay={0.55}>
                  <GlowEffect intensity="low">
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Learning at Your Pace
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Whether you're reviewing concepts or exploring new topics, πumera adapts to your schedule.
                          Study when it works for you, track your progress, and get personalized recommendations
                          to help you achieve your learning goals.
                        </p>
                      </CardContent>
                    </Card>
                  </GlowEffect>
                </FadeInUp>
              </StaggerItem>
            </StaggerChildren>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <FadeInUp delay={0.3}>
              <GlowEffect intensity="medium">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Interactive Learning</h3>
                        <p className="text-sm text-muted-foreground">
                          Engage with video lessons, practice problems, and interactive quizzes that adapt to your learning style.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Achievement System</h3>
                        <p className="text-sm text-muted-foreground">
                          Earn badges and track your progress with our gamified learning system that motivates you to keep going.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Progress Tracking</h3>
                        <p className="text-sm text-muted-foreground">
                          Monitor your learning journey with detailed analytics and personalized recommendations.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Live Tutoring</h3>
                        <p className="text-sm text-muted-foreground">
                          Connect with expert teachers through scheduled sessions or get immediate help when you need it.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </GlowEffect>
            </FadeInUp>

            <FadeInUp delay={0.4}>
              <GlowEffect intensity="medium">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background flex flex-col min-h-full">
                  <CardHeader>
                    <CardTitle>What You'll Learn</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-end pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-lg">Linear equations and inequalities</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-lg">Systems of equations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-lg">Polynomials and factoring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-lg">Quadratic equations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-lg">Functions and relations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-lg">Exponential and radical expressions</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </GlowEffect>
            </FadeInUp>
          </div>
        </div>
      </div>
    </div>
  )
}
