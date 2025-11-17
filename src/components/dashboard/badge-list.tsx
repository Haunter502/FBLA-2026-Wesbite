'use client';

import { motion } from 'framer-motion';
import { Award, Trophy, Flame, Star, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BadgeItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  awardedAt?: Date;
}

interface BadgeListProps {
  badges: BadgeItem[];
  showAll?: boolean;
}

const iconMap: Record<string, any> = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  award: Award,
  'check-circle': CheckCircle,
};

export function BadgeList({ badges, showAll = false }: BadgeListProps) {
  const displayBadges = showAll ? badges : badges.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Award className="h-4 w-4" />
          Badges Earned
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No badges yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete lessons and quizzes to earn badges!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {displayBadges.map((badge, index) => {
              const Icon = badge.icon ? iconMap[badge.icon] || Award : Award;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium leading-tight">{badge.name}</p>
                      {badge.awardedAt && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(badge.awardedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {badge.description}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {!showAll && badges.length > 4 && (
          <div className="mt-4 text-center">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              +{badges.length - 4} more
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

