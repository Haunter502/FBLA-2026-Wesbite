'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CompleteLessonButtonProps {
  lessonId: string;
  isCompleted: boolean;
}

export function CompleteLessonButton({ lessonId, isCompleted }: CompleteLessonButtonProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const router = useRouter();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/progress/lesson/${lessonId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: completed ? 'IN_PROGRESS' : 'COMPLETED',
        }),
      });

      if (response.ok) {
        setCompleted(!completed);
        // Refresh the page to update UI
        router.refresh();
      } else {
        console.error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleComplete}
      disabled={loading}
      variant={completed ? 'outline' : 'default'}
      className={completed ? 'border-green-500 text-green-600 hover:bg-green-50' : ''}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {completed ? 'Marking as Incomplete...' : 'Marking as Complete...'}
        </>
      ) : completed ? (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Completed
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Mark as Complete
        </>
      )}
    </Button>
  );
}

