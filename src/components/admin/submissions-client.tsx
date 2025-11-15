'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, HelpCircle, Mail, Clock, User, CheckCircle2 } from "lucide-react"
import { useRouter } from 'next/navigation'

interface TutoringRequest {
  id: string
  type: string
  topic: string | null
  status: string
  createdAt: number | null
  user: {
    id: string
    name: string | null
    email: string
  } | null
}

interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  responded: boolean
  createdAt: number | null
}

interface AdminSubmissionsClientProps {
  tutoringRequests: TutoringRequest[]
  contactSubmissions: ContactSubmission[]
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return 'Unknown date'
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function AdminSubmissionsClient({ 
  tutoringRequests, 
  contactSubmissions 
}: AdminSubmissionsClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const immediateRequests = tutoringRequests.filter(r => r.type === 'IMMEDIATE')
  const scheduledRequests = tutoringRequests.filter(r => r.type === 'SCHEDULED')
  const unreadContacts = contactSubmissions.filter(c => !c.read)
  const unreadRequests = tutoringRequests.filter(r => r.status === 'PENDING')

  const handleMarkContactRead = async (id: string) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/contacts/${id}/read`, {
        method: 'PATCH',
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error marking contact as read:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleMarkContactResponded = async (id: string) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/contacts/${id}/responded`, {
        method: 'PATCH',
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error marking contact as responded:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleUpdateRequestStatus = async (id: string, status: 'MATCHED' | 'COMPLETED') => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/tutoring/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating request status:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Tabs defaultValue="immediate" className="space-y-4">
      <TabsList>
        <TabsTrigger value="immediate">
          <HelpCircle className="h-4 w-4 mr-2" />
          Immediate Help ({immediateRequests.length})
          {unreadRequests.filter(r => r.type === 'IMMEDIATE').length > 0 && (
            <Badge className="ml-2" variant="destructive">
              {unreadRequests.filter(r => r.type === 'IMMEDIATE').length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="scheduled">
          Scheduled ({scheduledRequests.length})
        </TabsTrigger>
        <TabsTrigger value="contacts">
          <Mail className="h-4 w-4 mr-2" />
          Contact Forms ({contactSubmissions.length})
          {unreadContacts.length > 0 && (
            <Badge className="ml-2" variant="destructive">
              {unreadContacts.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="immediate" className="space-y-4">
        {immediateRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                No immediate help requests yet
              </div>
            </CardContent>
          </Card>
        ) : (
          immediateRequests.map((request) => (
            <Card key={request.id} className={request.status === 'PENDING' ? 'border-orange-500/50 bg-orange-500/5' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">Immediate Help Request</CardTitle>
                      <Badge
                        variant={
                          request.status === 'PENDING'
                            ? 'destructive'
                            : request.status === 'MATCHED'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Topic: {request.topic || 'No topic specified'}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {request.user && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{request.user.name || 'Unknown'}</span>
                      <span className="text-muted-foreground">({request.user.email})</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {request.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRequestStatus(request.id, 'MATCHED')}
                        disabled={loading === request.id}
                      >
                        Mark as Matched
                      </Button>
                    )}
                    {request.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRequestStatus(request.id, 'COMPLETED')}
                        disabled={loading === request.id}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="scheduled" className="space-y-4">
        {scheduledRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                No scheduled tutoring requests yet
              </div>
            </CardContent>
          </Card>
        ) : (
          scheduledRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">Scheduled Session</CardTitle>
                      <Badge
                        variant={
                          request.status === 'PENDING'
                            ? 'destructive'
                            : request.status === 'MATCHED'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    {request.topic && (
                      <CardDescription>Topic: {request.topic}</CardDescription>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {request.user && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{request.user.name || 'Unknown'}</span>
                    <span className="text-muted-foreground">({request.user.email})</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="contacts" className="space-y-4">
        {contactSubmissions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                No contact form submissions yet
              </div>
            </CardContent>
          </Card>
        ) : (
          contactSubmissions.map((contact) => (
            <Card key={contact.id} className={!contact.read ? 'border-blue-500/50 bg-blue-500/5' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{contact.subject}</CardTitle>
                      {!contact.read && (
                        <Badge variant="default">New</Badge>
                      )}
                      {contact.responded && (
                        <Badge variant="secondary">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Responded
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      From: {contact.name} ({contact.email})
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(contact.createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                    {contact.message}
                  </div>
                  <div className="flex gap-2">
                    {!contact.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkContactRead(contact.id)}
                        disabled={loading === contact.id}
                      >
                        Mark as Read
                      </Button>
                    )}
                    {!contact.responded && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkContactResponded(contact.id)}
                        disabled={loading === contact.id}
                      >
                        Mark as Responded
                      </Button>
                    )}
                    <a href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}>
                      <Button size="sm" variant="default">
                        <Mail className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}



