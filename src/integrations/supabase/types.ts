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
      blog_posts: {
        Row: {
          body: string | null
          context: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          flags: string | null
          id: string
          link_label: string | null
          link_url: string | null
          location: string | null
          published: boolean
          slug: string | null
          sort_order: number
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          context?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          flags?: string | null
          id?: string
          link_label?: string | null
          link_url?: string | null
          location?: string | null
          published?: boolean
          slug?: string | null
          sort_order?: number
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          context?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          flags?: string | null
          id?: string
          link_label?: string | null
          link_url?: string | null
          location?: string | null
          published?: boolean
          slug?: string | null
          sort_order?: number
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      diagnostico_respostas: {
        Row: {
          arquetipo: string
          aspiracao: string | null
          barreira: string | null
          consentimento: boolean
          created_at: string
          desafios: Json
          email: string | null
          equipe: string | null
          ferramentas: Json
          id: string
          impacto: string | null
          negocio: string | null
          nivel: string
          nome: string
          papel: string | null
          reflexao: string | null
          respostas_brutas: Json
          score_automacao: number
          score_dados: number
          score_gente: number
          score_geral: number
          score_oportunidades: number
          score_usar_ia: number
          segmento: string | null
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          arquetipo: string
          aspiracao?: string | null
          barreira?: string | null
          consentimento?: boolean
          created_at?: string
          desafios?: Json
          email?: string | null
          equipe?: string | null
          ferramentas?: Json
          id?: string
          impacto?: string | null
          negocio?: string | null
          nivel: string
          nome: string
          papel?: string | null
          reflexao?: string | null
          respostas_brutas?: Json
          score_automacao?: number
          score_dados?: number
          score_gente?: number
          score_geral: number
          score_oportunidades?: number
          score_usar_ia?: number
          segmento?: string | null
          user_id?: string | null
          whatsapp: string
        }
        Update: {
          arquetipo?: string
          aspiracao?: string | null
          barreira?: string | null
          consentimento?: boolean
          created_at?: string
          desafios?: Json
          email?: string | null
          equipe?: string | null
          ferramentas?: Json
          id?: string
          impacto?: string | null
          negocio?: string | null
          nivel?: string
          nome?: string
          papel?: string | null
          reflexao?: string | null
          respostas_brutas?: Json
          score_automacao?: number
          score_dados?: number
          score_gente?: number
          score_geral?: number
          score_oportunidades?: number
          score_usar_ia?: number
          segmento?: string | null
          user_id?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      page_events: {
        Row: {
          created_at: string
          event: string
          id: string
          meta: Json
          path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          meta?: Json
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          meta?: Json
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      whatsapp_connections: {
        Row: {
          business_name: string | null
          connected_at: string | null
          created_at: string
          display_phone_number: string | null
          error_message: string | null
          id: string
          phone_number_id: string | null
          status: string
          updated_at: string
          user_id: string
          verified_name: string | null
          waba_id: string
        }
        Insert: {
          business_name?: string | null
          connected_at?: string | null
          created_at?: string
          display_phone_number?: string | null
          error_message?: string | null
          id?: string
          phone_number_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verified_name?: string | null
          waba_id: string
        }
        Update: {
          business_name?: string | null
          connected_at?: string | null
          created_at?: string
          display_phone_number?: string | null
          error_message?: string | null
          id?: string
          phone_number_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verified_name?: string | null
          waba_id?: string
        }
        Relationships: []
      }
      whatsapp_connection_secrets: {
        Row: {
          connection_id: string
          created_at: string
          encrypted_access_token: string
          token_expires_at: string | null
          token_iv: string
          updated_at: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          encrypted_access_token: string
          token_expires_at?: string | null
          token_iv: string
          updated_at?: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          encrypted_access_token?: string
          token_expires_at?: string | null
          token_iv?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_events: {
        Row: {
          connection_id: string | null
          event_type: string
          id: string
          payload: Json
          received_at: string
          waba_id: string
        }
        Insert: {
          connection_id?: string | null
          event_type: string
          id?: string
          payload: Json
          received_at?: string
          waba_id: string
        }
        Update: {
          connection_id?: string | null
          event_type?: string
          id?: string
          payload?: Json
          received_at?: string
          waba_id?: string
        }
        Relationships: []
      }
      user_app_access: {
        Row: {
          app_slug: string
          granted_at: string
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          app_slug: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          app_slug?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
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
      claim_seed_admin: { Args: never; Returns: boolean }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
