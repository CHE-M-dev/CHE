"use client";

import { useState, useTransition } from "react";
import { adminRemoveMember } from "./actions";

export function AdminRemoveButton({ memberRowId, name }: { memberRowId: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm(`Remove ${name}?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await adminRemoveMember(memberRowId);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Removing..." : "Remove"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
