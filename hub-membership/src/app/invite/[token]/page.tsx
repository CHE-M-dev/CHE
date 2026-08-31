import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AcceptInviteButton } from "./accept-invite-button";

const ROLE_LABELS: Record<string, string> = {
  startup_member: "a startup member",
  employee: "an employee",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const [{ data: preview }, { data: userData }] = await Promise.all([
    supabase.rpc("get_invite_preview", { p_token: token }).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  const user = userData.user;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        {!preview || !preview.valid ? (
          <>
            <h1 className="text-xl font-semibold text-neutral-900">Invite not available</h1>
            <p className="text-sm text-neutral-500">
              This invite link is invalid, expired, or has already been used.
            </p>
            <Link href="/login" className="inline-block text-sm font-medium text-neutral-900 underline">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-neutral-900">You&apos;re invited</h1>
            <p className="text-sm text-neutral-500">
              Join <span className="font-medium text-neutral-800">{preview.company_name}</span> as{" "}
              {ROLE_LABELS[preview.role] ?? preview.role}.
            </p>

            {user ? (
              <AcceptInviteButton
                token={token}
                companyName={preview.company_name}
                role={ROLE_LABELS[preview.role] ?? preview.role}
              />
            ) : (
              <div className="space-y-2">
                <Link
                  href={`/signup?next=/invite/${token}`}
                  className="block w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
                >
                  Create an account to join
                </Link>
                <p className="text-sm text-neutral-500">
                  Already have an account?{" "}
                  <Link
                    href={`/login?next=/invite/${token}`}
                    className="font-medium text-neutral-900 underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
