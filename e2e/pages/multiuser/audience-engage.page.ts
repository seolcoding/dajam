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

    await this.sessionCodeInput.fill(code);
    await this.participantNameInput.fill(name);
    await this.joinSessionButton.click();
    await this.waitForAnimation(1000);
  }

  // Q&A actions
  async switchToQA() {
    await this.qaTab.click();
    await this.waitForAnimation();
  }

  async submitQuestion(question: string) {
    await this.questionInput.fill(question);
    await this.questionInput.press('Enter');
    await this.waitForAnimation();
  }

  async getQuestionCount(): Promise<number> {
    const countText = await this.qaTab.textContent() || '';
    const match = countText.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Chat actions
  async switchToChat() {
    await this.chatTab.click();
    await this.waitForAnimation();
  }

  async sendChatMessage(message: string) {
    await this.chatInput.fill(message);
    await this.chatInput.press('Enter');
    await this.waitForAnimation();
  }

  async getChatMessageCount(): Promise<number> {
    const countText = await this.chatTab.textContent() || '';
    const match = countText.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
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
