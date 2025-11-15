"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface SectionRevealProps {
  children: ReactNode
  className?: string
}

export function SectionReveal({ children, className = "" }: SectionRevealProps) {
  const prefersReducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  )
}
