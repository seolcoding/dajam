import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useLiveVotingStore } from '../liveVotingStore';
import type { Poll, Vote } from '../../types/poll';
import type { SessionParticipant } from '@/types/database';

// 테스트용 Poll 생성
function createTestPoll(overrides: Partial<Poll> = {}): Poll {
  return {
    id: 'test-poll-123',
    title: '테스트 투표',
    type: 'single',
    options: ['옵션 A', '옵션 B', '옵션 C'],
    createdAt: new Date('2024-01-01'),
    allowAnonymous: true,
    ...overrides,
  };
}

// 테스트용 Vote 생성
function createTestVote(overrides: Partial<Vote> = {}): Vote {
  return {
    id: `vote-${Date.now()}`,
    pollId: 'test-poll-123',
    selection: 0,
    timestamp: new Date(),
    ...overrides,
  };
}

// 테스트용 Participant 생성
function createTestParticipant(overrides: Partial<SessionParticipant> = {}): SessionParticipant {
  return {
    id: `participant-${Date.now()}`,
    session_id: 'session-123',
    user_id: null,
    display_name: '참여자',
    role: 'participant',
    joined_at: new Date().toISOString(),
    is_banned: false,
    ...overrides,
  } as SessionParticipant;
}

describe('liveVotingStore', () => {
  // 각 테스트 전에 스토어 리셋
  beforeEach(() => {
    act(() => {
      useLiveVotingStore.getState().reset();
    });
  });

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const state = useLiveVotingStore.getState();

      expect(state.poll).toBeNull();
      expect(state.sessionId).toBeNull();
      expect(state.sessionCode).toBeNull();
      expect(state.status).toBe('active');
      expect(state.mode).toBe('local');
      expect(state.isHost).toBe(false);
      expect(state.votes).toEqual([]);
      expect(state.results).toEqual([]);
      expect(state.participants).toEqual([]);
      expect(state.connectionStatus).toBe('disconnected');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.hasVoted).toBe(false);
      expect(state.userSelection).toBeNull();
    });
  });

  describe('initPoll', () => {
    it('poll을 초기화해야 함', () => {
      const poll = createTestPoll();

      act(() => {
        useLiveVotingStore.getState().initPoll(poll);
      });

      const state = useLiveVotingStore.getState();
      expect(state.poll).toEqual(poll);
      expect(state.sessionCode).toBe(poll.id);
      expect(state.status).toBe('active');
      expect(state.mode).toBe('local');
      expect(state.isHost).toBe(false);
    });

    it('호스트 모드로 초기화해야 함', () => {
      const poll = createTestPoll();

      act(() => {
        useLiveVotingStore.getState().initPoll(poll, { isHost: true });
      });

      const state = useLiveVotingStore.getState();
      expect(state.isHost).toBe(true);
    });

    it('클라우드 모드로 초기화해야 함', () => {
      const poll = createTestPoll();

      act(() => {
        useLiveVotingStore.getState().initPoll(poll, { mode: 'cloud' });
      });

      const state = useLiveVotingStore.getState();
      expect(state.mode).toBe('cloud');
    });

    it('결과 배열을 옵션 수에 맞게 초기화해야 함', () => {
      const poll = createTestPoll({ options: ['A', 'B', 'C', 'D'] });

      act(() => {
        useLiveVotingStore.getState().initPoll(poll);
      });

      const state = useLiveVotingStore.getState();
      expect(state.results).toHaveLength(4);
      expect(state.results.every(r => r.count === 0)).toBe(true);
      expect(state.results.every(r => r.percentage === 0)).toBe(true);
    });

    it('이전 투표 상태를 리셋해야 함', () => {
      const poll = createTestPoll();

      act(() => {
        const store = useLiveVotingStore.getState();
        store.initPoll(poll);
        store.setUserVoted(1);
      });

      // 새 poll로 다시 초기화
      act(() => {
        useLiveVotingStore.getState().initPoll(createTestPoll({ id: 'new-poll' }));
      });

      const state = useLiveVotingStore.getState();
      expect(state.hasVoted).toBe(false);
      expect(state.userSelection).toBeNull();
    });
  });

  describe('setSessionInfo', () => {
    it('세션 정보를 설정해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().setSessionInfo('session-uuid', 'ABC123');
      });

      const state = useLiveVotingStore.getState();
      expect(state.sessionId).toBe('session-uuid');
      expect(state.sessionCode).toBe('ABC123');
    });
  });

  describe('reset', () => {
    it('모든 상태를 초기값으로 리셋해야 함', () => {
      const poll = createTestPoll();

      act(() => {
        const store = useLiveVotingStore.getState();
        store.initPoll(poll, { isHost: true, mode: 'cloud' });
        store.setSessionInfo('session-123', 'CODE');
        store.addVote(createTestVote());
        store.setUserVoted(0);
        store.setStatus('closed');
      });

      act(() => {
        useLiveVotingStore.getState().reset();
      });

      const state = useLiveVotingStore.getState();
      expect(state.poll).toBeNull();
      expect(state.sessionId).toBeNull();
      expect(state.isHost).toBe(false);
      expect(state.mode).toBe('local');
      expect(state.votes).toEqual([]);
      expect(state.hasVoted).toBe(false);
      expect(state.status).toBe('active');
    });
  });

  describe('상태 변경 액션', () => {
    it('setStatus로 상태를 변경해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().setStatus('closed');
      });

      expect(useLiveVotingStore.getState().status).toBe('closed');

      act(() => {
        useLiveVotingStore.getState().setStatus('results_locked');
      });

      expect(useLiveVotingStore.getState().status).toBe('results_locked');
    });

    it('setConnectionStatus로 연결 상태를 변경해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().setConnectionStatus('connecting');
      });

      expect(useLiveVotingStore.getState().connectionStatus).toBe('connecting');

      act(() => {
        useLiveVotingStore.getState().setConnectionStatus('connected');
      });

      expect(useLiveVotingStore.getState().connectionStatus).toBe('connected');
    });

    it('setLoading으로 로딩 상태를 변경해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().setLoading(true);
      });

      expect(useLiveVotingStore.getState().isLoading).toBe(true);

      act(() => {
        useLiveVotingStore.getState().setLoading(false);
      });

      expect(useLiveVotingStore.getState().isLoading).toBe(false);
    });

    it('setError로 에러를 설정해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().setError('투표 실패');
      });

      expect(useLiveVotingStore.getState().error).toBe('투표 실패');

      act(() => {
        useLiveVotingStore.getState().setError(null);
      });

      expect(useLiveVotingStore.getState().error).toBeNull();
    });
  });

  describe('투표 관련 액션', () => {
    beforeEach(() => {
      const poll = createTestPoll();
      act(() => {
        useLiveVotingStore.getState().initPoll(poll);
      });
    });

    it('addVote로 투표를 추가해야 함', () => {
      const vote = createTestVote({ selection: 0 });

      act(() => {
        useLiveVotingStore.getState().addVote(vote);
      });

      const state = useLiveVotingStore.getState();
      expect(state.votes).toHaveLength(1);
      expect(state.votes[0]).toEqual(vote);
    });

    it('addVote 시 결과를 재계산해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().addVote(createTestVote({ selection: 0 }));
        useLiveVotingStore.getState().addVote(createTestVote({ selection: 0 }));
        useLiveVotingStore.getState().addVote(createTestVote({ selection: 1 }));
      });

      const state = useLiveVotingStore.getState();
      expect(state.results[0].count).toBe(2);
      expect(state.results[1].count).toBe(1);
      expect(state.results[2].count).toBe(0);
    });

    it('setVotes로 투표 배열을 설정해야 함', () => {
      const votes = [
        createTestVote({ id: '1', selection: 0 }),
        createTestVote({ id: '2', selection: 1 }),
        createTestVote({ id: '3', selection: 2 }),
      ];

      act(() => {
        useLiveVotingStore.getState().setVotes(votes);
      });

      const state = useLiveVotingStore.getState();
      expect(state.votes).toHaveLength(3);
      expect(state.results[0].count).toBe(1);
      expect(state.results[1].count).toBe(1);
      expect(state.results[2].count).toBe(1);
    });

    it('setUserVoted로 사용자 투표 상태를 설정해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().setUserVoted(1);
      });

      const state = useLiveVotingStore.getState();
      expect(state.hasVoted).toBe(true);
      expect(state.userSelection).toBe(1);
    });

    it('복수 선택 투표 상태도 저장해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().setUserVoted([0, 2]);
      });

      const state = useLiveVotingStore.getState();
      expect(state.hasVoted).toBe(true);
      expect(state.userSelection).toEqual([0, 2]);
    });

    it('recalculateResults로 결과를 재계산해야 함', () => {
      const votes = [
        createTestVote({ selection: 0 }),
        createTestVote({ selection: 0 }),
      ];

      act(() => {
        // votes를 직접 설정하지 않고 상태 조작
        useLiveVotingStore.setState({ votes });
      });

      act(() => {
        useLiveVotingStore.getState().recalculateResults();
      });

      const state = useLiveVotingStore.getState();
      expect(state.results[0].count).toBe(2);
    });
  });

  describe('참여자 관련 액션', () => {
    it('addParticipant로 참여자를 추가해야 함', () => {
      const participant = createTestParticipant({ id: 'p1', display_name: '참여자1' });

      act(() => {
        useLiveVotingStore.getState().addParticipant(participant);
      });

      const state = useLiveVotingStore.getState();
      expect(state.participants).toHaveLength(1);
      expect(state.participants[0].display_name).toBe('참여자1');
    });

    it('addParticipant로 중복 참여자를 업데이트해야 함', () => {
      const participant1 = createTestParticipant({ id: 'p1', display_name: '참여자1' });
      const participant1Updated = createTestParticipant({ id: 'p1', display_name: '참여자1-수정' });

      act(() => {
        useLiveVotingStore.getState().addParticipant(participant1);
        useLiveVotingStore.getState().addParticipant(participant1Updated);
      });

      const state = useLiveVotingStore.getState();
      expect(state.participants).toHaveLength(1);
      expect(state.participants[0].display_name).toBe('참여자1-수정');
    });

    it('removeParticipant로 참여자를 제거해야 함', () => {
      const p1 = createTestParticipant({ id: 'p1' });
      const p2 = createTestParticipant({ id: 'p2' });

      act(() => {
        useLiveVotingStore.getState().addParticipant(p1);
        useLiveVotingStore.getState().addParticipant(p2);
      });

      act(() => {
        useLiveVotingStore.getState().removeParticipant('p1');
      });

      const state = useLiveVotingStore.getState();
      expect(state.participants).toHaveLength(1);
      expect(state.participants[0].id).toBe('p2');
    });

    it('setParticipants로 참여자 배열을 설정해야 함', () => {
      const participants = [
        createTestParticipant({ id: 'p1' }),
        createTestParticipant({ id: 'p2' }),
        createTestParticipant({ id: 'p3' }),
      ];

      act(() => {
        useLiveVotingStore.getState().setParticipants(participants);
      });

      expect(useLiveVotingStore.getState().participants).toHaveLength(3);
    });

    it('setParticipantId로 참여자 ID를 설정해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().setParticipantId('my-participant-id');
      });

      expect(useLiveVotingStore.getState().participantId).toBe('my-participant-id');
    });
  });

  describe('호스트 액션', () => {
    beforeEach(() => {
      const poll = createTestPoll();
      act(() => {
        useLiveVotingStore.getState().initPoll(poll, { isHost: true });
      });
    });

    it('closePoll로 투표를 종료해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().closePoll();
      });

      expect(useLiveVotingStore.getState().status).toBe('closed');
    });

    it('lockResults로 결과를 잠금해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().lockResults();
      });

      expect(useLiveVotingStore.getState().status).toBe('results_locked');
    });

    it('reopenPoll로 투표를 재개해야 함', () => {
      act(() => {
        useLiveVotingStore.getState().closePoll();
      });

      act(() => {
        useLiveVotingStore.getState().reopenPoll();
      });

      expect(useLiveVotingStore.getState().status).toBe('active');
    });
  });

  describe('순위 투표 결과 계산', () => {
    it('순위 투표 결과를 올바르게 계산해야 함', () => {
      const poll = createTestPoll({ type: 'ranking', options: ['A', 'B', 'C'] });

      act(() => {
        useLiveVotingStore.getState().initPoll(poll);
      });

      const votes = [
        createTestVote({ selection: [0, 1, 2] }), // A=3, B=2, C=1
        createTestVote({ selection: [0, 2, 1] }), // A=3, C=2, B=1
      ];

      act(() => {
        useLiveVotingStore.getState().setVotes(votes);
      });

      const state = useLiveVotingStore.getState();
      // A: 6점, B: 3점, C: 3점
      const scoreA = state.results.find(r => r.option === 'A')?.score;
      expect(scoreA).toBe(6);
    });
  });

  describe('복수 선택 투표 결과 계산', () => {
    it('복수 선택 투표 결과를 올바르게 계산해야 함', () => {
      const poll = createTestPoll({ type: 'multiple', options: ['A', 'B', 'C'] });

      act(() => {
        useLiveVotingStore.getState().initPoll(poll);
      });

      const votes = [
        createTestVote({ selection: [0, 1] }),    // A, B
        createTestVote({ selection: [0, 1, 2] }), // A, B, C
      ];

      act(() => {
        useLiveVotingStore.getState().setVotes(votes);
      });

      const state = useLiveVotingStore.getState();
      expect(state.results.find(r => r.option === 'A')?.count).toBe(2);
      expect(state.results.find(r => r.option === 'B')?.count).toBe(2);
      expect(state.results.find(r => r.option === 'C')?.count).toBe(1);
    });
  });
});
