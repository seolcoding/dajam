import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object - 모든 페이지의 공통 기능
 *
 * Best Practice: Page Object Model (POM) 패턴
 * - UI 요소와 테스트 로직 분리
 * - 재사용성 및 유지보수성 향상
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation
  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // Common UI elements
  get heading() {
    return this.page.getByRole('heading').first();
  }

  get mainContent() {
    return this.page.locator('main, [role="main"], .container').first();
  }

  // Common actions
  async clickButton(name: string | RegExp) {
    await this.page.getByRole('button', { name }).click();
  }

  async fillInput(label: string, value: string) {
    await this.page.getByLabel(label).fill(value);
  }

  async fillByPlaceholder(placeholder: string, value: string) {
    await this.page.getByPlaceholder(placeholder).fill(value);
  }

  async selectOption(label: string, value: string) {
    await this.page.getByLabel(label).selectOption(value);
  }

  async pressEnter() {
    await this.page.keyboard.press('Enter');
  }

  // Assertions
  async expectVisible(text: string | RegExp) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async expectHeading(text: string | RegExp) {
    await expect(this.page.getByRole('heading', { name: text })).toBeVisible();
  }

  async expectButton(text: string | RegExp) {
    await expect(this.page.getByRole('button', { name: text })).toBeVisible();
  }

  async expectNoErrors() {
    // Check for error alerts
    const errorCount = await this.page.locator('[role="alert"]').count();
    expect(errorCount).toBe(0);
  }

  // Screenshots
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    });
  }

  // Local storage
  async clearStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async setStorage(key: string, value: unknown) {
    await this.page.evaluate(
      ({ k, v }) => localStorage.setItem(k, JSON.stringify(v)),
      { k: key, v: value }
    );
  }

  async getStorage(key: string) {
    return await this.page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k) || 'null'),
      key
    );
  }

  // Wait helpers
  async waitForAnimation(ms = 500) {
    await this.page.waitForTimeout(ms);
  }

  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  // Responsive helpers
  async setViewport(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
  }

  async isMobile(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }
}
