import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-context";

export default async function AdminCompaniesPage() {
  const { supabase, features } = await getAdminContext();
  if (!features.has("manage_companies")) redirect("/admin");

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-sm font-semibold text-neutral-900">All companies</h1>
      {!companies || companies.length === 0 ? (
        <p className="text-sm text-neutral-500">No companies yet.</p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {companies.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium text-neutral-800">{c.name}</span>
              <span className="text-neutral-500">
                Created {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
