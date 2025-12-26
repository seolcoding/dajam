import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserStats, StatsApiResponse, StatsPeriod } from '../types';

// Supabase 클라이언트 mock
const mockRpc = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc,
  })),
}));

// stats 모듈 import (mock 설정 후)
import { getStats, transformStatsResponse } from '../stats';

describe('Analytics - getStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStats', () => {
    it('사용자 ID와 기간으로 통계를 조회해야 함', async () => {
      const mockResponse: StatsApiResponse = {
        total_sessions: 10,
        total_participants: 50,
        active_sessions: 2,
        by_app_type: { 'live-voting': 5 },
        by_date: [{ date: '2024-12-25', count: 3 }],
      };

      mockRpc.mockResolvedValueOnce({ data: mockResponse, error: null });

      const userId = 'user-123';
      const period: StatsPeriod = 'month';

      const result = await getStats({ userId, period });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalSessions');
      expect(result).toHaveProperty('totalParticipants');
      expect(result).toHaveProperty('activeSessions');
      expect(result).toHaveProperty('byAppType');
      expect(result).toHaveProperty('byDate');
    });

    it('week 기간으로 7일간의 데이터를 반환해야 함', async () => {
      const mockResponse: StatsApiResponse = {
        total_sessions: 5,
        total_participants: 20,
        active_sessions: 1,
        by_app_type: null,
        by_date: [
          { date: '2024-12-19', count: 1 },
          { date: '2024-12-20', count: 1 },
          { date: '2024-12-21', count: 1 },
          { date: '2024-12-22', count: 1 },
          { date: '2024-12-23', count: 1 },
        ],
      };

      mockRpc.mockResolvedValueOnce({ data: mockResponse, error: null });

      const userId = 'user-123';
      const period: StatsPeriod = 'week';

      const result = await getStats({ userId, period });

      expect(result.byDate).toBeDefined();
      expect(result.byDate.length).toBeLessThanOrEqual(7);
    });

    it('month 기간으로 30일간의 데이터를 반환해야 함', async () => {
      const byDate = Array.from({ length: 30 }, (_, i) => ({
        date: `2024-12-${String(i + 1).padStart(2, '0')}`,
        count: 1,
      }));

      const mockResponse: StatsApiResponse = {
        total_sessions: 30,
        total_participants: 100,
        active_sessions: 0,
        by_app_type: null,
        by_date: byDate,
      };

      mockRpc.mockResolvedValueOnce({ data: mockResponse, error: null });

      const userId = 'user-123';
      const period: StatsPeriod = 'month';

      const result = await getStats({ userId, period });

      expect(result.byDate).toBeDefined();
      expect(result.byDate.length).toBeLessThanOrEqual(31);
    });

    it('year 기간으로 12개월간의 데이터를 반환해야 함', async () => {
      const byDate = Array.from({ length: 12 }, (_, i) => ({
        date: `2024-${String(i + 1).padStart(2, '0')}`,
        count: 5,
      }));

      const mockResponse: StatsApiResponse = {
        total_sessions: 60,
        total_participants: 300,
        active_sessions: 0,
        by_app_type: null,
        by_date: byDate,
      };

      mockRpc.mockResolvedValueOnce({ data: mockResponse, error: null });

      const userId = 'user-123';
      const period: StatsPeriod = 'year';

      const result = await getStats({ userId, period });

      expect(result.byDate).toBeDefined();
      expect(result.byDate.length).toBeLessThanOrEqual(12);
    });

    it('데이터가 없을 때 기본값을 반환해야 함', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      const userId = 'user-no-data';
      const period: StatsPeriod = 'month';

      const result = await getStats({ userId, period });

      expect(result.totalSessions).toBe(0);
      expect(result.totalParticipants).toBe(0);
      expect(result.activeSessions).toBe(0);
      expect(result.byAppType).toEqual({});
      expect(result.byDate).toEqual([]);
    });

    it('Supabase RPC를 올바른 파라미터로 호출해야 함', async () => {
      const mockResponse: StatsApiResponse = {
        total_sessions: 0,
        total_participants: 0,
        active_sessions: 0,
        by_app_type: null,
        by_date: null,
      };

      mockRpc.mockResolvedValueOnce({ data: mockResponse, error: null });

      const userId = 'user-123';
      const period: StatsPeriod = 'week';

      await getStats({ userId, period });

      expect(mockRpc).toHaveBeenCalledWith('get_user_stats', {
        p_user_id: userId,
        p_period: period,
      });
    });
  });

  describe('transformStatsResponse', () => {
    it('API 응답을 UserStats 형식으로 변환해야 함', () => {
      const apiResponse: StatsApiResponse = {
        total_sessions: 10,
        total_participants: 50,
        active_sessions: 2,
        by_app_type: { 'live-voting': 5, 'balance-game': 3, 'chosung-quiz': 2 },
        by_date: [
          { date: '2024-12-20', count: 3 },
          { date: '2024-12-21', count: 4 },
          { date: '2024-12-22', count: 3 },
        ],
      };

      const result = transformStatsResponse(apiResponse);

      expect(result.totalSessions).toBe(10);
      expect(result.totalParticipants).toBe(50);
      expect(result.activeSessions).toBe(2);
      expect(result.byAppType).toEqual({
        'live-voting': 5,
        'balance-game': 3,
        'chosung-quiz': 2,
      });
      expect(result.byDate).toHaveLength(3);
    });

    it('by_app_type이 null일 때 빈 객체를 반환해야 함', () => {
      const apiResponse: StatsApiResponse = {
        total_sessions: 0,
        total_participants: 0,
        active_sessions: 0,
        by_app_type: null,
        by_date: null,
      };

      const result = transformStatsResponse(apiResponse);

      expect(result.byAppType).toEqual({});
      expect(result.byDate).toEqual([]);
    });

    it('by_date이 null일 때 빈 배열을 반환해야 함', () => {
      const apiResponse: StatsApiResponse = {
        total_sessions: 5,
        total_participants: 20,
        active_sessions: 1,
        by_app_type: { 'live-voting': 5 },
        by_date: null,
      };

      const result = transformStatsResponse(apiResponse);

      expect(result.byDate).toEqual([]);
    });

    it('AppType 키를 올바르게 변환해야 함', () => {
      const apiResponse: StatsApiResponse = {
        total_sessions: 3,
        total_participants: 15,
        active_sessions: 0,
        by_app_type: {
          'audience-engage': 1,
          'ideal-worldcup': 1,
          'student-network': 1,
        },
        by_date: [],
      };

      const result = transformStatsResponse(apiResponse);

      expect(result.byAppType['audience-engage']).toBe(1);
      expect(result.byAppType['ideal-worldcup']).toBe(1);
      expect(result.byAppType['student-network']).toBe(1);
    });
  });
});

describe('Analytics - Edge Cases', () => {
  it('음수 값이 있을 때 0으로 처리해야 함', () => {
    const apiResponse: StatsApiResponse = {
      total_sessions: -1,
      total_participants: -5,
      active_sessions: -2,
      by_app_type: null,
      by_date: null,
    };

    const result = transformStatsResponse(apiResponse);

    expect(result.totalSessions).toBeGreaterThanOrEqual(0);
    expect(result.totalParticipants).toBeGreaterThanOrEqual(0);
    expect(result.activeSessions).toBeGreaterThanOrEqual(0);
  });

  it('by_date의 날짜가 YYYY-MM-DD 형식이어야 함', () => {
    const apiResponse: StatsApiResponse = {
      total_sessions: 1,
      total_participants: 5,
      active_sessions: 0,
      by_app_type: null,
      by_date: [{ date: '2024-12-25', count: 1 }],
    };

    const result = transformStatsResponse(apiResponse);

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    result.byDate.forEach((item) => {
      expect(item.date).toMatch(dateRegex);
    });
  });
});
