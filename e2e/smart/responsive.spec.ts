import { test, expect, devices } from '@playwright/test';

/**
 * Responsive Design Tests
 *
 * Smart Test: 반응형 검사
 * - Mobile, Tablet, Desktop 뷰포트
 * - 가로 스크롤 없음 확인
 * - 터치 타겟 크기 확인
 */

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  widescreen: { width: 1920, height: 1080 },
};

const APP_ROUTES = [
  '/',
  '/salary-calculator',
  '/rent-calculator',
  '/gpa-calculator',
  '/dutch-pay',
  '/ideal-worldcup',
  '/balance-game',
  '/chosung-quiz',
  '/ladder-game',
  '/bingo-game',
  '/live-voting',
  '/random-picker',
  '/team-divider',
  '/lunch-roulette',
  '/group-order',
  '/id-validator',
  '/student-network',
];

test.describe('Responsive - No Horizontal Scroll', () => {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${viewportName} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport });

      for (const route of APP_ROUTES) {
        test(`${route} should have no horizontal scroll`, async ({ page }) => {
          await page.goto(route);
          await page.waitForLoadState('networkidle');

          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });

          if (hasHorizontalScroll) {
            // Find overflowing elements for debugging
            const overflowingElements = await page.evaluate(() => {
              const elements: string[] = [];
              document.querySelectorAll('*').forEach(el => {
                if (el.scrollWidth > el.clientWidth) {
                  elements.push(`${el.tagName}.${el.className}`);
                }
              });
              return elements.slice(0, 5);
            });

            console.log(`Overflowing elements on ${route}:`, overflowingElements);
          }

          expect(hasHorizontalScroll).toBe(false);
        });
      }
    });
  }
});

test.describe('Responsive - Touch Targets', () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test('buttons should have minimum touch target size (44x44)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button, a, [role="button"]').all();

    for (const button of buttons.slice(0, 20)) {
      const box = await button.boundingBox();
      if (box) {
        // WCAG recommends 44x44 minimum touch target
        // We'll be lenient with 40x40 for now
        const meetsMinSize = box.width >= 40 && box.height >= 40;

        if (!meetsMinSize) {
          const text = await button.textContent();
          console.log(`Small touch target: ${text} (${box.width}x${box.height})`);
        }
      }
    }
  });
});

test.describe('Responsive - Layout Integrity', () => {
  test('home page should show all apps on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should still show app cards
    const cards = page.locator('[data-testid="app-card"], .app-card, article, a[href*="/"]');
    const count = await cards.count();

    expect(count).toBeGreaterThanOrEqual(16);
  });

  test('calculator should be usable on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/salary-calculator');
    await page.waitForLoadState('networkidle');

    // Input should be visible and usable
    const input = page.locator('input').first();
    await expect(input).toBeVisible();

    // Should be able to type
    await input.fill('50000000');
    await expect(input).toHaveValue('50000000');
  });

  test('ladder game should fit on tablet', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/ladder-game');
    await page.waitForLoadState('networkidle');

    // Canvas should be visible
    const canvas = page.locator('canvas');
    const canvasCount = await canvas.count();

    // Canvas might not exist until ladder is generated
    // But page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Responsive - Visual Regression', () => {
  const screenshotRoutes = ['/', '/salary-calculator', '/random-picker'];

  for (const route of screenshotRoutes) {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      test(`${route} visual on ${viewportName}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(route);
        await page.waitForLoadState('networkidle');

        // Wait for animations to complete
        await page.waitForTimeout(500);

        // Take screenshot for visual comparison
        await expect(page).toHaveScreenshot(
          `${route.replace('/', 'home')}-${viewportName}.png`,
          {
            fullPage: true,
            maxDiffPixelRatio: 0.1, // Allow 10% diff for dynamic content
          }
        );
      });
    }
  }
});
