import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;
type CompanySizeValue = (typeof COMPANY_SIZES)[number];
function isCompanySize(value: string): value is CompanySizeValue {
  return (COMPANY_SIZES as readonly string[]).includes(value);
}

const FUNDING_STAGES = [
  { value: "bootstrapped", label: "Bootstrapped" },
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B" },
  { value: "series_c_plus", label: "Series C+" },
  { value: "public", label: "Public" },
  { value: "acquired", label: "Acquired" },
] as const;
type FundingStageValue = (typeof FUNDING_STAGES)[number]["value"];
function isFundingStage(value: string): value is FundingStageValue {
  return (FUNDING_STAGES as readonly { value: string }[]).some((s) => s.value === value);
}

const FUNDING_STAGE_LABELS: Record<FundingStageValue, string> = Object.fromEntries(
  FUNDING_STAGES.map((s) => [s.value, s.label]),
) as Record<FundingStageValue, string>;

export default async function CompanyDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; size?: string; stage?: string }>;
}) {
  const { q, size, stage } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("public_companies")
    .select("*")
    .order("created_at", { ascending: false });

  // Strip characters that are syntactically significant in a PostgREST
  // filter string so user input can't inject extra filter clauses.
  const safeQ = q?.replace(/[(),%*]/g, "").trim();
  if (safeQ) query = query.or(`name.ilike.%${safeQ}%,industry.ilike.%${safeQ}%,description.ilike.%${safeQ}%`);

  // Only pass through values that are actually valid for these enum
  // columns — anything else would otherwise error at the database level.
  if (size && isCompanySize(size)) {
    query = query.eq("company_size", size);
  }
  if (stage && isFundingStage(stage)) {
    query = query.eq("funding_stage", stage);
  }

  const { data: companies } = await query;

  return (
    <div>
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <span className="text-sm font-semibold text-neutral-900">Startup Directory</span>
        </div>
      </div>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <form className="flex flex-wrap gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, industry, or description"
            className="min-w-[200px] flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
          <select
            name="size"
            defaultValue={size ?? ""}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="">Any size</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} employees
              </option>
            ))}
          </select>
          <select
            name="stage"
            defaultValue={stage ?? ""}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="">Any stage</option>
            {FUNDING_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            Search
          </button>
          {(q || size || stage) && (
            <Link
              href="/apps/directory"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              Clear
            </Link>
          )}
        </form>

        {!companies || companies.length === 0 ? (
          <p className="text-sm text-neutral-500">No startups match your search.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/apps/company/${c.id}`}
                className="block space-y-2 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
              >
                <h2 className="text-sm font-semibold text-neutral-900">{c.name}</h2>
                {c.description && <p className="text-sm text-neutral-600">{c.description}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
                  {c.industry && <span>{c.industry}</span>}
                  {c.company_size && <span>{c.company_size} employees</span>}
                  {c.funding_stage && <span>{FUNDING_STAGE_LABELS[c.funding_stage]}</span>}
                  {c.founded_year && <span>Founded {c.founded_year}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
