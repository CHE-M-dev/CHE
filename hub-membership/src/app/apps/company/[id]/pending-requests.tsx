"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { reviewExperience } from "./actions";

export type PendingRequest = {
  id: string;
  title: string;
  profiles: { id: string; full_name: string; headline: string | null } | null;
};

export function PendingRequests({ requests }: { requests: PendingRequest[] }) {
  const [items, setItems] = useState(requests);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleReview(id: string, approve: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await reviewExperience(id, approve);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((prev) => prev.filter((r) => r.id !== id));
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-neutral-900">
        Pending requests ({items.length})
      </h2>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="divide-y divide-amber-100">
        {items.map((req) => (
          <div key={req.id} className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-medium text-neutral-800">
                {req.profiles ? (
                  <Link href={`/apps/profile/${req.profiles.id}`} className="underline hover:text-neutral-900">
                    {req.profiles.full_name}
                  </Link>
                ) : (
                  "Unknown person"
                )}{" "}
                <span className="font-normal text-neutral-600">wants to add: {req.title}</span>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => handleReview(req.id, true)}
                disabled={pending}
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleReview(req.id, false)}
                disabled={pending}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
