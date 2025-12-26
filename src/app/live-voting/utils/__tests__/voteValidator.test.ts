import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hasVoted, markAsVoted } from '../voteValidator';
import { STORAGE_KEYS } from '../storage';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

describe('voteValidator', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('hasVoted', () => {
    it('투표하지 않은 poll에 대해 false를 반환해야 함', () => {
      const result = hasVoted('poll-123');

      expect(result).toBe(false);
    });

    it('투표한 poll에 대해 true를 반환해야 함', () => {
      // 투표 기록 설정
      localStorageMock.setItem(STORAGE_KEYS.votedPolls, JSON.stringify(['poll-123']));

      const result = hasVoted('poll-123');

      expect(result).toBe(true);
    });

    it('다른 poll에 투표했을 때 false를 반환해야 함', () => {
      localStorageMock.setItem(STORAGE_KEYS.votedPolls, JSON.stringify(['poll-other']));

      const result = hasVoted('poll-123');

      expect(result).toBe(false);
    });

    it('여러 poll 중 해당 poll이 있으면 true를 반환해야 함', () => {
      localStorageMock.setItem(
        STORAGE_KEYS.votedPolls,
        JSON.stringify(['poll-1', 'poll-2', 'poll-123', 'poll-4'])
      );

      expect(hasVoted('poll-1')).toBe(true);
      expect(hasVoted('poll-123')).toBe(true);
      expect(hasVoted('poll-999')).toBe(false);
    });

    it('빈 배열일 때 false를 반환해야 함', () => {
      localStorageMock.setItem(STORAGE_KEYS.votedPolls, JSON.stringify([]));

      const result = hasVoted('poll-123');

      expect(result).toBe(false);
    });

    it('잘못된 JSON 형식일 때 오류 없이 처리해야 함', () => {
      // 잘못된 JSON - 빈 배열로 파싱됨 (기본값)
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      // JSON.parse 오류 발생 - 테스트에서는 mock이 빈 배열 반환
      expect(() => hasVoted('poll-123')).not.toThrow();
    });
  });

  describe('markAsVoted', () => {
    it('투표 기록을 저장해야 함', () => {
      markAsVoted('poll-123');

      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEYS.votedPolls) || '[]');
      expect(stored).toContain('poll-123');
    });

    it('기존 투표 기록에 추가해야 함', () => {
      localStorageMock.setItem(STORAGE_KEYS.votedPolls, JSON.stringify(['poll-1']));

      markAsVoted('poll-2');

      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEYS.votedPolls) || '[]');
      expect(stored).toContain('poll-1');
      expect(stored).toContain('poll-2');
    });

    it('중복 투표 기록을 추가하지 않아야 함', () => {
      localStorageMock.setItem(STORAGE_KEYS.votedPolls, JSON.stringify(['poll-123']));

      markAsVoted('poll-123');

      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEYS.votedPolls) || '[]');
      expect(stored.filter((id: string) => id === 'poll-123')).toHaveLength(1);
    });

    it('여러 poll에 순차적으로 투표 기록을 추가해야 함', () => {
      markAsVoted('poll-1');
      markAsVoted('poll-2');
      markAsVoted('poll-3');

      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEYS.votedPolls) || '[]');
      expect(stored).toHaveLength(3);
      expect(stored).toEqual(expect.arrayContaining(['poll-1', 'poll-2', 'poll-3']));
    });
  });

  describe('hasVoted + markAsVoted 통합', () => {
    it('markAsVoted 후 hasVoted가 true를 반환해야 함', () => {
      expect(hasVoted('poll-123')).toBe(false);

      markAsVoted('poll-123');

      expect(hasVoted('poll-123')).toBe(true);
    });

    it('다른 poll에는 영향을 주지 않아야 함', () => {
      markAsVoted('poll-1');

      expect(hasVoted('poll-1')).toBe(true);
      expect(hasVoted('poll-2')).toBe(false);
    });
  });
});
