import { STORAGE_KEYS } from './storage';

/**
 * 브라우저 환경인지 확인
 */
const isBrowser = typeof window !== 'undefined';

/**
 * localStorage에서 투표 기록 배열을 안전하게 로드
 */
function getVotedPolls(): string[] {
  if (!isBrowser) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.votedPolls);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * 이미 투표했는지 확인
 */
export function hasVoted(pollId: string): boolean {
  const votedPolls = getVotedPolls();
  return votedPolls.includes(pollId);
}

/**
 * 투표 완료 기록
 */
export function markAsVoted(pollId: string): void {
  if (!isBrowser) return;
  const votedPolls = getVotedPolls();
  if (!votedPolls.includes(pollId)) {
    votedPolls.push(pollId);
    localStorage.setItem(STORAGE_KEYS.votedPolls, JSON.stringify(votedPolls));
  }
}
