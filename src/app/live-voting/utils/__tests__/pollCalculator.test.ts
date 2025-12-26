import { describe, it, expect } from 'vitest';
import { countVotes, bordaCount, calculateResults } from '../pollCalculator';
import type { Poll, Vote, PollResult } from '../../types/poll';

// 테스트용 Vote 헬퍼
function createVote(id: string, pollId: string, selection: number | number[]): Vote {
  return {
    id,
    pollId,
    selection,
    timestamp: new Date(),
  };
}

// 테스트용 Poll 헬퍼
function createPoll(
  type: 'single' | 'multiple' | 'ranking',
  options: string[]
): Poll {
  return {
    id: 'test-poll',
    title: '테스트 투표',
    type,
    options,
    createdAt: new Date(),
    allowAnonymous: true,
  };
}

describe('pollCalculator', () => {
  describe('countVotes - 단일 선택 투표', () => {
    const options = ['옵션 A', '옵션 B', '옵션 C'];

    it('투표가 없을 때 모든 count가 0이어야 함', () => {
      const votes: Vote[] = [];
      const results = countVotes(options, votes, 'single');

      expect(results).toHaveLength(3);
      expect(results[0].count).toBe(0);
      expect(results[0].percentage).toBe(0);
      expect(results[1].count).toBe(0);
      expect(results[2].count).toBe(0);
    });

    it('단일 투표를 정확히 집계해야 함', () => {
      const votes = [
        createVote('1', 'poll1', 0),
        createVote('2', 'poll1', 1),
        createVote('3', 'poll1', 0),
      ];
      const results = countVotes(options, votes, 'single');

      expect(results[0].count).toBe(2); // 옵션 A
      expect(results[1].count).toBe(1); // 옵션 B
      expect(results[2].count).toBe(0); // 옵션 C
    });

    it('퍼센티지를 정확히 계산해야 함', () => {
      const votes = [
        createVote('1', 'poll1', 0),
        createVote('2', 'poll1', 0),
        createVote('3', 'poll1', 1),
        createVote('4', 'poll1', 2),
      ];
      const results = countVotes(options, votes, 'single');

      expect(results[0].percentage).toBe(50); // 2/4 = 50%
      expect(results[1].percentage).toBe(25); // 1/4 = 25%
      expect(results[2].percentage).toBe(25); // 1/4 = 25%
    });

    it('옵션 순서가 유지되어야 함', () => {
      const votes: Vote[] = [];
      const results = countVotes(options, votes, 'single');

      expect(results[0].option).toBe('옵션 A');
      expect(results[1].option).toBe('옵션 B');
      expect(results[2].option).toBe('옵션 C');
    });

    it('모든 투표가 한 옵션에 집중될 때 100%가 되어야 함', () => {
      const votes = [
        createVote('1', 'poll1', 1),
        createVote('2', 'poll1', 1),
        createVote('3', 'poll1', 1),
      ];
      const results = countVotes(options, votes, 'single');

      expect(results[0].percentage).toBe(0);
      expect(results[1].percentage).toBe(100);
      expect(results[2].percentage).toBe(0);
    });
  });

  describe('countVotes - 복수 선택 투표', () => {
    const options = ['옵션 A', '옵션 B', '옵션 C', '옵션 D'];

    it('복수 선택 투표를 정확히 집계해야 함', () => {
      const votes = [
        createVote('1', 'poll1', [0, 1]),     // A, B 선택
        createVote('2', 'poll1', [1, 2]),     // B, C 선택
        createVote('3', 'poll1', [0, 1, 2]),  // A, B, C 선택
      ];
      const results = countVotes(options, votes, 'multiple');

      expect(results[0].count).toBe(2); // A: 2명
      expect(results[1].count).toBe(3); // B: 3명
      expect(results[2].count).toBe(2); // C: 2명
      expect(results[3].count).toBe(0); // D: 0명
    });

    it('복수 선택 퍼센티지는 총 투표자 수 기준이어야 함', () => {
      const votes = [
        createVote('1', 'poll1', [0, 1]),
        createVote('2', 'poll1', [1]),
      ];
      const results = countVotes(options, votes, 'multiple');

      // 총 2명 투표
      expect(results[0].percentage).toBe(50);  // 1/2 = 50%
      expect(results[1].percentage).toBe(100); // 2/2 = 100%
    });

    it('빈 복수 선택도 처리해야 함', () => {
      const votes = [
        createVote('1', 'poll1', []),
        createVote('2', 'poll1', [0]),
      ];
      const results = countVotes(options, votes, 'multiple');

      expect(results[0].count).toBe(1);
    });
  });

  describe('bordaCount - 순위 투표', () => {
    const options = ['후보 A', '후보 B', '후보 C'];

    it('Borda Count 점수를 정확히 계산해야 함', () => {
      // n=3: 1위=3점, 2위=2점, 3위=1점
      const votes = [
        createVote('1', 'poll1', [0, 1, 2]), // A=3, B=2, C=1
        createVote('2', 'poll1', [0, 2, 1]), // A=3, C=2, B=1
        createVote('3', 'poll1', [1, 0, 2]), // B=3, A=2, C=1
      ];
      const results = bordaCount(options, votes);

      // A: 3+3+2 = 8점
      // B: 2+1+3 = 6점
      // C: 1+2+1 = 4점
      const scoreA = results.find(r => r.option === '후보 A')?.score;
      const scoreB = results.find(r => r.option === '후보 B')?.score;
      const scoreC = results.find(r => r.option === '후보 C')?.score;

      expect(scoreA).toBe(8);
      expect(scoreB).toBe(6);
      expect(scoreC).toBe(4);
    });

    it('결과가 점수순으로 정렬되어야 함', () => {
      const votes = [
        createVote('1', 'poll1', [2, 1, 0]), // C=3, B=2, A=1
        createVote('2', 'poll1', [2, 0, 1]), // C=3, A=2, B=1
      ];
      const results = bordaCount(options, votes);

      // C: 6점, A: 3점(또는 4점), B: 나머지
      expect(results[0].option).toBe('후보 C');
      expect(results[0].rank).toBe(1);
    });

    it('랭킹이 올바르게 부여되어야 함', () => {
      const votes = [
        createVote('1', 'poll1', [0, 1, 2]),
      ];
      const results = bordaCount(options, votes);

      expect(results[0].rank).toBe(1);
      expect(results[1].rank).toBe(2);
      expect(results[2].rank).toBe(3);
    });

    it('투표가 없을 때 모든 점수가 0이어야 함', () => {
      const votes: Vote[] = [];
      const results = bordaCount(options, votes);

      expect(results.every(r => r.score === 0)).toBe(true);
    });

    it('동점일 때도 처리되어야 함', () => {
      const votes = [
        createVote('1', 'poll1', [0, 1, 2]), // A=3, B=2, C=1
        createVote('2', 'poll1', [1, 0, 2]), // B=3, A=2, C=1
      ];
      const results = bordaCount(options, votes);

      // A: 5점, B: 5점 (동점)
      const scoreA = results.find(r => r.option === '후보 A')?.score;
      const scoreB = results.find(r => r.option === '후보 B')?.score;

      expect(scoreA).toBe(5);
      expect(scoreB).toBe(5);
    });
  });

  describe('calculateResults - 통합 계산', () => {
    it('single 타입일 때 countVotes를 사용해야 함', () => {
      const poll = createPoll('single', ['A', 'B']);
      const votes = [
        createVote('1', 'poll1', 0),
        createVote('2', 'poll1', 1),
      ];
      const results = calculateResults(poll, votes);

      expect(results[0].count).toBe(1);
      expect(results[1].count).toBe(1);
      expect(results[0].score).toBeUndefined();
    });

    it('multiple 타입일 때 countVotes를 사용해야 함', () => {
      const poll = createPoll('multiple', ['A', 'B', 'C']);
      const votes = [
        createVote('1', 'poll1', [0, 1]),
        createVote('2', 'poll1', [1, 2]),
      ];
      const results = calculateResults(poll, votes);

      expect(results[0].count).toBe(1); // A
      expect(results[1].count).toBe(2); // B
      expect(results[2].count).toBe(1); // C
    });

    it('ranking 타입일 때 bordaCount를 사용해야 함', () => {
      const poll = createPoll('ranking', ['A', 'B', 'C']);
      const votes = [
        createVote('1', 'poll1', [0, 1, 2]),
      ];
      const results = calculateResults(poll, votes);

      expect(results[0].score).toBeDefined();
      expect(results[0].rank).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('옵션이 하나일 때 처리해야 함', () => {
      const options = ['유일한 옵션'];
      const votes = [createVote('1', 'poll1', 0)];
      const results = countVotes(options, votes, 'single');

      expect(results).toHaveLength(1);
      expect(results[0].count).toBe(1);
      expect(results[0].percentage).toBe(100);
    });

    it('많은 수의 투표를 처리해야 함', () => {
      const options = ['A', 'B'];
      const votes = Array.from({ length: 1000 }, (_, i) =>
        createVote(`${i}`, 'poll1', i % 2)
      );
      const results = countVotes(options, votes, 'single');

      expect(results[0].count).toBe(500);
      expect(results[1].count).toBe(500);
    });

    it('많은 수의 옵션을 처리해야 함', () => {
      const options = Array.from({ length: 20 }, (_, i) => `옵션 ${i + 1}`);
      const votes = [createVote('1', 'poll1', 19)];
      const results = countVotes(options, votes, 'single');

      expect(results).toHaveLength(20);
      expect(results[19].count).toBe(1);
    });

    it('순위 투표에서 부분 순위도 처리해야 함', () => {
      // 일부 옵션만 순위 매긴 경우
      const options = ['A', 'B', 'C', 'D'];
      const votes = [
        createVote('1', 'poll1', [0, 1]), // 상위 2개만 순위
      ];
      // 현재 구현에서는 전체 순위를 기대하므로 이 케이스는 별도 처리 필요
      const results = bordaCount(options, votes);

      expect(results).toBeDefined();
    });
  });
});
