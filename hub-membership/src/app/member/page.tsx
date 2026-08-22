import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { MemberQrCode } from "@/app/member/member-qr-code";

export default async function MemberPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("id, created_at")
    .eq("member_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">{profile.full_name}</h1>
            <p className="text-sm text-neutral-500">{profile.email}</p>
          </div>
          <SignOutButton />
        </div>

        {profile.status === "inactive" && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your membership is currently inactive. Contact an admin at the hub.
          </div>
        )}

        <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-neutral-700">Show this at check-in</p>
          <MemberQrCode value={profile.id} />
          <p className="text-xs text-neutral-400">Member ID: {profile.id.slice(0, 8)}</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">Recent check-ins</h2>
          {!checkIns || checkIns.length === 0 ? (
            <p className="text-sm text-neutral-500">No check-ins yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {checkIns.map((c) => (
                <li key={c.id} className="py-2 text-sm text-neutral-700">
                  {new Date(c.created_at).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
