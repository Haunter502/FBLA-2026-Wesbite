'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProgressChartProps {
  data: { label: string; value: number }[]
  title?: string
}

export function ProgressChart({ data, title }: ProgressChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.value}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


