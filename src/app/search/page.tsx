"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, BookOpen, FileText, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children"
import { GradientText } from "@/components/animations/gradient-text"
import { LoadingSpinner } from "@/components/animations/loading-spinner"
import { GlowEffect } from "@/components/animations/glow-effect"

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ScrollReveal>
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl font-bold mb-4"
          >
            <GradientText variant="primary">Search</GradientText>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-xl text-muted-foreground"
          >
            Find units, lessons, and skills quickly
          </motion.p>
        </div>
      </ScrollReveal>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={handleSearch}
        className="mb-8"
      >
        <GlowEffect>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for units, lessons, or skills..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-2 focus:border-primary/50 transition-colors"
            />
            <Button type="submit" disabled={loading} className="group relative overflow-hidden">
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  <span>Search</span>
                </div>
              )}
            </Button>
          </div>
        </GlowEffect>
      </motion.form>

      {results.length > 0 && (
        <StaggerChildren className="space-y-4">
          {results.map((result, index) => (
            <StaggerItem key={result.id}>
              <Link href={result.href}>
                <GlowEffect>
                  <Card className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {result.type === "unit" && <BookOpen className="h-5 w-5 text-primary" />}
                        {result.type === "lesson" && <FileText className="h-5 w-5 text-primary" />}
                        {result.type === "skill" && <Sparkles className="h-5 w-5 text-primary" />}
                        {result.title}
                      </CardTitle>
                      <CardDescription>{result.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </GlowEffect>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      {query && !loading && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No results found for "{query}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
