"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, BookOpen, FileText, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { GradientText } from "@/components/animations/gradient-text"
import { LoadingSpinner } from "@/components/animations/loading-spinner"
import { GlowEffect } from "@/components/animations/glow-effect"
import { GlassCard } from "@/components/animations/glass-card"
import { ParticleBackground } from "@/components/animations/particle-background"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`)
      }

      // Check if response has content before parsing JSON
      const text = await response.text()
      if (!text || text.trim().length === 0) {
        setResults([])
        return
      }

      const data = JSON.parse(text)
      setResults(data.results || [])
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground count={25} />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
        {/* Hero Section */}
        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-12 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-2xl opacity-30 rounded-full" />
                <h1 className="relative text-5xl md:text-6xl font-bold mb-4">
                  <GradientText variant="primary">Search</GradientText>
                </h1>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground"
            >
              Find units, lessons, and skills quickly
            </motion.p>
          </motion.div>
        </ScrollReveal>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSearch}
          className="mb-8"
        >
          <GlowEffect>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for units, lessons, or skills..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg border-2 focus:border-primary/50 transition-all bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading} 
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all px-8"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span>Search</span>
                  </div>
                )}
              </Button>
            </div>
          </GlowEffect>
        </motion.form>

        {/* Results */}
        <AnimatePresence mode="wait">
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <StaggerChildren className="space-y-4">
                {results.map((result, index) => (
                  <StaggerItem key={result.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4, scale: 1.01 }}
                    >
                      <Link href={result.href}>
                        <GlowEffect>
                          <GlassCard className="backdrop-blur-xl bg-gradient-to-br from-background/80 via-primary/5 to-background/80 border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-3 group-hover:gap-4 transition-all">
                                <motion.div
                                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                  transition={{ duration: 0.5 }}
                                  className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
                                >
                                  {result.type === "unit" && <BookOpen className="h-6 w-6 text-primary" />}
                                  {result.type === "lesson" && <FileText className="h-6 w-6 text-primary" />}
                                  {result.type === "skill" && <Sparkles className="h-6 w-6 text-primary" />}
                                </motion.div>
                                <span className="flex-1">{result.title}</span>
                                <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                              </CardTitle>
                              <CardDescription className="text-base leading-relaxed">
                                {result.description}
                              </CardDescription>
                            </CardHeader>
                          </GlassCard>
                        </GlowEffect>
                      </Link>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </motion.div>
          )}

          {query && !loading && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="backdrop-blur-xl bg-gradient-to-br from-background/80 to-background/60 border-2 border-primary/20">
                <CardContent className="py-16 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                  >
                    <Search className="h-8 w-8 text-primary" />
                  </motion.div>
                  <p className="text-lg text-muted-foreground">
                    No results found for <span className="font-semibold text-foreground">"{query}"</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different keywords or browse our units
                  </p>
                </CardContent>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
