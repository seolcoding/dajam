'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

interface AdminStats {
  totalUsers: number;
  activeUsersThisWeek: number;
  totalSessions: number;
  proSubscribers: number;
  monthlyRevenue: number;
  activeSessions: number;
}

interface UseAdminStatsReturn {
  stats: AdminStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAdminStats(): UseAdminStatsReturn {
  const supabase = useSupabase();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if user is admin
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        throw new Error('Not authorized - admin access required');
      }

      // Fetch stats in parallel
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [
        { count: totalUsers },
        { count: activeUsersThisWeek },
        { count: totalSessions },
        { count: proSubscribers },
        { count: activeSessions },
      ] = await Promise.all([
        // Total users
        supabase.from('profiles').select('*', { count: 'exact', head: true }),

        // Active users this week (based on activity_logs)
        supabase
          .from('activity_logs')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo.toISOString()),

        // Total sessions
        supabase.from('sessions').select('*', { count: 'exact', head: true }),

        // Pro subscribers (placeholder - would need a subscriptions table)
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_admin', false), // TODO: Add subscription status to profiles

        // Active sessions
        supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        activeUsersThisWeek: activeUsersThisWeek || 0,
        totalSessions: totalSessions || 0,
        proSubscribers: proSubscribers || 0, // Mock value
        monthlyRevenue: 0, // Mock value - would need payment tracking
        activeSessions: activeSessions || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch admin stats'));
      console.error('Error fetching admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

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
