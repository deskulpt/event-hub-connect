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
      bookings: {
        Row: {
          created_at: string
          deposit_cents: number
          event_date: string | null
          event_id: string | null
          host_id: string
          id: string
          inquiry_id: string | null
          notes: string | null
          provider_id: string
          provider_kind: Database["public"]["Enums"]["recipient_kind"]
          status: Database["public"]["Enums"]["booking_status"]
          title: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_cents?: number
          event_date?: string | null
          event_id?: string | null
          host_id: string
          id?: string
          inquiry_id?: string | null
          notes?: string | null
          provider_id: string
          provider_kind: Database["public"]["Enums"]["recipient_kind"]
          status?: Database["public"]["Enums"]["booking_status"]
          title: string
          total_cents?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_cents?: number
          event_date?: string | null
          event_id?: string | null
          host_id?: string
          id?: string
          inquiry_id?: string | null
          notes?: string | null
          provider_id?: string
          provider_kind?: Database["public"]["Enums"]["recipient_kind"]
          status?: Database["public"]["Enums"]["booking_status"]
          title?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          owner_id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          owner_id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          owner_id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          accessibility_notes: string | null
          budget_cents: number | null
          city: string | null
          created_at: string
          dietary_notes: string | null
          event_date: string | null
          event_type: string | null
          guest_count: number | null
          id: string
          owner_id: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
          vibe: string | null
        }
        Insert: {
          accessibility_notes?: string | null
          budget_cents?: number | null
          city?: string | null
          created_at?: string
          dietary_notes?: string | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          owner_id: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
          vibe?: string | null
        }
        Update: {
          accessibility_notes?: string | null
          budget_cents?: number | null
          city?: string | null
          created_at?: string
          dietary_notes?: string | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
          vibe?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          budget_max_cents: number | null
          budget_min_cents: number | null
          created_at: string
          event_id: string | null
          guest_count: number | null
          id: string
          message: string | null
          recipient_id: string
          recipient_kind: Database["public"]["Enums"]["recipient_kind"]
          replied_at: string | null
          reply_note: string | null
          requested_date: string | null
          sender_id: string
          status: Database["public"]["Enums"]["inquiry_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          budget_max_cents?: number | null
          budget_min_cents?: number | null
          created_at?: string
          event_id?: string | null
          guest_count?: number | null
          id?: string
          message?: string | null
          recipient_id: string
          recipient_kind: Database["public"]["Enums"]["recipient_kind"]
          replied_at?: string | null
          reply_note?: string | null
          requested_date?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          budget_max_cents?: number | null
          budget_min_cents?: number | null
          created_at?: string
          event_id?: string | null
          guest_count?: number | null
          id?: string
          message?: string | null
          recipient_id?: string
          recipient_kind?: Database["public"]["Enums"]["recipient_kind"]
          replied_at?: string | null
          reply_note?: string | null
          requested_date?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          booking_id: string | null
          created_at: string
          currency: string
          due_on: string | null
          event_id: string | null
          id: string
          issued_on: string
          line_items: Json
          notes: string | null
          number: string
          owner_id: string
          paid_on: string | null
          recipient_email: string | null
          recipient_name: string
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          currency?: string
          due_on?: string | null
          event_id?: string | null
          id?: string
          issued_on?: string
          line_items?: Json
          notes?: string | null
          number: string
          owner_id: string
          paid_on?: string | null
          recipient_email?: string | null
          recipient_name: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          currency?: string
          due_on?: string | null
          event_id?: string | null
          id?: string
          issued_on?: string
          line_items?: Json
          notes?: string | null
          number?: string
          owner_id?: string
          paid_on?: string | null
          recipient_email?: string | null
          recipient_name?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          inquiry_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          inquiry_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          inquiry_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          expected_on: string | null
          id: string
          method: string | null
          notes: string | null
          owner_id: string
          paid_on: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          currency?: string
          expected_on?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          owner_id: string
          paid_on?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          expected_on?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          owner_id?: string
          paid_on?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_role: Database["public"]["Enums"]["app_role"]
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          updated_at: string
        }
        Insert: {
          active_role?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarded?: boolean
          updated_at?: string
        }
        Update: {
          active_role?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          amount_cents: number
          category: string | null
          created_at: string
          currency: string
          event_id: string | null
          file_url: string | null
          id: string
          notes: string | null
          occurred_on: string
          owner_id: string
          updated_at: string
          vendor_name: string
        }
        Insert: {
          amount_cents?: number
          category?: string | null
          created_at?: string
          currency?: string
          event_id?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          occurred_on?: string
          owner_id: string
          updated_at?: string
          vendor_name: string
        }
        Update: {
          amount_cents?: number
          category?: string | null
          created_at?: string
          currency?: string
          event_id?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          occurred_on?: string
          owner_id?: string
          updated_at?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_listings: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          listing_kind: Database["public"]["Enums"]["recipient_kind"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          listing_kind: Database["public"]["Enums"]["recipient_kind"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          listing_kind?: Database["public"]["Enums"]["recipient_kind"]
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          booking_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          event_id: string | null
          id: string
          owner_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          owner_id: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_cents: number
          booking_id: string | null
          counterparty: string | null
          created_at: string
          currency: string
          description: string | null
          event_id: string | null
          id: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          occurred_on: string
          owner_id: string
          status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          booking_id?: string | null
          counterparty?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          event_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["transaction_kind"]
          occurred_on?: string
          owner_id: string
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          counterparty?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          event_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["transaction_kind"]
          occurred_on?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      vendors: {
        Row: {
          base_price_cents: number | null
          category: Database["public"]["Enums"]["vendor_category"]
          city: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          photo_url: string | null
          published: boolean
          updated_at: string
          vibe_tags: string[] | null
        }
        Insert: {
          base_price_cents?: number | null
          category?: Database["public"]["Enums"]["vendor_category"]
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          photo_url?: string | null
          published?: boolean
          updated_at?: string
          vibe_tags?: string[] | null
        }
        Update: {
          base_price_cents?: number | null
          category?: Database["public"]["Enums"]["vendor_category"]
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          photo_url?: string | null
          published?: boolean
          updated_at?: string
          vibe_tags?: string[] | null
        }
        Relationships: []
      }
      venues: {
        Row: {
          base_price_cents: number | null
          capacity_max: number | null
          capacity_min: number | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          photo_url: string | null
          published: boolean
          updated_at: string
          vibe_tags: string[] | null
        }
        Insert: {
          base_price_cents?: number | null
          capacity_max?: number | null
          capacity_min?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          photo_url?: string | null
          published?: boolean
          updated_at?: string
          vibe_tags?: string[] | null
        }
        Update: {
          base_price_cents?: number | null
          capacity_max?: number | null
          capacity_min?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          photo_url?: string | null
          published?: boolean
          updated_at?: string
          vibe_tags?: string[] | null
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
    }
    Enums: {
      app_role: "host" | "pro" | "business" | "admin"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "refunded"
      event_status: "draft" | "planning" | "booked" | "completed" | "cancelled"
      inquiry_status: "new" | "sent" | "replied" | "declined" | "expired"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "void"
      payout_status: "scheduled" | "in_transit" | "paid" | "failed"
      recipient_kind: "venue" | "pro" | "business"
      task_status: "todo" | "in_progress" | "done" | "blocked"
      transaction_kind:
        | "charge"
        | "refund"
        | "deposit"
        | "fee"
        | "payout"
        | "expense"
      transaction_status: "pending" | "succeeded" | "failed" | "refunded"
      vendor_category:
        | "chef"
        | "dj"
        | "photographer"
        | "planner"
        | "artist"
        | "caterer"
        | "florist"
        | "other"
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
      app_role: ["host", "pro", "business", "admin"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "refunded",
      ],
      event_status: ["draft", "planning", "booked", "completed", "cancelled"],
      inquiry_status: ["new", "sent", "replied", "declined", "expired"],
      invoice_status: ["draft", "sent", "paid", "overdue", "void"],
      payout_status: ["scheduled", "in_transit", "paid", "failed"],
      recipient_kind: ["venue", "pro", "business"],
      task_status: ["todo", "in_progress", "done", "blocked"],
      transaction_kind: [
        "charge",
        "refund",
        "deposit",
        "fee",
        "payout",
        "expense",
      ],
      transaction_status: ["pending", "succeeded", "failed", "refunded"],
      vendor_category: [
        "chef",
        "dj",
        "photographer",
        "planner",
        "artist",
        "caterer",
        "florist",
        "other",
      ],
    },
  },
} as const
