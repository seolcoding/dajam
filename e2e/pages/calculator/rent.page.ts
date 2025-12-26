import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Rent Calculator Page Object
 *
 * 테스트 시나리오:
 * - 전세 → 월세 변환 계산
 * - 월세 → 전세 환산 계산
 * - 전환율 슬라이더 조정 반영
 * - 탭 전환 기능
 */
export class RentCalculatorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Tab locators
  get jeonseToWolseTab() {
    return this.page.getByRole('tab', { name: /전세.*월세/i });
  }

  get wolseToJeonseTab() {
    return this.page.getByRole('tab', { name: /월세.*전세/i });
  }

  // Jeonse to Wolse inputs
  get jeonseInput() {
    return this.page.locator('#jeonse');
  }

  get depositForWolseInput() {
    return this.page.locator('#deposit-wolse');
  }

  get conversionRateJeonseSlider() {
    return this.page.locator('#conversion-rate-jeonse');
  }

  get conversionRateJeonseValue() {
    return this.page.locator('#conversion-rate-jeonse').locator('..').getByText(/\d+\.\d+%/);
  }

  // Wolse to Jeonse inputs
  get depositForJeonseInput() {
    return this.page.locator('#deposit-jeonse');
  }

  get monthlyRentInput() {
    return this.page.locator('#monthly-rent');
  }

  get conversionRateWolseSlider() {
    return this.page.locator('#conversion-rate-wolse');
  }

  get conversionRateWolseValue() {
    return this.page.locator('#conversion-rate-wolse').locator('..').getByText(/\d+\.\d+%/);
  }

  // Result displays
  get monthlyRentResult() {
    // Find the card with "결과" header, then the blue text showing monthly rent
    return this.page.locator('.text-blue-600.text-3xl').first();
  }

  get jeonseEquivalentResult() {
    // Find the blue text showing jeonse equivalent in the second tab
    return this.page.locator('.text-blue-600.text-3xl').first();
  }

  get calculationFormula() {
    // The calculation formula section
    return this.page.getByText(/계산 공식/);
  }

  get resultCard() {
    return this.page.locator('.border-blue-200').first();
  }

  // Actions
  async goto() {
    await super.goto('/rent-calculator');
  }

  async switchToJeonseToWolse() {
    await this.jeonseToWolseTab.click();
    await this.waitForAnimation(300);
  }

  async switchToWolseToJeonse() {
    await this.wolseToJeonseTab.click();
    await this.waitForAnimation(300);
  }

  async setJeonse(amount: number) {
    await this.jeonseInput.waitFor({ state: 'visible' });
    await this.jeonseInput.click();
    await this.jeonseInput.clear();
    await this.jeonseInput.fill(amount.toString());
    await this.jeonseInput.blur();
    await this.waitForAnimation(200);
  }

  async setDepositForWolse(amount: number) {
    await this.depositForWolseInput.waitFor({ state: 'visible' });
    await this.depositForWolseInput.click();
    await this.depositForWolseInput.clear();
    await this.depositForWolseInput.fill(amount.toString());
    await this.depositForWolseInput.blur();
    await this.waitForAnimation(200);
  }

  async setDepositForJeonse(amount: number) {
    await this.depositForJeonseInput.waitFor({ state: 'visible' });
    await this.depositForJeonseInput.click();
    await this.depositForJeonseInput.clear();
    await this.depositForJeonseInput.fill(amount.toString());
    await this.depositForJeonseInput.blur();
    await this.waitForAnimation(200);
  }

  async setMonthlyRent(amount: number) {
    await this.monthlyRentInput.waitFor({ state: 'visible' });
    await this.monthlyRentInput.click();
    await this.monthlyRentInput.clear();
    await this.monthlyRentInput.fill(amount.toString());
    await this.monthlyRentInput.blur();
    await this.waitForAnimation(200);
  }

  async adjustConversionRateJeonse(percentage: number) {
    const slider = this.conversionRateJeonseSlider;
    await slider.scrollIntoViewIfNeeded();
    await this.waitForAnimation(300);

    const box = await slider.boundingBox();
    if (box) {
      // Rate ranges from 0.1 to 10, so percentage is (value - 0.1) / (10 - 0.1) * 100
      const x = box.x + (box.width * percentage / 100);
      const y = box.y + box.height / 2;
      await this.page.mouse.click(x, y);
      await this.waitForAnimation(200);
    }
  }

  async adjustConversionRateWolse(percentage: number) {
    const slider = this.conversionRateWolseSlider;
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
  async expectTabsVisible() {
    await expect(this.jeonseToWolseTab).toBeVisible({ timeout: 5000 });
    await expect(this.wolseToJeonseTab).toBeVisible({ timeout: 5000 });
  }

  async expectJeonseToWolseVisible() {
    await expect(this.jeonseInput).toBeVisible({ timeout: 5000 });
    await expect(this.depositForWolseInput).toBeVisible({ timeout: 5000 });
    await expect(this.conversionRateJeonseSlider).toBeVisible({ timeout: 5000 });
  }

  async expectWolseToJeonseVisible() {
    await expect(this.depositForJeonseInput).toBeVisible({ timeout: 5000 });
    await expect(this.monthlyRentInput).toBeVisible({ timeout: 5000 });
    await expect(this.conversionRateWolseSlider).toBeVisible({ timeout: 5000 });
  }

  async expectMonthlyRent(expectedValue: number, tolerance: number = 10000) {
    await expect(this.monthlyRentResult).toBeVisible({ timeout: 5000 });
    const text = await this.monthlyRentResult.textContent();
    const numbers = text?.match(/[\d,]+/g);
    if (numbers && numbers.length > 0) {
      const value = parseInt(numbers[0].replace(/,/g, ''));
      expect(Math.abs(value - expectedValue)).toBeLessThanOrEqual(tolerance);
    }
  }

  async expectJeonseEquivalent(expectedValue: number, tolerance: number = 100000) {
    await expect(this.jeonseEquivalentResult).toBeVisible({ timeout: 5000 });
    const text = await this.jeonseEquivalentResult.textContent();
    const numbers = text?.match(/[\d,]+/g);
    if (numbers && numbers.length > 0) {
      const value = parseInt(numbers[0].replace(/,/g, ''));
      expect(Math.abs(value - expectedValue)).toBeLessThanOrEqual(tolerance);
    }
  }

  async expectResultCardVisible() {
    await expect(this.resultCard).toBeVisible({ timeout: 5000 });
  }

  async expectCalculationFormulaVisible() {
    await expect(this.calculationFormula).toBeVisible({ timeout: 5000 });
  }

  async expectConversionRateJeonse(expectedRate: number, tolerance: number = 0.2) {
    const text = await this.conversionRateJeonseValue.textContent();
    const rateMatch = text?.match(/(\d+\.\d+)%/);
    if (rateMatch) {
      const rate = parseFloat(rateMatch[1]);
      expect(Math.abs(rate - expectedRate)).toBeLessThanOrEqual(tolerance);
    }
  }

  async expectConversionRateWolse(expectedRate: number, tolerance: number = 0.2) {
    const text = await this.conversionRateWolseValue.textContent();
    const rateMatch = text?.match(/(\d+\.\d+)%/);
    if (rateMatch) {
      const rate = parseFloat(rateMatch[1]);
      expect(Math.abs(rate - expectedRate)).toBeLessThanOrEqual(tolerance);
    }
  }
}
