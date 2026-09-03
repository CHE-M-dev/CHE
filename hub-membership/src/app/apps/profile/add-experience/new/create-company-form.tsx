"use client";

import { useActionState } from "react";
import { createCompanyWithExperience } from "../actions";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const FUNDING_STAGES: { value: string; label: string }[] = [
  { value: "bootstrapped", label: "Bootstrapped" },
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B" },
  { value: "series_c_plus", label: "Series C+" },
  { value: "public", label: "Public" },
  { value: "acquired", label: "Acquired" },
];

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

export function CreateCompanyForm() {
  const [state, formAction, pending] = useActionState(createCompanyWithExperience, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-neutral-900">About the company</legend>

        <Field label="Company name" required>
          <input name="name" required className={inputClass} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Industry">
            <input name="industry" className={inputClass} />
          </Field>
          <Field label="Company size">
            <select name="company_size" defaultValue="" className={inputClass}>
              <option value="">—</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} employees
                </option>
              ))}
            </select>
          </Field>
          <Field label="Funding stage">
            <select name="funding_stage" defaultValue="" className={inputClass}>
              <option value="">—</option>
              {FUNDING_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Founded year">
            <input name="founded_year" type="number" min={1800} max={2100} className={inputClass} />
          </Field>
          <Field label="Website">
            <input name="website" type="url" className={inputClass} />
          </Field>
          <Field label="Phone number">
            <input name="phone" type="tel" className={inputClass} />
          </Field>
          <Field label="LinkedIn URL">
            <input name="linkedin_url" type="url" className={inputClass} />
          </Field>
          <Field label="Twitter / X URL">
            <input name="twitter_url" type="url" className={inputClass} />
          </Field>
        </div>

        <Field label="Address">
          <input name="address" className={inputClass} />
        </Field>

        <Field label="Description">
          <textarea name="description" rows={3} className={inputClass} />
        </Field>
      </fieldset>

      <fieldset className="space-y-2 border-t border-neutral-200 pt-4">
        <legend className="text-sm font-semibold text-neutral-900">Your role</legend>
        <Field label="Your title" required>
          <input name="title" required placeholder="e.g. Founder & CEO" className={inputClass} />
        </Field>
      </fieldset>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create company page"}
      </button>
      <p className="text-center text-xs text-neutral-500">
        Your title is approved automatically since you&apos;re creating this page, but the company
        itself needs a platform admin&apos;s approval before it&apos;s public.
      </p>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
