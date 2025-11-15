'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

interface TimelineItem {
  title: string
  description: string
  completed: boolean
  date?: string
}

interface InteractiveTimelineProps {
  items: TimelineItem[]
}

export function InteractiveTimeline({ items }: InteractiveTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
      
      <div className="space-y-8">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-16"
          >
            {/* Timeline dot */}
            <div className="absolute left-0 top-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                className={`
                  relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                  ${item.completed 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {item.completed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </motion.div>
              
              {/* Pulse effect for completed items */}
              {item.completed && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            {/* Content */}
            <motion.div
              whileHover={{ x: 5 }}
              className={`
                p-4 rounded-lg border transition-all
                ${item.completed 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-muted bg-background'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.title}
                </h3>
                {item.date && (
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


