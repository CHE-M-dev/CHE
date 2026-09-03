import { getAdminContext } from "@/lib/admin-context";

export default async function AdminOverviewPage() {
  const { supabase, isSuperAdmin, features } = await getAdminContext();

  const [companyCount, pendingCount, adminCount] = await Promise.all([
    features.has("manage_companies")
      ? supabase.from("companies").select("*", { count: "exact", head: true }).then((r) => r.count)
      : null,
    features.has("manage_companies")
      ? supabase
          .from("companies")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
          .then((r) => r.count)
      : null,
    isSuperAdmin || features.has("view_admins")
      ? supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .in("system_role", ["admin", "super_admin"])
          .then((r) => r.count)
      : null,
  ]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Companies" value={companyCount} />
        <StatCard label="Pending review" value={pendingCount} />
        <StatCard label="Admins" value={adminCount} />
      </div>
      <p className="text-sm text-neutral-500">
        {isSuperAdmin
          ? "You have full access. Manage sub-admins and their permissions under Admins."
          : "You can see the sections your permissions grant you in the navigation above."}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-neutral-900">{value ?? "—"}</p>
    </div>
  );
}
