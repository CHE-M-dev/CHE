import { createClient } from "@/lib/supabase/server";
import { RequestExperienceForm } from "./request-form";

export default async function AddExperienceAtCompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("public_companies")
    .select("id, name")
    .eq("id", companyId)
    .maybeSingle();

  if (!company) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <p className="text-sm text-neutral-500">This startup isn&apos;t available.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Add experience at {company.name}</h1>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <RequestExperienceForm companyId={company.id} />
      </div>
    </div>
  );
}
