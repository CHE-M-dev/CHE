import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditForm } from "./profile-edit-form";
import { DeleteExperienceButton } from "./delete-experience-button";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Not approved",
};

const STATUS_CLASSES: Record<string, string> = {
  pending: "text-amber-600",
  approved: "text-emerald-600",
  rejected: "text-red-600",
};

function formatRange(start: string | null, end: string | null, isCurrent: boolean) {
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" });
  const from = start ? fmt(start) : null;
  const to = isCurrent ? "Present" : end ? fmt(end) : null;
  if (from && to) return `${from} – ${to}`;
  if (from) return from;
  return null;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  const { data: experiences } = await supabase
    .from("experiences")
    .select("id, title, is_current, start_date, end_date, status, companies(id, name)")
    .eq("profile_id", user!.id)
    .order("is_current", { ascending: false })
    .order("start_date", { ascending: false });

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-lg font-semibold text-neutral-900">Your profile</h1>
        <ProfileEditForm profile={profile} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Experience</h2>
          <Link
            href="/apps/profile/add-experience"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700"
          >
            Add experience
          </Link>
        </div>

        {!experiences || experiences.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No experience yet. Add the startup you work at to get started.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {experiences.map((exp) => {
              const range = formatRange(exp.start_date, exp.end_date, exp.is_current);
              return (
                <div key={exp.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{exp.title}</p>
                    <p className="text-sm text-neutral-600">
                      {exp.companies ? (
                        <Link
                          href={`/apps/company/${exp.companies.id}`}
                          className="underline hover:text-neutral-900"
                        >
                          {exp.companies.name}
                        </Link>
                      ) : (
                        "Unknown company"
                      )}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {range}
                      {range && " · "}
                      <span className={STATUS_CLASSES[exp.status]}>{STATUS_LABELS[exp.status]}</span>
                    </p>
                  </div>
                  <DeleteExperienceButton experienceId={exp.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
