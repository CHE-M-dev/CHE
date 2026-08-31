"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("system_role")
    .eq("id", user.id)
    .single();

  if (profile?.system_role !== "super_admin") throw new Error("Only a super admin can do this.");
  return supabase;
}

export async function createSubAdmin(_: { error?: string } | undefined, formData: FormData) {
  try {
    await requireSuperAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || password.length < 6) {
    return { error: "Full name, email, and a password of at least 6 characters are required." };
  }

  const adminClient = createAdminClient();

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create the account." };
  }

  const { error: roleError } = await adminClient
    .from("profiles")
    .update({ system_role: "admin" })
    .eq("id", created.user.id);

  if (roleError) {
    return { error: roleError.message };
  }

  revalidatePath("/admin/admins");
  return {};
}

export async function toggleAdminFeature(adminId: string, featureKey: string, enabled: boolean) {
  const supabase = await requireSuperAdmin();

  const { error } = await supabase
    .from("admin_feature_grants")
    .upsert({ admin_id: adminId, feature_key: featureKey, enabled }, { onConflict: "admin_id,feature_key" });

  if (error) return { error: error.message };
  revalidatePath("/admin/admins");
  return {};
}
