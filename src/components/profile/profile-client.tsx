'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { User, Upload, X, FileText, CheckCircle2, AlertTriangle, Trash2, Loader2, Mail, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { GlassCard } from '@/components/animations/glass-card'
import { GlowEffect } from '@/components/animations/glow-effect'
import { FadeInUp } from '@/components/animations/fade-in-up'

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
      <FadeInUp delay={0.2}>
        <GlowEffect intensity="medium">
          <GlassCard hover className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Profile Picture</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload a profile picture to personalize your account
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar className="h-32 w-32 ring-4 ring-primary/30 shadow-lg">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex flex-col gap-3 flex-1 w-full sm:w-auto">
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
                      className="w-full border-primary/30 hover:border-primary/50"
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
                      className="w-full text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </GlowEffect>
      </FadeInUp>

      {/* Account Information */}
      <FadeInUp delay={0.3}>
        <GlowEffect intensity="medium">
          <GlassCard hover>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Account Information</h2>
                  <p className="text-sm text-muted-foreground">
                    Your account details
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Name</Label>
                  <p className="text-base font-semibold mt-1">{user.name || 'Not set'}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email</Label>
                  </div>
                  <p className="text-base font-semibold mt-1">{user.email}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Role</Label>
                  </div>
                  <p className="text-base font-semibold mt-1 capitalize">{user.role.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </GlowEffect>
      </FadeInUp>

      {/* Bio Section */}
      <FadeInUp delay={0.4}>
        <GlowEffect intensity="medium">
          <GlassCard hover>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Bio</h2>
                  <p className="text-sm text-muted-foreground">
                    Tell others about yourself. This will be visible on your profile.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Your Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short bio about yourself..."
                    rows={4}
                    maxLength={500}
                    className="resize-none bg-background/50 border-primary/20 focus:border-primary/50"
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
                      className="border-primary/30 hover:border-primary/50"
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
              </div>
            </div>
          </GlassCard>
        </GlowEffect>
      </FadeInUp>

      {/* Delete Account */}
      <FadeInUp delay={0.5}>
        <GlowEffect intensity="low">
          <GlassCard className="border-destructive/30 bg-destructive/5">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
              </div>
              {!showDeleteConfirm ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. This will permanently delete:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 ml-2">
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
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
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
                      className="w-full p-3 rounded-lg border bg-background/50 border-destructive/30 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
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
                      className="border-primary/30 hover:border-primary/50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </GlowEffect>
      </FadeInUp>
    </div>
  )
}


