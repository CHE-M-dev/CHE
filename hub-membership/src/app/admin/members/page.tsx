import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-neutral-900">Members</h1>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {members?.map((m) => (
              <tr key={m.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/members/${m.id}`} className="font-medium text-neutral-900 underline">
                    {m.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{m.email}</td>
                <td className="px-4 py-3 capitalize text-neutral-600">{m.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-medium " +
                      (m.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-200 text-neutral-600")
                    }
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!members || members.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  No members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
