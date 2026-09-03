"use client";

import { useTransition } from "react";
import { revokeInvite } from "./actions";

export function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await revokeInvite(inviteId);
        })
      }
      disabled={pending}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Revoking..." : "Revoke"}
    </button>
  );
}
