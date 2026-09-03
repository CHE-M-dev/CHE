"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function reviewCompanyAdmin(companyId: string, approve: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_company", { p_company_id: companyId, p_approve: approve });
  if (error) return { error: error.message };
  revalidatePath("/apps/admin/companies");
  return {};
}
