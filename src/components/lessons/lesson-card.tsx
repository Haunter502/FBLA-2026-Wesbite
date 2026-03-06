'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, BookOpen, Dumbbell, CheckCircle2, Clock } from 'lucide-react';

interface LessonCardProps {
  lesson: {
    id: string;
    slug: string;
    title: string;
    description: string;
    type: 'VIDEO' | 'READING' | 'EXERCISE';
    duration?: number;
    order: number;
  };
  isCompleted?: boolean;
  isLocked?: boolean;
}

const typeIcons = {
  VIDEO: Play,
  READING: BookOpen,
  EXERCISE: Dumbbell,
};

const typeLabels = {
  VIDEO: 'Video Lesson',
  READING: 'Reading',
  EXERCISE: 'Practice',
};

const typeColors = {
  VIDEO: 'bg-blue-500/10 text-blue-600',
  READING: 'bg-green-500/10 text-green-600',
  EXERCISE: 'bg-purple-500/10 text-purple-600',
};

export function LessonCard({ lesson, isCompleted = false, isLocked = false }: LessonCardProps) {
  const Icon = typeIcons[lesson.type];

  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.01 }}
      transition={{ duration: 0.15 }}
    >
      <Link href={isLocked ? '#' : `/lessons/${lesson.slug}`} className={isLocked ? 'pointer-events-none' : ''}>
        <Card
          className={`transition-all hover:shadow-md ${
            isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${isCompleted ? 'border-green-500/50' : ''}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    Lesson {lesson.order}
                  </Badge>
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                      typeColors[lesson.type]
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {typeLabels[lesson.type]}
                  </div>
                  {lesson.duration && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {lesson.duration} min
                    </div>
                  )}
                </div>
                <CardTitle className="text-base leading-snug">{lesson.title}</CardTitle>
              </div>
              {isCompleted && (
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              )}
              {isLocked && (
                <div className="flex-shrink-0">
                  <Badge variant="outline">Locked</Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

