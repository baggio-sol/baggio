export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      brackets: {
        Row: {
          id: string;
          user_id: string;
          bracket_data: Json;
          spice_score: number | null;
          persona: string | null;
          persona_emoji: string | null;
          champion: string | null;
          runner_up: string | null;
          dark_horse: string | null;
          early_exit: string | null;
          boldest_call: string | null;
          is_public: boolean;
          points: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bracket_data: Json;
          spice_score?: number | null;
          persona?: string | null;
          persona_emoji?: string | null;
          champion?: string | null;
          runner_up?: string | null;
          dark_horse?: string | null;
          early_exit?: string | null;
          boldest_call?: string | null;
          is_public?: boolean;
          points?: number | null;
        };
        Update: {
          bracket_data?: Json;
          spice_score?: number | null;
          persona?: string | null;
          persona_emoji?: string | null;
          champion?: string | null;
          runner_up?: string | null;
          dark_horse?: string | null;
          early_exit?: string | null;
          boldest_call?: string | null;
          is_public?: boolean;
          points?: number | null;
          updated_at?: string;
        };
      };
      leagues: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code?: string;
          owner_id: string;
        };
        Update: {
          name?: string;
        };
      };
      league_members: {
        Row: {
          league_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          league_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
      };
      results: {
        Row: {
          match_id: string;
          home_score: number;
          away_score: number;
          winner: string | null;
          played_at: string;
          created_at: string;
        };
        Insert: {
          match_id: string;
          home_score: number;
          away_score: number;
          winner?: string | null;
          played_at: string;
        };
        Update: {
          home_score?: number;
          away_score?: number;
          winner?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
