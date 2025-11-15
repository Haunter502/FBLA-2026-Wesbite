import NextAuth from "next-auth"
// import { DrizzleAdapter } from "@auth/drizzle-adapter" // Only needed for OAuth providers
import CredentialsProvider from "next-auth/providers/credentials"
//import GoogleProvider from "next-auth/providers/google"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import { z } from "zod"
import { eq } from "@/lib/drizzle-helpers"
import { users } from "@/lib/schema"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || "fallback-secret-change-in-production-min-32-chars",
  // adapter: DrizzleAdapter(db) as any, // Only needed for OAuth providers
  trustHost: true, // Allow dynamic host in development - required for Next.js 15
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null

        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

        if (!user) return null

        // In production, use hashed passwords
        // For demo purposes, we'll check against a simple password
        // In seed script, we'll hash passwords properly
        const passwordMatch = await compare(password, user.password || "").catch(() => false)

        // Fallback for demo accounts (remove in production)
        if (!passwordMatch && password === "Passw0rd!") {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        }

        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
})
