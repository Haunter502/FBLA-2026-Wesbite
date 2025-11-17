"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { BookOpen, Menu, X, User, LogOut, Home, GraduationCap, Calendar, Users, FileText, Info, Mail, Search, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function NavBar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Learn dropdown items
  const learnItems = [
    { href: "/units", label: "Units", icon: BookOpen },
    { href: "/tutoring", label: "Tutoring", icon: Calendar },
    { href: "/resources", label: "Resources", icon: FileText },
    { href: "/teachers", label: "Teachers", icon: Users },
  ]

  // Main nav items (always visible)
  const mainNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  // Admin/Teacher items
  const adminItems = []
  if (session?.user?.role === 'ADMIN') {
    adminItems.push({ href: "/admin/content", label: "Content", icon: BookOpen })
  }
  if (session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') {
    adminItems.push({ href: "/admin/submissions", label: "Submissions", icon: GraduationCap })
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold">π</span>
              <span className="text-xl font-bold">Numera</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Home */}
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              <span className="hidden lg:inline">Home</span>
              <Home className="lg:hidden h-5 w-5" />
            </Link>

            {/* Search */}
            <Link
              href="/search"
              className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              <span className="hidden lg:inline">Search</span>
              <Search className="lg:hidden h-5 w-5" />
            </Link>

            {/* Learn Dropdown */}
            <DropdownMenu
              trigger={
                <>
                  <BookOpen className="lg:hidden h-5 w-5" />
                  <span className="hidden lg:inline">Learn</span>
                </>
              }
              items={learnItems}
            />

            {/* About */}
            <Link
              href="/about"
              className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              <span className="hidden lg:inline">About</span>
              <Info className="lg:hidden h-5 w-5" />
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              <span className="hidden lg:inline">Contact</span>
              <Mail className="lg:hidden h-5 w-5" />
            </Link>

            {/* Admin/Teacher Items */}
            {adminItems.length > 0 && (
              <DropdownMenu
                trigger={
                  <>
                    <GraduationCap className="lg:hidden h-5 w-5" />
                    <span className="hidden lg:inline">Admin</span>
                  </>
                }
                items={adminItems}
              />
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{session.user?.name || session.user?.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Main Nav Items */}
            {mainNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}

            {/* Learn Section */}
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Learn
            </div>
            {learnItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-6 py-2 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}

            {/* Admin Section */}
            {adminItems.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  Admin
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-6 py-2 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  )
                })}
              </>
            )}
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <GraduationCap className="h-5 w-5 mr-3" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" })
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-md"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="flex items-center px-3 py-2 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="flex items-center px-3 py-2 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
