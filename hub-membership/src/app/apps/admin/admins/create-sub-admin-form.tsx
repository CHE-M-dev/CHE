"use client";

import { useActionState } from "react";
import { createSubAdmin } from "./actions";

export function CreateSubAdminForm() {
  const [state, formAction, pending] = useActionState(createSubAdmin, undefined);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-4">
      <input
        name="fullName"
        placeholder="Full name"
        required
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
      <input
        name="password"
        type="password"
        placeholder="Temporary password"
        required
        minLength={6}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create sub-admin"}
      </button>
      {state?.error && <p className="text-sm text-red-600 sm:col-span-4">{state.error}</p>}
    </form>
  );
}
