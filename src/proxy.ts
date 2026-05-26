import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/create-auction",
  "/watchlist",
  "/profile",
  "/dashboard",
];

// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

// Routes that redirect logged-in users away
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/auctions", request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect non-admins away from admin routes
  if (isAdmin) {
    const userRole = (session?.user as { role?: string })?.role;
    if (!session || userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
