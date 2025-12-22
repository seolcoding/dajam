import { Page, expect, BrowserContext } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Live Voting Page Object
 *
 * Multi-user scenarios:
 * - Create poll (host)
 * - Vote (participant)
 * - Real-time result updates
 */
export class LiveVotingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Home
  get createPollButton() {
    return this.page.getByRole('button', { name: /투표.*만들기|새.*투표|create/i });
  }

  get joinPollInput() {
    return this.page.getByPlaceholder(/코드|code/i);
  }

  // Locators - Create Poll
  get pollTitleInput() {
    return this.page.getByLabel(/제목|title/i).first();
  }

  get optionInputs() {
    return this.page.locator('input[placeholder*="옵션"], input[placeholder*="option"]');
  }

  get addOptionButton() {
    return this.page.getByRole('button', { name: /옵션.*추가|add.*option/i });
  }

  get startPollButton() {
    return this.page.getByRole('button', { name: /시작|start|생성|create/i });
  }

  // Locators - Host View
  get pollCode() {
    return this.page.locator('[data-testid="poll-code"], .poll-code, code');
  }

  get qrCode() {
    return this.page.locator('canvas, img[src*="qr"], svg[class*="qr"]');
  }

  get voteCount() {
    return this.page.locator('[data-testid="vote-count"], .vote-count');
  }

  get resultChart() {
    return this.page.locator('svg, canvas, .recharts-wrapper');
  }

  get endPollButton() {
    return this.page.getByRole('button', { name: /종료|end|마감/i });
  }

  // Locators - Vote View
  get voteOptions() {
    return this.page.locator('button[data-option], .vote-option, [role="radio"]');
  }

  get submitVoteButton() {
    return this.page.getByRole('button', { name: /투표|vote|제출|submit/i });
  }

  get votedMessage() {
    return this.page.getByText(/완료|submitted|감사/i);
  }

  // Actions
  async goto() {
    await super.goto('/live-voting');
  }

  async gotoCreate() {
    await super.goto('/live-voting/create');
  }

  async gotoHost(pollId: string) {
    await super.goto(`/live-voting/host/${pollId}`);
  }

  async gotoVote(pollId: string) {
    await super.goto(`/live-voting/vote/${pollId}`);
  }

  async createPoll(title: string, options: string[]) {
    await this.gotoCreate();

    // Fill title
    if (await this.pollTitleInput.isVisible()) {
      await this.pollTitleInput.fill(title);
    }

    // Fill options
    const optionInputsLocator = this.optionInputs;
    for (let i = 0; i < options.length; i++) {
      if (i >= await optionInputsLocator.count()) {
        await this.addOptionButton.click();
      }
      await optionInputsLocator.nth(i).fill(options[i]);
    }

    // Start poll
    await this.startPollButton.click();
    await this.waitForPageLoad();

    // Extract poll ID from URL
    const url = this.page.url();
    const match = url.match(/host\/([^/?]+)/);
    return match ? match[1] : '';
  }

  async vote(optionIndex: number) {
    const options = await this.voteOptions.all();
    if (options[optionIndex]) {
      await options[optionIndex].click();
    }
    await this.submitVoteButton.click();
  }

  async getPollCode(): Promise<string> {
    const codeElement = this.pollCode;
    if (await codeElement.isVisible()) {
      return await codeElement.textContent() || '';
    }
    return '';
  }

  // Assertions
  async expectPollCreated() {
    await expect(this.page).toHaveURL(/host\//);
  }

  async expectQRVisible() {
    await expect(this.qrCode).toBeVisible();
  }

  async expectVotedSuccessfully() {
    await expect(this.votedMessage).toBeVisible();
  }

  async expectResultUpdated() {
    await expect(this.resultChart).toBeVisible();
  }
}
