import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function formatRange(start: string | null, end: string | null, isCurrent: boolean) {
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" });
  const from = start ? fmt(start) : null;
  const to = isCurrent ? "Present" : end ? fmt(end) : null;
  if (from && to) return `${from} – ${to}`;
  if (from) return from;
  return null;
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (id === user!.id) redirect("/apps/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, headline, bio")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-neutral-500">This profile isn&apos;t available.</p>
      </div>
    );
  }

  const { data: experiences } = await supabase
    .from("experiences")
    .select("id, title, is_current, start_date, end_date, companies(id, name)")
    .eq("profile_id", id)
    .eq("status", "approved")
    .order("is_current", { ascending: false })
    .order("start_date", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-900">{profile.full_name}</h1>
        {profile.headline && <p className="mt-1 text-sm text-neutral-600">{profile.headline}</p>}
        {profile.bio && <p className="mt-4 whitespace-pre-wrap text-sm text-neutral-700">{profile.bio}</p>}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Experience</h2>
        {!experiences || experiences.length === 0 ? (
          <p className="text-sm text-neutral-500">No experience listed.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {experiences.map((exp) => (
              <div key={exp.id} className="py-3">
                <p className="text-sm font-medium text-neutral-800">{exp.title}</p>
                <p className="text-sm text-neutral-600">
                  {exp.companies ? (
                    <Link href={`/apps/company/${exp.companies.id}`} className="underline hover:text-neutral-900">
                      {exp.companies.name}
                    </Link>
                  ) : (
                    "Unknown company"
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatRange(exp.start_date, exp.end_date, exp.is_current)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
