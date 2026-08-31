"use client";

import { useActionState } from "react";
import { acceptInvite } from "./actions";

export function AcceptInviteButton({
  token,
  companyName,
  role,
}: {
  token: string;
  companyName: string;
  role: string;
}) {
  const [state, formAction, pending] = useActionState(acceptInvite.bind(null, token), undefined);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Joining..." : `Join ${companyName} as ${role}`}
      </button>
    </form>
  );
}
