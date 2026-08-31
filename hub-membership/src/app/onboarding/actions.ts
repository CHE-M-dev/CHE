"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  redirect("/dashboard");
}
