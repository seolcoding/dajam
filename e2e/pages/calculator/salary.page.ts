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
    // Match by id or label containing 연봉
    return this.page.locator('#annualSalary, input[id="annualSalary"]').first();
  }

  get dependentsInput() {
    return this.page.locator('#dependents, input[id="dependents"]');
  }

  get calculateButton() {
    return this.page.getByRole('button', { name: /실수령액 계산하기|계산하기|계산|calculate/i });
  }

  get resultCard() {
    // Match the result card with emerald border or the CardTitle with 월 실수령액
    return this.page.locator('.border-emerald-100, [class*="shadow-emerald"]').first();
  }

  get netSalary() {
    // Match the large emerald text showing the net pay amount
    return this.page.locator('.text-emerald-600.text-6xl, .text-6xl.text-emerald-600').first();
  }

  get chart() {
    return this.page.locator('.recharts-wrapper, svg.recharts-surface').first();
  }

  get slider() {
    return this.page.getByRole('slider');
  }

  // Actions
  async goto() {
    await super.goto('/salary-calculator');
  }

  async enterSalary(amount: number) {
    await this.salaryInput.waitFor({ state: 'visible' });
    await this.salaryInput.click();
    await this.salaryInput.clear();
    // Type the number - NumberInput expects raw numbers
    await this.salaryInput.fill(amount.toString());
    // Trigger blur to format the number
    await this.salaryInput.blur();
    await this.waitForAnimation(200);
  }

  async setDependents(count: number) {
    if (await this.dependentsInput.isVisible()) {
      await this.dependentsInput.click();
      await this.dependentsInput.clear();
      await this.dependentsInput.fill(count.toString());
    }
  }

  async calculate() {
    await this.calculateButton.click();
    // Wait for calculation and animation
    await this.waitForAnimation(500);
  }

  async adjustSlider(percentage: number) {
    // Scroll to slider section first
    const slider = this.slider.first();
    await slider.scrollIntoViewIfNeeded();
    await this.waitForAnimation(300);

    const box = await slider.boundingBox();
    if (box) {
      const x = box.x + (box.width * percentage / 100);
      const y = box.y + box.height / 2;
      await this.page.mouse.click(x, y);
      await this.waitForAnimation(200);
    }
  }

  // Assertions
  async expectResultVisible() {
    // Wait for the result card to be visible
    await expect(this.resultCard).toBeVisible({ timeout: 5000 });
  }

  async expectNetSalary(min: number, max: number) {
    await expect(this.netSalary).toBeVisible({ timeout: 5000 });
    const text = await this.netSalary.textContent();
    const numbers = text?.match(/[\d,]+/g);
    if (numbers && numbers.length > 0) {
      const value = parseInt(numbers[0].replace(/,/g, ''));
      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThanOrEqual(max);
    }
  }

  async expectChartVisible() {
    await expect(this.chart).toBeVisible({ timeout: 5000 });
  }

  async expectDeductionItems() {
    // Check for deduction items in the breakdown section
    const items = ['국민연금', '건강보험', '고용보험', '소득세'];
    for (const item of items) {
      await expect(this.page.getByText(item).first()).toBeVisible({ timeout: 5000 });
    }
  }
}
