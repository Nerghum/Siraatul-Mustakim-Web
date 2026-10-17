import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextProxy } from "next/server"

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "")

export const proxy: NextProxy = async (request, _event) => {
  const { pathname } = request.nextUrl

  // Proxy /files/* to backend (static files: images, PDFs, etc.)
  if (pathname.startsWith("/files")) {
    const backendUrl = `${BACKEND_ORIGIN}${pathname}${request.nextUrl.search}`
    return NextResponse.rewrite(backendUrl)
  }

  // Allow public routes
  if (
    pathname === "/" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/")
  ) {
    return
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const session = await auth()

    if (!session?.user) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return Response.redirect(loginUrl)
    }
  }
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
