import { createClient } from '@/lib/supabase/client';
import type { AppType } from '@/types/database';
import type { UserStats, StatsApiResponse, GetStatsOptions } from './types';

/**
 * API 응답을 UserStats 형식으로 변환
 */
export function transformStatsResponse(response: StatsApiResponse): UserStats {
  return {
    totalSessions: Math.max(0, response.total_sessions),
    totalParticipants: Math.max(0, response.total_participants),
    activeSessions: Math.max(0, response.active_sessions),
    byAppType: (response.by_app_type ?? {}) as Partial<Record<AppType, number>>,
    byDate: response.by_date ?? [],
  };
}

/**
 * 사용자 통계 조회
 */
export async function getStats(options: GetStatsOptions): Promise<UserStats> {
  const { userId, period } = options;
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_user_stats', {
    p_user_id: userId,
    p_period: period,
  });

  if (error || !data) {
    // 데이터가 없거나 에러 시 기본값 반환
    return {
      totalSessions: 0,
      totalParticipants: 0,
      activeSessions: 0,
      byAppType: {},
      byDate: [],
    };
  }

  return transformStatsResponse(data as StatsApiResponse);
}
