"use client";

import { useTransition } from "react";
import { deleteExperience } from "./actions";

export function DeleteExperienceButton({ experienceId }: { experienceId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Remove this experience?")) return;
    startTransition(async () => {
      await deleteExperience(experienceId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Removing..." : "Remove"}
    </button>
  );
}
