import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getNextBestLesson } from '@/lib/recommendations';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const nextLesson = await getNextBestLesson(session.user.id);

    if (!nextLesson) {
      return NextResponse.json(
        { message: 'All lessons completed! Great job!' },
        { status: 200 }
      );
    }

    return NextResponse.json(nextLesson);
  } catch (error) {
    console.error('Error getting next lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

