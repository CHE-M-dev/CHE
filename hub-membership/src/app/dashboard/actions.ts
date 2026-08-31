"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CompanyRole } from "@/lib/supabase/types";

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

  revalidatePath("/dashboard");
  return { token: data.token };
}

export async function revokeInvite(inviteId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invites").update({ revoked: true }).eq("id", inviteId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function removeCompanyMember(memberRowId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("company_members").delete().eq("id", memberRowId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}
