import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // API routes handle their own auth (e.g. the Telegram webhook verifies
    // Telegram's secret token) — redirecting them to /login on an
    // unauthenticated request would break them, since callers there aren't
    // a browser that can follow an HTML redirect.
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
