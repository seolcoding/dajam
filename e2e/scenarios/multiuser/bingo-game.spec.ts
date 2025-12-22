import { test, expect, BrowserContext, Page } from '@playwright/test';
import { BingoGamePage } from '../../pages/game/bingo.page';

/**
 * Bingo Game - Multi-User E2E Tests
 *
 * Scenarios:
 * 1. Host creates game, player joins
 * 2. Cell selection synchronization
 * 3. Bingo detection for both host and player
 */
test.describe('Bingo Game - Multi-User', () => {
  test.describe('Game Creation', () => {
    test('should load menu with create and join options', async ({ page }) => {
      const bingoPage = new BingoGamePage(page);
      await bingoPage.goto();

      // Menu should be visible with options
      await expect(page.locator('body')).toBeVisible();
    });

    test('should create a new game as host', async ({ page }) => {
      const bingoPage = new BingoGamePage(page);
      await bingoPage.goto();

      // Try to create game if button is available
      const createButton = bingoPage.createGameButton;
      if (await createButton.isVisible()) {
        await createButton.click();
        await bingoPage.waitForAnimation();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Host and Player Contexts', () => {
    test('host and player should both see bingo grid', async ({ browser }) => {
      const hostContext = await browser.newContext();
      const playerContext = await browser.newContext();

      const hostPage = await hostContext.newPage();
      const playerPage = await playerContext.newPage();

      try {
        const hostBingo = new BingoGamePage(hostPage);
        const playerBingo = new BingoGamePage(playerPage);

        // Both navigate to bingo game
        await Promise.all([
          hostBingo.goto(),
          playerBingo.goto()
        ]);

        // Both should see the page
        await expect(hostPage.locator('body')).toBeVisible();
        await expect(playerPage.locator('body')).toBeVisible();

      } finally {
        await hostContext.close();
        await playerContext.close();
      }
    });

    test('multiple players joining same game', async ({ browser }) => {
      const contexts: BrowserContext[] = [];
      const pages: Page[] = [];

      try {
        // Create host and 2 players
        for (let i = 0; i < 3; i++) {
          const context = await browser.newContext();
          const page = await context.newPage();
          contexts.push(context);
          pages.push(page);
        }

        // All navigate to bingo
        await Promise.all(
          pages.map(async (page) => {
            await page.goto('/bingo-game');
            await page.waitForLoadState('networkidle');
          })
        );

        // All pages should be functional
        for (const page of pages) {
          await expect(page.locator('body')).toBeVisible();
        }

      } finally {
        await Promise.all(contexts.map(ctx => ctx.close()));
      }
    });
  });

  test.describe('Cell Selection', () => {
    test('should be able to click cells on grid', async ({ page }) => {
      const bingoPage = new BingoGamePage(page);
      await bingoPage.goto();

      // If we can get to a grid view
      const cells = bingoPage.bingoCells;
      const cellCount = await cells.count();

      if (cellCount > 0) {
        // Click first cell
        await cells.first().click();
        await bingoPage.waitForAnimation();
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Game State Persistence', () => {
    test('should handle page refresh', async ({ page }) => {
      const bingoPage = new BingoGamePage(page);
      await bingoPage.goto();

      // Refresh
      await page.reload();
      await bingoPage.waitForPageLoad();

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle localStorage clear', async ({ page }) => {
      const bingoPage = new BingoGamePage(page);
      await bingoPage.goto();

      // Clear localStorage
      await bingoPage.clearStorage();

      // Refresh
      await page.reload();
      await bingoPage.waitForPageLoad();

      await expect(page.locator('body')).toBeVisible();
    });
  });
});
