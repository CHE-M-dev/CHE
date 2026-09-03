"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";
import type { Profile } from "@/lib/supabase/types";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-700">Name</label>
        <input name="full_name" defaultValue={profile.full_name} required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-700">Headline</label>
        <input
          name="headline"
          defaultValue={profile.headline ?? ""}
          placeholder="e.g. Founder at Acme, or Software Engineer"
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-700">About</label>
        <textarea name="bio" rows={4} defaultValue={profile.bio ?? ""} className={inputClass} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
