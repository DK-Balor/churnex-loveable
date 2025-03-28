export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics: {
        Row: {
          active_subscriptions: number
          at_risk_revenue: number
          created_at: string
          id: string
          recovery_rate: number
          revenue_recovered: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_subscriptions?: number
          at_risk_revenue?: number
          created_at?: string
          id?: string
          recovery_rate?: number
          revenue_recovered?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_subscriptions?: number
          at_risk_revenue?: number
          created_at?: string
          id?: string
          recovery_rate?: number
          revenue_recovered?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_history: {
        Row: {
          active_subscriptions: number
          at_risk_revenue: number
          created_at: string
          date: string
          id: string
          recovery_rate: number
          revenue_recovered: number
          user_id: string
        }
        Insert: {
          active_subscriptions?: number
          at_risk_revenue?: number
          created_at?: string
          date: string
          id?: string
          recovery_rate?: number
          revenue_recovered?: number
          user_id: string
        }
        Update: {
          active_subscriptions?: number
          at_risk_revenue?: number
          created_at?: string
          date?: string
          id?: string
          recovery_rate?: number
          revenue_recovered?: number
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          metadata: Json | null
          name: string | null
          phone: string | null
          source: string
          source_account: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          source: string
          source_account?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          source?: string
          source_account?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_imports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          record_count: number | null
          source: string
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          record_count?: number | null
          source: string
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          record_count?: number | null
          source?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_accounts: {
        Row: {
          account_email: string | null
          account_id: string
          account_name: string | null
          created_at: string | null
          id: string
          livemode: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_email?: string | null
          account_id: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          livemode?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_email?: string | null
          account_id?: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          livemode?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_connections: {
        Row: {
          access_token: string | null
          account_email: string | null
          account_id: string
          account_name: string | null
          connected: boolean | null
          created_at: string | null
          last_sync_at: string | null
          refresh_token: string | null
          sync_error: string | null
          sync_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_email?: string | null
          account_id: string
          account_name?: string | null
          connected?: boolean | null
          created_at?: string | null
          last_sync_at?: string | null
          refresh_token?: string | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_email?: string | null
          account_id?: string
          account_name?: string | null
          connected?: boolean | null
          created_at?: string | null
          last_sync_at?: string | null
          refresh_token?: string | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          currency: string | null
          current_period_end: string | null
          customer_id: string
          id: string
          plan_name: string
          source: string
          source_account: string | null
          source_id: string | null
          start_date: string
          status: string
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          customer_id: string
          id: string
          plan_name: string
          source: string
          source_account?: string | null
          source_id?: string | null
          start_date: string
          status: string
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          customer_id?: string
          id?: string
          plan_name?: string
          source?: string
          source_account?: string | null
          source_id?: string | null
          start_date?: string
          status?: string
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_user_id_fkey"
            columns: ["customer_id", "user_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      user_metadata: {
        Row: {
          business_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_cancel_at_period_end: boolean | null
          subscription_created_at: string | null
          subscription_current_period_end: string | null
          subscription_payment_method: string | null
          subscription_plan: string | null
          subscription_price_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_created_at?: string | null
          subscription_current_period_end?: string | null
          subscription_payment_method?: string | null
          subscription_plan?: string | null
          subscription_price_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_created_at?: string | null
          subscription_current_period_end?: string | null
          subscription_payment_method?: string | null
          subscription_plan?: string | null
          subscription_price_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          notification_emails: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_emails?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_emails?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
