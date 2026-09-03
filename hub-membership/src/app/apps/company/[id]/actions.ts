"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CompanySize, FundingStage } from "@/lib/supabase/types";

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

export async function updateCompany(companyId: string, _: { error?: string } | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Company name is required." };

  const foundedYearRaw = optionalText(formData, "founded_year");
  const founded_year = foundedYearRaw ? Number(foundedYearRaw) : null;
  if (founded_year !== null && !Number.isInteger(founded_year)) {
    return { error: "Founded year must be a whole number." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({
      name,
      industry: optionalText(formData, "industry"),
      company_size: optionalText(formData, "company_size") as CompanySize | null,
      funding_stage: optionalText(formData, "funding_stage") as FundingStage | null,
      founded_year,
      website: optionalText(formData, "website"),
      phone: optionalText(formData, "phone"),
      address: optionalText(formData, "address"),
      description: optionalText(formData, "description"),
      linkedin_url: optionalText(formData, "linkedin_url"),
      twitter_url: optionalText(formData, "twitter_url"),
    })
    .eq("id", companyId);

  if (error) return { error: error.message };

  revalidatePath(`/apps/company/${companyId}`);
  return {};
}

export async function reviewExperience(experienceId: string, approve: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_experience", {
    p_experience_id: experienceId,
    p_approve: approve,
  });
  if (error) return { error: error.message };
  revalidatePath("/apps/company/[id]", "page");
  return {};
}
