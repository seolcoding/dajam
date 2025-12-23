import { useState, useEffect, useCallback } from 'react';
import type { Poll, Vote, PollResult } from '../types/poll';
import { loadPoll, loadVotes } from '../utils/storage';
import { calculateResults } from '../utils/pollCalculator';
import { useBroadcastChannel } from './useBroadcastChannel';
import { useSupabasePoll } from './useSupabasePoll';

export function useLiveResults(pollId: string) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [results, setResults] = useState<PollResult[]>([]);
  const [isCloudMode, setIsCloudMode] = useState(false);

  // Supabase cloud mode hook
  const {
    poll: cloudPoll,
    votes: cloudVotes,
    results: cloudResults,
    isLoading: cloudLoading,
    sessionId,
  } = useSupabasePoll({ pollId, enabled: true });

  // 로컬 데이터 로드 함수
  const loadLocalData = useCallback(() => {
    const pollData = loadPoll(pollId);
    const votesData = loadVotes(pollId);

    if (pollData) {
      setPoll(pollData);
      setVotes(votesData);
      setResults(calculateResults(pollData, votesData));
      setIsCloudMode(pollData.isCloudMode || false);
    }
  }, [pollId]);

  // 클라우드 모드에서 데이터 동기화
  useEffect(() => {
    if (cloudPoll && sessionId) {
      // 클라우드 poll 발견 시 클라우드 모드로 전환
      setPoll(cloudPoll);
      setVotes(cloudVotes);
      setResults(cloudResults);
      setIsCloudMode(true);
    } else if (!cloudLoading) {
      // 클라우드에 없으면 로컬 데이터 사용
      loadLocalData();
    }
  }, [cloudPoll, cloudVotes, cloudResults, cloudLoading, sessionId, loadLocalData]);

  // BroadcastChannel 리스너 (로컬 모드만)
  useBroadcastChannel(`poll:${pollId}`, (message) => {
    if (!isCloudMode && message.type === 'NEW_VOTE') {
      loadLocalData(); // 새 투표 시 전체 데이터 다시 로드
    }
  });

  // 폴링 폴백 (BroadcastChannel 미지원 시, 로컬 모드만)
  useEffect(() => {
    if (isCloudMode) return; // 클라우드 모드는 Realtime 사용
    if (typeof BroadcastChannel !== 'undefined') {
      return; // BroadcastChannel 지원 시 폴링 불필요
    }

    const interval = setInterval(() => {
      loadLocalData();
    }, 1000); // 1초마다 폴링

    return () => clearInterval(interval);
  }, [loadLocalData, isCloudMode]);

  return { poll, votes, results, isCloudMode };
}
