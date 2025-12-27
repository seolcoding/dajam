/**
 * Live Voting - 투표 리포트 생성 유틸리티
 */

import type { Poll, Vote, PollResult, PollReport } from '../types/poll';
import { calculateResults } from './pollCalculator';

/**
 * 투표 리포트 생성
 */
export function generatePollReport(poll: Poll, votes: Vote[]): PollReport {
  // 취소되지 않은 투표만 필터링
  const activeVotes = votes.filter((v) => !v.isCancelled);
  const cancelledVotes = votes.filter((v) => v.isCancelled);

  // 결과 계산
  const results = calculateResults(poll, activeVotes);

  // 고유 참여자 수 계산
  const uniqueParticipants = new Set(
    activeVotes.map((v) => v.participantId).filter(Boolean)
  ).size;

  // 타임라인 생성 (5분 단위)
  const timeline = generateTimeline(activeVotes, poll.options);

  // 익명/식별 투표 비율
  const anonymousVotes = activeVotes.filter((v) => !v.participantId).length;
  const identifiedVotes = activeVotes.length - anonymousVotes;

  return {
    pollId: poll.id,
    title: poll.title,
    type: poll.type,
    options: poll.options,
    createdAt: poll.createdAt,
    closedAt: poll.expiresAt,
    totalVotes: activeVotes.length,
    cancelledVotes: cancelledVotes.length,
    uniqueParticipants,
    results,
    timeline,
    demographics: {
      anonymousVotes,
      identifiedVotes,
    },
  };
}

/**
 * 투표 타임라인 생성 (5분 단위)
 */
function generateTimeline(
  votes: Vote[],
  options: string[]
): PollReport['timeline'] {
  if (votes.length === 0) return [];

  // 시간순 정렬
  const sortedVotes = [...votes].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const startTime = new Date(sortedVotes[0].timestamp);
  const endTime = new Date(sortedVotes[sortedVotes.length - 1].timestamp);

  const timeline: PollReport['timeline'] = [];
  const intervalMs = 5 * 60 * 1000; // 5분

  let currentTime = new Date(startTime);
  let cumulativeVotes = 0;
  const optionBreakdown: Record<number, number> = {};

  // 초기화
  options.forEach((_, idx) => {
    optionBreakdown[idx] = 0;
  });

  let voteIndex = 0;

  while (currentTime <= endTime || voteIndex < sortedVotes.length) {
    const nextCheckpoint = new Date(currentTime.getTime() + intervalMs);

    // 현재 체크포인트까지의 투표 집계
    while (
      voteIndex < sortedVotes.length &&
      new Date(sortedVotes[voteIndex].timestamp) <= nextCheckpoint
    ) {
      const vote = sortedVotes[voteIndex];
      cumulativeVotes++;

      // 옵션별 집계
      if (typeof vote.selection === 'number') {
        optionBreakdown[vote.selection] = (optionBreakdown[vote.selection] || 0) + 1;
      } else if (Array.isArray(vote.selection)) {
        vote.selection.forEach((sel) => {
          optionBreakdown[sel] = (optionBreakdown[sel] || 0) + 1;
        });
      }

      voteIndex++;
    }

    timeline.push({
      timestamp: new Date(currentTime),
      cumulativeVotes,
      optionBreakdown: { ...optionBreakdown },
    });

    currentTime = nextCheckpoint;

    // 무한 루프 방지
    if (currentTime > new Date(endTime.getTime() + intervalMs * 2)) break;
  }

  return timeline;
}

/**
 * 리포트를 CSV로 내보내기
 */
export function exportReportToCsv(report: PollReport): string {
  const lines: string[] = [];

  // 헤더
  lines.push(`투표 리포트: ${report.title}`);
  lines.push(`생성일: ${report.createdAt.toLocaleString('ko-KR')}`);
  lines.push(`유형: ${report.type === 'single' ? '단일 선택' : report.type === 'multiple' ? '복수 선택' : '순위 투표'}`);
  lines.push('');

  // 요약
  lines.push('=== 요약 ===');
  lines.push(`총 투표 수: ${report.totalVotes}`);
  lines.push(`취소된 투표: ${report.cancelledVotes}`);
  lines.push(`고유 참여자: ${report.uniqueParticipants}`);
  lines.push('');

  // 결과
  lines.push('=== 결과 ===');
  lines.push('선택지,득표수,비율');
  report.results.forEach((result) => {
    lines.push(`"${result.option}",${result.count},${result.percentage.toFixed(1)}%`);
  });
  lines.push('');

  // 타임라인
  if (report.timeline.length > 0) {
    lines.push('=== 타임라인 ===');
    lines.push('시간,누적 투표');
    report.timeline.forEach((point) => {
      lines.push(
        `${point.timestamp.toLocaleString('ko-KR')},${point.cumulativeVotes}`
      );
    });
  }

  return lines.join('\n');
}

/**
 * 리포트를 JSON으로 내보내기
 */
export function exportReportToJson(report: PollReport): string {
  return JSON.stringify(report, null, 2);
}
