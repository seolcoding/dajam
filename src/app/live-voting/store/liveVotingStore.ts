'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Poll, Vote, PollResult, PollType } from '../types/poll';
import type { SessionParticipant } from '@/types/database';
import type { ConnectionStatus } from '@/lib/realtime/types';
import { calculateResults } from '../utils/pollCalculator';

/**
 * Live Voting 상태 (Poll State)
 */
export type PollStatus = 'active' | 'closed' | 'results_locked';

export interface LiveVotingState {
  // 세션/폴 정보
  poll: Poll | null;
  sessionId: string | null;
  sessionCode: string | null;
  status: PollStatus;

  // 모드
  mode: 'local' | 'cloud';
  isHost: boolean;

  // 실시간 데이터
  votes: Vote[];
  results: PollResult[];
  participants: SessionParticipant[];
  participantId: string | null;

  // 연결 상태
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;

  // 사용자 투표 상태
  hasVoted: boolean;
  userSelection: number | number[] | null;
}

export interface LiveVotingActions {
  // 초기화
  initPoll: (poll: Poll, options?: { isHost?: boolean; mode?: 'local' | 'cloud' }) => void;
  setSessionInfo: (sessionId: string, sessionCode: string) => void;
  reset: () => void;

  // 상태 변경
  setStatus: (status: PollStatus) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // 투표 관련
  addVote: (vote: Vote) => void;
  setVotes: (votes: Vote[]) => void;
  setUserVoted: (selection: number | number[]) => void;
  recalculateResults: () => void;

  // 참여자 관련
  addParticipant: (participant: SessionParticipant) => void;
  removeParticipant: (participantId: string) => void;
  setParticipants: (participants: SessionParticipant[]) => void;
  setParticipantId: (id: string | null) => void;

  // 호스트 액션
  closePoll: () => void;
  lockResults: () => void;
  reopenPoll: () => void;
}

const initialState: LiveVotingState = {
  poll: null,
  sessionId: null,
  sessionCode: null,
  status: 'active',
  mode: 'local',
  isHost: false,
  votes: [],
  results: [],
  participants: [],
  participantId: null,
  connectionStatus: 'disconnected',
  isLoading: false,
  error: null,
  hasVoted: false,
  userSelection: null,
};

export const useLiveVotingStore = create<LiveVotingState & LiveVotingActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // 초기화
    initPoll: (poll, options = {}) => {
      const { isHost = false, mode = 'local' } = options;
      set({
        poll,
        sessionCode: poll.id,
        status: 'active',
        mode,
        isHost,
        votes: [],
        results: poll.options.map((option) => ({
          option,
          count: 0,
          percentage: 0,
        })),
        participants: [],
        hasVoted: false,
        userSelection: null,
        error: null,
      });
    },

    setSessionInfo: (sessionId, sessionCode) => {
      set({ sessionId, sessionCode });
    },

    reset: () => {
      set(initialState);
    },

    // 상태 변경
    setStatus: (status) => {
      set({ status });
    },

    setConnectionStatus: (connectionStatus) => {
      set({ connectionStatus });
    },

    setLoading: (isLoading) => {
      set({ isLoading });
    },

    setError: (error) => {
      set({ error });
    },

    // 투표 관련
    addVote: (vote) => {
      set((state) => {
        const votes = [...state.votes, vote];
        const results = state.poll ? calculateResults(state.poll, votes) : state.results;
        return { votes, results };
      });
    },

    setVotes: (votes) => {
      set((state) => {
        const results = state.poll ? calculateResults(state.poll, votes) : [];
        return { votes, results };
      });
    },

    setUserVoted: (selection) => {
      set({ hasVoted: true, userSelection: selection });
    },

    recalculateResults: () => {
      const { poll, votes } = get();
      if (poll) {
        const results = calculateResults(poll, votes);
        set({ results });
      }
    },

    // 참여자 관련
    addParticipant: (participant) => {
      set((state) => ({
        participants: [...state.participants.filter((p) => p.id !== participant.id), participant],
      }));
    },

    removeParticipant: (participantId) => {
      set((state) => ({
        participants: state.participants.filter((p) => p.id !== participantId),
      }));
    },

    setParticipants: (participants) => {
      set({ participants });
    },

    setParticipantId: (id) => {
      set({ participantId: id });
    },

    // 호스트 액션
    closePoll: () => {
      set({ status: 'closed' });
    },

    lockResults: () => {
      set({ status: 'results_locked' });
    },

    reopenPoll: () => {
      set({ status: 'active' });
    },
  }))
);

// 선택자 (Selectors) - 최적화된 구독용
export const selectPoll = (state: LiveVotingState) => state.poll;
export const selectResults = (state: LiveVotingState) => state.results;
export const selectVotes = (state: LiveVotingState) => state.votes;
export const selectParticipants = (state: LiveVotingState) => state.participants;
export const selectStatus = (state: LiveVotingState) => state.status;
export const selectConnectionStatus = (state: LiveVotingState) => state.connectionStatus;
export const selectIsHost = (state: LiveVotingState) => state.isHost;
export const selectHasVoted = (state: LiveVotingState) => state.hasVoted;
export const selectMode = (state: LiveVotingState) => state.mode;

// 편의 훅 - 특정 상태만 구독
export const usePoll = () => useLiveVotingStore((state) => state.poll);
export const useResults = () => useLiveVotingStore((state) => state.results);
export const useVotes = () => useLiveVotingStore((state) => state.votes);
export const useParticipants = () => useLiveVotingStore((state) => state.participants);
export const usePollStatus = () => useLiveVotingStore((state) => state.status);
export const useIsHost = () => useLiveVotingStore((state) => state.isHost);
export const useHasVoted = () => useLiveVotingStore((state) => state.hasVoted);
export const useVotingMode = () => useLiveVotingStore((state) => state.mode);
export const useVotingError = () => useLiveVotingStore((state) => state.error);
