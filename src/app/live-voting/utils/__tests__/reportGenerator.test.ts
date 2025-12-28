import { describe, it, expect } from 'vitest';
import {
  generatePollReport,
  exportReportToCsv,
  exportReportToJson,
} from '../reportGenerator';
import type { Poll, Vote } from '../../types/poll';

describe('reportGenerator', () => {
  const createPoll = (overrides: Partial<Poll> = {}): Poll => ({
    id: 'test-poll-1',
    title: '테스트 투표',
    type: 'single',
    options: ['옵션 A', '옵션 B', '옵션 C'],
    createdAt: new Date('2024-12-27T10:00:00'),
    allowAnonymous: true,
    ...overrides,
  });

  const createVote = (overrides: Partial<Vote> = {}): Vote => ({
    id: 'vote-1',
    pollId: 'test-poll-1',
    selection: 0,
    timestamp: new Date('2024-12-27T10:05:00'),
    ...overrides,
  });

  describe('generatePollReport', () => {
    it('빈 투표 목록에 대한 리포트를 생성한다', () => {
      const poll = createPoll();
      const report = generatePollReport(poll, []);

      expect(report.pollId).toBe('test-poll-1');
      expect(report.title).toBe('테스트 투표');
      expect(report.totalVotes).toBe(0);
      expect(report.cancelledVotes).toBe(0);
      expect(report.uniqueParticipants).toBe(0);
      expect(report.timeline).toEqual([]);
    });

    it('투표 목록에 대한 리포트를 생성한다', () => {
      const poll = createPoll();
      const votes: Vote[] = [
        createVote({ id: 'v1', selection: 0 }),
        createVote({ id: 'v2', selection: 1 }),
        createVote({ id: 'v3', selection: 0 }),
      ];

      const report = generatePollReport(poll, votes);

      expect(report.totalVotes).toBe(3);
      expect(report.cancelledVotes).toBe(0);
    });

    it('취소된 투표를 필터링한다', () => {
      const poll = createPoll();
      const votes: Vote[] = [
        createVote({ id: 'v1', selection: 0 }),
        createVote({ id: 'v2', selection: 1, isCancelled: true }),
        createVote({ id: 'v3', selection: 0 }),
      ];

      const report = generatePollReport(poll, votes);

      expect(report.totalVotes).toBe(2);
      expect(report.cancelledVotes).toBe(1);
    });

    it('고유 참여자 수를 계산한다', () => {
      const poll = createPoll();
      const votes: Vote[] = [
        createVote({ id: 'v1', selection: 0, participantId: 'user-1' }),
        createVote({ id: 'v2', selection: 1, participantId: 'user-2' }),
        createVote({ id: 'v3', selection: 0, participantId: 'user-1' }),
      ];

      const report = generatePollReport(poll, votes);

      expect(report.uniqueParticipants).toBe(2);
    });

    it('익명 투표 통계를 계산한다', () => {
      const poll = createPoll();
      const votes: Vote[] = [
        createVote({ id: 'v1', selection: 0, participantId: 'user-1' }),
        createVote({ id: 'v2', selection: 1 }), // 익명
        createVote({ id: 'v3', selection: 0 }), // 익명
      ];

      const report = generatePollReport(poll, votes);

      expect(report.demographics?.anonymousVotes).toBe(2);
      expect(report.demographics?.identifiedVotes).toBe(1);
    });

    it('복수 선택 투표를 처리한다', () => {
      const poll = createPoll({ type: 'multiple' });
      const votes: Vote[] = [
        createVote({ id: 'v1', selection: [0, 1] }),
        createVote({ id: 'v2', selection: [1, 2] }),
      ];

      const report = generatePollReport(poll, votes);

      expect(report.totalVotes).toBe(2);
      expect(report.type).toBe('multiple');
    });

    it('타임라인을 생성한다', () => {
      const poll = createPoll();
      const baseTime = new Date('2024-12-27T10:00:00');
      const votes: Vote[] = [
        createVote({
          id: 'v1',
          selection: 0,
          timestamp: new Date(baseTime.getTime() + 60000),
        }),
        createVote({
          id: 'v2',
          selection: 1,
          timestamp: new Date(baseTime.getTime() + 120000),
        }),
      ];

      const report = generatePollReport(poll, votes);

      expect(report.timeline.length).toBeGreaterThan(0);
      expect(report.timeline[0].cumulativeVotes).toBeGreaterThanOrEqual(0);
    });
  });

  describe('exportReportToCsv', () => {
    it('CSV 형식으로 리포트를 내보낸다', () => {
      const poll = createPoll();
      const votes: Vote[] = [
        createVote({ id: 'v1', selection: 0 }),
        createVote({ id: 'v2', selection: 1 }),
      ];
      const report = generatePollReport(poll, votes);

      const csv = exportReportToCsv(report);

      expect(csv).toContain('투표 리포트: 테스트 투표');
      expect(csv).toContain('총 투표 수: 2');
      expect(csv).toContain('=== 결과 ===');
      expect(csv).toContain('선택지,득표수,비율');
    });

    it('빈 리포트도 처리한다', () => {
      const poll = createPoll();
      const report = generatePollReport(poll, []);

      const csv = exportReportToCsv(report);

      expect(csv).toContain('총 투표 수: 0');
    });

    it('선택지 결과를 포함한다', () => {
      const poll = createPoll();
      const votes: Vote[] = [
        createVote({ id: 'v1', selection: 0 }),
        createVote({ id: 'v2', selection: 0 }),
      ];
      const report = generatePollReport(poll, votes);

      const csv = exportReportToCsv(report);

      expect(csv).toContain('옵션 A');
    });
  });

  describe('exportReportToJson', () => {
    it('JSON 형식으로 리포트를 내보낸다', () => {
      const poll = createPoll();
      const votes: Vote[] = [createVote({ id: 'v1', selection: 0 })];
      const report = generatePollReport(poll, votes);

      const json = exportReportToJson(report);

      expect(json).toContain('"pollId": "test-poll-1"');
      expect(json).toContain('"title": "테스트 투표"');
      expect(json).toContain('"totalVotes": 1');
    });

    it('유효한 JSON 문자열을 반환한다', () => {
      const poll = createPoll();
      const votes: Vote[] = [createVote({ id: 'v1', selection: 0 })];
      const report = generatePollReport(poll, votes);

      const json = exportReportToJson(report);
      const parsed = JSON.parse(json);

      expect(parsed.pollId).toBe('test-poll-1');
      expect(parsed.totalVotes).toBe(1);
    });

    it('결과 배열을 포함한다', () => {
      const poll = createPoll();
      const votes: Vote[] = [createVote({ id: 'v1', selection: 0 })];
      const report = generatePollReport(poll, votes);

      const json = exportReportToJson(report);
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed.results)).toBe(true);
      expect(parsed.results.length).toBe(3); // 3 options
    });
  });
});
