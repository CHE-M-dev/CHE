import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberControls } from "@/app/admin/members/[id]/member-controls";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase.from("profiles").select("*").eq("id", id).single();

  if (!member) notFound();

  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("id, created_at")
    .eq("member_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">{member.full_name}</h1>
        <p className="text-sm text-neutral-500">{member.email}</p>
      </div>

      <MemberControls member={member} />

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Check-in history</h2>
        {!checkIns || checkIns.length === 0 ? (
          <p className="text-sm text-neutral-500">No check-ins yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {checkIns.map((c) => (
              <li key={c.id} className="py-2 text-sm text-neutral-700">
                {new Date(c.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
