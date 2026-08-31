import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("system_role")
    .eq("id", user!.id)
    .single();

  const isSuperAdmin = profile?.system_role === "super_admin";

  let features = new Set<string>();
  if (isSuperAdmin) {
    features = new Set(["manage_companies", "manage_members", "manage_invites", "view_admins"]);
  } else {
    const { data: grants } = await supabase
      .from("admin_feature_grants")
      .select("feature_key")
      .eq("admin_id", user!.id)
      .eq("enabled", true);
    features = new Set((grants ?? []).map((g) => g.feature_key));
  }

  return { supabase, user: user!, isSuperAdmin, features };
}
