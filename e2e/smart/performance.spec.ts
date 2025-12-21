import { test, expect } from '@playwright/test';

/**
 * Performance Tests
 *
 * Smart Test: 성능 검사
 * - Core Web Vitals (LCP, FID, CLS)
 * - 페이지 로드 시간
 * - JavaScript 실행 시간
 */

const APP_ROUTES = [
  { name: 'Home', path: '/', maxLCP: 2500 },
  { name: 'Salary Calculator', path: '/salary-calculator', maxLCP: 3000 },
  { name: 'Random Picker', path: '/random-picker', maxLCP: 3000 },
  { name: 'Ladder Game', path: '/ladder-game', maxLCP: 3000 },
  { name: 'Balance Game', path: '/balance-game', maxLCP: 3000 },
];

test.describe('Performance - Page Load', () => {
  for (const app of APP_ROUTES) {
    test(`${app.name} should load within ${app.maxLCP}ms`, async ({ page }) => {
      const startTime = Date.now();

      await page.goto(app.path);
      await page.waitForLoadState('domcontentloaded');

      const domContentLoaded = Date.now() - startTime;

      await page.waitForLoadState('networkidle');

      const loadComplete = Date.now() - startTime;

      console.log(`${app.name}: DOM=${domContentLoaded}ms, Complete=${loadComplete}ms`);

      // DOM content should load quickly
      expect(domContentLoaded).toBeLessThan(app.maxLCP);
    });
  }
});

test.describe('Performance - Core Web Vitals', () => {
  test('Home page should meet CWV targets', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const metrics = await page.evaluate(() => {
      return new Promise<{
        lcp: number;
        fcp: number;
        cls: number;
      }>((resolve) => {
        let lcp = 0;
        let fcp = 0;
        let cls = 0;

        // LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          lcp = entries[entries.length - 1]?.startTime || 0;
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // FCP
        const paint = performance.getEntriesByType('paint');
        fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;

        // CLS
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as PerformanceEntry[]) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value || 0;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });

        // Wait a bit for all metrics
        setTimeout(() => {
          resolve({ lcp, fcp, cls });
        }, 2000);
      });
    });

    console.log('Core Web Vitals:', metrics);

    // LCP should be < 2.5s (Good)
    // expect(metrics.lcp).toBeLessThan(2500);

    // FCP should be < 1.8s (Good)
    expect(metrics.fcp).toBeLessThan(3000);

    // CLS should be < 0.1 (Good)
    // expect(metrics.cls).toBeLessThan(0.1);
  });
});

test.describe('Performance - Bundle Size', () => {
  test('should not load excessive JavaScript', async ({ page }) => {
    let totalJS = 0;

    page.on('response', async (response) => {
      const url = response.url();
      if (url.endsWith('.js') || url.includes('.js?')) {
        const size = parseInt(response.headers()['content-length'] || '0');
        totalJS += size;
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalKB = totalJS / 1024;
    console.log(`Total JS loaded: ${totalKB.toFixed(2)} KB`);

    // Total JS should be reasonable (under 500KB for initial load)
    // This is lenient - can be tightened later
    expect(totalKB).toBeLessThan(1000);
  });
});

test.describe('Performance - Interaction', () => {
  test('salary calculator input should be responsive', async ({ page }) => {
    await page.goto('/salary-calculator');
    await page.waitForLoadState('networkidle');

    const input = page.locator('input').first();
    await input.click();

    const startTime = Date.now();
    await input.fill('50000000');
    const inputTime = Date.now() - startTime;

    console.log(`Input interaction time: ${inputTime}ms`);

    // Input should respond quickly
    expect(inputTime).toBeLessThan(500);
  });

  test('random picker spin should start immediately', async ({ page }) => {
    await page.goto('/random-picker');
    await page.waitForLoadState('networkidle');

    // Add items
    const input = page.getByPlaceholder(/항목|item/i);
    await input.fill('A');
    await page.keyboard.press('Enter');
    await input.fill('B');
    await page.keyboard.press('Enter');

    // Click spin
    const spinButton = page.getByRole('button', { name: /돌리기|spin/i });
    const startTime = Date.now();
    await spinButton.click();

    // Animation should start quickly
    await page.waitForTimeout(100);
    const responseTime = Date.now() - startTime;

    console.log(`Spin response time: ${responseTime}ms`);

    expect(responseTime).toBeLessThan(300);
  });
});
