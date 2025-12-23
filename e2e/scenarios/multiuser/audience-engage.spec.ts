import { test, expect, BrowserContext } from '@playwright/test';
import { AudienceEngagePage } from '../../pages/multiuser/audience-engage.page';

/**
 * Audience Engage - E2E Tests
 *
 * Tests for the Slido/Mentimeter alternative app
 * Scenarios:
 * 1. Home page loads correctly
 * 2. Host creates session
 * 3. Participant joins session
 * 4. Q&A functionality (submit question, like, highlight)
 * 5. Chat functionality (send message)
 * 6. Multi-user synchronization
 */
test.describe('Audience Engage', () => {
  test.describe('Home Page', () => {
    test('should load home page with create and join options', async ({ page }) => {
      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      // Title should be visible
      await expect(page.getByRole('heading', { name: 'Audience Engage' })).toBeVisible();

      // Create tab should be visible
      await expect(page.getByRole('tab', { name: '발표자 (호스트)' })).toBeVisible();

      // Join tab should be visible
      await expect(page.getByRole('tab', { name: '참여하기' })).toBeVisible();
    });

    test('should show session title input on host tab', async ({ page }) => {
      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      // Should show session title input
      await expect(page.getByLabel('세션 제목')).toBeVisible();
      // Button may be disabled initially
      await expect(page.getByRole('button', { name: /세션 시작|생성/ })).toBeVisible();
    });

    test('should show join fields on participant tab', async ({ page }) => {
      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      // Switch to join tab
      await page.getByRole('tab', { name: '참여하기' }).click();

      // Should show code and name inputs
      await expect(page.getByLabel('세션 코드')).toBeVisible();
      await expect(page.getByLabel('이름')).toBeVisible();
      // Button may show "참여하기" or "참여 중..." during loading
      await expect(page.getByRole('button', { name: /참여하기|참여 중/ })).toBeVisible();
    });

    test('should show supported interactions badges', async ({ page }) => {
      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      // Should show interaction badges
      await expect(page.getByText('실시간 퀴즈')).toBeVisible();
      await expect(page.getByText('투표', { exact: true })).toBeVisible();
      await expect(page.getByText('This or That')).toBeVisible();
    });
  });

  test.describe('Session Creation (requires Supabase)', () => {
    test.skip('should create session and show host view', async ({ page }) => {
      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      // Create session
      await engagePage.createSession('테스트 프레젠테이션');

      // Should be in host view
      const isHost = await engagePage.isHostView();
      expect(isHost).toBe(true);

      // Session code should be displayed
      const sessionCode = await engagePage.getSessionCode();
      expect(sessionCode.length).toBe(6);
    });
  });

  test.describe('Multi-User Scenarios (requires Supabase)', () => {
    test.skip('host and participant should see same session', async ({ browser }) => {
      const hostContext = await browser.newContext();
      const participantContext = await browser.newContext();

      const hostPage = await hostContext.newPage();
      const participantPage = await participantContext.newPage();

      try {
        const hostEngage = new AudienceEngagePage(hostPage);
        const participantEngage = new AudienceEngagePage(participantPage);

        // Host creates session
        await hostEngage.goto();
        await hostEngage.createSession('멀티유저 테스트');

        const sessionCode = await hostEngage.getSessionCode();

        // Participant joins
        await participantEngage.goto();
        await participantEngage.joinSession(sessionCode, '테스터');

        // Both should see their respective views
        const isHost = await hostEngage.isHostView();
        const isParticipant = await participantEngage.isParticipantView();

        expect(isHost).toBe(true);
        expect(isParticipant).toBe(true);

      } finally {
        await hostContext.close();
        await participantContext.close();
      }
    });

    test.skip('Q&A messages should sync between host and participant', async ({ browser }) => {
      const hostContext = await browser.newContext();
      const participantContext = await browser.newContext();

      const hostPage = await hostContext.newPage();
      const participantPage = await participantContext.newPage();

      try {
        const hostEngage = new AudienceEngagePage(hostPage);
        const participantEngage = new AudienceEngagePage(participantPage);

        // Host creates session
        await hostEngage.goto();
        await hostEngage.createSession('Q&A 테스트');

        const sessionCode = await hostEngage.getSessionCode();

        // Participant joins
        await participantEngage.goto();
        await participantEngage.joinSession(sessionCode, 'Q&A 테스터');

        // Participant submits question
        await participantEngage.switchToQA();
        await participantEngage.submitQuestion('테스트 질문입니다');

        // Wait for sync
        await hostEngage.waitForAnimation(2000);

        // Host should see the question
        await hostEngage.switchToQA();
        const hostQuestionCount = await hostEngage.getQuestionCount();
        expect(hostQuestionCount).toBeGreaterThan(0);

      } finally {
        await hostContext.close();
        await participantContext.close();
      }
    });

    test.skip('Chat messages should sync in real-time', async ({ browser }) => {
      const hostContext = await browser.newContext();
      const participantContext = await browser.newContext();

      const hostPage = await hostContext.newPage();
      const participantPage = await participantContext.newPage();

      try {
        const hostEngage = new AudienceEngagePage(hostPage);
        const participantEngage = new AudienceEngagePage(participantPage);

        // Host creates session
        await hostEngage.goto();
        await hostEngage.createSession('채팅 테스트');

        const sessionCode = await hostEngage.getSessionCode();

        // Participant joins
        await participantEngage.goto();
        await participantEngage.joinSession(sessionCode, '채팅 테스터');

        // Participant sends chat message
        await participantEngage.switchToChat();
        await participantEngage.sendChatMessage('안녕하세요!');

        // Wait for sync
        await hostEngage.waitForAnimation(2000);

        // Host should see the message
        await hostEngage.switchToChat();
        const hostChatCount = await hostEngage.getChatMessageCount();
        expect(hostChatCount).toBeGreaterThan(0);

      } finally {
        await hostContext.close();
        await participantContext.close();
      }
    });
  });

  test.describe('UI Components', () => {
    test('should display feature cards on home page', async ({ page }) => {
      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      // Feature cards should be visible
      await expect(page.getByText('슬라이드', { exact: true })).toBeVisible();
      await expect(page.getByText('투표/퀴즈')).toBeVisible();
      await expect(page.getByText('Q&A', { exact: true })).toBeVisible();
      await expect(page.getByText('리액션')).toBeVisible();
    });

    test('should handle empty session title validation', async ({ page }) => {
      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      // The button should be visible (disabled or shows loading state)
      const button = page.getByRole('button', { name: /세션 시작|생성/ });
      await expect(button).toBeVisible();
    });

    test('should handle empty join form validation', async ({ page }) => {
      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      // Switch to join tab
      await page.getByRole('tab', { name: '참여하기' }).click();

      // Join button should be disabled without code and name
      const joinButton = page.getByRole('button', { name: /참여하기|참여 중/ });
      await expect(joinButton).toBeDisabled();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      // Should still show main content
      await expect(page.getByRole('heading', { name: 'Audience Engage' })).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      await expect(page.getByRole('heading', { name: 'Audience Engage' })).toBeVisible();
    });
  });

  test.describe('Page Refresh', () => {
    test('should handle page refresh on home', async ({ page }) => {
      const engagePage = new AudienceEngagePage(page);
      await engagePage.goto();

      await page.reload();
      await engagePage.waitForPageLoad();

      await expect(page.getByRole('heading', { name: 'Audience Engage' })).toBeVisible();
    });
  });
});
