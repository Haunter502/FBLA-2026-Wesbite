'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { User, Upload, X, FileText, CheckCircle2, AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  bio: string | null
  role: string
}

interface ProfileClientProps {
  user: User
}

export function ProfileClient({ user: initialUser }: ProfileClientProps) {
  const router = useRouter()
  const [user, setUser] = useState(initialUser)
  const [uploading, setUploading] = useState(false)
  const [bio, setBio] = useState(user.bio || '')
  const [savingBio, setSavingBio] = useState(false)
  const [bioSuccess, setBioSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUser({ ...user, image: data.imageUrl })
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return

    try {
      const response = await fetch('/api/profile/upload', {
        method: 'DELETE',
      })

      if (response.ok) {
        setUser({ ...user, image: null })
        router.refresh()
      } else {
        alert('Failed to remove image')
      }
    } catch (error) {
      console.error('Error removing image:', error)
      alert('Failed to remove image. Please try again.')
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Upload a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {user.image ? 'Change Picture' : 'Upload Picture'}
                    </>
                  )}
                </Button>
              </label>
              {user.image && (
                <Button
                  variant="outline"
                  onClick={handleRemoveImage}
                  className="w-full text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <p className="text-sm font-medium mt-1">{user.name || 'Not set'}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="text-sm font-medium mt-1">{user.email}</p>
          </div>
          <div>
            <Label>Role</Label>
            <p className="text-sm font-medium mt-1 capitalize">{user.role.toLowerCase()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bio
          </CardTitle>
          <CardDescription>
            Tell others about yourself. This will be visible on your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Your Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio about yourself..."
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {bio.length}/500 characters
              </p>
              <Button
                onClick={async () => {
                  setSavingBio(true)
                  setBioSuccess(false)
                  try {
                    const response = await fetch('/api/profile/bio', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ bio }),
                    })
                    if (response.ok) {
                      setUser({ ...user, bio })
                      setBioSuccess(true)
                      setTimeout(() => setBioSuccess(false), 3000)
                      router.refresh()
                    } else {
                      alert('Failed to save bio')
                    }
                  } catch (error) {
                    console.error('Error saving bio:', error)
                    alert('Failed to save bio')
                  } finally {
                    setSavingBio(false)
                  }
                }}
                disabled={savingBio || bio === user.bio}
                size="sm"
              >
                {savingBio ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Bio'
                )}
              </Button>
            </div>
            {bioSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-green-600"
              >
                <CheckCircle2 className="h-4 w-4" />
                Bio saved successfully!
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showDeleteConfirm ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. This will permanently delete:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li>Your profile and bio</li>
                <li>All your progress and achievements</li>
                <li>Your reviews and submissions</li>
                <li>All other account data</li>
              </ul>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-4"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm font-semibold text-destructive mb-2">
                  Are you absolutely sure?
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  This action cannot be undone. Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full p-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (deleteConfirmText !== 'DELETE') {
                      alert('Please type DELETE to confirm')
                      return
                    }

                    setDeleting(true)
                    try {
                      const response = await fetch('/api/profile/delete', {
                        method: 'DELETE',
                      })

                      if (response.ok) {
                        await signOut({ callbackUrl: '/' })
                      } else {
                        const error = await response.json()
                        alert(error.error || 'Failed to delete account')
                        setDeleting(false)
                      }
                    } catch (error) {
                      console.error('Error deleting account:', error)
                      alert('Failed to delete account. Please try again.')
                      setDeleting(false)
                    }
                  }}
                  disabled={deleting || deleteConfirmText !== 'DELETE'}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Permanently Delete Account
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  disabled={deleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


