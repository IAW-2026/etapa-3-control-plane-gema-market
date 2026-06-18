import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isSuperadmin } from "@/lib/auth/role";

// Solo /sign-in es público. El resto exige sesión con rol `superadmin`:
//  - sin userId            → /sign-in
//  - con sesión sin el rol → /unauthorized
const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const { userId, sessionClaims } = await auth();

  if (isPublicRoute(req)) {
    // Si ya está logueado y es superadmin, mandarlo al overview.
    if (userId && isSuperadmin(sessionClaims)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (!isSuperadmin(sessionClaims)) {
    if (pathname === "/unauthorized") return NextResponse.next();
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
