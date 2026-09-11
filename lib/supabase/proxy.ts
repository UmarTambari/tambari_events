import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies onto the request so downstream server components see them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          // Write cookies onto the response so the browser stores the refreshed token
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // CRITICAL: Do not remove this call. It refreshes the session token.
  // Without it, users get logged out as soon as their JWT expires.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Forward the current path so lib/auth.ts can build the ?redirect= return URL
  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname);
  supabaseResponse.headers.set("x-search", request.nextUrl.search);

  return { supabaseResponse, user };
}