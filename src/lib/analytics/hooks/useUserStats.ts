'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStats } from '../stats';
import type { UserStats, StatsPeriod } from '../types';

interface UseUserStatsOptions {
  userId: string | null;
  period?: StatsPeriod;
  enabled?: boolean;
}

interface UseUserStatsReturn {
  stats: UserStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const defaultStats: UserStats = {
  totalSessions: 0,
  totalParticipants: 0,
  activeSessions: 0,
  byAppType: {},
  byDate: [],
};

/**
 * 사용자 통계를 조회하는 React Hook
 *
 * @example
 * ```tsx
 * const { stats, isLoading, error, refetch } = useUserStats({
 *   userId: user?.id ?? null,
 *   period: 'month',
 * });
 * ```
 */
export function useUserStats({
  userId,
  period = 'month',
  enabled = true,
}: UseUserStatsOptions): UseUserStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId || !enabled) {
      setStats(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getStats({ userId, period });
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('통계 조회 실패'));
      setStats(defaultStats);
    } finally {
      setIsLoading(false);
    }
  }, [userId, period, enabled]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
