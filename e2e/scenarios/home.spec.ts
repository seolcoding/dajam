import { test, expect } from '@playwright/test';

/**
 * Home Page (Marketing Landing) - E2E Tests
 *
 * 시나리오:
 * 1. 마케팅 랜딩 페이지 로드
 * 2. CTA 버튼 및 네비게이션 확인
 * 3. 앱 갤러리로 이동
 */
test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display page title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/다잼|Dajam/i);
    // Marketing landing page heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should display CTA buttons', async ({ page }) => {
    // Check for signup/start buttons
    const ctaButton = page.locator('a[href*="signup"], button').filter({
      hasText: /시작|무료|가입/i
    }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('should navigate to apps page', async ({ page }) => {
    const appsLink = page.locator('a[href="/apps"]').first();
    await appsLink.click();
    await expect(page).toHaveURL(/apps/);
  });

  test('should navigate to pricing page', async ({ page }) => {
    const pricingLink = page.locator('a[href="/pricing"]').first();
    await pricingLink.click();
    await expect(page).toHaveURL(/pricing/);
  });

  test('should navigate to login page', async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]').first();
    await loginLink.click();
    await expect(page).toHaveURL(/login/);
  });

  test('should have footer with legal links', async ({ page }) => {
    const termsLink = page.locator('a[href="/terms"]');
    const privacyLink = page.locator('a[href="/privacy"]');
    await expect(termsLink).toBeVisible();
    await expect(privacyLink).toBeVisible();
  });
});

/**
 * Apps Gallery Page - E2E Tests
 */
test.describe('Apps Gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/apps');
  });

  test('should display all 16+ apps', async ({ page }) => {
    // Check that app links exist
    const appLinks = page.locator('a[href*="/"]').filter({
      has: page.locator('h3, h4, .font-semibold, .font-bold')
    });
    const count = await appLinks.count();
    expect(count).toBeGreaterThanOrEqual(16);
  });

  test('should navigate to salary calculator', async ({ page }) => {
    const appCard = page.locator('a').filter({ hasText: /급여/i }).first();
    await appCard.click();
    await expect(page).toHaveURL(/salary-calculator/);
  });

  test('should navigate to random picker', async ({ page }) => {
    const appCard = page.locator('a').filter({ hasText: /랜덤/i }).first();
    await appCard.click();
    await expect(page).toHaveURL(/random-picker/);
  });
});
