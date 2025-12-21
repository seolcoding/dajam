import { useState, useEffect, useCallback } from 'react';
import type { Poll, Vote, PollResult } from '@/types/poll';
import { loadPoll, loadVotes } from '@/utils/storage';
import { calculateResults } from '@/utils/pollCalculator';
import { useBroadcastChannel } from './useBroadcastChannel';

export function useLiveResults(pollId: string) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [results, setResults] = useState<PollResult[]>([]);

  // 데이터 로드 함수
  const loadData = useCallback(() => {
    const pollData = loadPoll(pollId);
    const votesData = loadVotes(pollId);

    if (pollData) {
      setPoll(pollData);
      setVotes(votesData);
      setResults(calculateResults(pollData, votesData));
    }
  }, [pollId]);

  // 초기 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // BroadcastChannel 리스너
  useBroadcastChannel(`poll:${pollId}`, (message) => {
    if (message.type === 'NEW_VOTE') {
      loadData(); // 새 투표 시 전체 데이터 다시 로드
    }
  });

  // 폴링 폴백 (BroadcastChannel 미지원 시)
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      return; // BroadcastChannel 지원 시 폴링 불필요
    }

    const interval = setInterval(() => {
      loadData();
    }, 1000); // 1초마다 폴링

    return () => clearInterval(interval);
  }, [loadData]);

  return { poll, votes, results };
}
