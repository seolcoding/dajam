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

// V2 Data Model Enums
export type InstitutionType =
  | 'welfare_center'
  | 'lifelong_learning'
  | 'senior_center'
  | 'community_center'
  | 'library'
  | 'corporation'
  | 'academy'
  | 'other';

export type WorkspaceRole = 'owner' | 'admin' | 'instructor' | 'assistant';

export type AttendanceMethod = 'qr' | 'code' | 'kakao' | 'manual' | 'auto';

export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type AgeGroup = 'under_20' | '20s' | '30s' | '40s' | '50s' | '60s' | '70s' | '80_plus';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type ContactStatus = 'active' | 'inactive' | 'churned' | 'vip';

export type CompletionStatus = 'in_progress' | 'completed' | 'dropped' | 'pending';

export type IntegrationType =
  | 'google_sheets'
  | 'google_forms'
  | 'notion'
  | 'slack'
  | 'kakao_channel'
  | 'webhook';

export type MarketingConsentType = {
  sms: boolean;
  email: boolean;
  kakao: boolean;
};

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
          // V2 extensions
          institution_id: string | null;
          workspace_id: string | null;
          class_id: string | null;
          accessibility_mode: boolean;
          large_text_mode: boolean;
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
          // V2 extensions
          institution_id?: string | null;
          workspace_id?: string | null;
          class_id?: string | null;
          accessibility_mode?: boolean;
          large_text_mode?: boolean;
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
          // V2 extensions
          institution_id?: string | null;
          workspace_id?: string | null;
          class_id?: string | null;
          accessibility_mode?: boolean;
          large_text_mode?: boolean;
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
          // V2 extension
          contact_id: string | null;
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
          // V2 extension
          contact_id?: string | null;
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
          // V2 extension
          contact_id?: string | null;
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
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: 'free' | 'pro';
          status: 'active' | 'cancelled' | 'expired' | 'past_due';
          toss_customer_key: string | null;
          toss_billing_key: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type?: 'free' | 'pro';
          status?: 'active' | 'cancelled' | 'expired' | 'past_due';
          toss_customer_key?: string | null;
          toss_billing_key?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: 'free' | 'pro';
          status?: 'active' | 'cancelled' | 'expired' | 'past_due';
          toss_customer_key?: string | null;
          toss_billing_key?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_history: {
        Row: {
          id: string;
          subscription_id: string | null;
          user_id: string;
          amount: number;
          currency: string;
          status: 'succeeded' | 'failed' | 'pending' | 'refunded';
          toss_payment_key: string | null;
          description: string | null;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id?: string | null;
          user_id: string;
          amount: number;
          currency?: string;
          status: 'succeeded' | 'failed' | 'pending' | 'refunded';
          toss_payment_key?: string | null;
          description?: string | null;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string | null;
          user_id?: string;
          amount?: number;
          currency?: string;
          status?: 'succeeded' | 'failed' | 'pending' | 'refunded';
          toss_payment_key?: string | null;
          description?: string | null;
          receipt_url?: string | null;
          created_at?: string;
        };
      };
      // ============================================
      // V2 Data Model Tables
      // ============================================
      institutions: {
        Row: {
          id: string;
          name: string;
          institution_type: InstitutionType;
          address: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          logo_url: string | null;
          settings: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          institution_type?: InstitutionType;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          institution_type?: InstitutionType;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          institution_id: string | null;
          owner_id: string;
          name: string;
          slug: string | null;
          description: string | null;
          logo_url: string | null;
          settings: Json;
          plan_type: 'free' | 'pro' | 'enterprise';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          institution_id?: string | null;
          owner_id: string;
          name: string;
          slug?: string | null;
          description?: string | null;
          logo_url?: string | null;
          settings?: Json;
          plan_type?: 'free' | 'pro' | 'enterprise';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string | null;
          owner_id?: string;
          name?: string;
          slug?: string | null;
          description?: string | null;
          logo_url?: string | null;
          settings?: Json;
          plan_type?: 'free' | 'pro' | 'enterprise';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: WorkspaceRole;
          permissions: Json;
          invited_by: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role: WorkspaceRole;
          permissions?: Json;
          invited_by?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: WorkspaceRole;
          permissions?: Json;
          invited_by?: string | null;
          joined_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          name: string;
          phone: string | null;
          email: string | null;
          source: string | null;
          source_session_id: string | null;
          marketing_consent: Json;
          marketing_consent_at: string | null;
          tags: string[];
          custom_fields: Json;
          sessions_attended: number;
          last_session_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          // Extended CRM fields
          gender: GenderType | null;
          birth_year: number | null;
          age_group: AgeGroup | null;
          address: string | null;
          address_detail: Json;
          interests: string[];
          preferred_topics: string[];
          skill_level: SkillLevel;
          total_sessions: number;
          completed_courses: number;
          total_attendance_minutes: number;
          average_satisfaction: number | null;
          last_active_at: string | null;
          interaction_stats: Json;
          device_info: Json;
          accessibility_needs: string[];
          preferred_font_size: 'normal' | 'large' | 'x-large';
          preferred_contact_method: 'phone' | 'sms' | 'email' | 'kakao';
          preferred_contact_time: string | null;
          status: ContactStatus;
          churn_risk_score: number;
          lifetime_value: number;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          name: string;
          phone?: string | null;
          email?: string | null;
          source?: string | null;
          source_session_id?: string | null;
          marketing_consent?: Json;
          marketing_consent_at?: string | null;
          tags?: string[];
          custom_fields?: Json;
          sessions_attended?: number;
          last_session_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          // Extended CRM fields
          gender?: GenderType | null;
          birth_year?: number | null;
          age_group?: AgeGroup | null;
          address?: string | null;
          address_detail?: Json;
          interests?: string[];
          preferred_topics?: string[];
          skill_level?: SkillLevel;
          total_sessions?: number;
          completed_courses?: number;
          total_attendance_minutes?: number;
          average_satisfaction?: number | null;
          last_active_at?: string | null;
          interaction_stats?: Json;
          device_info?: Json;
          accessibility_needs?: string[];
          preferred_font_size?: 'normal' | 'large' | 'x-large';
          preferred_contact_method?: 'phone' | 'sms' | 'email' | 'kakao';
          preferred_contact_time?: string | null;
          status?: ContactStatus;
          churn_risk_score?: number;
          lifetime_value?: number;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string | null;
          name?: string;
          phone?: string | null;
          email?: string | null;
          source?: string | null;
          source_session_id?: string | null;
          marketing_consent?: Json;
          marketing_consent_at?: string | null;
          tags?: string[];
          custom_fields?: Json;
          sessions_attended?: number;
          last_session_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          // Extended CRM fields
          gender?: GenderType | null;
          birth_year?: number | null;
          age_group?: AgeGroup | null;
          address?: string | null;
          address_detail?: Json;
          interests?: string[];
          preferred_topics?: string[];
          skill_level?: SkillLevel;
          total_sessions?: number;
          completed_courses?: number;
          total_attendance_minutes?: number;
          average_satisfaction?: number | null;
          last_active_at?: string | null;
          interaction_stats?: Json;
          device_info?: Json;
          accessibility_needs?: string[];
          preferred_font_size?: 'normal' | 'large' | 'x-large';
          preferred_contact_method?: 'phone' | 'sms' | 'email' | 'kakao';
          preferred_contact_time?: string | null;
          status?: ContactStatus;
          churn_risk_score?: number;
          lifetime_value?: number;
        };
      };
      attendance: {
        Row: {
          id: string;
          session_id: string;
          contact_id: string | null;
          participant_id: string | null;
          check_in_method: AttendanceMethod;
          check_in_at: string;
          check_out_at: string | null;
          verified: boolean;
          verified_by: string | null;
          location: Json | null;
          device_info: Json | null;
          qr_code: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          contact_id?: string | null;
          participant_id?: string | null;
          check_in_method?: AttendanceMethod;
          check_in_at?: string;
          check_out_at?: string | null;
          verified?: boolean;
          verified_by?: string | null;
          location?: Json | null;
          device_info?: Json | null;
          qr_code?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          contact_id?: string | null;
          participant_id?: string | null;
          check_in_method?: AttendanceMethod;
          check_in_at?: string;
          check_out_at?: string | null;
          verified?: boolean;
          verified_by?: string | null;
          location?: Json | null;
          device_info?: Json | null;
          qr_code?: string | null;
        };
      };
      integrations: {
        Row: {
          id: string;
          workspace_id: string;
          integration_type: IntegrationType;
          name: string;
          config: Json;
          credentials_encrypted: string | null;
          is_active: boolean;
          last_sync_at: string | null;
          sync_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          integration_type: IntegrationType;
          name: string;
          config?: Json;
          credentials_encrypted?: string | null;
          is_active?: boolean;
          last_sync_at?: string | null;
          sync_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          integration_type?: IntegrationType;
          name?: string;
          config?: Json;
          credentials_encrypted?: string | null;
          is_active?: boolean;
          last_sync_at?: string | null;
          sync_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      integration_logs: {
        Row: {
          id: string;
          integration_id: string;
          action: string;
          status: 'success' | 'failed' | 'pending';
          request_data: Json | null;
          response_data: Json | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          integration_id: string;
          action: string;
          status: 'success' | 'failed' | 'pending';
          request_data?: Json | null;
          response_data?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          integration_id?: string;
          action?: string;
          status?: 'success' | 'failed' | 'pending';
          request_data?: Json | null;
          response_data?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
      // ============================================
      // Flexible Content Layer (JSONB 기반)
      // ============================================
      session_elements: {
        Row: {
          id: string;
          session_id: string;
          element_type: string; // poll, quiz, word_cloud, balance_game, ladder, etc.
          title: string | null;
          description: string | null;
          config: Json;
          state: Json;
          order_index: number;
          is_active: boolean;
          is_visible: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          element_type: string;
          title?: string | null;
          description?: string | null;
          config?: Json;
          state?: Json;
          order_index?: number;
          is_active?: boolean;
          is_visible?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          element_type?: string;
          title?: string | null;
          description?: string | null;
          config?: Json;
          state?: Json;
          order_index?: number;
          is_active?: boolean;
          is_visible?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      element_responses: {
        Row: {
          id: string;
          element_id: string;
          session_id: string;
          participant_id: string | null;
          user_id: string | null;
          contact_id: string | null;
          anonymous_id: string | null;
          display_name: string | null;
          response_type: string; // vote, answer, reaction, submission, etc.
          data: Json;
          score: number | null;
          is_correct: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          element_id: string;
          session_id: string;
          participant_id?: string | null;
          user_id?: string | null;
          contact_id?: string | null;
          anonymous_id?: string | null;
          display_name?: string | null;
          response_type: string;
          data?: Json;
          score?: number | null;
          is_correct?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          element_id?: string;
          session_id?: string;
          participant_id?: string | null;
          user_id?: string | null;
          contact_id?: string | null;
          anonymous_id?: string | null;
          display_name?: string | null;
          response_type?: string;
          data?: Json;
          score?: number | null;
          is_correct?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      element_aggregates: {
        Row: {
          id: string;
          element_id: string;
          aggregate_key: string;
          count: number;
          sum_value: number | null;
          metadata: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          element_id: string;
          aggregate_key: string;
          count?: number;
          sum_value?: number | null;
          metadata?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          element_id?: string;
          aggregate_key?: string;
          count?: number;
          sum_value?: number | null;
          metadata?: Json;
          updated_at?: string;
        };
      };
      // ============================================
      // CRM Extended Tables
      // ============================================
      course_history: {
        Row: {
          id: string;
          contact_id: string;
          session_id: string | null;
          course_name: string;
          course_type: string | null;
          instructor_name: string | null;
          started_at: string | null;
          completed_at: string | null;
          attendance_rate: number | null;
          completion_status: CompletionStatus;
          final_score: number | null;
          certificate_issued: boolean;
          satisfaction_score: number | null;
          feedback_text: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          session_id?: string | null;
          course_name: string;
          course_type?: string | null;
          instructor_name?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          attendance_rate?: number | null;
          completion_status?: CompletionStatus;
          final_score?: number | null;
          certificate_issued?: boolean;
          satisfaction_score?: number | null;
          feedback_text?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          session_id?: string | null;
          course_name?: string;
          course_type?: string | null;
          instructor_name?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          attendance_rate?: number | null;
          completion_status?: CompletionStatus;
          final_score?: number | null;
          certificate_issued?: boolean;
          satisfaction_score?: number | null;
          feedback_text?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      interaction_logs: {
        Row: {
          id: string;
          contact_id: string | null;
          session_id: string | null;
          element_id: string | null;
          interaction_type: string;
          interaction_data: Json;
          is_correct: boolean | null;
          points_earned: number;
          device_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id?: string | null;
          session_id?: string | null;
          element_id?: string | null;
          interaction_type: string;
          interaction_data?: Json;
          is_correct?: boolean | null;
          points_earned?: number;
          device_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string | null;
          session_id?: string | null;
          element_id?: string | null;
          interaction_type?: string;
          interaction_data?: Json;
          is_correct?: boolean | null;
          points_earned?: number;
          device_type?: string | null;
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
      // V2 Functions
      generate_qr_code: {
        Args: { p_session_id: string; p_participant_id?: string };
        Returns: string;
      };
      link_participant_to_contact: {
        Args: { p_participant_id: string; p_contact_id: string };
        Returns: void;
      };
    };
    Enums: {
      app_type: AppType;
      session_role: SessionRole;
      // V2 Enums
      institution_type: InstitutionType;
      workspace_role: WorkspaceRole;
      attendance_method: AttendanceMethod;
      integration_type: IntegrationType;
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

// V2 Data Model Types
export type Institution = Database['public']['Tables']['institutions']['Row'];
export type Workspace = Database['public']['Tables']['workspaces']['Row'];
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Attendance = Database['public']['Tables']['attendance']['Row'];
export type Integration = Database['public']['Tables']['integrations']['Row'];
export type IntegrationLog = Database['public']['Tables']['integration_logs']['Row'];

// V2 Insert types
export type InstitutionInsert = Database['public']['Tables']['institutions']['Insert'];
export type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert'];
export type WorkspaceMemberInsert = Database['public']['Tables']['workspace_members']['Insert'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];
export type IntegrationInsert = Database['public']['Tables']['integrations']['Insert'];

// Flexible Content Layer Types
export type SessionElement = Database['public']['Tables']['session_elements']['Row'];
export type ElementResponse = Database['public']['Tables']['element_responses']['Row'];
export type ElementAggregate = Database['public']['Tables']['element_aggregates']['Row'];

export type SessionElementInsert = Database['public']['Tables']['session_elements']['Insert'];
export type ElementResponseInsert = Database['public']['Tables']['element_responses']['Insert'];

// ============================================
// Element Type Definitions (코드레벨 스키마)
// ============================================

// 지원되는 element_type 목록
export type ElementType =
  | 'poll'              // 투표
  | 'quiz'              // 퀴즈
  | 'word_cloud'        // 워드클라우드
  | 'balance_game'      // 밸런스게임
  | 'ladder'            // 사다리게임
  | 'qna'               // Q&A
  | 'survey'            // 설문조사
  | 'bingo'             // 빙고
  | 'ideal_worldcup'    // 이상형월드컵
  | 'team_divider'      // 팀 나누기
  | 'personality_test'  // 성격테스트
  | 'this_or_that'      // 이거저거
  | 'chosung_quiz'      // 초성퀴즈
  | 'realtime_quiz'     // 실시간퀴즈
  | 'human_bingo'       // 휴먼빙고
  | 'reaction'          // 실시간 리액션
  | 'ranking'           // 순위투표
  | 'open_ended'        // 주관식 응답
  | 'lucky_draw';       // 경품 추첨 (Phase 6)

// 응답 타입
export type ResponseType =
  | 'vote'              // 선택 투표
  | 'answer'            // 텍스트 답변
  | 'reaction'          // 이모지/리액션
  | 'submission'        // 제출 (파일, 이미지 등)
  | 'choice'            // 단일 선택
  | 'multiple_choice'   // 다중 선택
  | 'ranking'           // 순위 매기기
  | 'text';             // 자유 텍스트

// Element Config Types (element_type별 config 스키마)
export interface PollConfig {
  options: Array<{ id: string; text: string; color?: string }>;
  allowMultiple: boolean;
  showResults: boolean;
  anonymousVoting: boolean;
}

export interface QuizConfig {
  questions: Array<{
    id: string;
    text: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    options?: string[];
    correctAnswer: string | number;
    points: number;
    timeLimit?: number;
  }>;
  shuffleQuestions: boolean;
  showCorrectAnswer: boolean;
}

export interface WordCloudConfig {
  maxWords: number;
  minLength: number;
  maxLength: number;
  allowDuplicates: boolean;
  profanityFilter: boolean;
}

export interface BalanceGameConfig {
  questions: Array<{
    id: string;
    optionA: { text: string; image?: string };
    optionB: { text: string; image?: string };
  }>;
}

export interface LadderConfig {
  participants: string[];
  results: string[];
  revealed: boolean;
}

export interface QnAConfig {
  allowAnonymous: boolean;
  allowUpvote: boolean;
  moderationRequired: boolean;
}

export interface LuckyDrawConfig {
  prizes: Array<{ name: string; count: number; image?: string }>;
  animationType: 'slot' | 'wheel' | 'confetti';
  excludePreviousWinners: boolean;
  requireAttendance: boolean;
}

// Element State Types (실시간 상태)
export interface PollState {
  isOpen: boolean;
  totalVotes: number;
  results?: Record<string, number>;
}

export interface QuizState {
  currentQuestionIndex: number;
  isRevealed: boolean;
  scores: Record<string, number>;
}

export interface WordCloudState {
  words: Array<{ text: string; count: number }>;
}

// Response Data Types (response_type별 data 스키마)
export interface VoteResponseData {
  selectedOption: string;
  selectedOptions?: string[]; // multiple choice
}

export interface AnswerResponseData {
  text: string;
  questionId?: string;
}

export interface ReactionResponseData {
  emoji: string;
  timestamp: number;
}

export interface RankingResponseData {
  ranking: string[]; // ordered list of option IDs
}

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
