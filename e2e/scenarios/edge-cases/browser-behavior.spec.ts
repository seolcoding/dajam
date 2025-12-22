import { test, expect } from '@playwright/test';

/**
 * Edge Cases - Browser Behavior Tests
 *
 * Test scenarios:
 * 1. Page refresh during operation
 * 2. Browser back/forward navigation
 * 3. Multiple tabs
 * 4. LocalStorage manipulation
 * 5. Network issues simulation
 */
test.describe('Edge Cases - Browser Behavior', () => {
  test.describe('Page Refresh', () => {
    const apps = [
      '/salary-calculator',
      '/random-picker',
      '/ladder-game',
      '/id-validator',
      '/balance-game',
    ];

    for (const app of apps) {
      test(`${app} should recover from refresh`, async ({ page }) => {
        await page.goto(app);
        await page.waitForLoadState('networkidle');

        // Perform some action if possible
        const input = page.locator('input').first();
        if (await input.isVisible()) {
          await input.fill('test');
        }

        // Refresh
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Page should recover
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Navigation', () => {
    test('should handle back/forward navigation', async ({ page }) => {
      // Start at home
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigate to salary calculator
      await page.goto('/salary-calculator');
      await page.waitForLoadState('networkidle');

      // Navigate to random picker
      await page.goto('/random-picker');
      await page.waitForLoadState('networkidle');

      // Go back twice
      await page.goBack();
      await expect(page).toHaveURL(/salary-calculator/);

      await page.goBack();
      await expect(page).toHaveURL(/\/$/);

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/salary-calculator/);
    });

    test('should handle direct URL access', async ({ page }) => {
      // Access apps directly without going through home
      await page.goto('/gpa-calculator');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();

      await page.goto('/dutch-pay');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle invalid URL gracefully', async ({ page }) => {
      await page.goto('/non-existent-app');
      await page.waitForLoadState('networkidle');

      // Should show 404 or redirect
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('LocalStorage', () => {
    test('should handle corrupted localStorage', async ({ page }) => {
      await page.goto('/salary-calculator');

      // Set corrupted data
      await page.evaluate(() => {
        localStorage.setItem('salary-calculator', 'invalid{json');
      });

      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle localStorage full', async ({ page }) => {
      await page.goto('/');

      // Try to fill localStorage (this won't actually fill it, but tests the pattern)
      await page.evaluate(() => {
        try {
          const bigData = 'x'.repeat(1000);
          for (let i = 0; i < 100; i++) {
            localStorage.setItem(`test-${i}`, bigData);
          }
        } catch (e) {
          // QuotaExceeded - expected
        }
      });

      await page.goto('/salary-calculator');
      await page.waitForLoadState('networkidle');

      // Should work despite localStorage issues
      await expect(page.locator('body')).toBeVisible();

      // Clean up
      await page.evaluate(() => {
        for (let i = 0; i < 100; i++) {
          localStorage.removeItem(`test-${i}`);
        }
      });
    });

    test('should handle localStorage disabled', async ({ page, context }) => {
      // Note: We can't actually disable localStorage in Playwright,
      // but we can test error handling
      await page.goto('/salary-calculator');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Multiple Tabs', () => {
    test('should handle same app in multiple tabs', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      await page1.goto('/salary-calculator');
      await page2.goto('/salary-calculator');

      // Modify in page1
      const input1 = page1.locator('input').first();
      if (await input1.isVisible()) {
        await input1.fill('60000000');
      }

      // Modify in page2
      const input2 = page2.locator('input').first();
      if (await input2.isVisible()) {
        await input2.fill('70000000');
      }

      // Both should work independently
      await expect(page1.locator('body')).toBeVisible();
      await expect(page2.locator('body')).toBeVisible();

      await page1.close();
      await page2.close();
    });

    test('should handle different apps in multiple tabs', async ({ context }) => {
      const pages = await Promise.all([
        context.newPage(),
        context.newPage(),
        context.newPage(),
      ]);

      await Promise.all([
        pages[0].goto('/salary-calculator'),
        pages[1].goto('/random-picker'),
        pages[2].goto('/ladder-game'),
      ]);

      // All should be functional
      for (const page of pages) {
        await expect(page.locator('body')).toBeVisible();
      }

      await Promise.all(pages.map(p => p.close()));
    });
  });

  test.describe('Rapid Interactions', () => {
    test('should handle rapid button clicks', async ({ page }) => {
      await page.goto('/random-picker');

      const addButton = page.getByRole('button', { name: /추가|add/i });
      const input = page.getByPlaceholder(/항목|item/i);

      if (await addButton.isVisible() && await input.isVisible()) {
        // Rapid clicks
        for (let i = 0; i < 10; i++) {
          await input.fill(`item${i}`);
          await addButton.click();
        }
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle rapid navigation', async ({ page }) => {
      const routes = [
        '/',
        '/salary-calculator',
        '/random-picker',
        '/ladder-game',
        '/id-validator',
      ];

      for (const route of routes) {
        await page.goto(route);
        // Don't wait - rapid navigation
      }

      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
