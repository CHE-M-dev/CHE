"use client";

import { useState, useTransition } from "react";
import { toggleAdminFeature } from "./actions";

export function FeatureToggle({
  adminId,
  featureKey,
  label,
  initialEnabled,
}: {
  adminId: string;
  featureKey: string;
  label: string;
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      const result = await toggleAdminFeature(adminId, featureKey, next);
      if (result?.error) setEnabled(!next);
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={enabled}
        disabled={pending}
        onChange={(e) => handleChange(e.target.checked)}
        className="h-4 w-4 rounded border-neutral-300"
      />
      {label}
    </label>
  );
}
