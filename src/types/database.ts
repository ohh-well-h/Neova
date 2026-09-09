import type { BirthExperience, ReactionType, SupportPreference } from '@/types/models';

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          postpartum_start_date: string;
          display_name: string;
          is_anonymous: boolean;
          birth_experiences: BirthExperience[];
          support_preferences: SupportPreference[];
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          postpartum_start_date: string;
          display_name: string;
          is_anonymous?: boolean;
          birth_experiences?: BirthExperience[];
          support_preferences?: SupportPreference[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [];
      };
      cohorts: {
        Row: {
          id: string;
          name: string;
          stage_window_start: number;
          stage_window_end: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          stage_window_start: number;
          stage_window_end: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['cohorts']['Insert']>;
        Relationships: [];
      };
      cohort_members: {
        Row: { user_id: string; cohort_id: string; joined_at: string };
        Insert: { user_id: string; cohort_id: string; joined_at?: string };
        Update: Partial<Database['public']['Tables']['cohort_members']['Insert']>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          cohort_id: string;
          author_id: string;
          body: string;
          is_anonymous: boolean;
          flagged: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          author_id: string;
          body: string;
          is_anonymous?: boolean;
          flagged?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
        Relationships: [];
      };
      reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          type: ReactionType;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          type: ReactionType;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reactions']['Insert']>;
        Relationships: [];
      };
      flags: {
        Row: {
          id: string;
          post_id: string | null;
          subject_user_id: string | null;
          flagged_by: string;
          reason: string;
          resolved: boolean;
          acknowledged_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id?: string | null;
          subject_user_id?: string | null;
          flagged_by: string;
          reason: string;
          resolved?: boolean;
          acknowledged_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['flags']['Insert']>;
        Relationships: [];
      };
      cohort_events: {
        Row: { id: string; cohort_id: string; created_at: string };
        Insert: { id?: string; cohort_id: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['cohort_events']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      assign_user_to_cohort: {
        Args: { p_user_id: string; p_postpartum_week: number };
        Returns: string;
      };
      get_circle_members: {
        Args: { p_cohort_id: string };
        Returns: {
          user_id: string;
          display_name: string;
          joined_at: string;
        }[];
      };
      get_cohort_posts: {
        Args: { p_cohort_id: string; p_limit?: number };
        Returns: {
          id: string;
          cohort_id: string;
          author_id: string | null;
          author_name: string;
          body: string;
          is_anonymous: boolean;
          flagged: boolean;
          created_at: string;
        }[];
      };
      create_cohort_post: {
        Args: {
          p_cohort_id: string;
          p_body: string;
          p_is_anonymous: boolean;
        };
        Returns: { post_id: string; needs_acknowledgement: boolean }[];
      };
      get_my_cohort_reactions: {
        Args: { p_cohort_id: string };
        Returns: { post_id: string; type: ReactionType }[];
      };
      needs_safety_acknowledgement: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      acknowledge_safety_resources: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
