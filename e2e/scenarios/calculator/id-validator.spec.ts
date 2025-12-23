import { test, expect } from '@playwright/test';
import { IdValidatorPage } from '../../pages/calculator/id-validator.page';

/**
 * ID Validator - E2E Tests
 *
 * Based on APPS_DOCUMENTATION.md:
 * - 주민번호 검증 확인
 * - 테스트 번호 생성 확인
 * - 자동 포맷팅 확인
 */
test.describe('ID Validator', () => {
  let idPage: IdValidatorPage;

  test.beforeEach(async ({ page }) => {
    idPage = new IdValidatorPage(page);
    await idPage.goto();
  });

  test('should load page with tabs', async () => {
    await expect(idPage.rrnTab).toBeVisible();
  });

  test('should validate correct RRN format', async () => {
    await idPage.selectRRN();

    // Generate a test number first - this also triggers validation
    const testNumber = await idPage.generateTestNumber();

    // Validation happens automatically after generation
    await idPage.expectValid();
  });

  test('should detect invalid RRN', async () => {
    await idPage.selectRRN();
    await idPage.enterNumber('000000-0000000');
    await idPage.validate();
    // Wait for validation result
    await idPage.waitForAnimation(500);
    await idPage.expectInvalid();
  });

  test('should generate valid test numbers', async () => {
    await idPage.selectRRN();

    const testNumber = await idPage.generateTestNumber();
    expect(testNumber).toMatch(/^\d{6}-\d{7}$/);

    // Validation happens automatically after generation
    await idPage.expectValid();
  });

  test('should auto-format RRN input', async () => {
    await idPage.selectRRN();

    // Enter without hyphen
    await idPage.enterNumber('9001011234567');

    // Should auto-format with hyphen
    await idPage.waitForAnimation(200);
    await idPage.expectFormatted(/^\d{6}-\d{7}$/);
  });

  test.describe('Business Registration Number', () => {
    test('should validate BRN format', async () => {
      await idPage.selectBRN();

      // Generate test BRN - validation happens automatically
      const testNumber = await idPage.generateTestNumber();
      await idPage.expectValid();
    });

    test('should detect invalid BRN', async () => {
      await idPage.selectBRN();
      // Enter invalid BRN that fails checksum - validation happens automatically on 10 digits
      await idPage.enterNumber('1234567890');
      await idPage.waitForAnimation(500);
      await idPage.expectInvalid();
    });
  });

  test.describe('Corporate Registration Number', () => {
    test('should validate CRN format', async () => {
      await idPage.selectCRN();

      // Generate test CRN - validation happens automatically
      const testNumber = await idPage.generateTestNumber();
      await idPage.expectValid();
    });
  });
});
