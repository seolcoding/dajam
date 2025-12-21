import type { TeamColor } from '@/types/team';

/**
 * 단순화된 팀 색상 - 모든 팀이 동일한 blue 기반 스타일 사용
 * 협업과 조직의 느낌을 주는 깔끔한 단일 색상 접근
 */
export function generateTeamColors(teamCount: number): TeamColor[] {
  // 모든 팀에 동일한 스타일 적용 (UI 가이드라인: 단일 primary color)
  const uniformColor: TeamColor = {
    bg: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
  };

  return Array(teamCount).fill(uniformColor);
}
