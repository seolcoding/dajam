'use client';

import { useState, useEffect } from 'react';
import { SessionTable } from '@/components/admin/SessionTable';
import { useSupabase } from '@/hooks/useSupabase';
import type { Session } from '@/types/database';

export default function AdminSessionsPage() {
  const supabase = useSupabase();
  const [sessions, setSessions] = useState<
    Array<Session & { host_name: string; participant_count: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchSessions = async () => {
      if (!supabase) return;

      try {
        setIsLoading(true);

        // Fetch sessions with pagination
        const { data, error, count } = await supabase
          .from('sessions')
          .select('*, profiles(nickname)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        if (error) throw error;

        // Transform data
        const sessionsWithStats = (data || []).map((session: any) => ({
          ...session,
          host_name: session.profiles?.nickname || '알 수 없음',
          participant_count: 0, // TODO: Get from session_participants count
        }));

        setSessions(sessionsWithStats);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [supabase, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">세션 관리</h2>
        <p className="text-muted-foreground">플랫폼의 모든 세션을 관리하세요</p>
      </div>

      {/* Sessions Table */}
      <SessionTable
        sessions={sessions}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
