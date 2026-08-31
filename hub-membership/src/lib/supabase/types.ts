import type { Tables } from "@/lib/supabase/database.types";

export type SystemRole = "super_admin" | "admin" | "user";
export type CompanyRole = "leader" | "startup_member" | "employee";

export type Profile = Tables<"profiles">;
export type Company = Tables<"companies">;
export type CompanyMember = Tables<"company_members">;
export type Invite = Tables<"invites">;
export type AdminFeature = Tables<"admin_features">;
export type AdminFeatureGrant = Tables<"admin_feature_grants">;

export type { Database } from "@/lib/supabase/database.types";
