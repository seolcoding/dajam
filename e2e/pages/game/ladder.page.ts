import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Ladder Game Page Object
 *
 * 테스트 시나리오:
 * - 참가자 입력
 * - 결과 입력
 * - 사다리 생성
 * - 경로 애니메이션
 */
export class LadderGamePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get participantInputs() {
    return this.page.getByPlaceholder(/참가자 이름|참가자/);
  }

  get resultInputs() {
    return this.page.getByPlaceholder(/결과 선택지|결과/);
  }

  get addParticipantButton() {
    return this.page.getByRole('button', { name: /참가자 추가|추가/i });
  }

  get generateButton() {
    return this.page.getByRole('button', { name: /사다리 생성|사다리 재생성/i });
  }

  get resetButton() {
    return this.page.getByRole('button', { name: /초기화|reset/i });
  }

  get canvas() {
    return this.page.locator('canvas');
  }

  get participantLabels() {
    // Participant names are shown at top of canvas area
    return this.page.locator('.participant-label, [data-participant], .text-emerald-700');
  }

  get resultModal() {
    return this.page.locator('[role="dialog"], [data-state="open"]');
  }

  // Actions
  async goto() {
    await super.goto('/ladder-game');
  }

  async enterParticipants(names: string[]) {
    const inputs = this.participantInputs;
    for (let i = 0; i < names.length; i++) {
      if (i >= await inputs.count()) {
        await this.addParticipantButton.click();
      }
      await inputs.nth(i).fill(names[i]);
    }
  }

  async enterResults(results: string[]) {
    const inputs = this.resultInputs;
    for (let i = 0; i < results.length; i++) {
      await inputs.nth(i).fill(results[i]);
    }
  }

  async generateLadder() {
    await this.generateButton.click();
    await this.waitForAnimation(500);
  }

  async clickParticipant(index: number) {
    const labels = await this.participantLabels.all();
    if (labels[index]) {
      await labels[index].click();
      await this.waitForAnimation(2000); // Animation takes time
    }
  }

  async reset() {
    await this.resetButton.click();
  }

  // Assertions
  async expectCanvasVisible() {
    await expect(this.canvas).toBeVisible();
  }

  async expectLadderRendered() {
    await expect(this.canvas).toBeVisible();
    // Canvas should have content
    const box = await this.canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(100);
  }

  async expectResultModalVisible() {
    await expect(this.resultModal).toBeVisible();
  }

  async expectParticipantCount(count: number) {
    await expect(this.participantInputs).toHaveCount(count);
  }
}
