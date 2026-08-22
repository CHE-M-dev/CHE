"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export function MemberControls({ member }: { member: Profile }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleStatus() {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const nextStatus = member.status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("profiles").update({ status: nextStatus }).eq("id", member.id);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function toggleRole() {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const nextRole = member.role === "admin" ? "member" : "admin";
    const { error } = await supabase.from("profiles").update({ role: nextRole }).eq("id", member.id);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <span className="text-sm text-neutral-600">
        Role: <span className="font-medium capitalize text-neutral-900">{member.role}</span>
      </span>
      <span className="text-sm text-neutral-600">
        Status: <span className="font-medium capitalize text-neutral-900">{member.status}</span>
      </span>

      <div className="ml-auto flex gap-2">
        <button
          onClick={toggleRole}
          disabled={pending}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          {member.role === "admin" ? "Revoke admin" : "Make admin"}
        </button>
        <button
          onClick={toggleStatus}
          disabled={pending}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          {member.status === "active" ? "Deactivate" : "Activate"}
        </button>
      </div>

      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </div>
  );
}
