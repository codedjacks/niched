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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_daily_rounds: {
        Row: {
          created_at: string
          day: string
          error: string | null
          locked_until: string
          status: string
        }
        Insert: {
          created_at?: string
          day: string
          error?: string | null
          locked_until?: string
          status?: string
        }
        Update: {
          created_at?: string
          day?: string
          error?: string | null
          locked_until?: string
          status?: string
        }
        Relationships: []
      }
      ai_questions: {
        Row: {
          answers: Json
          category: string
          created_at: string
          day: string
          id: string
          position: number
          prompt: string
          prompt_key: string
          track: string
        }
        Insert: {
          answers: Json
          category: string
          created_at?: string
          day: string
          id: string
          position: number
          prompt: string
          prompt_key: string
          track?: string
        }
        Update: {
          answers?: Json
          category?: string
          created_at?: string
          day?: string
          id?: string
          position?: number
          prompt?: string
          prompt_key?: string
          track?: string
        }
        Relationships: []
      }
      ai_topic_rounds: {
        Row: {
          created_at: string
          day: string
          error: string | null
          locked_until: string
          status: string
          topic: string
        }
        Insert: {
          created_at?: string
          day: string
          error?: string | null
          locked_until?: string
          status?: string
          topic: string
        }
        Update: {
          created_at?: string
          day?: string
          error?: string | null
          locked_until?: string
          status?: string
          topic?: string
        }
        Relationships: []
      }
      answer_counts: {
        Row: {
          answer_key: string
          count: number
          question_id: string
        }
        Insert: {
          answer_key: string
          count?: number
          question_id: string
        }
        Update: {
          answer_key?: string
          count?: number
          question_id?: string
        }
        Relationships: []
      }
      daily_scores: {
        Row: {
          created_at: string
          day: string
          id: string
          player_id: string
          player_name: string
          score: number
          tiers: string[]
        }
        Insert: {
          created_at?: string
          day: string
          id?: string
          player_id: string
          player_name: string
          score: number
          tiers?: string[]
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          player_id?: string
          player_name?: string
          score?: number
          tiers?: string[]
        }
        Relationships: []
      }
      match_answers: {
        Row: {
          created_at: string
          display: string | null
          id: string
          match_id: string
          points: number
          q_index: number
          tier: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display?: string | null
          id?: string
          match_id: string
          points?: number
          q_index: number
          tier?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          display?: string | null
          id?: string
          match_id?: string
          points?: number
          q_index?: number
          tier?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_answers_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          code: string
          created_at: string
          guest_id: string | null
          host_id: string
          id: string
          question_ids: string[]
          starts_at: string | null
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          guest_id?: string | null
          host_id: string
          id?: string
          question_ids: string[]
          starts_at?: string | null
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          guest_id?: string | null
          host_id?: string
          id?: string
          question_ids?: string[]
          starts_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          card_color: string
          created_at: string
          display_name: string
          favorite_sport: string | null
          favorite_team: string | null
          id: string
          jersey_number: string | null
          tagline: string | null
        }
        Insert: {
          avatar_url?: string | null
          card_color?: string
          created_at?: string
          display_name?: string
          favorite_sport?: string | null
          favorite_team?: string | null
          id: string
          jersey_number?: string | null
          tagline?: string | null
        }
        Update: {
          avatar_url?: string | null
          card_color?: string
          created_at?: string
          display_name?: string
          favorite_sport?: string | null
          favorite_team?: string | null
          id?: string
          jersey_number?: string | null
          tagline?: string | null
        }
        Relationships: []
      }
      ranked_scores: {
        Row: {
          answers: Json
          created_at: string
          day: string
          id: string
          score: number
          tiers: string[]
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          day: string
          id?: string
          score: number
          tiers?: string[]
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          day?: string
          id?: string
          score?: number
          tiers?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranked_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rarity_votes: {
        Row: {
          answer_key: string
          created_at: string
          id: string
          question_id: string
          tier: string
          user_id: string
        }
        Insert: {
          answer_key: string
          created_at?: string
          id?: string
          question_id: string
          tier: string
          user_id?: string
        }
        Update: {
          answer_key?: string
          created_at?: string
          id?: string
          question_id?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      sports_fact_sources: {
        Row: {
          id: string
          payload: Json
          payload_hash: string
          provider: string
          retrieved_at: string
          url: string
        }
        Insert: {
          id: string
          payload: Json
          payload_hash: string
          provider: string
          retrieved_at: string
          url: string
        }
        Update: {
          id?: string
          payload?: Json
          payload_hash?: string
          provider?: string
          retrieved_at?: string
          url?: string
        }
        Relationships: []
      }
      sports_facts: {
        Row: {
          id: string
          league: string
          metric: string
          player_id: string
          player_name: string
          scope: string
          source_id: string
          unit: string
          value: number
          verified_at: string
        }
        Insert: {
          id: string
          league: string
          metric: string
          player_id: string
          player_name: string
          scope?: string
          source_id: string
          unit: string
          value: number
          verified_at: string
        }
        Update: {
          id?: string
          league?: string
          metric?: string
          player_id?: string
          player_name?: string
          scope?: string
          source_id?: string
          unit?: string
          value?: number
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_facts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sports_fact_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_player_aliases: {
        Row: {
          espn_id: string | null
          fetched_at: string
          league: string
          query_key: string
        }
        Insert: {
          espn_id?: string | null
          fetched_at?: string
          league: string
          query_key: string
        }
        Update: {
          espn_id?: string | null
          fetched_at?: string
          league?: string
          query_key?: string
        }
        Relationships: []
      }
      sports_players: {
        Row: {
          awards: string[]
          birth_place: string | null
          career: Json
          draft: string | null
          espn_id: string
          fetched_at: string
          league: string
          name: string
          name_key: string
          position: string | null
          seasons: Json
          teams: string[]
        }
        Insert: {
          awards?: string[]
          birth_place?: string | null
          career?: Json
          draft?: string | null
          espn_id: string
          fetched_at?: string
          league: string
          name: string
          name_key: string
          position?: string | null
          seasons?: Json
          teams?: string[]
        }
        Update: {
          awards?: string[]
          birth_place?: string | null
          career?: Json
          draft?: string | null
          espn_id?: string
          fetched_at?: string
          league?: string
          name?: string
          name_key?: string
          position?: string | null
          seasons?: Json
          teams?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bump_answers: {
        Args: { _keys: string[]; _question_ids: string[] }
        Returns: undefined
      }
      leaderboard_alltime: {
        Args: { _limit?: number }
        Returns: {
          best: number
          games: number
          player_name: string
          total: number
        }[]
      }
      question_answer_counts: {
        Args: { _question_ids: string[] }
        Returns: {
          answer_key: string
          count: number
          question_id: string
        }[]
      }
      ranked_alltime: {
        Args: { _limit?: number }
        Returns: {
          avatar_url: string
          best: number
          display_name: string
          games: number
          total: number
          user_id: string
        }[]
      }
      ranked_daily: {
        Args: { _day: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          id: string
          score: number
          tiers: string[]
          user_id: string
        }[]
      }
      rarity_vote_counts: {
        Args: { _answer_key: string; _question_id: string }
        Returns: {
          count: number
          tier: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
