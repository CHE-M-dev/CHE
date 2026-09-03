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
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          system_role?: Database["public"]["Enums"]["system_role"]
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          system_role?: Database["public"]["Enums"]["system_role"]
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
          industry: string | null
          company_size: Database["public"]["Enums"]["company_size"] | null
          funding_stage: Database["public"]["Enums"]["funding_stage"] | null
          founded_year: number | null
          website: string | null
          phone: string | null
          address: string | null
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          industry?: string | null
          company_size?: Database["public"]["Enums"]["company_size"] | null
          funding_stage?: Database["public"]["Enums"]["funding_stage"] | null
          founded_year?: number | null
          website?: string | null
          phone?: string | null
          address?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
          industry?: string | null
          company_size?: Database["public"]["Enums"]["company_size"] | null
          funding_stage?: Database["public"]["Enums"]["funding_stage"] | null
          founded_year?: number | null
          website?: string | null
          phone?: string | null
          address?: string | null
          description?: string | null
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
      company_members: {
        Row: {
          id: string
          company_id: string
          user_id: string
          company_role: Database["public"]["Enums"]["company_role"]
          invited_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          company_role: Database["public"]["Enums"]["company_role"]
          invited_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          company_role?: Database["public"]["Enums"]["company_role"]
          invited_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          id: string
          company_id: string
          role: Database["public"]["Enums"]["company_role"]
          token: string
          created_by: string
          max_uses: number
          uses_count: number
          revoked: boolean
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          role: Database["public"]["Enums"]["company_role"]
          token?: string
          created_by: string
          max_uses?: number
          uses_count?: number
          revoked?: boolean
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          role?: Database["public"]["Enums"]["company_role"]
          token?: string
          created_by?: string
          max_uses?: number
          uses_count?: number
          revoked?: boolean
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_company_id_fkey"
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
      [_ in never]: never
    }
    Functions: {
      current_system_role: { Args: never; Returns: Database["public"]["Enums"]["system_role"] }
      current_company_id: { Args: never; Returns: string }
      current_company_role: { Args: never; Returns: Database["public"]["Enums"]["company_role"] }
      admin_has_feature: { Args: { p_feature: string }; Returns: boolean }
      create_company: { Args: { p_name: string }; Returns: string }
      get_invite_preview: {
        Args: { p_token: string }
        Returns: { company_name: string; role: Database["public"]["Enums"]["company_role"]; valid: boolean }[]
      }
      accept_invite: { Args: { p_token: string }; Returns: string }
    }
    Enums: {
      system_role: "super_admin" | "admin" | "user"
      company_role: "leader" | "startup_member" | "employee"
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
      company_role: ["leader", "startup_member", "employee"],
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
    },
  },
} as const
