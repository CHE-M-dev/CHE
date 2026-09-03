import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminContext } from "@/lib/admin-context";
import { ReviewButtons } from "./review-buttons";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_CLASSES: Record<string, string> = {
  pending: "text-amber-600",
  approved: "text-emerald-600",
  rejected: "text-red-600",
};

export default async function AdminCompaniesPage() {
  const { supabase, features } = await getAdminContext();
  if (!features.has("manage_companies")) redirect("/apps/admin");

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, status, industry, company_size, funding_stage, created_at")
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
              c.funding_stage,
            ].filter(Boolean);
            return (
              <div key={c.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-neutral-800">
                    <Link href={`/apps/company/${c.id}`} className="underline hover:text-neutral-900">
                      {c.name}
                    </Link>
                  </p>
                  <p className="text-xs text-neutral-500">
                    {details.length > 0 && `${details.join(" · ")} · `}
                    <span className={STATUS_CLASSES[c.status]}>{STATUS_LABELS[c.status]}</span>
                  </p>
                </div>
                {c.status === "pending" && <ReviewButtons companyId={c.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
