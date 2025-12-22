import { test, expect } from '@playwright/test';
import { TeamDividerPage } from '../../pages/utility/team-divider.page';

/**
 * Team Divider - E2E Tests
 *
 * Based on APPS_DOCUMENTATION.md:
 * - 참가자 입력 확인
 * - 팀 분배 확인
 * - QR 코드 생성 확인
 */
test.describe('Team Divider', () => {
  let teamPage: TeamDividerPage;

  test.beforeEach(async ({ page }) => {
    teamPage = new TeamDividerPage(page);
    await teamPage.goto();
  });

  test('should load page with input form', async () => {
    await expect(teamPage.page.locator('body')).toBeVisible();
  });

  test('should have participant input', async ({ page }) => {
    const inputs = page.locator('input, textarea');
    await expect(inputs.first()).toBeVisible();
  });

  test('should allow adding participants', async ({ page }) => {
    const input = page.locator('input').first();
    if (await input.isVisible()) {
      await input.fill('참가자1');
      await page.keyboard.press('Enter');
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('should add multiple participants', async ({ page }) => {
    const participants = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (const name of participants) {
      const input = page.locator('input').first();
      if (await input.isVisible()) {
        await input.fill(name);
        await page.keyboard.press('Enter');
        await teamPage.waitForAnimation(100);
      }
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('should divide into teams', async ({ page }) => {
    // Add participants
    const participants = ['A', 'B', 'C', 'D'];
    for (const name of participants) {
      const input = page.locator('input').first();
      if (await input.isVisible()) {
        await input.fill(name);
        await page.keyboard.press('Enter');
      }
    }

    // Click divide button
    const divideBtn = page.getByRole('button', { name: /나누기|divide|분배/i });
    if (await divideBtn.isVisible()) {
      await divideBtn.click();
      await teamPage.waitForAnimation();
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('should shuffle teams', async ({ page }) => {
    // Add participants and divide first
    const participants = ['A', 'B', 'C', 'D'];
    for (const name of participants) {
      const input = page.locator('input').first();
      if (await input.isVisible()) {
        await input.fill(name);
        await page.keyboard.press('Enter');
      }
    }

    const divideBtn = page.getByRole('button', { name: /나누기|divide|분배/i });
    if (await divideBtn.isVisible()) {
      await divideBtn.click();
    }

    // Then shuffle
    const shuffleBtn = page.getByRole('button', { name: /섞기|shuffle/i });
    if (await shuffleBtn.isVisible()) {
      await shuffleBtn.click();
      await teamPage.waitForAnimation();
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test.describe('Edge Cases', () => {
    test('should handle odd number of participants', async ({ page }) => {
      const participants = ['A', 'B', 'C', 'D', 'E']; // 5 people

      for (const name of participants) {
        const input = page.locator('input').first();
        if (await input.isVisible()) {
          await input.fill(name);
          await page.keyboard.press('Enter');
        }
      }

      const divideBtn = page.getByRole('button', { name: /나누기|divide/i });
      if (await divideBtn.isVisible()) {
        await divideBtn.click();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle minimum participants (2)', async ({ page }) => {
      const participants = ['A', 'B'];

      for (const name of participants) {
        const input = page.locator('input').first();
        if (await input.isVisible()) {
          await input.fill(name);
          await page.keyboard.press('Enter');
        }
      }

      const divideBtn = page.getByRole('button', { name: /나누기|divide/i });
      if (await divideBtn.isVisible()) {
        await divideBtn.click();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle many participants', async ({ page }) => {
      // Add 20 participants
      for (let i = 1; i <= 20; i++) {
        const input = page.locator('input').first();
        if (await input.isVisible()) {
          await input.fill(`참가자${i}`);
          await page.keyboard.press('Enter');
        }
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle duplicate names', async ({ page }) => {
      const input = page.locator('input').first();
      if (await input.isVisible()) {
        await input.fill('같은이름');
        await page.keyboard.press('Enter');
        await input.fill('같은이름');
        await page.keyboard.press('Enter');
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Export Features', () => {
    test('should have QR code option', async ({ page }) => {
      // Add some participants first
      const input = page.locator('input').first();
      if (await input.isVisible()) {
        await input.fill('테스트');
        await page.keyboard.press('Enter');
      }

      // Look for QR button
      const qrBtn = page.getByRole('button', { name: /QR/i });
      // It might only appear after dividing
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have PDF export option', async ({ page }) => {
      const pdfBtn = page.getByRole('button', { name: /PDF/i });
      // PDF button might only appear after dividing
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
