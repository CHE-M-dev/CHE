"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adminRemoveMember(memberRowId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("company_members").delete().eq("id", memberRowId);
  if (error) return { error: error.message };
  revalidatePath("/apps/admin/members");
  return {};
}
