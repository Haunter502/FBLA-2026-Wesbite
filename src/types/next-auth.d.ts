import "next-auth"

/** Matches Drizzle schema: STUDENT | TEACHER | ADMIN */
export type UserRole = "STUDENT" | "TEACHER" | "ADMIN"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}
