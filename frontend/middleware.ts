import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the exact pathname and URL for debugging
  const pathname = request.nextUrl.pathname;
  const fullUrl = request.url;
  
  console.log("------- MIDDLEWARE EXECUTION -------");
  console.log("Full URL:", fullUrl);
  console.log("Pathname:", pathname);
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  console.log("Token:", token ? "Authenticated" : "Not authenticated");
  console.log("User role:", token?.role || "none");
  console.log("Username:", token?.username || "none");
  console.log("Middleware token:", JSON.stringify(token, null, 2));
  
  const isAuthenticated = !!token;
  
  const userRole = token?.role;
  const isAdmin = userRole === "ADMIN"; 
  
  console.log("Is admin?", isAdmin);
  
  // Improve root path detection by checking if path is exactly "/"
  const isRootPath = pathname === "/" || pathname === "" || new URL(fullUrl).pathname === "/";
  
  // Define additional routes
  const isProtectedRoute = pathname.startsWith("/chat");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/api/auth");
  
  console.log("Is root path?", isRootPath);
  
  // IMPORTANT: Don't redirect during auth flows
  if (isAuthRoute) {
    console.log("🔑 Auth route, proceeding normally");
    return NextResponse.next();
  }
  
  // Redirect authenticated admins from root to admin page
  if (isRootPath && isAuthenticated && isAdmin) {
    console.log("⚠️ REDIRECTING ADMIN from home to admin dashboard");
    const adminUrl = new URL("/admin", fullUrl);
    console.log("Redirecting to:", adminUrl.toString());
    return NextResponse.redirect(adminUrl, { status: 302 });
  }
  
  // Redirect authenticated non-admin users from root to chat
  if (isRootPath && isAuthenticated && !isAdmin) {
    console.log("⚠️ REDIRECTING USER from home to chat");
    const chatUrl = new URL("/chat", fullUrl);
    console.log("Redirecting to:", chatUrl.toString());
    return NextResponse.redirect(chatUrl, { status: 302 });
  }
  
  // Protect chat routes
  if (isProtectedRoute && !isAuthenticated) {
    console.log("⚠️ REDIRECTING unauthenticated user from protected route to home");
    return NextResponse.redirect(new URL("/", fullUrl), { status: 302 });
  }

  // Protect admin routes
  if (isAdminRoute && !isAdmin) {
    console.log("⚠️ REDIRECTING non-admin from admin route to home");
    return NextResponse.redirect(new URL("/", fullUrl), { status: 302 });
  }

  console.log("Proceeding with request normally");
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/", "/chat/:path*", "/admin/:path*"],
}; 