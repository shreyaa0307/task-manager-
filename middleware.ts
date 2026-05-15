import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";

const publicPaths = ["/", "/login", "/signup"];
const authPaths = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, etc.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("session")?.value;
  const payload = await decrypt(session);

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (payload && authPaths.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and trying to access protected pages
  if (!payload && !publicPaths.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
