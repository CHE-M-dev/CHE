"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adminRevokeInvite(inviteId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invites").update({ revoked: true }).eq("id", inviteId);
  if (error) return { error: error.message };
  revalidatePath("/admin/invites");
  return {};
}
