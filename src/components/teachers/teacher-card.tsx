'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeacherCardProps {
  teacher: {
    id: string;
    name: string;
    avatar?: string;
    bio: string;
    email: string;
    officeHours?: string;
  };
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const initials = teacher.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-brand transition-shadow">
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-4">
            {teacher.avatar ? (
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/10"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-brand flex items-center justify-center ring-4 ring-primary/10">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-lg">{teacher.name}</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{teacher.bio}</p>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a
                href={`mailto:${teacher.email}`}
                className="text-primary hover:underline truncate"
              >
                {teacher.email}
              </a>
            </div>
            {teacher.officeHours && (
              <div className="flex items-start gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-xs text-muted-foreground">Office Hours</p>
                  <p className="text-foreground">{teacher.officeHours}</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Badge variant="secondary" className="w-full justify-center">
              Available for Tutoring
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

