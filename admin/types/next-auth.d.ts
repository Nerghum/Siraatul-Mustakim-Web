import "next-auth"
import "next-auth/jwt"

declare module "@auth/core/types" {
  interface User {
    backendToken?: string
    phone?: string
    email?: string
    role?: "user" | "writer" | "admin" | "moderator" | "mufti"
  }
}

declare module "next-auth" {
  interface User {
    backendToken?: string
    phone?: string
    email?: string
    role?: "user" | "writer" | "admin" | "moderator" | "mufti"
  }

  interface Session {
    backendToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    phone?: string
    email?: string
    role?: "user" | "writer" | "admin" | "moderator" | "mufti"
    backendToken: string
  }
}
