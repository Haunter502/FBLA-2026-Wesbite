'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface NextBestLessonProps {
  lesson: {
    id: string;
    slug: string;
    title: string;
    description: string;
    type: string;
    duration?: number;
    unitTitle: string;
  } | null;
}

export function NextBestLesson({ lesson }: NextBestLessonProps) {
  if (!lesson) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Next Recommended Lesson
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">
              You've completed all available lessons.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Next Recommended Lesson
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {lesson.unitTitle}
            </Badge>
            <h3 className="font-semibold text-lg leading-snug">{lesson.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {lesson.description}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              {lesson.type}
            </div>
            {lesson.duration && (
              <div className="flex items-center gap-1">
                <span>⏱</span>
                {lesson.duration} min
              </div>
            )}
          </div>

          <Link href={`/lessons/${lesson.slug}`}>
            <Button className="w-full group" size="lg">
              Start Learning
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

