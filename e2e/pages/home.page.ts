import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Home Page Object - 메인 갤러리 페이지
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get appCards() {
    return this.page.locator('[data-testid="app-card"], .app-card, article');
  }

  get categoryTabs() {
    return this.page.getByRole('tab');
  }

  get searchInput() {
    return this.page.getByPlaceholder(/검색|search/i);
  }

  // Actions
  async goto() {
    await super.goto('/');
  }

  async clickApp(appName: string) {
    await this.page.getByRole('link', { name: new RegExp(appName, 'i') }).click();
    await this.waitForPageLoad();
  }

  async searchApp(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async selectCategory(category: string) {
    await this.page.getByRole('tab', { name: category }).click();
  }

  // Assertions
  async expectAppCount(count: number) {
    await expect(this.appCards).toHaveCount(count);
  }

  async expectAppVisible(appName: string) {
    await expect(
      this.page.getByRole('link', { name: new RegExp(appName, 'i') })
    ).toBeVisible();
  }

  async expectCategorySelected(category: string) {
    await expect(
      this.page.getByRole('tab', { name: category })
    ).toHaveAttribute('aria-selected', 'true');
  }
}
