import { createClient } from "@/lib/supabase/server";

export default async function CompanyAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user!.id)
    .maybeSingle();

  const { data: company } = membership
    ? await supabase.from("companies").select("name").eq("id", membership.company_id).single()
    : { data: null };

  return (
    <div>
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <span className="text-sm font-semibold text-neutral-900">
            {company?.name ?? "Company"}
          </span>
        </div>
      </div>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
