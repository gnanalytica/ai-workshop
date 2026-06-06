import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow unauthenticated routes
  if (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/start") ||
    pathname.startsWith("/auth") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Refresh session + check for missing roll_number
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: Record<string, unknown>;
          }>,
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/start", request.url));
  }

  // Skip check on roll-number entry page itself
  if (pathname === "/start/roll-number") {
    return response;
  }

  // For authenticated routes, check if student needs to set roll_number
  const { data: registration } = await supabase
    .from("registrations")
    .select("user_id, roll_number")
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .maybeSingle();

  // If confirmed student with no roll_number, redirect to entry form
  if (registration && !registration.roll_number) {
    return NextResponse.redirect(new URL("/start/roll-number", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
