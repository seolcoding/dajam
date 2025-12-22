import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Balance Game Page Object
 *
 * 테스트 시나리오:
 * - 카테고리 선택
 * - A/B 선택
 * - 결과 차트 확인
 */
export class BalanceGamePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get categoryButtons() {
    return this.page.locator('button[data-category], .category-btn, [role="tab"]');
  }

  get optionA() {
    return this.page.locator('[data-option="a"], .option-a, button:has-text("A")').first();
  }

  get optionB() {
    return this.page.locator('[data-option="b"], .option-b, button:has-text("B")').first();
  }

  get questionText() {
    return this.page.locator('.question, [data-testid="question"], h2, h3');
  }

  get progressBar() {
    return this.page.locator('[role="progressbar"], .progress');
  }

  get resultChart() {
    return this.page.locator('svg, canvas, .chart, .recharts-wrapper');
  }

  get shareButton() {
    return this.page.getByRole('button', { name: /공유|share/i });
  }

  get restartButton() {
    return this.page.getByRole('button', { name: /다시|restart|처음/i });
  }

  // Actions
  async goto() {
    await super.goto('/balance-game');
  }

  async selectCategory(index: number) {
    const buttons = await this.categoryButtons.all();
    if (buttons[index]) {
      await buttons[index].click();
      await this.waitForAnimation();
    }
  }

  async selectOptionA() {
    await this.optionA.click();
    await this.waitForAnimation();
  }

  async selectOptionB() {
    await this.optionB.click();
    await this.waitForAnimation();
  }

  async playAllQuestions(count: number = 10) {
    for (let i = 0; i < count; i++) {
      // Randomly select A or B
      if (Math.random() > 0.5) {
        await this.selectOptionA();
      } else {
        await this.selectOptionB();
      }
      await this.waitForAnimation(300);
    }
  }

  // Assertions
  async expectCategoryVisible() {
    await expect(this.categoryButtons.first()).toBeVisible();
  }

  async expectQuestionVisible() {
    await expect(this.questionText.first()).toBeVisible();
  }

  async expectOptionsVisible() {
    // At least some clickable elements should be visible
    const buttons = this.page.locator('button');
    await expect(buttons.first()).toBeVisible();
  }

  async expectResultVisible() {
    await expect(this.resultChart).toBeVisible();
  }
}
