import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { QuickPractice } from '@/components/quick-practice/quick-practice'

export default async function QuickPracticePage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/sign-in')
  }

  return <QuickPractice />
}


