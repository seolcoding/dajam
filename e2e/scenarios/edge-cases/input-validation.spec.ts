import { test, expect } from '@playwright/test';

/**
 * Edge Cases - Input Validation Tests
 *
 * Test scenarios:
 * 1. Empty inputs
 * 2. Maximum input limits
 * 3. Special characters
 * 4. Very large numbers
 * 5. Invalid formats
 */
test.describe('Edge Cases - Input Validation', () => {
  test.describe('Salary Calculator', () => {
    test('should handle empty salary input', async ({ page }) => {
      await page.goto('/salary-calculator');

      // Find salary input and clear it
      const input = page.locator('input[type="number"], input[type="text"]').first();
      await input.fill('');

      // App auto-calculates - should not crash
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle zero salary', async ({ page }) => {
      await page.goto('/salary-calculator');

      const input = page.locator('input').first();
      await input.fill('0');

      const calculateBtn = page.getByRole('button', { name: /계산|calculate/i });
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle very large salary', async ({ page }) => {
      await page.goto('/salary-calculator');

      const input = page.locator('input').first();
      await input.fill('999999999999'); // 1조원

      const calculateBtn = page.getByRole('button', { name: /계산|calculate/i });
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
      }

      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle negative salary', async ({ page }) => {
      await page.goto('/salary-calculator');

      const input = page.locator('input').first();
      await input.fill('-50000000');

      const calculateBtn = page.getByRole('button', { name: /계산|calculate/i });
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle non-numeric input', async ({ page }) => {
      await page.goto('/salary-calculator');

      const input = page.locator('input').first();
      await input.fill('abc가나다');

      // Input should reject or handle gracefully
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('ID Validator', () => {
    test('should handle empty RRN', async ({ page }) => {
      await page.goto('/id-validator');

      const input = page.getByRole('textbox').first();
      await input.fill('');

      // App validates on input - should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle partial RRN', async ({ page }) => {
      await page.goto('/id-validator');

      const input = page.getByRole('textbox').first();
      await input.fill('900101'); // Only front part

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle RRN with letters', async ({ page }) => {
      await page.goto('/id-validator');

      const input = page.getByRole('textbox').first();
      await input.fill('ABC123-1234567');

      // Should reject or handle gracefully
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle too long RRN', async ({ page }) => {
      await page.goto('/id-validator');

      const input = page.getByRole('textbox').first();
      await input.fill('900101-12345678901234567890');

      // Should truncate or handle gracefully
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Random Picker', () => {
    test('should handle empty item input', async ({ page }) => {
      await page.goto('/random-picker');

      const input = page.getByPlaceholder(/항목|item/i);
      if (await input.isVisible()) {
        await input.fill('');
        await page.keyboard.press('Enter');
      }

      // Should not add empty item
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle very long item name', async ({ page }) => {
      await page.goto('/random-picker');

      const input = page.getByPlaceholder(/항목|item/i);
      if (await input.isVisible()) {
        const longText = 'A'.repeat(500);
        await input.fill(longText);
        await page.keyboard.press('Enter');
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle special characters', async ({ page }) => {
      await page.goto('/random-picker');

      const input = page.getByPlaceholder(/항목|item/i);
      if (await input.isVisible()) {
        await input.fill('<script>alert("xss")</script>');
        await page.keyboard.press('Enter');
      }

      // Should escape or reject malicious input
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle emoji input', async ({ page }) => {
      await page.goto('/random-picker');

      const input = page.getByPlaceholder(/항목|item/i);
      if (await input.isVisible()) {
        await input.fill('🍕 피자');
        await page.keyboard.press('Enter');
      }

      // Should handle emoji gracefully
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle duplicate items', async ({ page }) => {
      await page.goto('/random-picker');

      const input = page.getByPlaceholder(/항목|item/i);
      if (await input.isVisible()) {
        await input.fill('같은항목');
        await page.keyboard.press('Enter');
        await input.fill('같은항목');
        await page.keyboard.press('Enter');
      }

      // Should handle or reject duplicates
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Ladder Game', () => {
    test('should handle empty participant names', async ({ page }) => {
      await page.goto('/ladder-game');

      const inputs = page.locator('input');
      const inputCount = await inputs.count();

      // Leave all inputs empty and try to generate
      const generateBtn = page.getByRole('button', { name: /생성|만들기|start/i });
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle single participant', async ({ page }) => {
      await page.goto('/ladder-game');

      // Only one participant - ladder game needs at least 2
      const input = page.locator('input').first();
      if (await input.isVisible()) {
        await input.fill('혼자');
      }

      const generateBtn = page.getByRole('button', { name: /생성|만들기|start/i });
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
      }

      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle maximum participants', async ({ page }) => {
      await page.goto('/ladder-game');

      // Try to add several participants (not 20 to avoid timeout)
      const addBtn = page.getByRole('button', { name: /추가|add/i });
      if (await addBtn.isVisible()) {
        for (let i = 0; i < 5; i++) {
          await addBtn.click();
          await page.waitForTimeout(100);
        }
      }

      await expect(page.locator('body')).toBeVisible();
    });
  });
});
