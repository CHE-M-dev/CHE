import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AddExperiencePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existing } = await supabase
    .from("experiences")
    .select("company_id")
    .eq("profile_id", user!.id)
    .neq("status", "rejected");
  const excludeIds = (existing ?? []).map((e) => e.company_id);

  const safeQ = q?.replace(/[(),%*]/g, "").trim();

  let results: { id: string; name: string; industry: string | null }[] = [];
  if (safeQ) {
    let query = supabase
      .from("public_companies")
      .select("id, name, industry")
      .or(`name.ilike.%${safeQ}%,industry.ilike.%${safeQ}%`)
      .order("name", { ascending: true })
      .limit(20);
    if (excludeIds.length > 0) query = query.not("id", "in", `(${excludeIds.join(",")})`);
    const { data } = await query;
    results = data ?? [];
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <h1 className="text-lg font-semibold text-neutral-900">Add experience</h1>
      <p className="text-sm text-neutral-500">
        Search for the startup you work at. Can&apos;t find it?{" "}
        <Link href="/apps/profile/add-experience/new" className="font-medium text-neutral-900 underline">
          Create its page
        </Link>
        .
      </p>

      <form className="flex gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by company name or industry"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          Search
        </button>
      </form>

      {safeQ && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          {results.length === 0 ? (
            <p className="py-2 text-sm text-neutral-500">No matching startups. You can create its page instead.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {results.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{c.name}</p>
                    {c.industry && <p className="text-xs text-neutral-500">{c.industry}</p>}
                  </div>
                  <Link
                    href={`/apps/profile/add-experience/${c.id}`}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                  >
                    Add experience here
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
