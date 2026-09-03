import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-context";
import { AdminRemoveButton } from "./remove-button";

const ROLE_LABELS: Record<string, string> = {
  leader: "Leader",
  startup_member: "Startup member",
  employee: "Employee",
};

export default async function AdminMembersPage() {
  const { supabase, features } = await getAdminContext();
  if (!features.has("manage_members")) redirect("/apps/admin");

  const { data: members } = await supabase
    .from("company_members")
    .select("id, company_role, companies(name), profiles(full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-sm font-semibold text-neutral-900">All members</h1>
      {!members || members.length === 0 ? (
        <p className="text-sm text-neutral-500">No members yet.</p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-neutral-800">
                  {m.profiles?.full_name || m.profiles?.email}
                </p>
                <p className="text-xs text-neutral-500">
                  {m.companies?.name} · {ROLE_LABELS[m.company_role]}
                </p>
              </div>
              {m.company_role !== "leader" && (
                <AdminRemoveButton
                  memberRowId={m.id}
                  name={m.profiles?.full_name || m.profiles?.email || "this person"}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
