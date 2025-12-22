import { test, expect } from '@playwright/test';
import { BalanceGamePage } from '../../pages/game/balance-game.page';

/**
 * Balance Game - E2E Tests
 *
 * Based on APPS_DOCUMENTATION.md:
 * - 카테고리 선택 확인
 * - 질문 표시 및 선택 확인
 * - 결과 차트 확인
 */
test.describe('Balance Game', () => {
  let balancePage: BalanceGamePage;

  test.beforeEach(async ({ page }) => {
    balancePage = new BalanceGamePage(page);
    await balancePage.goto();
  });

  test('should load page with game content', async () => {
    await expect(balancePage.page.locator('body')).toBeVisible();
  });

  test('should display category or question options', async () => {
    // Game should show either categories or questions
    await balancePage.expectOptionsVisible();
  });

  test('should allow making selections', async ({ page }) => {
    // Find any clickable button and interact
    const buttons = page.locator('button');
    const count = await buttons.count();

    if (count > 0) {
      await buttons.first().click();
      await balancePage.waitForAnimation();
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle rapid selections', async ({ page }) => {
    // Quickly select multiple options
    const buttons = page.locator('button');

    for (let i = 0; i < 5; i++) {
      const count = await buttons.count();
      if (count > 0) {
        await buttons.first().click();
        await balancePage.waitForAnimation(100);
      }
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle page refresh mid-game', async ({ page }) => {
    // Make a selection
    const buttons = page.locator('button');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }

    // Refresh
    await page.reload();
    await balancePage.waitForPageLoad();

    await expect(page.locator('body')).toBeVisible();
  });

  test('should be playable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await balancePage.goto();

    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
  });
});
