import { test as base, expect, Page, Locator } from '@playwright/test';
import { APP_ROUTES } from '../../playwright.config';

/**
 * Custom test fixtures for SeolCoding Apps
 */

// Extended test context
interface AppFixtures {
  appPage: AppPage;
}

// App page helper class
export class AppPage {
  constructor(public readonly page: Page) {}

  // Navigation
  async goto(route: keyof typeof APP_ROUTES) {
    await this.page.goto(APP_ROUTES[route]);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoHome() {
    await this.goto('home');
  }

  // Common actions
  async clickButton(text: string) {
    await this.page.getByRole('button', { name: text }).click();
  }

  async fillInput(label: string, value: string) {
    await this.page.getByLabel(label).fill(value);
  }

  async selectOption(label: string, value: string) {
    await this.page.getByLabel(label).selectOption(value);
  }

  // Assertions
  async expectHeading(text: string | RegExp) {
    await expect(this.page.getByRole('heading', { name: text })).toBeVisible();
  }

  async expectText(text: string | RegExp) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async expectNoErrors() {
    const errorMessages = this.page.locator('[role="alert"]');
    await expect(errorMessages).toHaveCount(0);
  }

  // Wait helpers
  async waitForAnimation(ms = 500) {
    await this.page.waitForTimeout(ms);
  }

  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  // Local storage helpers
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async setLocalStorage(key: string, value: unknown) {
    await this.page.evaluate(
      ([k, v]) => localStorage.setItem(k, JSON.stringify(v)),
      [key, value]
    );
  }

  async getLocalStorage(key: string) {
    return await this.page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k) || 'null'),
      key
    );
  }
}

// Extended test with fixtures
export const test = base.extend<AppFixtures>({
  appPage: async ({ page }, use) => {
    const appPage = new AppPage(page);
    await use(appPage);
  },
});

export { expect };

// Re-export common types
export type { Page, Locator };
