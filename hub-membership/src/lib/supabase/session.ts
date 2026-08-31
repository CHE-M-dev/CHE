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

  if (!user) {
    if (isAuthPath || isInvitePath) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("system_role").eq("id", user.id).single(),
    supabase.from("company_members").select("company_id").eq("user_id", user.id).maybeSingle(),
  ]);

  const isAdmin = profile?.system_role === "super_admin" || profile?.system_role === "admin";
  const hasCompany = !!membership;
  const home = isAdmin ? "/admin" : hasCompany ? "/dashboard" : "/onboarding";

  if (isAuthPath || path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  if (isInvitePath) return response;

  if (path.startsWith("/admin") && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/dashboard")) {
    if (isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    if (!hasCompany) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  if (path.startsWith("/onboarding") && (isAdmin || hasCompany)) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  return response;
}
