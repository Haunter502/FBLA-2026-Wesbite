import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { lessons, units } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Clock, AlertCircle, Play } from "lucide-react"
import { eq, asc } from "@/lib/drizzle-helpers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations/scroll-reveal"

async function getVideoLessons() {
  const allVideos = await db
    .select({
      id: lessons.id,
      slug: lessons.slug,
      title: lessons.title,
      description: lessons.description,
      youtubeId: lessons.youtubeId,
      duration: lessons.duration,
      unitId: lessons.unitId,
      unit: {
        id: units.id,
        title: units.title,
        slug: units.slug,
      },
    })
    .from(lessons)
    .leftJoin(units, eq(lessons.unitId, units.id))
    .where(eq(lessons.type, "VIDEO"))
    .orderBy(asc(lessons.createdAt))

  // Only keep lessons that have an associated YouTube video
  return allVideos.filter((video) => !!video.youtubeId)
}

function getYouTubeThumbnail(videoId: string | null): string {
  if (videoId) {
    // Use hqdefault for more reliable thumbnails across Khan Academy videos
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  }
  return ''
}

export default async function VideosPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/auth/sign-in")
  }

  const videosList = await getVideoLessons()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/resources" className="hover:text-foreground transition-colors">
              Resources
            </Link>
            <span>/</span>
            <span className="text-foreground">Video Resources</span>
          </div>
          <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-violet-500/5 px-6 py-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
                Watch concepts come to life
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                Curated Khan Academy and algebra videos, organized by unit so you always know which
                clip connects to what you&apos;re learning in class.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {videosList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-10 pb-12">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No video resources available yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                We&apos;ll be adding short, focused videos here to match each Algebra 1 topic.
                Check back soon.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {videosList.map((video: typeof videosList[0]) => {
            const thumbnailUrl = video.youtubeId ? getYouTubeThumbnail(video.youtubeId) : ""
            
            return (
              <Card key={video.id} className="h-full flex flex-col overflow-hidden border border-primary/10 bg-gradient-to-b from-primary/5 via-background to-background/80 hover:border-primary/40 hover:shadow-lg transition-all">
                    {thumbnailUrl && (
                      <div className="relative w-full aspect-video bg-muted overflow-hidden shrink-0">
                        <img
                          src={thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-between p-3">
                          <div className="flex items-center justify-between text-[11px] text-white/80">
                            {video.unit && (
                              <span className="inline-flex items-center rounded-full bg-black/40 px-2 py-0.5 backdrop-blur">
                                {video.unit.title}
                              </span>
                            )}
                            {video.duration && (
                              <span className="inline-flex items-center rounded-full bg-black/60 px-2 py-0.5">
                                <Clock className="h-3 w-3 mr-1" />
                                {video.duration} min
                              </span>
                            )}
                          </div>
                          <div className="flex justify-center">
                            <div className="inline-flex items-center justify-center rounded-full bg-white/90 text-primary shadow-md p-3">
                              <Play className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-3 flex-1 min-h-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Video className="h-4 w-4 text-primary" />
                        <span>Video lesson</span>
                      </div>
                      <CardTitle className="text-base md:text-lg line-clamp-2">{video.title}</CardTitle>
                      <CardDescription className="text-xs md:text-sm line-clamp-3">
                        {video.description || "Additional video content"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4 shrink-0">
                      <Link href={`/lessons/${video.slug}`} className="w-full block">
                        <Button className="w-full justify-center text-sm">
                          <Play className="mr-2 h-4 w-4" />
                          Watch lesson
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}



