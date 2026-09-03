"use client";

import { useState, useTransition } from "react";
import { reviewCompanyAdmin } from "./actions";

export function ReviewButtons({ companyId }: { companyId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handle(approve: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await reviewCompanyAdmin(companyId, approve);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          onClick={() => handle(true)}
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => handle(false)}
          disabled={pending}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
