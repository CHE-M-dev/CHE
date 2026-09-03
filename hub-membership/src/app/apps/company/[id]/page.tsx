import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CompanyEditForm } from "./company-edit-form";
import { PendingRequests, type PendingRequest } from "./pending-requests";
import type { Company, PublicCompany } from "@/lib/supabase/types";

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

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = tab === "who-works-here" ? "who-works-here" : "about";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: fullCompany } = await supabase.from("companies").select("*").eq("id", id).maybeSingle();
  const company: Company | PublicCompany | null =
    fullCompany ?? (await supabase.from("public_companies").select("*").eq("id", id).maybeSingle()).data;

  if (!company) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-neutral-500">This company isn&apos;t available.</p>
      </div>
    );
  }

  const isOwner = company.created_by === user!.id;
  const status = fullCompany?.status ?? "approved";

  let pendingRequests: PendingRequest[] = [];
  if (isOwner) {
    const { data } = await supabase
      .from("experiences")
      .select("id, title, profiles(id, full_name, headline)")
      .eq("company_id", id)
      .eq("status", "pending");
    pendingRequests = data ?? [];
  }

  const { data: colleagues } = await supabase
    .from("experiences")
    .select("id, title, profiles(id, full_name, headline)")
    .eq("company_id", id)
    .eq("status", "approved")
    .eq("is_current", true);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">{company.name}</h1>
        {status !== "approved" && (
          <p className="mt-1 text-xs font-medium text-amber-600">
            {status === "pending"
              ? "Awaiting platform admin approval — only you can see this page until then."
              : "This company page was not approved."}
          </p>
        )}
      </div>

      {isOwner && <PendingRequests requests={pendingRequests} />}

      <div className="flex gap-4 border-b border-neutral-200 text-sm font-medium">
        <Link
          href={`/apps/company/${id}`}
          className={activeTab === "about" ? "border-b-2 border-neutral-900 pb-2 text-neutral-900" : "pb-2 text-neutral-500"}
        >
          About
        </Link>
        <Link
          href={`/apps/company/${id}?tab=who-works-here`}
          className={
            activeTab === "who-works-here"
              ? "border-b-2 border-neutral-900 pb-2 text-neutral-900"
              : "pb-2 text-neutral-500"
          }
        >
          Who works here ({colleagues?.length ?? 0})
        </Link>
      </div>

      {activeTab === "about" ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          {isOwner && fullCompany ? (
            <CompanyEditForm company={fullCompany} />
          ) : (
            <AboutDisplay company={company} />
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          {!colleagues || colleagues.length === 0 ? (
            <p className="text-sm text-neutral-500">No one has been added here yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {colleagues.map((c) => (
                <div key={c.id} className="py-3">
                  <p className="text-sm font-medium text-neutral-800">
                    {c.profiles ? (
                      <Link href={`/apps/profile/${c.profiles.id}`} className="underline hover:text-neutral-900">
                        {c.profiles.full_name}
                      </Link>
                    ) : (
                      "Unknown"
                    )}
                  </p>
                  <p className="text-sm text-neutral-600">{c.title}</p>
                  {c.profiles?.headline && <p className="text-xs text-neutral-500">{c.profiles.headline}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AboutDisplay({ company }: { company: Company | PublicCompany }) {
  const rows: [string, string | null][] = [
    ["Industry", company.industry],
    ["Company size", company.company_size ? `${company.company_size} employees` : null],
    ["Funding stage", company.funding_stage ? FUNDING_STAGE_LABELS[company.funding_stage] : null],
    ["Founded", company.founded_year ? String(company.founded_year) : null],
    ["Address", company.address],
    ...("phone" in company ? ([["Phone", company.phone]] as [string, string | null][]) : []),
  ];
  const filled = rows.filter(([, value]) => value);

  return (
    <div className="space-y-4 text-sm">
      {company.description && <p className="text-neutral-700">{company.description}</p>}

      {filled.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
          {filled.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-neutral-500">{label}</dt>
              <dd className="text-neutral-800">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {(company.website || company.linkedin_url || company.twitter_url) && (
        <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-3">
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-neutral-900 underline">
              Website
            </a>
          )}
          {company.linkedin_url && (
            <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-neutral-900 underline">
              LinkedIn
            </a>
          )}
          {company.twitter_url && (
            <a href={company.twitter_url} target="_blank" rel="noopener noreferrer" className="text-neutral-900 underline">
              Twitter / X
            </a>
          )}
        </div>
      )}
    </div>
  );
}
