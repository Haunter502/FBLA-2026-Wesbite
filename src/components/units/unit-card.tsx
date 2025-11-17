'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2 } from 'lucide-react';

interface UnitCardProps {
  unit: {
    id: string;
    slug: string;
    title: string;
    description: string;
    order: number;
  };
  progress?: number;
  lessonsCompleted?: number;
  totalLessons?: number;
  isLocked?: boolean;
}

export function UnitCard({
  unit,
  progress = 0,
  lessonsCompleted = 0,
  totalLessons = 0,
  isLocked = false,
}: UnitCardProps) {
  const isComplete = progress === 100;

  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.02, y: isLocked ? 0 : -4 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={isLocked ? '#' : `/units/${unit.slug}`} className={isLocked ? 'pointer-events-none' : ''}>
        <Card
          className={`h-full transition-shadow hover:shadow-brand ${
            isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Unit {unit.order}</Badge>
                  {isComplete && (
                    <Badge variant="default" className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </Badge>
                  )}
                  {isLocked && <Badge variant="outline">Locked</Badge>}
                </div>
                <CardTitle className="text-xl">{unit.title}</CardTitle>
              </div>
              {!isLocked && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
            <CardDescription className="line-clamp-2">{unit.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {totalLessons > 0 && (
                <p className="text-xs text-muted-foreground">
                  {lessonsCompleted} of {totalLessons} lessons completed
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

