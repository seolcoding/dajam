import { test, expect } from '@playwright/test';
import { LadderGamePage } from '../../pages/game/ladder.page';

/**
 * Ladder Game - E2E Tests
 *
 * Based on APPS_DOCUMENTATION.md:
 * - 참가자/결과 입력 확인
 * - 사다리 렌더링 확인
 * - 경로 애니메이션 확인
 */
test.describe('Ladder Game', () => {
  let ladderPage: LadderGamePage;

  test.beforeEach(async ({ page }) => {
    ladderPage = new LadderGamePage(page);
    await ladderPage.goto();
  });

  test('should load page with input fields', async () => {
    await expect(ladderPage.participantInputs.first()).toBeVisible();
  });

  test('should add participants', async () => {
    const participants = ['김철수', '이영희', '박민수'];
    await ladderPage.enterParticipants(participants);

    await ladderPage.expectParticipantCount(participants.length);
  });

  test('should generate ladder', async () => {
    const participants = ['김철수', '이영희', '박민수'];
    const results = ['당첨', '꽝', '벌칙'];

    await ladderPage.enterParticipants(participants);
    await ladderPage.enterResults(results);
    await ladderPage.generateLadder();

    await ladderPage.expectCanvasVisible();
    await ladderPage.expectLadderRendered();
  });

  test('should animate path when participant clicked', async () => {
    const participants = ['김철수', '이영희'];
    const results = ['A', 'B'];

    await ladderPage.enterParticipants(participants);
    await ladderPage.enterResults(results);
    await ladderPage.generateLadder();

    // Click first participant to trace path
    await ladderPage.clickParticipant(0);

    // Result modal should appear
    await ladderPage.expectResultModalVisible();
  });

  test('should reset game', async () => {
    const participants = ['김철수', '이영희'];
    await ladderPage.enterParticipants(participants);
    await ladderPage.generateLadder();

    await ladderPage.reset();

    // Canvas should be cleared or inputs reset
    await expect(ladderPage.participantInputs.first()).toHaveValue('');
  });

  test('should handle 4+ participants', async () => {
    const participants = ['A', 'B', 'C', 'D', 'E'];
    const results = ['1', '2', '3', '4', '5'];

    await ladderPage.enterParticipants(participants);
    await ladderPage.enterResults(results);
    await ladderPage.generateLadder();

    await ladderPage.expectLadderRendered();
  });
});
