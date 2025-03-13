import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the exact pathname and URL for debugging
  const pathname = request.nextUrl.pathname;
  const fullUrl = request.url;
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  const isAuthenticated = !!token;
  
  const userRole = token?.role;
  const isAdmin = userRole === "ADMIN"; 
  
  
  const isRootPath = pathname === "/" || pathname === "" || new URL(fullUrl).pathname === "/";
  
  const isProtectedRoute = pathname.startsWith("/chat");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/api/auth");
  
  
  if (isAuthRoute) {
    return NextResponse.next();
  }
  
  if (isRootPath && isAuthenticated && isAdmin) {
    const adminUrl = new URL("/admin", fullUrl);
    return NextResponse.redirect(adminUrl, { status: 302 });
  }
  
  if (isRootPath && isAuthenticated && !isAdmin) {
    const chatUrl = new URL("/chat", fullUrl);
    return NextResponse.redirect(chatUrl, { status: 302 });
  }
  
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", fullUrl), { status: 302 });
  }

  if (isAdminRoute && (!isAuthenticated || !isAdmin)) {
    return NextResponse.redirect(new URL("/", fullUrl), { status: 302 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*", "/admin/:path*"],
}; 