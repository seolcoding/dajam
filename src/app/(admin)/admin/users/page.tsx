'use client';

import { useState, useEffect } from 'react';
import { UserTable } from '@/components/admin/UserTable';
import { useSupabase } from '@/hooks/useSupabase';
import type { Profile } from '@/types/database';

export default function AdminUsersPage() {
  const supabase = useSupabase();
  const [users, setUsers] = useState<
    Array<Profile & { session_count: number; last_activity: string | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!supabase) return;

      try {
        setIsLoading(true);

        // Fetch users with pagination
        const { data, error, count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        if (error) throw error;

        // Transform data to include session count and last activity
        // In production, these would come from joins or separate queries
        const usersWithStats = (data || []).map((user: Profile) => ({
          ...user,
          session_count: 0, // TODO: Get from sessions table
          last_activity: null as string | null, // TODO: Get from activity_logs table
        }));

        setUsers(usersWithStats);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [supabase, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">사용자 관리</h2>
        <p className="text-muted-foreground">플랫폼의 모든 사용자를 관리하세요</p>
      </div>

      {/* Users Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
