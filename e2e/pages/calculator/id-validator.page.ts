import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * ID Validator Page Object
 *
 * 테스트 시나리오:
 * - 주민번호 검증
 * - 사업자번호 검증
 * - 법인번호 검증
 * - 테스트 번호 생성
 * - 자동 포맷팅
 */
export class IdValidatorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get rrnTab() {
    return this.page.getByRole('tab', { name: /주민등록번호|RRN/i });
  }

  get brnTab() {
    return this.page.getByRole('tab', { name: /사업자|BRN/i });
  }

  get crnTab() {
    return this.page.getByRole('tab', { name: /법인|CRN/i });
  }

  get input() {
    return this.page.getByRole('textbox').first();
  }

  get validateButton() {
    return this.page.getByRole('button', { name: /검증하기|검증|확인|validate/i });
  }

  get generateButton() {
    return this.page.getByRole('button', { name: /테스트 번호 생성|생성|generate/i });
  }

  get validResult() {
    // Look for the green success icon (CheckCircle2)
    return this.page.locator('.text-green-600, .lucide-check-circle-2, svg.text-green-600').first();
  }

  get invalidResult() {
    // Look for the red error icon (XCircle)
    return this.page.locator('.text-red-600, .lucide-x-circle, svg.text-red-600').first();
  }

  // Actions
  async goto() {
    await super.goto('/id-validator');
  }

  async selectRRN() {
    await this.rrnTab.click();
  }

  async selectBRN() {
    await this.brnTab.click();
  }

  async selectCRN() {
    await this.crnTab.click();
  }

  async enterNumber(value: string) {
    await this.input.clear();
    await this.input.fill(value);
  }

  async validate() {
    await this.validateButton.click();
    await this.waitForAnimation(300);
  }

  async generateTestNumber() {
    await this.generateButton.click();
    await this.waitForAnimation(300);
    return await this.input.inputValue();
  }

  // Assertions
  async expectValid() {
    await expect(this.validResult).toBeVisible();
  }

  async expectInvalid() {
    await expect(this.invalidResult).toBeVisible();
  }

  async expectFormatted(pattern: RegExp) {
    const value = await this.input.inputValue();
    expect(value).toMatch(pattern);
  }

  async expectAutoFormat() {
    // RRN format: 000000-0000000
    await this.enterNumber('9001011234567');
    const value = await this.input.inputValue();
    expect(value).toMatch(/^\d{6}-\d{7}$/);
  }
}
