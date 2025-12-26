import type { AppType } from '@/types/database';

/**
 * 사용자 통계 인터페이스
 * 대시보드 UsageStats 컴포넌트에서 사용
 */
export interface UserStats {
  /** 총 세션 수 */
  totalSessions: number;
  /** 총 참여자 수 */
  totalParticipants: number;
  /** 현재 활성 세션 수 */
  activeSessions: number;
  /** 앱별 세션 수 */
  byAppType: Partial<Record<AppType, number>>;
  /** 일별 세션 수 (트렌드) */
  byDate: DateCount[];
}

export interface DateCount {
  date: string; // YYYY-MM-DD
  count: number;
}

/**
 * 통계 조회 기간
 */
export type StatsPeriod = 'week' | 'month' | 'year';

/**
 * 통계 API 응답 (Supabase RPC)
 */
export interface StatsApiResponse {
  total_sessions: number;
  total_participants: number;
  active_sessions: number;
  by_app_type: Record<string, number> | null;
  by_date: { date: string; count: number }[] | null;
}

/**
 * 통계 조회 옵션
 */
export interface GetStatsOptions {
  userId: string;
  period: StatsPeriod;
}
