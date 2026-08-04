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
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after_value: Json | null
          before_value: Json | null
          created_at: string
          domain: string
          id: string
          reason: string | null
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          domain: string
          id?: string
          reason?: string | null
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          domain?: string
          id?: string
          reason?: string | null
          target_id?: string | null
        }
        Relationships: []
      }
      ai_provider_settings: {
        Row: {
          created_at: string
          enabled: boolean
          fallback_model: string | null
          fallback_provider: string | null
          feature: string
          id: string
          monthly_spend_cap_cents: number | null
          notes: string | null
          primary_model: string
          primary_provider: string
          rate_limit_per_min: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          fallback_model?: string | null
          fallback_provider?: string | null
          feature: string
          id?: string
          monthly_spend_cap_cents?: number | null
          notes?: string | null
          primary_model?: string
          primary_provider?: string
          rate_limit_per_min?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          fallback_model?: string | null
          fallback_provider?: string | null
          feature?: string
          id?: string
          monthly_spend_cap_cents?: number | null
          notes?: string | null
          primary_model?: string
          primary_provider?: string
          rate_limit_per_min?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
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
      circle_members: {
        Row: {
          circle_id: string
          created_at: string
          id: string
          is_organizer: boolean
          user_id: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          id?: string
          is_organizer?: boolean
          user_id: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          id?: string
          is_organizer?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          interest_tags: string[]
          language: string
          locality_id: string | null
          member_count: number
          name: string
          organization_id: string | null
          owner_id: string
          photo_url: string | null
          published: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          interest_tags?: string[]
          language?: string
          locality_id?: string | null
          member_count?: number
          name: string
          organization_id?: string | null
          owner_id: string
          photo_url?: string | null
          published?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          interest_tags?: string[]
          language?: string
          locality_id?: string | null
          member_count?: number
          name?: string
          organization_id?: string | null
          owner_id?: string
          photo_url?: string | null
          published?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circles_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          cap_cents: number | null
          category: string
          created_at: string
          created_by: string | null
          effective_from: string
          effective_to: string | null
          floor_cents: number
          id: string
          rate_percent: number
        }
        Insert: {
          cap_cents?: number | null
          category: string
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          floor_cents?: number
          id?: string
          rate_percent?: number
        }
        Update: {
          cap_cents?: number | null
          category?: string
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          floor_cents?: number
          id?: string
          rate_percent?: number
        }
        Relationships: []
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
      content_moderation_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision: string | null
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
          subject_id: string
          subject_table: string
          triage_confidence: number | null
          triage_label: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string | null
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
          subject_id: string
          subject_table: string
          triage_confidence?: number | null
          triage_label?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string | null
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          subject_id?: string
          subject_table?: string
          triage_confidence?: number | null
          triage_label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      event_generation_rules: {
        Row: {
          auto_publish: boolean
          created_at: string
          enabled: boolean
          id: string
          locality_id: string | null
          min_threshold: number
          radius_bands: number[]
          slate_size: number
          threshold_multiplier: number
          updated_at: string
          voting_window_days: number
        }
        Insert: {
          auto_publish?: boolean
          created_at?: string
          enabled?: boolean
          id?: string
          locality_id?: string | null
          min_threshold?: number
          radius_bands?: number[]
          slate_size?: number
          threshold_multiplier?: number
          updated_at?: string
          voting_window_days?: number
        }
        Update: {
          auto_publish?: boolean
          created_at?: string
          enabled?: boolean
          id?: string
          locality_id?: string | null
          min_threshold?: number
          radius_bands?: number[]
          slate_size?: number
          threshold_multiplier?: number
          updated_at?: string
          voting_window_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_generation_rules_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: true
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_invites: {
        Row: {
          copy: string | null
          created_at: string
          event_id: string
          headline: string | null
          id: string
          image_url: string | null
          owner_id: string
          rsvp_enabled: boolean
          slug: string
          source: string
          updated_at: string
        }
        Insert: {
          copy?: string | null
          created_at?: string
          event_id: string
          headline?: string | null
          id?: string
          image_url?: string | null
          owner_id: string
          rsvp_enabled?: boolean
          slug: string
          source?: string
          updated_at?: string
        }
        Update: {
          copy?: string | null
          created_at?: string
          event_id?: string
          headline?: string | null
          id?: string
          image_url?: string | null
          owner_id?: string
          rsvp_enabled?: boolean
          slug?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_plans: {
        Row: {
          created_at: string
          event_id: string
          id: string
          model: string | null
          owner_id: string
          shortlist: Json
          summary: string | null
          tasks: Json
          timeline: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          model?: string | null
          owner_id: string
          shortlist?: Json
          summary?: string | null
          tasks?: Json
          timeline?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          model?: string | null
          owner_id?: string
          shortlist?: Json
          summary?: string | null
          tasks?: Json
          timeline?: Json
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          accessibility_attributes: string[]
          accessibility_notes: string | null
          budget_cents: number | null
          circle_id: string | null
          city: string | null
          created_at: string
          dietary_notes: string | null
          event_date: string | null
          event_type: string | null
          external_source: string | null
          guest_count: number | null
          id: string
          indoor_outdoor: string | null
          language: string
          locality_id: string | null
          min_attendance: number | null
          organization_id: string | null
          origin: string
          owner_id: string
          proposal_id: string | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
          vibe: string | null
        }
        Insert: {
          accessibility_attributes?: string[]
          accessibility_notes?: string | null
          budget_cents?: number | null
          circle_id?: string | null
          city?: string | null
          created_at?: string
          dietary_notes?: string | null
          event_date?: string | null
          event_type?: string | null
          external_source?: string | null
          guest_count?: number | null
          id?: string
          indoor_outdoor?: string | null
          language?: string
          locality_id?: string | null
          min_attendance?: number | null
          organization_id?: string | null
          origin?: string
          owner_id: string
          proposal_id?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
          vibe?: string | null
        }
        Update: {
          accessibility_attributes?: string[]
          accessibility_notes?: string | null
          budget_cents?: number | null
          circle_id?: string | null
          city?: string | null
          created_at?: string
          dietary_notes?: string | null
          event_date?: string | null
          event_type?: string | null
          external_source?: string | null
          guest_count?: number | null
          id?: string
          indoor_outdoor?: string | null
          language?: string
          locality_id?: string | null
          min_attendance?: number | null
          organization_id?: string | null
          origin?: string
          owner_id?: string
          proposal_id?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
          vibe?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          key: string
          label: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          key: string
          label?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          key?: string
          label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      feature_toggle_overrides: {
        Row: {
          created_at: string
          enabled: boolean
          flag_key: string
          id: string
          scope_id: string | null
          scope_kind: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled: boolean
          flag_key: string
          id?: string
          scope_id?: string | null
          scope_kind: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          flag_key?: string
          id?: string
          scope_id?: string | null
          scope_kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_toggle_overrides_flag_key_fkey"
            columns: ["flag_key"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["key"]
          },
        ]
      }
      generated_activity_proposals: {
        Row: {
          accessibility_attributes: string[]
          category: string | null
          circle_id: string | null
          claimed_by: string | null
          created_at: string
          estimated_cost_cents: number
          event_id: string | null
          id: string
          indoor_outdoor: string | null
          language: string
          locality_id: string | null
          rationale: string | null
          run_id: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          suggested_date: string | null
          suggested_time: string | null
          summary: string | null
          title: string
          updated_at: string
          vote_count: number
          vote_threshold: number
          voting_closes_on: string | null
          voting_opens_on: string | null
        }
        Insert: {
          accessibility_attributes?: string[]
          category?: string | null
          circle_id?: string | null
          claimed_by?: string | null
          created_at?: string
          estimated_cost_cents?: number
          event_id?: string | null
          id?: string
          indoor_outdoor?: string | null
          language?: string
          locality_id?: string | null
          rationale?: string | null
          run_id?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          suggested_date?: string | null
          suggested_time?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          vote_count?: number
          vote_threshold?: number
          voting_closes_on?: string | null
          voting_opens_on?: string | null
        }
        Update: {
          accessibility_attributes?: string[]
          category?: string | null
          circle_id?: string | null
          claimed_by?: string | null
          created_at?: string
          estimated_cost_cents?: number
          event_id?: string | null
          id?: string
          indoor_outdoor?: string | null
          language?: string
          locality_id?: string | null
          rationale?: string | null
          run_id?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          suggested_date?: string | null
          suggested_time?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          vote_count?: number
          vote_threshold?: number
          voting_closes_on?: string | null
          voting_opens_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_activity_proposals_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_activity_proposals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_activity_proposals_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_activity_proposals_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "proposal_generation_runs"
            referencedColumns: ["id"]
          },
        ]
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
      localities: {
        Row: {
          active: boolean
          center_lat: number | null
          center_lng: number | null
          city: string | null
          country: string
          created_at: string
          default_language: string
          id: string
          member_count: number
          name: string
          radius_miles: number
          state: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          center_lat?: number | null
          center_lng?: number | null
          city?: string | null
          country?: string
          created_at?: string
          default_language?: string
          id?: string
          member_count?: number
          name: string
          radius_miles?: number
          state?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          center_lat?: number | null
          center_lng?: number | null
          city?: string | null
          country?: string
          created_at?: string
          default_language?: string
          id?: string
          member_count?: number
          name?: string
          radius_miles?: number
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      localization_settings: {
        Row: {
          coverage_percent: number
          created_at: string
          enabled: boolean
          id: string
          is_default: boolean
          label: string
          language_code: string
          native_label: string | null
          updated_at: string
        }
        Insert: {
          coverage_percent?: number
          created_at?: string
          enabled?: boolean
          id?: string
          is_default?: boolean
          label: string
          language_code: string
          native_label?: string | null
          updated_at?: string
        }
        Update: {
          coverage_percent?: number
          created_at?: string
          enabled?: boolean
          id?: string
          is_default?: boolean
          label?: string
          language_code?: string
          native_label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      memorabilia_listings: {
        Row: {
          category: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          locality_id: string | null
          owner_id: string
          price_cents: number
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          locality_id?: string | null
          owner_id: string
          price_cents?: number
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          locality_id?: string | null
          owner_id?: string
          price_cents?: number
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorabilia_listings_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
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
      organization_members: {
        Row: {
          created_at: string
          id: string
          org_role: string
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_role?: string
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_role?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          kind: string
          locality_id: string | null
          logo_url: string | null
          name: string
          owner_id: string
          registration_number: string | null
          status: Database["public"]["Enums"]["org_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          locality_id?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          registration_number?: string | null
          status?: Database["public"]["Enums"]["org_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          locality_id?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          registration_number?: string | null
          status?: Database["public"]["Enums"]["org_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
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
      perk_redemptions: {
        Row: {
          id: string
          perk_id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          id?: string
          perk_id: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          id?: string
          perk_id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perk_redemptions_perk_id_fkey"
            columns: ["perk_id"]
            isOneToOne: false
            referencedRelation: "perks_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      perks_offers: {
        Row: {
          category: string | null
          code: string | null
          created_at: string
          description: string | null
          discount_label: string | null
          ends_on: string | null
          id: string
          image_url: string | null
          locality_id: string | null
          max_redemptions: number | null
          organization_id: string | null
          owner_id: string
          redemption_count: number
          starts_on: string | null
          status: Database["public"]["Enums"]["perk_status"]
          terms: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          discount_label?: string | null
          ends_on?: string | null
          id?: string
          image_url?: string | null
          locality_id?: string | null
          max_redemptions?: number | null
          organization_id?: string | null
          owner_id: string
          redemption_count?: number
          starts_on?: string | null
          status?: Database["public"]["Enums"]["perk_status"]
          terms?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          discount_label?: string | null
          ends_on?: string | null
          id?: string
          image_url?: string | null
          locality_id?: string | null
          max_redemptions?: number | null
          organization_id?: string | null
          owner_id?: string
          redemption_count?: number
          starts_on?: string | null
          status?: Database["public"]["Enums"]["perk_status"]
          terms?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perks_offers_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perks_offers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_credentials: {
        Row: {
          created_at: string
          document_url: string | null
          expires_on: string | null
          id: string
          issued_on: string | null
          kind: string
          owner_id: string
          reviewer_note: string | null
          state: Database["public"]["Enums"]["verification_state"]
          title: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          expires_on?: string | null
          id?: string
          issued_on?: string | null
          kind: string
          owner_id: string
          reviewer_note?: string | null
          state?: Database["public"]["Enums"]["verification_state"]
          title: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          document_url?: string | null
          expires_on?: string | null
          id?: string
          issued_on?: string | null
          kind?: string
          owner_id?: string
          reviewer_note?: string | null
          state?: Database["public"]["Enums"]["verification_state"]
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_credentials_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accessibility_prefs: Json
          active_role: Database["public"]["Enums"]["app_role"]
          age_band: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          interests: string[]
          latitude: number | null
          locality_id: string | null
          longitude: number | null
          onboarded: boolean
          preferred_language: string
          updated_at: string
          voice_first_enabled: boolean
        }
        Insert: {
          accessibility_prefs?: Json
          active_role?: Database["public"]["Enums"]["app_role"]
          age_band?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          interests?: string[]
          latitude?: number | null
          locality_id?: string | null
          longitude?: number | null
          onboarded?: boolean
          preferred_language?: string
          updated_at?: string
          voice_first_enabled?: boolean
        }
        Update: {
          accessibility_prefs?: Json
          active_role?: Database["public"]["Enums"]["app_role"]
          age_band?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: string[]
          latitude?: number | null
          locality_id?: string | null
          longitude?: number | null
          onboarded?: boolean
          preferred_language?: string
          updated_at?: string
          voice_first_enabled?: boolean
        }
        Relationships: []
      }
      proposal_generation_runs: {
        Row: {
          created_at: string
          diagnostics: Json
          id: string
          locality_id: string | null
          model: string | null
          period: string
          proposals_created: number
          status: string
        }
        Insert: {
          created_at?: string
          diagnostics?: Json
          id?: string
          locality_id?: string | null
          model?: string | null
          period: string
          proposals_created?: number
          status?: string
        }
        Update: {
          created_at?: string
          diagnostics?: Json
          id?: string
          locality_id?: string | null
          model?: string | null
          period?: string
          proposals_created?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_generation_runs_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_votes: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          user_id: string
          vote: number
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          user_id: string
          vote?: number
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          user_id?: string
          vote?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "generated_activity_proposals"
            referencedColumns: ["id"]
          },
        ]
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
      reviews: {
        Row: {
          author_id: string
          body: string | null
          booking_id: string | null
          created_at: string
          id: string
          rating: number
          subject_id: string
          subject_kind: Database["public"]["Enums"]["review_subject"]
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          body?: string | null
          booking_id?: string | null
          created_at?: string
          id?: string
          rating: number
          subject_id: string
          subject_kind: Database["public"]["Enums"]["review_subject"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string | null
          booking_id?: string | null
          created_at?: string
          id?: string
          rating?: number
          subject_id?: string
          subject_kind?: Database["public"]["Enums"]["review_subject"]
          title?: string | null
          updated_at?: string
        }
        Relationships: []
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
      sponsorship_packages: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          description: string | null
          duration_days: number
          id: string
          name: string
          placements: string[]
          price_cents: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          duration_days?: number
          id?: string
          name: string
          placements?: string[]
          price_cents?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          duration_days?: number
          id?: string
          name?: string
          placements?: string[]
          price_cents?: number
          updated_at?: string
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
          background_check_state: Database["public"]["Enums"]["verification_state"]
          base_price_cents: number | null
          category: Database["public"]["Enums"]["vendor_category"]
          city: string | null
          created_at: string
          description: string | null
          id: string
          languages_spoken: string[]
          locality_id: string | null
          name: string
          owner_id: string
          photo_url: string | null
          published: boolean
          rate_card: Json
          updated_at: string
          verification_state: Database["public"]["Enums"]["verification_state"]
          vibe_tags: string[] | null
        }
        Insert: {
          background_check_state?: Database["public"]["Enums"]["verification_state"]
          base_price_cents?: number | null
          category?: Database["public"]["Enums"]["vendor_category"]
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          languages_spoken?: string[]
          locality_id?: string | null
          name: string
          owner_id: string
          photo_url?: string | null
          published?: boolean
          rate_card?: Json
          updated_at?: string
          verification_state?: Database["public"]["Enums"]["verification_state"]
          vibe_tags?: string[] | null
        }
        Update: {
          background_check_state?: Database["public"]["Enums"]["verification_state"]
          base_price_cents?: number | null
          category?: Database["public"]["Enums"]["vendor_category"]
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          languages_spoken?: string[]
          locality_id?: string | null
          name?: string
          owner_id?: string
          photo_url?: string | null
          published?: boolean
          rate_card?: Json
          updated_at?: string
          verification_state?: Database["public"]["Enums"]["verification_state"]
          vibe_tags?: string[] | null
        }
        Relationships: []
      }
      venues: {
        Row: {
          accessibility_attributes: string[]
          base_price_cents: number | null
          capacity_max: number | null
          capacity_min: number | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          locality_id: string | null
          name: string
          organization_id: string | null
          owner_id: string
          photo_url: string | null
          published: boolean
          updated_at: string
          vibe_tags: string[] | null
        }
        Insert: {
          accessibility_attributes?: string[]
          base_price_cents?: number | null
          capacity_max?: number | null
          capacity_min?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          locality_id?: string | null
          name: string
          organization_id?: string | null
          owner_id: string
          photo_url?: string | null
          published?: boolean
          updated_at?: string
          vibe_tags?: string[] | null
        }
        Update: {
          accessibility_attributes?: string[]
          base_price_cents?: number | null
          capacity_max?: number | null
          capacity_min?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          locality_id?: string | null
          name?: string
          organization_id?: string | null
          owner_id?: string
          photo_url?: string | null
          published?: boolean
          updated_at?: string
          vibe_tags?: string[] | null
        }
        Relationships: []
      }
      voice_calls: {
        Row: {
          created_at: string
          ended_at: string | null
          event_id: string | null
          id: string
          inquiry_id: string | null
          outcome: Database["public"]["Enums"]["voice_call_outcome"] | null
          owner_id: string
          phone: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["voice_call_status"]
          summary: string | null
          target_id: string | null
          target_kind: Database["public"]["Enums"]["review_subject"] | null
          target_name: string | null
          transcript: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          event_id?: string | null
          id?: string
          inquiry_id?: string | null
          outcome?: Database["public"]["Enums"]["voice_call_outcome"] | null
          owner_id: string
          phone?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["voice_call_status"]
          summary?: string | null
          target_id?: string | null
          target_kind?: Database["public"]["Enums"]["review_subject"] | null
          target_name?: string | null
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          event_id?: string | null
          id?: string
          inquiry_id?: string | null
          outcome?: Database["public"]["Enums"]["voice_call_outcome"] | null
          owner_id?: string
          phone?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["voice_call_status"]
          summary?: string | null
          target_id?: string | null
          target_kind?: Database["public"]["Enums"]["review_subject"] | null
          target_name?: string | null
          transcript?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_self_service_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      get_invite_by_slug: {
        Args: { _slug: string }
        Returns: {
          copy: string
          created_at: string
          event_id: string
          headline: string
          id: string
          image_url: string
          rsvp_enabled: boolean
          slug: string
        }[]
      }
      get_public_profile: {
        Args: { _user_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_moderator: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "host"
        | "pro"
        | "business"
        | "admin"
        | "member"
        | "volunteer_host"
        | "professional"
        | "sponsor"
        | "org_admin"
        | "moderator"
        | "ops_admin"
        | "super_admin"
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
      listing_status: "active" | "sold" | "withdrawn" | "removed"
      org_status: "pending" | "verified" | "suspended" | "rejected"
      payout_status: "scheduled" | "in_transit" | "paid" | "failed"
      perk_status: "draft" | "pending" | "approved" | "paused" | "expired"
      proposal_status:
        | "draft"
        | "voting"
        | "threshold_met"
        | "scheduled"
        | "published"
        | "expired"
        | "rejected"
      recipient_kind: "venue" | "pro" | "business"
      report_status: "open" | "triaged" | "actioned" | "dismissed"
      review_subject: "venue" | "vendor"
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
      verification_state: "unverified" | "pending" | "verified" | "rejected"
      voice_call_outcome:
        | "available"
        | "unavailable"
        | "callback"
        | "no_answer"
        | "voicemail"
      voice_call_status: "queued" | "in_progress" | "completed" | "failed"
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
      app_role: [
        "host",
        "pro",
        "business",
        "admin",
        "member",
        "volunteer_host",
        "professional",
        "sponsor",
        "org_admin",
        "moderator",
        "ops_admin",
        "super_admin",
      ],
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
      listing_status: ["active", "sold", "withdrawn", "removed"],
      org_status: ["pending", "verified", "suspended", "rejected"],
      payout_status: ["scheduled", "in_transit", "paid", "failed"],
      perk_status: ["draft", "pending", "approved", "paused", "expired"],
      proposal_status: [
        "draft",
        "voting",
        "threshold_met",
        "scheduled",
        "published",
        "expired",
        "rejected",
      ],
      recipient_kind: ["venue", "pro", "business"],
      report_status: ["open", "triaged", "actioned", "dismissed"],
      review_subject: ["venue", "vendor"],
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
      verification_state: ["unverified", "pending", "verified", "rejected"],
      voice_call_outcome: [
        "available",
        "unavailable",
        "callback",
        "no_answer",
        "voicemail",
      ],
      voice_call_status: ["queued", "in_progress", "completed", "failed"],
    },
  },
} as const
