'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import type { Session, AppType } from '@/types/database';

interface SessionWithStats extends Session {
  participant_count: number;
  app_display_name: string;
}

interface UseSessionHistoryParams {
  userId?: string;
  appType?: AppType;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

interface UseSessionHistoryReturn {
  sessions: SessionWithStats[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  refetch: () => Promise<void>;
}

const appDisplayNames: Record<AppType, string> = {
  'live-voting': '실시간 투표',
  'student-network': '학생 네트워크',
  'group-order': '공동 주문',
  'balance-game': '밸런스 게임',
  'chosung-quiz': '초성 퀴즈',
  'ideal-worldcup': '이상형 월드컵',
  'bingo-game': '빙고 게임',
  'ladder-game': '사다리 게임',
  'team-divider': '팀 나누기',
  'salary-calculator': '연봉 계산기',
  'rent-calculator': '월세 계산기',
  'gpa-calculator': '학점 계산기',
  'dutch-pay': '더치페이',
  'random-picker': '랜덤 뽑기',
  'lunch-roulette': '점심 룰렛',
  'id-validator': '주민번호 검증',
  'this-or-that': 'This or That',
  'realtime-quiz': '실시간 퀴즈',
  'word-cloud': '워드 클라우드',
  'personality-test': '성격 테스트',
  'human-bingo': '휴먼 빙고',
  'audience-engage': '청중 참여',
};

export function useSessionHistory({
  userId,
  appType,
  isActive,
  limit = 10,
  offset = 0,
}: UseSessionHistoryParams = {}): UseSessionHistoryReturn {
  const supabase = useSupabase();
  const [sessions, setSessions] = useState<SessionWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSessions = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get current user if userId not provided
      let currentUserId = userId;
      if (!currentUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        currentUserId = user?.id;
      }

      if (!currentUserId) {
        setSessions([]);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }

      // Build query
      let query = supabase
        .from('sessions')
        .select('*, session_participants(count)', { count: 'exact' })
        .eq('host_id', currentUserId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (appType) {
        query = query.eq('app_type', appType);
      }
      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      // Transform data to include participant count and display name
      const sessionsWithStats: SessionWithStats[] = (data || []).map((session: any) => ({
        ...session,
        participant_count: session.session_participants?.[0]?.count || 0,
        app_display_name: (appDisplayNames as Record<string, string>)[session.app_type] || session.app_type,
      }));

      setSessions(sessionsWithStats);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId, appType, isActive, limit, offset]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    error,
    totalCount,
    refetch: fetchSessions,
  };
}
