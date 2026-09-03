import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-context";

const FUNDING_STAGE_LABELS: Record<string, string> = {
  bootstrapped: "Bootstrapped",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  series_c_plus: "Series C+",
  public: "Public",
  acquired: "Acquired",
};

export default async function AdminCompaniesPage() {
  const { supabase, features } = await getAdminContext();
  if (!features.has("manage_companies")) redirect("/apps/admin");

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, created_at, industry, company_size, funding_stage")
    .order("created_at", { ascending: false });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-sm font-semibold text-neutral-900">All companies</h1>
      {!companies || companies.length === 0 ? (
        <p className="text-sm text-neutral-500">No companies yet.</p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {companies.map((c) => {
            const details = [
              c.industry,
              c.company_size ? `${c.company_size} employees` : null,
              c.funding_stage ? FUNDING_STAGE_LABELS[c.funding_stage] : null,
            ].filter(Boolean);
            return (
              <div key={c.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-medium text-neutral-800">{c.name}</span>
                  {details.length > 0 && (
                    <span className="ml-2 text-neutral-500">{details.join(" · ")}</span>
                  )}
                </div>
                <span className="text-neutral-500">
                  Created {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
