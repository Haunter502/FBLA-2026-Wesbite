"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { ParticleBackground } from "@/components/animations/particle-background"
import { GlassCard } from "@/components/animations/glass-card"
import { GlowEffect } from "@/components/animations/glow-effect"
import { GradientText } from "@/components/animations/gradient-text"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { AlertCircle } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <ParticleBackground count={20} />
      <div className="container mx-auto px-4 py-16 relative z-10 w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-md"
        >
          <GlowEffect intensity="high">
            <GlassCard className="backdrop-blur-xl bg-gradient-to-br from-primary/10 via-background/95 to-background border-2 border-primary/30 shadow-2xl">
              <CardHeader className="text-center space-y-2">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <CardTitle className="text-4xl font-bold">
                    <GradientText variant="primary" className="text-4xl">
                      Sign In
                    </GradientText>
                  </CardTitle>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <CardDescription className="text-base">
                    Sign in to your πumera account
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <StaggerChildren className="space-y-5" staggerDelay={0.1}>
                    <StaggerItem>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          className="border-primary/30 focus:border-primary focus:ring-primary/20 bg-background/50 backdrop-blur-sm transition-all"
                        />
                      </motion.div>
                    </StaggerItem>

                    <StaggerItem>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="password" className="text-sm font-medium">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="border-primary/30 focus:border-primary focus:ring-primary/20 bg-background/50 backdrop-blur-sm transition-all"
                        />
                      </motion.div>
                    </StaggerItem>
                  </StaggerChildren>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 text-lg py-6"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </motion.div>
                </form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative my-6"
                >
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background/95 backdrop-blur-sm px-3 text-muted-foreground font-medium">
                      Or continue with
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 text-center text-sm text-muted-foreground"
                >
                  Don't have an account?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="text-primary hover:underline font-medium transition-all hover:text-primary/80"
                  >
                    Sign up
                  </Link>
                </motion.p>
              </CardContent>
            </GlassCard>
          </GlowEffect>
        </motion.div>
      </div>
    </div>
  )
}
