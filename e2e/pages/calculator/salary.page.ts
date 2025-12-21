import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Salary Calculator Page Object
 *
 * 테스트 시나리오:
 * - 연봉 입력 후 실수령액 계산
 * - 차트 렌더링 확인
 * - 시뮬레이터 슬라이더 작동
 * - 부양가족 설정 반영
 */
export class SalaryCalculatorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get salaryInput() {
    return this.page.getByLabel(/연봉|급여|salary/i).first();
  }

  get dependentsInput() {
    return this.page.getByLabel(/부양가족|dependents/i);
  }

  get calculateButton() {
    return this.page.getByRole('button', { name: /계산|calculate/i });
  }

  get resultCard() {
    return this.page.locator('[data-testid="result-card"], .result-card, .result');
  }

  get netSalary() {
    return this.page.getByText(/실수령액|net salary/i).locator('..');
  }

  get chart() {
    return this.page.locator('svg, canvas, .recharts-wrapper, [class*="chart"]');
  }

  get slider() {
    return this.page.getByRole('slider');
  }

  // Actions
  async goto() {
    await super.goto('/salary-calculator');
  }

  async enterSalary(amount: number) {
    await this.salaryInput.clear();
    await this.salaryInput.fill(amount.toString());
  }

  async setDependents(count: number) {
    if (await this.dependentsInput.isVisible()) {
      await this.dependentsInput.selectOption(count.toString());
    }
  }

  async calculate() {
    await this.calculateButton.click();
    await this.waitForAnimation();
  }

  async adjustSlider(percentage: number) {
    const slider = this.slider.first();
    const box = await slider.boundingBox();
    if (box) {
      const x = box.x + (box.width * percentage / 100);
      const y = box.y + box.height / 2;
      await this.page.mouse.click(x, y);
    }
  }

  // Assertions
  async expectResultVisible() {
    await expect(this.resultCard.first()).toBeVisible();
  }

  async expectNetSalary(min: number, max: number) {
    const text = await this.netSalary.textContent();
    const numbers = text?.match(/[\d,]+/g);
    if (numbers) {
      const value = parseInt(numbers[0].replace(/,/g, ''));
      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThanOrEqual(max);
    }
  }

  async expectChartVisible() {
    await expect(this.chart.first()).toBeVisible();
  }

  async expectDeductionItems() {
    const items = ['국민연금', '건강보험', '고용보험', '소득세'];
    for (const item of items) {
      await expect(this.page.getByText(new RegExp(item, 'i'))).toBeVisible();
    }
  }
}
