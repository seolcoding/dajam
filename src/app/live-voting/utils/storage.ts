import type { Poll, Vote } from '../types/poll';

/**
 * 브라우저 환경인지 확인
 */
const isBrowser = typeof window !== 'undefined';

/**
 * LocalStorage 키 관리
 */
export const STORAGE_KEYS = {
  poll: (pollId: string) => `poll:${pollId}`,
  votes: (pollId: string) => `votes:${pollId}`,
  votedPolls: 'votedPolls', // 사용자가 투표한 poll ID 배열
  myPolls: 'myPolls', // 사용자가 생성한 poll ID 배열
};

/**
 * Poll 저장
 */
export function savePoll(poll: Poll): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.poll(poll.id), JSON.stringify(poll));

  // 내 투표 목록에 추가
  const myPolls = JSON.parse(localStorage.getItem(STORAGE_KEYS.myPolls) || '[]');
  myPolls.push(poll.id);
  localStorage.setItem(STORAGE_KEYS.myPolls, JSON.stringify(myPolls));
}

/**
 * Poll 로드
 */
export function loadPoll(pollId: string): Poll | null {
  if (!isBrowser) return null;
  const data = localStorage.getItem(STORAGE_KEYS.poll(pollId));
  if (!data) return null;

  const parsed = JSON.parse(data);
  return {
    ...parsed,
    createdAt: new Date(parsed.createdAt),
    expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
  };
}

/**
 * Vote 저장
 */
export function saveVote(vote: Vote): void {
  if (!isBrowser) return;
  const votesKey = STORAGE_KEYS.votes(vote.pollId);
  const votes = JSON.parse(localStorage.getItem(votesKey) || '[]');
  votes.push(vote);
  localStorage.setItem(votesKey, JSON.stringify(votes));
}

/**
 * Votes 로드
 */
export function loadVotes(pollId: string): Vote[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem(STORAGE_KEYS.votes(pollId));
  if (!data) return [];

  const parsed = JSON.parse(data);
  return parsed.map((vote: any) => ({
    ...vote,
    timestamp: new Date(vote.timestamp),
  }));
}

/**
 * 내가 생성한 투표 목록
 */
export function getMyPolls(): string[] {
  if (!isBrowser) return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.myPolls) || '[]');
}
