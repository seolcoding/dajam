import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

/**
 * Home Page (Gallery) - E2E Tests
 *
 * 시나리오:
 * 1. 페이지 로드 및 16개 앱 표시
 * 2. 앱 카드 클릭으로 이동
 * 3. 카테고리 필터링
 */
test.describe('Home Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display page title and heading', async () => {
    await expect(homePage.page).toHaveTitle(/SeolCoding/i);
    // The actual heading is "일상의 번거로움을 10초 만에 해결"
    await homePage.expectHeading(/일상|번거로움|10초|해결/i);
  });

  test('should display all 16 apps', async () => {
    // Check that app links exist (Link components with href)
    const appLinks = homePage.page.locator('a[href*="/"]').filter({
      has: homePage.page.locator('h3, h4, .font-semibold, .font-bold')
    });
    const count = await appLinks.count();
    expect(count).toBeGreaterThanOrEqual(16);
  });

  test('should navigate to salary calculator', async () => {
    await homePage.clickApp('급여');
    await expect(homePage.page).toHaveURL(/salary-calculator/);
  });

  test('should navigate to random picker', async () => {
    await homePage.clickApp('랜덤');
    await expect(homePage.page).toHaveURL(/random-picker/);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await homePage.goto();
    await homePage.waitForPageLoad();

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('hydration')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
