import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-context";
import { CreateSubAdminForm } from "./create-sub-admin-form";
import { FeatureToggle } from "./feature-toggle";

export default async function AdminAdminsPage() {
  const { supabase, isSuperAdmin, features } = await getAdminContext();
  if (!isSuperAdmin && !features.has("view_admins")) redirect("/apps/admin");

  const [{ data: admins }, { data: featureCatalog }, { data: grants }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, system_role")
      .in("system_role", ["admin", "super_admin"])
      .order("created_at", { ascending: true }),
    supabase.from("admin_features").select("feature_key, label"),
    isSuperAdmin
      ? supabase.from("admin_feature_grants").select("admin_id, feature_key, enabled")
      : Promise.resolve({ data: [] as { admin_id: string; feature_key: string; enabled: boolean }[] }),
  ]);

  const grantsByAdmin = new Map<string, Map<string, boolean>>();
  for (const g of grants ?? []) {
    if (!grantsByAdmin.has(g.admin_id)) grantsByAdmin.set(g.admin_id, new Map());
    grantsByAdmin.get(g.admin_id)!.set(g.feature_key, g.enabled);
  }

  return (
    <div className="space-y-8">
      {isSuperAdmin && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-sm font-semibold text-neutral-900">Create a sub-admin</h1>
          <CreateSubAdminForm />
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Admins</h2>
        <div className="divide-y divide-neutral-100">
          {(admins ?? []).map((a) => (
            <div key={a.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-800">{a.full_name || a.email}</p>
                  <p className="text-xs text-neutral-500">{a.email}</p>
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {a.system_role === "super_admin" ? "Super admin" : "Admin"}
                </span>
              </div>

              {isSuperAdmin && a.system_role === "admin" && (
                <div className="mt-3 flex flex-wrap gap-4">
                  {(featureCatalog ?? []).map((f) => (
                    <FeatureToggle
                      key={f.feature_key}
                      adminId={a.id}
                      featureKey={f.feature_key}
                      label={f.label}
                      initialEnabled={grantsByAdmin.get(a.id)?.get(f.feature_key) ?? false}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
