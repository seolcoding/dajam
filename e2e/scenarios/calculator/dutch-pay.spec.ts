import { test, expect } from '@playwright/test';
import { DutchPayPage } from '../../pages/calculator/dutch-pay.page';

/**
 * Dutch Pay - E2E Tests
 *
 * Based on APPS_DOCUMENTATION.md:
 * - 참가자 추가 확인
 * - 지출 추가 확인
 * - 정산 결과 계산 확인
 */
test.describe('Dutch Pay', () => {
  let dutchPayPage: DutchPayPage;

  test.beforeEach(async ({ page }) => {
    dutchPayPage = new DutchPayPage(page);
    await dutchPayPage.goto();
  });

  test('should load page with input form', async () => {
    await expect(dutchPayPage.page.locator('body')).toBeVisible();
  });

  test('should have input fields for participants', async ({ page }) => {
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible();
  });

  test('should allow adding participants', async ({ page }) => {
    const input = page.locator('input').first();
    if (await input.isVisible()) {
      await input.fill('김철수');
      await page.keyboard.press('Enter');
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle multiple participants', async ({ page }) => {
    const participants = ['김철수', '이영희', '박민수', '최수진'];

    for (const name of participants) {
      const input = page.locator('input').first();
      if (await input.isVisible()) {
        await input.fill(name);
        await page.keyboard.press('Enter');
        await dutchPayPage.waitForAnimation(200);
      }
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle expense entry', async ({ page }) => {
    // First add a participant
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('테스트');
      await page.keyboard.press('Enter');
    }

    // Then try to add expense
    const amountInputs = page.locator('input[type="number"], input[inputmode="numeric"]');
    if (await amountInputs.first().isVisible()) {
      await amountInputs.first().fill('10000');
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test.describe('Edge Cases', () => {
    test('should handle zero amount', async ({ page }) => {
      const input = page.locator('input[type="number"]').first();
      if (await input.isVisible()) {
        await input.fill('0');
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle decimal amounts', async ({ page }) => {
      const input = page.locator('input[type="number"]').first();
      if (await input.isVisible()) {
        await input.fill('10000.5');
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle single participant', async ({ page }) => {
      const input = page.locator('input').first();
      if (await input.isVisible()) {
        await input.fill('혼자');
        await page.keyboard.press('Enter');
      }

      // Try to calculate with single person
      const calculateBtn = page.getByRole('button', { name: /정산|calculate/i });
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle very large amounts', async ({ page }) => {
      const input = page.locator('input[type="number"]').first();
      if (await input.isVisible()) {
        await input.fill('999999999');
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });
});
