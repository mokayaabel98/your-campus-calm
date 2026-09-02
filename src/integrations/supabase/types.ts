export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          counsellor_id: string
          created_at: string
          duration_minutes: number
          format: Database["public"]["Enums"]["session_format"]
          id: string
          slot_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          student_id: string
          student_note: string | null
          updated_at: string
        }
        Insert: {
          counsellor_id: string
          created_at?: string
          duration_minutes?: number
          format?: Database["public"]["Enums"]["session_format"]
          id?: string
          slot_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          student_id: string
          student_note?: string | null
          updated_at?: string
        }
        Update: {
          counsellor_id?: string
          created_at?: string
          duration_minutes?: number
          format?: Database["public"]["Enums"]["session_format"]
          id?: string
          slot_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          student_id?: string
          student_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "availability_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      assistance_requests: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          reason: string | null
          status: string
          student_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          status?: string
          student_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistance_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          counsellor_id: string
          created_at: string
          duration_minutes: number
          id: string
          is_booked: boolean
          starts_at: string
        }
        Insert: {
          counsellor_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          is_booked?: boolean
          starts_at: string
        }
        Update: {
          counsellor_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          is_booked?: boolean
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellors"
            referencedColumns: ["id"]
          },
        ]
      }
      counsellors: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string
          focus_areas: string[]
          id: string
          is_active: boolean
          is_approved: boolean
          kind: Database["public"]["Enums"]["counsellor_kind"]
          languages: string[]
          qualifications: string | null
          session_fee_kes: number
          supports_in_person: boolean
          supports_online: boolean
          title: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name: string
          focus_areas?: string[]
          id?: string
          is_active?: boolean
          is_approved?: boolean
          kind: Database["public"]["Enums"]["counsellor_kind"]
          languages?: string[]
          qualifications?: string | null
          session_fee_kes?: number
          supports_in_person?: boolean
          supports_online?: boolean
          title?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string
          focus_areas?: string[]
          id?: string
          is_active?: boolean
          is_approved?: boolean
          kind?: Database["public"]["Enums"]["counsellor_kind"]
          languages?: string[]
          qualifications?: string | null
          session_fee_kes?: number
          supports_in_person?: boolean
          supports_online?: boolean
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_kes: number
          appointment_id: string | null
          checkout_request_id: string | null
          created_at: string
          currency: string
          id: string
          merchant_request_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string | null
          phone: string | null
          receipt_number: string | null
          reference: string
          result_desc: string | null
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          amount_kes?: number
          appointment_id?: string | null
          checkout_request_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          merchant_request_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          phone?: string | null
          receipt_number?: string | null
          reference?: string
          result_desc?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          amount_kes?: number
          appointment_id?: string | null
          checkout_request_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          merchant_request_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          phone?: string | null
          receipt_number?: string | null
          reference?: string
          result_desc?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_email_notifications: boolean
          allow_sms_notifications: boolean
          contact_email: string | null
          created_at: string
          display_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          allow_email_notifications?: boolean
          allow_sms_notifications?: boolean
          contact_email?: string | null
          created_at?: string
          display_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          allow_email_notifications?: boolean
          allow_sms_notifications?: boolean
          contact_email?: string | null
          created_at?: string
          display_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          appointment_id: string
          author_id: string
          content: string
          created_at: string
          id: string
        }
        Insert: {
          appointment_id: string
          author_id: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          appointment_id?: string
          author_id?: string
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_my_counsellor_record: {
        Args: { _counsellor_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "peer" | "counsellor" | "admin"
      appointment_status: "requested" | "confirmed" | "cancelled" | "completed"
      counsellor_kind: "professional" | "peer"
      payment_method:
        | "mpesa"
        | "card"
        | "mobile_money"
        | "bank"
        | "sponsored"
        | "free"
      payment_status: "pending" | "paid" | "failed" | "refunded" | "waived"
      session_format: "online" | "in_person"
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
      app_role: ["student", "peer", "counsellor", "admin"],
      appointment_status: ["requested", "confirmed", "cancelled", "completed"],
      counsellor_kind: ["professional", "peer"],
      payment_method: [
        "mpesa",
        "card",
        "mobile_money",
        "bank",
        "sponsored",
        "free",
      ],
      payment_status: ["pending", "paid", "failed", "refunded", "waived"],
      session_format: ["online", "in_person"],
    },
  },
} as const
