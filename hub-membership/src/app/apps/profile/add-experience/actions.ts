"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CompanySize, FundingStage } from "@/lib/supabase/types";

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

export async function requestExperience(
  companyId: string,
  _: { error?: string } | undefined,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Your title is required." };

  const isCurrent = formData.get("is_current") === "on";
  const startDate = optionalText(formData, "start_date");
  const endDate = isCurrent ? null : optionalText(formData, "end_date");
  const description = optionalText(formData, "description");

  const supabase = await createClient();
  const { error } = await supabase.from("experiences").insert({
    company_id: companyId,
    title,
    is_current: isCurrent,
    start_date: startDate,
    end_date: endDate,
    description,
  });

  if (error) return { error: error.message };

  redirect("/apps/profile");
}

export async function createCompanyWithExperience(
  _: { error?: string } | undefined,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!name) return { error: "Company name is required." };
  if (!title) return { error: "Your title is required." };

  const foundedYearRaw = optionalText(formData, "founded_year");
  const founded_year = foundedYearRaw ? Number(foundedYearRaw) : null;
  if (founded_year !== null && !Number.isInteger(founded_year)) {
    return { error: "Founded year must be a whole number." };
  }

  const supabase = await createClient();
  const { data: companyId, error } = await supabase.rpc("create_company_with_experience", {
    p_name: name,
    p_title: title,
    p_industry: optionalText(formData, "industry"),
    p_company_size: optionalText(formData, "company_size") as CompanySize | null,
    p_funding_stage: optionalText(formData, "funding_stage") as FundingStage | null,
    p_founded_year: founded_year,
    p_website: optionalText(formData, "website"),
    p_phone: optionalText(formData, "phone"),
    p_address: optionalText(formData, "address"),
    p_description: optionalText(formData, "description"),
    p_linkedin_url: optionalText(formData, "linkedin_url"),
    p_twitter_url: optionalText(formData, "twitter_url"),
  });

  if (error) return { error: error.message };

  redirect(`/apps/company/${companyId}`);
}
