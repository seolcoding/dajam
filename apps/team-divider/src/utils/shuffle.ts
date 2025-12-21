import type { Participant, TeamSettings } from '@/types/team';

/**
 * Fisher-Yates Shuffle Algorithm
 * - 시간복잡도: O(n)
 * - 공간복잡도: O(1) (in-place)
 * - 완전 랜덤: 모든 순열이 동일한 확률 (1/n!)
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array]; // 원본 보존

  for (let i = shuffled.length - 1; i > 0; i--) {
    // 0 ~ i 사이의 랜덤 인덱스
    const j = Math.floor(Math.random() * (i + 1));

    // swap
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * 랜덤 분배 로직
 */
export function divideIntoTeams(
  participants: Participant[],
  settings: TeamSettings
): Participant[][] {
  // 1. Fisher-Yates로 랜덤 셔플
  const shuffled = fisherYatesShuffle(participants);

  // 2. 팀 수 계산
  let teamCount: number;
  if (settings.mode === 'byTeamCount' && settings.teamCount) {
    teamCount = settings.teamCount;
  } else if (settings.mode === 'byMemberCount' && settings.memberCount) {
    teamCount = Math.ceil(participants.length / settings.memberCount);
  } else {
    throw new Error('Invalid team settings');
  }

  // 3. 균등 분배
  const teams: Participant[][] = Array.from({ length: teamCount }, () => []);

  shuffled.forEach((participant, index) => {
    const teamIndex = index % teamCount;
    teams[teamIndex].push({
      ...participant,
      team: teamIndex,
    });
  });

  return teams;
}

/**
 * 라운드 로빈 방식 균등 분배
 * - 팀 간 인원 차이 최소화 (최대 1명 차이)
 */
export function distributeEvenly<T>(items: T[], teamCount: number): T[][] {
  const teams: T[][] = Array.from({ length: teamCount }, () => []);

  items.forEach((item, index) => {
    const teamIndex = index % teamCount;
    teams[teamIndex].push(item);
  });

  return teams;
}

/**
 * 팀당 인원 제한 분배
 */
export function distributeBySize<T>(items: T[], maxPerTeam: number): T[][] {
  const teams: T[][] = [];

  for (let i = 0; i < items.length; i += maxPerTeam) {
    teams.push(items.slice(i, i + maxPerTeam));
  }

  return teams;
}
