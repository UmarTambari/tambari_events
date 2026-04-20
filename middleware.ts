import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Makes the requested path + query available to Server Components via `headers()`,
 * so auth helpers can send users to `/sign-in?redirect=...` with the right return URL.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-search", request.nextUrl.search);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
