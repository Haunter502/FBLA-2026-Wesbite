import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { StudyTimer } from '@/components/study-timer/study-timer'

export default async function StudyTimerPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/sign-in')
  }

  return <StudyTimer />
}


