import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { MatchResponseClient } from '@/components/tutoring/match-response-client'

export default async function MatchResponsePage({
  params,
}: {
  params: Promise<{ requestId: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const { requestId } = await params

  return <MatchResponseClient requestId={requestId} />
}

