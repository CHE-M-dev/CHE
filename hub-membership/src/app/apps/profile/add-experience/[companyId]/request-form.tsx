"use client";

import { useActionState, useState } from "react";
import { requestExperience } from "../actions";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

export function RequestExperienceForm({ companyId }: { companyId: string }) {
  const [state, formAction, pending] = useActionState(
    requestExperience.bind(null, companyId),
    undefined,
  );
  const [isCurrent, setIsCurrent] = useState(true);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-700">Your title</label>
        <input name="title" required placeholder="e.g. Software Engineer" className={inputClass} />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="is_current"
          defaultChecked
          onChange={(e) => setIsCurrent(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
        I currently work here
      </label>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700">Start date</label>
          <input type="date" name="start_date" className={inputClass} />
        </div>
        {!isCurrent && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">End date</label>
            <input type="date" name="end_date" className={inputClass} />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-700">Description (optional)</label>
        <textarea name="description" rows={3} className={inputClass} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit for approval"}
      </button>
      <p className="text-center text-xs text-neutral-500">
        The company&apos;s owner will need to approve this before it shows on your profile.
      </p>
    </form>
  );
}
