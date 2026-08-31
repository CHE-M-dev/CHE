"use client";

import { useActionState } from "react";
import { createCompany } from "./actions";
import { SignOutButton } from "@/components/sign-out-button";

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(createCompany, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-neutral-900">Set up your company</h1>
          <p className="text-sm text-neutral-500">
            Create your startup&apos;s workspace. You&apos;ll be the team leader and can invite
            startup members and employees afterwards.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-neutral-700">
              Company name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {pending ? "Creating..." : "Create company"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          Got an invite link from a team lead? Open it to join their company instead.
        </p>

        <div className="text-center">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
