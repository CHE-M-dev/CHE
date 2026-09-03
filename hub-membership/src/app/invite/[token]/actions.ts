"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function acceptInvite(token: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/invite/${token}`);
  }

  const { error } = await supabase.rpc("accept_invite", { p_token: token });

  if (error) {
    return { error: error.message };
  }

  redirect("/apps/company");
}
