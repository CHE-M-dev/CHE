"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CompanyRole } from "@/lib/supabase/types";

export async function createCompany(_: { error?: string } | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Company name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_company", { p_name: name });

  if (error) {
    return { error: error.message };
  }

  redirect("/apps/company");
}

export async function createInvite(role: Extract<CompanyRole, "startup_member" | "employee">) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id, company_role")
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.company_role !== "leader") {
    return { error: "Only the team leader can create invite links." };
  }

  const { data, error } = await supabase
    .from("invites")
    .insert({ company_id: membership.company_id, role, created_by: user.id })
    .select("token")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/apps/company");
  return { token: data.token };
}

export async function revokeInvite(inviteId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invites").update({ revoked: true }).eq("id", inviteId);
  if (error) return { error: error.message };
  revalidatePath("/apps/company");
  return {};
}

export async function removeCompanyMember(memberRowId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("company_members").delete().eq("id", memberRowId);
  if (error) return { error: error.message };
  revalidatePath("/apps/company");
  return {};
}

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

export async function updateCompanyProfile(_: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id, company_role")
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.company_role !== "leader") {
    return { error: "Only the team leader can edit the company profile." };
  }

  const foundedYearRaw = optionalText(formData, "founded_year");
  const founded_year = foundedYearRaw ? Number(foundedYearRaw) : null;
  if (founded_year !== null && !Number.isInteger(founded_year)) {
    return { error: "Founded year must be a whole number." };
  }

  const { error } = await supabase
    .from("companies")
    .update({
      industry: optionalText(formData, "industry"),
      company_size: optionalText(formData, "company_size") as
        | "1-10"
        | "11-50"
        | "51-200"
        | "201-500"
        | "500+"
        | null,
      funding_stage: optionalText(formData, "funding_stage") as
        | "bootstrapped"
        | "pre_seed"
        | "seed"
        | "series_a"
        | "series_b"
        | "series_c_plus"
        | "public"
        | "acquired"
        | null,
      founded_year,
      website: optionalText(formData, "website"),
      phone: optionalText(formData, "phone"),
      address: optionalText(formData, "address"),
      description: optionalText(formData, "description"),
    })
    .eq("id", membership.company_id);

  if (error) return { error: error.message };

  revalidatePath("/apps/company");
  return {};
}
