"use client";

import { useState, useTransition } from "react";
import { createInvite } from "./actions";

export function InviteGenerator() {
  const [pending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function generate(role: "startup_member" | "employee") {
    setError(null);
    setLink(null);
    setCopied(false);
    startTransition(async () => {
      const result = await createInvite(role);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("token" in result && result.token) {
        setLink(`${window.location.origin}/invite/${result.token}`);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">Invite people</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => generate("startup_member")}
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          Invite startup member
        </button>
        <button
          onClick={() => generate("employee")}
          disabled={pending}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          Invite employee
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {link && (
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
          <input
            readOnly
            value={link}
            className="w-full truncate bg-transparent text-sm text-neutral-700 focus:outline-none"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              setCopied(true);
            }}
            className="shrink-0 rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
