export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppType =
  | 'live-voting'
  | 'student-network'
  | 'group-order'
  | 'balance-game'
  | 'chosung-quiz'
  | 'ideal-worldcup'
  | 'bingo-game'
  | 'ladder-game'
  | 'team-divider'
  | 'salary-calculator'
  | 'rent-calculator'
  | 'gpa-calculator'
  | 'dutch-pay'
  | 'random-picker'
  | 'lunch-roulette'
  | 'id-validator'
  | 'this-or-that'
  | 'realtime-quiz'
  | 'word-cloud'
  | 'personality-test'
  | 'human-bingo'
  | 'audience-engage';

export type SessionRole = 'host' | 'moderator' | 'participant' | 'spectator';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string | null;
          email: string | null;
          provider: 'google' | 'kakao' | 'anonymous' | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          avatar_url?: string | null;
          email?: string | null;
          provider?: 'google' | 'kakao' | 'anonymous' | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string;
          avatar_url?: string | null;
          email?: string | null;
          provider?: 'google' | 'kakao' | 'anonymous' | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          code: string;
          app_type: AppType;
          title: string;
          host_id: string | null;
          config: Json;
          is_active: boolean;
          is_public: boolean;
          max_participants: number | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code?: string;
          app_type: AppType;
          title: string;
          host_id?: string | null;
          config?: Json;
          is_active?: boolean;
          is_public?: boolean;
          max_participants?: number | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          app_type?: AppType;
          title?: string;
          host_id?: string | null;
          config?: Json;
          is_active?: boolean;
          is_public?: boolean;
          max_participants?: number | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      session_participants: {
        Row: {
          id: string;
          session_id: string;
          user_id: string | null;
          display_name: string;
          role: SessionRole;
          is_banned: boolean;
          metadata: Json;
          joined_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          display_name: string;
          role?: SessionRole;
          is_banned?: boolean;
          metadata?: Json;
          joined_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string | null;
          display_name?: string;
          role?: SessionRole;
          is_banned?: boolean;
          metadata?: Json;
          joined_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          session_id: string;
          participant_id: string | null;
          user_id: string | null;
          selection: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          participant_id?: string | null;
          user_id?: string | null;
          selection: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          participant_id?: string | null;
          user_id?: string | null;
          selection?: Json;
          created_at?: string;
        };
      };
      vote_aggregates: {
        Row: {
          id: string;
          session_id: string;
          option_key: string;
          vote_count: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          option_key: string;
          vote_count?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          option_key?: string;
          vote_count?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          session_id: string;
          participant_id: string | null;
          user_id: string | null;
          participant_name: string;
          items: Json;
          special_request: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          participant_id?: string | null;
          user_id?: string | null;
          participant_name: string;
          items: Json;
          special_request?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          participant_id?: string | null;
          user_id?: string | null;
          participant_name?: string;
          items?: Json;
          special_request?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      icebreaker_answers: {
        Row: {
          id: string;
          session_id: string;
          participant_id: string | null;
          user_id: string | null;
          question_text: string;
          answer_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          participant_id?: string | null;
          user_id?: string | null;
          question_text: string;
          answer_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          participant_id?: string | null;
          user_id?: string | null;
          question_text?: string;
          answer_text?: string;
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          app_type: AppType;
          action_type: string;
          session_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          app_type: AppType;
          action_type: string;
          session_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          app_type?: AppType;
          action_type?: string;
          session_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_session_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      generate_unique_nickname: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_user_session_ids: {
        Args: { p_user_id: string };
        Returns: string[];
      };
      is_user_banned_from_session: {
        Args: { p_session_id: string; p_user_id: string };
        Returns: boolean;
      };
      get_user_session_role: {
        Args: { p_session_id: string; p_user_id: string };
        Returns: SessionRole;
      };
    };
    Enums: {
      app_type: AppType;
      session_role: SessionRole;
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
export type SessionParticipant = Database['public']['Tables']['session_participants']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type VoteAggregate = Database['public']['Tables']['vote_aggregates']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type IcebreakerAnswer = Database['public']['Tables']['icebreaker_answers']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];

// Insert types
export type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
export type VoteInsert = Database['public']['Tables']['votes']['Insert'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];

// App-specific config types
export interface LiveVotingConfig {
  type: 'single' | 'multiple' | 'ranking';
  options: string[];
  allowAnonymous: boolean;
  showResultsBeforeEnd?: boolean;
}

export interface GroupOrderConfig {
  mode: 'fixed' | 'free';
  restaurantName: string;
  menus?: MenuItem[];
  deadline?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
}

export interface OrderItem {
  id: string;
  menuId?: string;
  menuName: string;
  price: number;
  quantity: number;
  options?: string[];
}
