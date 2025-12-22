import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Team Divider Page Object
 *
 * 테스트 시나리오:
 * - 참가자 입력
 * - 팀 수 설정
 * - 랜덤 분배
 * - QR/PDF 내보내기
 */
export class TeamDividerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get participantInput() {
    return this.page.getByPlaceholder(/참가자|이름|name/i);
  }

  get bulkInput() {
    return this.page.locator('textarea');
  }

  get addButton() {
    return this.page.getByRole('button', { name: /추가|add/i });
  }

  get participantList() {
    return this.page.locator('.participant-list, [data-testid="participants"]');
  }

  get participantItems() {
    return this.page.locator('.participant-item, [data-participant], li');
  }

  get teamCountInput() {
    return this.page.getByLabel(/팀.*수|team.*count/i);
  }

  get teamCountSlider() {
    return this.page.getByRole('slider');
  }

  get divideButton() {
    return this.page.getByRole('button', { name: /나누기|divide|분배/i });
  }

  get shuffleButton() {
    return this.page.getByRole('button', { name: /섞기|shuffle/i });
  }

  get teamResults() {
    return this.page.locator('.team-result, [data-team], .team-card');
  }

  get qrButton() {
    return this.page.getByRole('button', { name: /QR/i });
  }

  get pdfButton() {
    return this.page.getByRole('button', { name: /PDF/i });
  }

  get resetButton() {
    return this.page.getByRole('button', { name: /초기화|reset/i });
  }

  // Actions
  async goto() {
    await super.goto('/team-divider');
  }

  async addParticipant(name: string) {
    await this.participantInput.fill(name);
    await this.addButton.click();
    await this.waitForAnimation();
  }

  async addParticipants(names: string[]) {
    for (const name of names) {
      await this.addParticipant(name);
    }
  }

  async addBulkParticipants(names: string[]) {
    const textarea = this.bulkInput;
    if (await textarea.isVisible()) {
      await textarea.fill(names.join('\n'));
      await this.addButton.click();
    } else {
      await this.addParticipants(names);
    }
  }

  async setTeamCount(count: number) {
    const input = this.teamCountInput;
    if (await input.isVisible()) {
      await input.fill(count.toString());
    } else {
      const slider = this.teamCountSlider;
      if (await slider.isVisible()) {
        // Slider manipulation would need bounding box logic
      }
    }
  }

  async divide() {
    await this.divideButton.click();
    await this.waitForAnimation(500);
  }

  async shuffle() {
    await this.shuffleButton.click();
    await this.waitForAnimation(500);
  }

  async exportQR() {
    await this.qrButton.click();
    await this.waitForAnimation();
  }

  async exportPDF() {
    await this.pdfButton.click();
    await this.waitForAnimation();
  }

  // Assertions
  async expectParticipantCount(count: number) {
    await expect(this.participantItems).toHaveCount(count);
  }

  async expectTeamCount(count: number) {
    await expect(this.teamResults).toHaveCount(count);
  }

  async expectTeamsVisible() {
    await expect(this.teamResults.first()).toBeVisible();
  }

  async expectAllParticipantsAssigned(names: string[]) {
    for (const name of names) {
      await expect(this.page.getByText(name)).toBeVisible();
    }
  }
}
