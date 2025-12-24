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
    return this.page.getByPlaceholder(/항목 입력|항목|item/i);
  }

  get addButton() {
    // Icon-only button with Plus icon inside form
    return this.page.locator('form button[type="submit"]');
  }

  get spinButton() {
    return this.page.getByRole('button', { name: /SPIN|돌리기|시작/i });
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
    // History icon button in header
    return this.page.locator('button:has(.lucide-history)');
  }

  get historyDialog() {
    return this.page.locator('div[role="dialog"]:has-text("히스토리")');
  }

  get historyItems() {
    // History items are Cards inside the dialog
    return this.historyDialog.locator('.bg-gray-50.p-3');
  }

  get itemCards() {
    // Items are displayed as Cards with the item label
    return this.page.locator('.space-y-2 .p-3, .bg-gray-50.p-3');
  }

  // Actions
  async goto() {
    await super.goto('/random-picker');
  }

  async addItem(name: string) {
    await this.itemInput.fill(name);
    // Press Enter to submit since button may be icon-only
    await this.itemInput.press('Enter');
    await this.waitForAnimation(200);
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
    // Find the card containing the item name and click the trash button
    const itemCard = this.page.locator(`.p-3:has-text("${name}")`);
    await itemCard.locator('button:has(.lucide-trash-2), button:last-child').click();
    await this.waitForAnimation(200);
  }

  async closeModal() {
    await this.page.keyboard.press('Escape');
    await this.waitForAnimation(200);
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
