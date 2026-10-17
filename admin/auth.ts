import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        id: { label: "ID", type: "text" },
        phone: { label: "Phone", type: "text" },
        email: { label: "Email", type: "email" },
        role: { label: "Role", type: "text" },
        backendToken: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.backendToken) {
          return null
        }

        return {
          name: credentials.name as string | undefined,
          id: credentials.id as string,
          phone: credentials.phone as string | undefined,
          email: credentials.email as string | undefined,
          role: (credentials.role as "user" | "writer" | "admin" | "moderator" | "mufti") ?? "user",
          backendToken: credentials.backendToken as string,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name ?? ""
        token.id = user.id ?? ""
        token.phone = user.phone ?? ""
        token.email = user.email ?? ""
        token.role = user.role ?? "user"
        token.backendToken = user.backendToken ?? ""
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.phone = token.phone || undefined
        session.user.email = token.email ?? ""
        session.user.role = (token.role as "user" | "writer" | "admin" | "moderator" | "mufti") || "user"
      }
      session.backendToken = token.backendToken
      return session
    },
    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl

      // Allow public routes
      if (
        pathname === "/admin/login" ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname === "/" ||
        pathname.startsWith("/api/") ||
        pathname === "/privacy" ||
        pathname === "/terms"
      ) {
        return true
      }

      // Admin-only routes - require admin role
      if (pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/users")) {
        if (!auth?.user) {
          const loginUrl = new URL("/admin/login", request.url)
          loginUrl.searchParams.set("callbackUrl", pathname)
          return Response.redirect(loginUrl)
        }
        
        if (auth.user.role !== "admin") {
          return Response.redirect(new URL("/admin", request.url))
        }
        return true
      }

      // Protect all /admin routes - require authentication and proper role
      if (pathname.startsWith("/admin")) {
        if (!auth?.user) {
          const loginUrl = new URL("/admin/login", request.url)
          loginUrl.searchParams.set("callbackUrl", pathname)
          return Response.redirect(loginUrl)
        }

        // Only admin and moderator can access the admin area
        if (auth.user.role !== "admin" && auth.user.role !== "moderator") {
          return Response.redirect(new URL("/admin/login?error=unauthorized", request.url))
        }

        return true
      }

      return true
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

