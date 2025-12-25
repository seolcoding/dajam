import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Audience Engage Page Object
 *
 * Represents the Audience Engage app (Slido/Mentimeter alternative)
 */
export class AudienceEngagePage extends BasePage {
  // Locators
  readonly sessionTitleInput: Locator;
  readonly sessionCodeInput: Locator;
  readonly participantNameInput: Locator;
  readonly createSessionButton: Locator;
  readonly joinSessionButton: Locator;
  readonly shareButton: Locator;
  readonly homeButton: Locator;
  readonly qaTab: Locator;
  readonly chatTab: Locator;
  readonly questionInput: Locator;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly participantCount: Locator;

  constructor(page: Page) {
    super(page);

    // Home view
    this.sessionTitleInput = page.getByLabel('세션 제목');
    this.sessionCodeInput = page.getByLabel('세션 코드');
    this.participantNameInput = page.getByLabel('이름');
    this.createSessionButton = page.getByRole('button', { name: '세션 시작하기' });
    this.joinSessionButton = page.getByRole('button', { name: '참여하기' });

    // Session view
    this.shareButton = page.getByRole('button', { name: /공유|복사/ });
    this.homeButton = page.getByRole('button', { name: /뒤로/ }).first();

    // Interaction panels
    this.qaTab = page.getByRole('tab', { name: /Q&A/i });
    this.chatTab = page.getByRole('tab', { name: /채팅/i });
    this.questionInput = page.getByPlaceholder('질문을 입력하세요');
    this.chatInput = page.getByPlaceholder('메시지를 입력하세요');
    this.sendButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();

    // Participant info
    this.participantCount = page.locator('.participant-count, [class*="participant"]');
  }

  // Navigation
  async goto() {
    await super.goto('/audience-engage');
  }

  // Host actions
  async createSession(title: string) {
    await this.sessionTitleInput.fill(title);
    await this.createSessionButton.click();
    await this.waitForAnimation(1000);
  }

  async getSessionCode(): Promise<string> {
    // The session code is displayed in a badge/span after creation
    const codeBadge = this.page.locator('.font-mono').first();
    return await codeBadge.textContent() || '';
  }

  // Participant actions
  async joinSession(code: string, name: string) {
    // Switch to join tab
    await this.page.getByRole('tab', { name: /참여/i }).click();
    await this.waitForAnimation();

    // Enter code
    await this.sessionCodeInput.fill(code);

    // Wait for session to load (indicated by green checkmark or enabled button)
    await this.page.waitForSelector('text=/✓|세션 확인 중/', { timeout: 5000 }).catch(() => {});
    await this.waitForAnimation(1500); // Give time for session to load

    // Enter name
    await this.participantNameInput.fill(name);

    // Wait for button to be enabled
    try {
      await this.joinSessionButton.waitFor({ state: 'visible', timeout: 5000 });
      // Wait until button is not disabled
      await this.page.waitForFunction(
        (btnText) => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => b.textContent?.includes(btnText));
          return btn && !btn.hasAttribute('disabled');
        },
        '참여하기',
        { timeout: 5000 }
      );
    } catch {
      // Continue anyway
    }

    // Click join button
    await this.joinSessionButton.click();
    await this.waitForAnimation(2000);
  }

  // Q&A actions
  async switchToQA(): Promise<boolean> {
    try {
      if (await this.qaTab.isVisible({ timeout: 3000 })) {
        await this.qaTab.click();
        await this.waitForAnimation();
        return true;
      }
    } catch {
      // Tab not available
    }
    return false;
  }

  async submitQuestion(question: string): Promise<boolean> {
    try {
      if (await this.questionInput.isVisible({ timeout: 3000 })) {
        await this.questionInput.fill(question);
        await this.questionInput.press('Enter');
        await this.waitForAnimation();
        return true;
      }
    } catch {
      // Input not available
    }
    return false;
  }

  async getQuestionCount(): Promise<number> {
    // First try tab count
    try {
      const countText = await this.qaTab.textContent() || '';
      const match = countText.match(/\((\d+)\)/);
      if (match && parseInt(match[1]) > 0) {
        return parseInt(match[1]);
      }
    } catch {
      // Tab might not be visible
    }

    // Fallback: count actual question items in the list
    const questionItems = this.page.locator('[data-question], .question-item, [class*="question"]');
    return await questionItems.count();
  }

  // Chat actions
  async switchToChat(): Promise<boolean> {
    try {
      if (await this.chatTab.isVisible({ timeout: 3000 })) {
        await this.chatTab.click();
        await this.waitForAnimation();
        return true;
      }
    } catch {
      // Tab not available
    }
    return false;
  }

  async sendChatMessage(message: string): Promise<boolean> {
    try {
      if (await this.chatInput.isVisible({ timeout: 3000 })) {
        await this.chatInput.fill(message);
        await this.chatInput.press('Enter');
        await this.waitForAnimation();
        return true;
      }
    } catch {
      // Input not available
    }
    return false;
  }

  async getChatMessageCount(): Promise<number> {
    // First try tab count
    try {
      const countText = await this.chatTab.textContent() || '';
      const match = countText.match(/\((\d+)\)/);
      if (match && parseInt(match[1]) > 0) {
        return parseInt(match[1]);
      }
    } catch {
      // Tab might not be visible
    }

    // Fallback: count actual chat messages in the list
    const chatItems = this.page.locator('[data-chat-message], .chat-message, [class*="message"]');
    return await chatItems.count();
  }

  // Wait for real-time sync with retries
  async waitForSync(checkFn: () => Promise<boolean>, maxRetries = 10, intervalMs = 500): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      if (await checkFn()) {
        return true;
      }
      await this.waitForAnimation(intervalMs);
    }
    return false;
  }

  // State checks
  async isHostView(): Promise<boolean> {
    return await this.shareButton.isVisible();
  }

  async isParticipantView(): Promise<boolean> {
    // Participant view has reactions bar
    return await this.page.locator('[class*="reaction"], .emoji-button, button:has-text("👍")').first().isVisible();
  }

  async isHomeView(): Promise<boolean> {
    return await this.createSessionButton.isVisible();
  }
}

export default AudienceEngagePage;
