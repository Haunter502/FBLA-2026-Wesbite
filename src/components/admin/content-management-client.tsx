'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, FileQuestion, ClipboardList, Eye, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Unit {
  id: string
  slug: string
  title: string
  description: string
  order: number
}

interface Lesson {
  id: string
  slug: string
  unitId: string
  title: string
  description: string
  type: 'VIDEO' | 'READING' | 'EXERCISE'
  youtubeId: string | null
  khanUrl: string | null
  duration: number | null
  order: number
}

interface Quiz {
  id: string
  unitId: string
  title: string
  description: string | null
  timeLimit: number | null
  passingScore: number
  questions: any
}

interface Test {
  id: string
  unitId: string
  title: string
  description: string | null
  timeLimit: number | null
  passingScore: number
  questions: any
}

interface ContentManagementClientProps {
  units: Unit[]
  lessons: Lesson[]
  quizzes: Quiz[]
  tests: Test[]
}

export function ContentManagementClient({
  units,
  lessons,
  quizzes,
  tests,
}: ContentManagementClientProps) {
  const [selectedType, setSelectedType] = useState<'lessons' | 'quizzes' | 'tests'>('lessons')

  const getUnitTitle = (unitId: string) => {
    return units.find(u => u.id === unitId)?.title || 'Unknown Unit'
  }

  const getQuestionsCount = (questions: any) => {
    if (Array.isArray(questions)) return questions.length
    try {
      const parsed = JSON.parse(questions)
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return 0
    }
  }

  return (
    <Tabs defaultValue="lessons" className="space-y-4">
      <TabsList>
        <TabsTrigger value="lessons">
          <BookOpen className="h-4 w-4 mr-2" />
          Lessons ({lessons.length})
        </TabsTrigger>
        <TabsTrigger value="quizzes">
          <FileQuestion className="h-4 w-4 mr-2" />
          Quizzes ({quizzes.length})
        </TabsTrigger>
        <TabsTrigger value="tests">
          <ClipboardList className="h-4 w-4 mr-2" />
          Tests ({tests.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="lessons" className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            To edit lessons, update the seed file at <code className="bg-muted px-1 rounded">drizzle/seed.ts</code> and run <code className="bg-muted px-1 rounded">npm run db:seed</code>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                  <Badge variant="secondary">{lesson.type}</Badge>
                </div>
                <CardDescription>
                  Unit: {getUnitTitle(lesson.unitId)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Slug:</span>{' '}
                    <code className="bg-muted px-1 rounded text-xs">{lesson.slug}</code>
                  </div>
                  {lesson.youtubeId && (
                    <div>
                      <span className="font-medium">YouTube ID:</span>{' '}
                      <code className="bg-muted px-1 rounded text-xs">{lesson.youtubeId}</code>
                    </div>
                  )}
                  {lesson.khanUrl && (
                    <div>
                      <span className="font-medium">Khan URL:</span>{' '}
                      <a href={lesson.khanUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                        View Link
                      </a>
                    </div>
                  )}
                  {lesson.duration && (
                    <div>
                      <span className="font-medium">Duration:</span> {lesson.duration} min
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Order:</span> {lesson.order}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                    {lesson.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="quizzes" className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            To edit quiz questions, update the seed file at <code className="bg-muted px-1 rounded">drizzle/seed.ts</code> or use the update script: <code className="bg-muted px-1 rounded">npm run update-content</code>
          </p>
        </div>
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const questionsCount = getQuestionsCount(quiz.questions)
            return (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{quiz.title}</CardTitle>
                    <Badge variant="secondary">{questionsCount} questions</Badge>
                  </div>
                  <CardDescription>
                    Unit: {getUnitTitle(quiz.unitId)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">ID:</span>{' '}
                      <code className="bg-muted px-1 rounded text-xs">{quiz.id}</code>
                    </div>
                    {quiz.description && (
                      <div>
                        <span className="font-medium">Description:</span> {quiz.description}
                      </div>
                    )}
                    <div className="flex gap-4">
                      {quiz.timeLimit && (
                        <div>
                          <span className="font-medium">Time Limit:</span> {quiz.timeLimit} min
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Passing Score:</span> {quiz.passingScore}%
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-medium">Questions:</span>
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {(() => {
                          const questions = Array.isArray(quiz.questions)
                            ? quiz.questions
                            : JSON.parse(quiz.questions as string)
                          return questions.slice(0, 3).map((q: any) => (
                            <div key={q.id} className="p-2 bg-muted rounded text-xs">
                              <div className="font-medium">{q.id}. {q.question}</div>
                              <div className="mt-1 text-muted-foreground">
                                Correct: Option {q.correctAnswer + 1}
                              </div>
                            </div>
                          ))
                        })()}
                        {questionsCount > 3 && (
                          <div className="text-xs text-muted-foreground">
                            ... and {questionsCount - 3} more questions
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="tests" className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            To edit test questions, update the seed file at <code className="bg-muted px-1 rounded">drizzle/seed.ts</code> or use the update script: <code className="bg-muted px-1 rounded">npm run update-content</code>
          </p>
        </div>
        <div className="space-y-4">
          {tests.map((test) => {
            const questionsCount = getQuestionsCount(test.questions)
            return (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{test.title}</CardTitle>
                    <Badge variant="secondary">{questionsCount} questions</Badge>
                  </div>
                  <CardDescription>
                    Unit: {getUnitTitle(test.unitId)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">ID:</span>{' '}
                      <code className="bg-muted px-1 rounded text-xs">{test.id}</code>
                    </div>
                    {test.description && (
                      <div>
                        <span className="font-medium">Description:</span> {test.description}
                      </div>
                    )}
                    <div className="flex gap-4">
                      {test.timeLimit && (
                        <div>
                          <span className="font-medium">Time Limit:</span> {test.timeLimit} min
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Passing Score:</span> {test.passingScore}%
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-medium">Questions:</span>
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {(() => {
                          const questions = Array.isArray(test.questions)
                            ? test.questions
                            : JSON.parse(test.questions as string)
                          return questions.slice(0, 3).map((q: any) => (
                            <div key={q.id} className="p-2 bg-muted rounded text-xs">
                              <div className="font-medium">{q.id}. {q.question}</div>
                              <div className="mt-1 text-muted-foreground">
                                Correct: Option {q.correctAnswer + 1}
                              </div>
                            </div>
                          ))
                        })()}
                        {questionsCount > 3 && (
                          <div className="text-xs text-muted-foreground">
                            ... and {questionsCount - 3} more questions
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>
    </Tabs>
  )
}



