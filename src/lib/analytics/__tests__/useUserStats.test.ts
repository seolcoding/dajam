import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { StatsApiResponse, StatsPeriod } from '../types';

// Supabase 클라이언트 mock
const mockRpc = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc,
  })),
}));

import { useUserStats } from '../hooks/useUserStats';

describe('useUserStats Hook', () => {
  const mockStatsResponse: StatsApiResponse = {
    total_sessions: 10,
    total_participants: 50,
    active_sessions: 2,
    by_app_type: { 'live-voting': 5, 'balance-game': 3 },
    by_date: [
      { date: '2024-12-23', count: 3 },
      { date: '2024-12-24', count: 4 },
      { date: '2024-12-25', count: 3 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('userId가 있을 때 통계를 조회해야 함', async () => {
    mockRpc.mockResolvedValueOnce({ data: mockStatsResponse, error: null });

    const { result } = renderHook(() =>
      useUserStats({ userId: 'user-123', period: 'month' })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).not.toBeNull();
    expect(result.current.stats?.totalSessions).toBe(10);
    expect(result.current.stats?.totalParticipants).toBe(50);
    expect(result.current.error).toBeNull();
  });

  it('userId가 null일 때 통계를 조회하지 않아야 함', async () => {
    const { result } = renderHook(() =>
      useUserStats({ userId: null, period: 'month' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('enabled=false일 때 통계를 조회하지 않아야 함', async () => {
    const { result } = renderHook(() =>
      useUserStats({ userId: 'user-123', period: 'month', enabled: false })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('에러 발생 시 error 상태를 설정해야 함', async () => {
    mockRpc.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() =>
      useUserStats({ userId: 'user-123', period: 'month' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('API Error');
  });

  it('refetch 함수로 데이터를 다시 조회할 수 있어야 함', async () => {
    mockRpc.mockResolvedValue({ data: mockStatsResponse, error: null });

    const { result } = renderHook(() =>
      useUserStats({ userId: 'user-123', period: 'month' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockRpc).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockRpc).toHaveBeenCalledTimes(2);
  });

  it('period 변경 시 새로 조회해야 함', async () => {
    mockRpc.mockResolvedValue({ data: mockStatsResponse, error: null });

    const { result, rerender } = renderHook(
      ({ period }: { period: StatsPeriod }) =>
        useUserStats({ userId: 'user-123', period }),
      { initialProps: { period: 'week' as StatsPeriod } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockRpc).toHaveBeenCalledWith('get_user_stats', {
      p_user_id: 'user-123',
      p_period: 'week',
    });

    rerender({ period: 'month' as StatsPeriod });

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('get_user_stats', {
        p_user_id: 'user-123',
        p_period: 'month',
      });
    });
  });

  it('기본 period는 month여야 함', async () => {
    mockRpc.mockResolvedValue({ data: mockStatsResponse, error: null });

    renderHook(() => useUserStats({ userId: 'user-123' }));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('get_user_stats', {
        p_user_id: 'user-123',
        p_period: 'month',
      });
    });
  });
});
