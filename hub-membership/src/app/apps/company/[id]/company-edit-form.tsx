"use client";

import { useActionState } from "react";
import { updateCompany } from "./actions";
import type { Company } from "@/lib/supabase/types";

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

export function CompanyEditForm({ company }: { company: Company }) {
  const [state, formAction, pending] = useActionState(updateCompany.bind(null, company.id), undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="Company name" full>
        <input name="name" required defaultValue={company.name} className={inputClass} />
      </Field>

      <Field label="Industry">
        <input name="industry" defaultValue={company.industry ?? ""} className={inputClass} />
      </Field>
      <Field label="Company size">
        <select name="company_size" defaultValue={company.company_size ?? ""} className={inputClass}>
          <option value="">—</option>
          {COMPANY_SIZES.map((s) => (
            <option key={s} value={s}>
              {s} employees
            </option>
          ))}
        </select>
      </Field>
      <Field label="Funding stage">
        <select name="funding_stage" defaultValue={company.funding_stage ?? ""} className={inputClass}>
          <option value="">—</option>
          {FUNDING_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Founded year">
        <input
          name="founded_year"
          type="number"
          min={1800}
          max={2100}
          defaultValue={company.founded_year ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Website">
        <input name="website" type="url" defaultValue={company.website ?? ""} className={inputClass} />
      </Field>
      <Field label="Phone number">
        <input name="phone" type="tel" defaultValue={company.phone ?? ""} className={inputClass} />
      </Field>
      <Field label="LinkedIn URL">
        <input name="linkedin_url" type="url" defaultValue={company.linkedin_url ?? ""} className={inputClass} />
      </Field>
      <Field label="Twitter / X URL">
        <input name="twitter_url" type="url" defaultValue={company.twitter_url ?? ""} className={inputClass} />
      </Field>

      <Field label="Address" full>
        <input name="address" defaultValue={company.address ?? ""} className={inputClass} />
      </Field>

      <Field label="Description" full>
        <textarea name="description" rows={3} defaultValue={company.description ?? ""} className={inputClass} />
      </Field>

      {state?.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`space-y-1 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
