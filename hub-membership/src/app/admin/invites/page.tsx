import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-context";
import { AdminRevokeButton } from "./revoke-button";

const ROLE_LABELS: Record<string, string> = {
  startup_member: "Startup member",
  employee: "Employee",
};

export default async function AdminInvitesPage() {
  const { supabase, features } = await getAdminContext();
  if (!features.has("manage_invites")) redirect("/admin");

  const { data: invites } = await supabase
    .from("invites")
    .select("id, role, uses_count, max_uses, revoked, expires_at, companies(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-sm font-semibold text-neutral-900">All invite links</h1>
      {!invites || invites.length === 0 ? (
        <p className="text-sm text-neutral-500">No invites yet.</p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {invites.map((inv) => {
            const isValid =
              !inv.revoked && inv.uses_count < inv.max_uses && new Date(inv.expires_at) > new Date();
            return (
              <div key={inv.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium text-neutral-800">
                    {inv.companies?.name} · {ROLE_LABELS[inv.role]}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {inv.uses_count}/{inv.max_uses} used ·{" "}
                    {isValid ? "active" : inv.revoked ? "revoked" : "expired"}
                  </p>
                </div>
                {isValid && <AdminRevokeButton inviteId={inv.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
