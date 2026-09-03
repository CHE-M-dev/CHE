import type { Tables } from "@/lib/supabase/database.types";

export type SystemRole = "super_admin" | "admin" | "user";
export type CompanyRole = "leader" | "startup_member" | "employee";
export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";
export type FundingStage =
  | "bootstrapped"
  | "pre_seed"
  | "seed"
  | "series_a"
  | "series_b"
  | "series_c_plus"
  | "public"
  | "acquired";

export type Profile = Tables<"profiles">;
export type Company = Tables<"companies">;
export type CompanyMember = Tables<"company_members">;
export type Invite = Tables<"invites">;
export type AdminFeature = Tables<"admin_features">;
export type AdminFeatureGrant = Tables<"admin_feature_grants">;

export type { Database } from "@/lib/supabase/database.types";
