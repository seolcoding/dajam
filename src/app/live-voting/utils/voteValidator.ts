import { STORAGE_KEYS } from './storage';

/**
 * 이미 투표했는지 확인
 */
export function hasVoted(pollId: string): boolean {
  const votedPolls = JSON.parse(localStorage.getItem(STORAGE_KEYS.votedPolls) || '[]');
  return votedPolls.includes(pollId);
}

/**
 * 투표 완료 기록
 */
export function markAsVoted(pollId: string): void {
  const votedPolls = JSON.parse(localStorage.getItem(STORAGE_KEYS.votedPolls) || '[]');
  if (!votedPolls.includes(pollId)) {
    votedPolls.push(pollId);
    localStorage.setItem(STORAGE_KEYS.votedPolls, JSON.stringify(votedPolls));
  }
}
