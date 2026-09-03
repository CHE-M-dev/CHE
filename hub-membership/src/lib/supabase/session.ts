import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PATHS = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPath = AUTH_PATHS.some((p) => path.startsWith(p));
  const isInvitePath = path.startsWith("/invite/");

  // Signing in is the only landing page — everything else, including the
  // company directory, requires an account.
  if (!user) {
    if (isAuthPath || isInvitePath) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPath || path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/apps";
    return NextResponse.redirect(url);
  }

  if (isInvitePath) return response;

  // Everything under /apps is otherwise open to any signed-in user — each
  // app decides its own access beyond that. The two exceptions: the Admin
  // app is admin-only, and the Company app doesn't apply to admin accounts
  // (they don't hold company memberships).
  if (path.startsWith("/apps/admin") || path.startsWith("/apps/company")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("system_role")
      .eq("id", user.id)
      .single();
    const isAdmin = profile?.system_role === "super_admin" || profile?.system_role === "admin";

    if (path.startsWith("/apps/admin") && !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/apps";
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/apps/company") && isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/apps";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
