import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [{ count: totalMembers }, { count: activeMembers }, { count: checkInsToday }, { data: recentCheckIns }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfToday.toISOString()),
      supabase
        .from("check_ins")
        .select("id, created_at, member:profiles!check_ins_member_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total members" value={totalMembers ?? 0} />
        <StatCard label="Active members" value={activeMembers ?? 0} />
        <StatCard label="Check-ins today" value={checkInsToday ?? 0} />
      </div>

      <Link
        href="/admin/scan"
        className="block rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-neutral-700"
      >
        Scan member QR code to check in →
      </Link>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Recent check-ins</h2>
        {!recentCheckIns || recentCheckIns.length === 0 ? (
          <p className="text-sm text-neutral-500">No check-ins yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {recentCheckIns.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium text-neutral-800">
                  {c.member?.full_name ?? "Unknown member"}
                </span>
                <span className="text-neutral-500">{new Date(c.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
