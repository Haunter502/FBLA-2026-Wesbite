import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { videoResources, units } from "@/lib/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Clock, AlertCircle, Play } from "lucide-react"
import { eq, asc } from "@/lib/drizzle-helpers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { AnimatedResourceCard } from "@/components/resources/animated-resource-card"

async function getVideoResources() {
  const allVideos = await db
    .select({
      id: videoResources.id,
      title: videoResources.title,
      description: videoResources.description,
      videoUrl: videoResources.videoUrl,
      videoId: videoResources.videoId,
      duration: videoResources.duration,
      thumbnailUrl: videoResources.thumbnailUrl,
      unitId: videoResources.unitId,
      unit: {
        id: units.id,
        title: units.title,
        slug: units.slug,
      },
    })
    .from(videoResources)
    .leftJoin(units, eq(videoResources.unitId, units.id))
    .orderBy(asc(videoResources.createdAt))

  return allVideos
}

function getYouTubeThumbnail(videoId: string | null): string {
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
  return ''
}

export default async function VideosPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/auth/sign-in")
  }

  const videosList = await getVideoResources()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ScrollReveal>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/resources" className="hover:text-foreground transition-colors">
              Resources
            </Link>
            <span>/</span>
            <span>Video Resources</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Video Resources</h1>
          <p className="text-lg text-muted-foreground">
            Explore additional video lessons and tutorials to deepen your understanding
          </p>
        </div>
      </ScrollReveal>

      {videosList.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No video resources available</h3>
              <p className="text-muted-foreground">
                Video resources will be added soon. Check back later!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videosList.map((video: typeof videosList[0]) => {
            const thumbnailUrl = video.thumbnailUrl || (video.videoId ? getYouTubeThumbnail(video.videoId) : '')
            
            return (
              <StaggerItem key={video.id}>
                <AnimatedResourceCard>
                  <Card className="h-full overflow-hidden">
                    {thumbnailUrl && (
                      <div className="relative w-full h-48 bg-muted">
                        <img
                          src={thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <Video className="h-6 w-6 text-primary mb-2" />
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <CardDescription>
                        {video.description || 'Additional video content'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {video.unit && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Unit: </span>
                            <Link 
                              href={`/units/${video.unit.slug}`}
                              className="text-primary hover:underline"
                            >
                              {video.unit.title}
                            </Link>
                          </div>
                        )}
                        {video.duration && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{video.duration} min</span>
                          </div>
                        )}
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button className="w-full">
                            <Play className="mr-2 h-4 w-4" />
                            Watch Video
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedResourceCard>
              </StaggerItem>
            )
          })}
        </StaggerChildren>
      )}
    </div>
  )
}



