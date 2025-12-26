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
    return this.page.getByPlaceholder(/항목 입력/);
  }

  get addButton() {
    // Icon-only button with Plus icon inside form
    return this.page.locator('form button[type="submit"]');
  }

  get spinButton() {
    return this.page.getByRole('button', { name: /SPIN!|회전 중/i });
  }

  get wheelCanvas() {
    return this.page.locator('canvas');
  }

  get itemList() {
    // Items are in Cards inside a scrollable container
    return this.page.locator('.max-h-\\[500px\\], .space-y-2').first();
  }

  get resultModal() {
    // Dialog with "당첨!" title
    return this.page.locator('div[role="dialog"]:has-text("당첨")');
  }

  get historyButton() {
    // History button in header with aria-label
    return this.page.getByRole('button', { name: /히스토리/i });
  }

  get historyDialog() {
    return this.page.locator('div[role="dialog"]:has-text("히스토리")');
  }

  get historyItems() {
    // History items are Cards inside the dialog
    return this.historyDialog.locator('.bg-gray-50.p-3');
  }

  get itemCards() {
    // Items are displayed as Cards inside space-y-2 container
    return this.page.locator('.space-y-2 > div.p-3.bg-gray-50');
  }

  // Actions
  async goto() {
    await super.goto('/random-picker');
  }

  async addItem(name: string) {
    // Focus and clear the input
    await this.itemInput.click();
    await this.itemInput.clear();
    // Type character by character to ensure React state updates
    await this.itemInput.type(name, { delay: 50 });
    // Wait for React state to update
    await this.page.waitForTimeout(100);
    // Submit via Enter key (most reliable for React forms)
    await this.page.keyboard.press('Enter');
    // Wait for animation and state update
    await this.waitForAnimation(500);
  }

  async addItems(names: string[]) {
    for (const name of names) {
      await this.addItem(name);
    }
  }

  async spin() {
    await this.spinButton.click();
    // Wait for wheel animation (longer animation) + result modal
    await this.waitForAnimation(5000);
  }

  async removeItem(name: string) {
    // Find the delete button with aria-label containing the item name
    const deleteButton = this.page.getByRole('button', { name: new RegExp(`${name} 삭제`) });
    await deleteButton.click();
    await this.waitForAnimation(300);
  }

  async closeModal() {
    // Wait for result modal to be visible first
    const modal = this.page.locator('[data-testid="result-modal"]');
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    // Click the close button inside the modal (first one is the main close button)
    const closeButton = modal.getByRole('button', { name: /닫기/i }).first();
    await closeButton.click();

    // Wait for modal to fully close (overlay disappears)
    await modal.waitFor({ state: 'hidden', timeout: 5000 });

    // Additional wait for animation
    await this.waitForAnimation(500);
  }

  // Assertions
  async expectWheelVisible() {
    await expect(this.wheelCanvas).toBeVisible({ timeout: 5000 });
  }

  async expectItemCount(count: number) {
    await expect(this.itemCards).toHaveCount(count, { timeout: 5000 });
  }

  async expectResultVisible() {
    await expect(this.resultModal).toBeVisible({ timeout: 5000 });
  }

  async expectHistoryCount(count: number) {
    // Open history dialog
    await this.historyButton.click();
    await this.waitForAnimation(300);

    // Check history items count
    await expect(this.historyItems).toHaveCount(count, { timeout: 5000 });

    // Close dialog
    await this.page.keyboard.press('Escape');
    await this.waitForAnimation(200);
  }

  async expectItemInWheel(name: string) {
    await expect(this.page.getByText(name).first()).toBeVisible({ timeout: 5000 });
  }
}
