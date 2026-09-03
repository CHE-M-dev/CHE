export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          system_role: Database["public"]["Enums"]["system_role"]
          headline: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          system_role?: Database["public"]["Enums"]["system_role"]
          headline?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          system_role?: Database["public"]["Enums"]["system_role"]
          headline?: string | null
          bio?: string | null
          created_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
          status: Database["public"]["Enums"]["approval_status"]
          industry: string | null
          company_size: Database["public"]["Enums"]["company_size"] | null
          funding_stage: Database["public"]["Enums"]["funding_stage"] | null
          founded_year: number | null
          website: string | null
          phone: string | null
          address: string | null
          description: string | null
          linkedin_url: string | null
          twitter_url: string | null
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          status?: Database["public"]["Enums"]["approval_status"]
          industry?: string | null
          company_size?: Database["public"]["Enums"]["company_size"] | null
          funding_stage?: Database["public"]["Enums"]["funding_stage"] | null
          founded_year?: number | null
          website?: string | null
          phone?: string | null
          address?: string | null
          description?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
          status?: Database["public"]["Enums"]["approval_status"]
          industry?: string | null
          company_size?: Database["public"]["Enums"]["company_size"] | null
          funding_stage?: Database["public"]["Enums"]["funding_stage"] | null
          founded_year?: number | null
          website?: string | null
          phone?: string | null
          address?: string | null
          description?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          id: string
          profile_id: string
          company_id: string
          title: string
          is_current: boolean
          start_date: string | null
          end_date: string | null
          description: string | null
          status: Database["public"]["Enums"]["approval_status"]
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string
          company_id: string
          title: string
          is_current?: boolean
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          company_id?: string
          title?: string
          is_current?: boolean
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_features: {
        Row: {
          feature_key: string
          label: string
          description: string
        }
        Insert: {
          feature_key: string
          label: string
          description: string
        }
        Update: {
          feature_key?: string
          label?: string
          description?: string
        }
        Relationships: []
      }
      admin_feature_grants: {
        Row: {
          admin_id: string
          feature_key: string
          enabled: boolean
        }
        Insert: {
          admin_id: string
          feature_key: string
          enabled?: boolean
        }
        Update: {
          admin_id?: string
          feature_key?: string
          enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "admin_feature_grants_feature_key_fkey"
            columns: ["feature_key"]
            isOneToOne: false
            referencedRelation: "admin_features"
            referencedColumns: ["feature_key"]
          },
        ]
      }
    }
    Views: {
      public_companies: {
        Row: {
          id: string
          name: string
          industry: string | null
          company_size: Database["public"]["Enums"]["company_size"] | null
          funding_stage: Database["public"]["Enums"]["funding_stage"] | null
          founded_year: number | null
          website: string | null
          description: string | null
          address: string | null
          linkedin_url: string | null
          twitter_url: string | null
          created_by: string
          created_at: string
        }
        Relationships: []
      }
    }
    Functions: {
      current_system_role: { Args: never; Returns: Database["public"]["Enums"]["system_role"] }
      admin_has_feature: { Args: { p_feature: string }; Returns: boolean }
      company_is_approved: { Args: { p_company_id: string }; Returns: boolean }
      create_company_with_experience: {
        Args: {
          p_name: string
          p_title: string
          p_industry?: string | null
          p_company_size?: Database["public"]["Enums"]["company_size"] | null
          p_funding_stage?: Database["public"]["Enums"]["funding_stage"] | null
          p_founded_year?: number | null
          p_website?: string | null
          p_phone?: string | null
          p_address?: string | null
          p_description?: string | null
          p_linkedin_url?: string | null
          p_twitter_url?: string | null
        }
        Returns: string
      }
      review_experience: { Args: { p_experience_id: string; p_approve: boolean }; Returns: undefined }
      review_company: { Args: { p_company_id: string; p_approve: boolean }; Returns: undefined }
    }
    Enums: {
      system_role: "super_admin" | "admin" | "user"
      company_size: "1-10" | "11-50" | "51-200" | "201-500" | "500+"
      funding_stage:
        | "bootstrapped"
        | "pre_seed"
        | "seed"
        | "series_a"
        | "series_b"
        | "series_c_plus"
        | "public"
        | "acquired"
      approval_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      system_role: ["super_admin", "admin", "user"],
      company_size: ["1-10", "11-50", "51-200", "201-500", "500+"],
      funding_stage: [
        "bootstrapped",
        "pre_seed",
        "seed",
        "series_a",
        "series_b",
        "series_c_plus",
        "public",
        "acquired",
      ],
      approval_status: ["pending", "approved", "rejected"],
    },
  },
} as const
