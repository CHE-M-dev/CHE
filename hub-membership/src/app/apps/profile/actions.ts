"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(_: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!fullName) return { error: "Name is required." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, headline: headline || null, bio: bio || null })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/apps/profile");
  return {};
}

export async function deleteExperience(experienceId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("experiences").delete().eq("id", experienceId);
  if (error) return { error: error.message };
  revalidatePath("/apps/profile");
  return {};
}
