import type { Tables } from "@/lib/supabase/database.types";

export type UserRole = "admin" | "member";
export type MemberStatus = "active" | "inactive";

export type Profile = Tables<"profiles">;
export type CheckIn = Tables<"check_ins">;

export type { Database } from "@/lib/supabase/database.types";
