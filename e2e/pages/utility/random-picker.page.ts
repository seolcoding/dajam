import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Random Picker Page Object
 *
 * 테스트 시나리오:
 * - 항목 추가
 * - 휠 회전
 * - 결과 표시
 * - 히스토리 확인
 */
export class RandomPickerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get itemInput() {
    return this.page.getByPlaceholder(/항목|item|추가/i);
  }

  get addButton() {
    return this.page.getByRole('button', { name: /추가|add/i });
  }

  get spinButton() {
    return this.page.getByRole('button', { name: /돌리기|spin|start/i });
  }

  get wheelCanvas() {
    return this.page.locator('canvas');
  }

  get itemList() {
    return this.page.locator('.item-list, [data-testid="item-list"]');
  }

  get resultModal() {
    return this.page.locator('[role="dialog"], .modal, .result');
  }

  get historyList() {
    return this.page.locator('.history, [data-testid="history"]');
  }

  get itemChips() {
    return this.page.locator('.item-chip, [data-item], .badge');
  }

  // Actions
  async goto() {
    await super.goto('/random-picker');
  }

  async addItem(name: string) {
    await this.itemInput.fill(name);
    await this.addButton.click();
  }

  async addItems(names: string[]) {
    for (const name of names) {
      await this.addItem(name);
    }
  }

  async spin() {
    await this.spinButton.click();
    // Wait for wheel animation
    await this.waitForAnimation(3000);
  }

  async removeItem(name: string) {
    const item = this.page.locator(`[data-item="${name}"], .item:has-text("${name}")`);
    await item.locator('button, .remove, .delete').click();
  }

  async closeModal() {
    await this.page.keyboard.press('Escape');
  }

  // Assertions
  async expectWheelVisible() {
    await expect(this.wheelCanvas).toBeVisible();
  }

  async expectItemCount(count: number) {
    await expect(this.itemChips).toHaveCount(count);
  }

  async expectResultVisible() {
    await expect(this.resultModal).toBeVisible();
  }

  async expectHistoryCount(count: number) {
    const historyItems = this.historyList.locator('.history-item, li');
    await expect(historyItems).toHaveCount(count);
  }

  async expectItemInWheel(name: string) {
    await expect(
      this.page.getByText(name)
    ).toBeVisible();
  }
}
