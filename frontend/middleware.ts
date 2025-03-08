import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  const isAuthenticated = !!token;

  // Define protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/chat");

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login page if trying to access protected route without authentication
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (request.nextUrl.pathname === "/" && isAuthenticated) {
    // Redirect to chat page if already authenticated and trying to access login page
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/", "/chat/:path*"],
}; 