import type { Poll, Vote, PollResult } from '@/types/poll';

/**
 * 단일/복수 선택 투표 집계
 */
export function countVotes(
  options: string[],
  votes: Vote[],
  type: 'single' | 'multiple'
): PollResult[] {
  const counts = new Array(options.length).fill(0);

  votes.forEach(vote => {
    if (type === 'single') {
      counts[vote.selection as number]++;
    } else {
      (vote.selection as number[]).forEach(index => {
        counts[index]++;
      });
    }
  });

  const totalVotes = votes.length;

  return options.map((option, index) => ({
    option,
    count: counts[index],
    percentage: totalVotes > 0 ? (counts[index] / totalVotes) * 100 : 0,
  }));
}

/**
 * Borda Count 방식 순위 투표 집계
 * - 1위 = N점, 2위 = N-1점, ..., N위 = 1점
 * - 총점이 가장 높은 선택지가 우승
 */
export function bordaCount(
  options: string[],
  votes: Vote[]
): PollResult[] {
  const n = options.length;
  const scores = new Array(n).fill(0);

  // 투표 집계
  votes.forEach(vote => {
    const ranking = vote.selection as number[]; // [2, 0, 1]
    ranking.forEach((optionIndex, position) => {
      scores[optionIndex] += n - position; // 1위 = n점, 2위 = n-1점
    });
  });

  // 결과 생성
  const results: PollResult[] = options.map((option, index) => ({
    option,
    count: 0, // 순위 투표에는 count 사용 안 함
    percentage: 0,
    score: scores[index],
    rank: 0,
  }));

  // 점수순 정렬
  results.sort((a, b) => (b.score || 0) - (a.score || 0));

  // 랭킹 부여
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
}

/**
 * 투표 유형에 따른 결과 계산
 */
export function calculateResults(poll: Poll, votes: Vote[]): PollResult[] {
  if (poll.type === 'ranking') {
    return bordaCount(poll.options, votes);
  }
  return countVotes(poll.options, votes, poll.type);
}
