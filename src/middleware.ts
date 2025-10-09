import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  // Allow access to the landing page without authentication
  if (req.nextUrl.pathname === '/') {
    return NextResponse.next(); // This is direct 'fuck-you' to nextjs lol
  }
  
  return withAuth(req);
}

export const config = {
    matcher: [
        // Apply middleware to all routes except static files and Next.js internals
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
    ]
};