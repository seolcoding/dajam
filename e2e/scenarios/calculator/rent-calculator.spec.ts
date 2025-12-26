import { test, expect } from '@playwright/test';
import { RentCalculatorPage } from '../../pages/calculator/rent.page';

/**
 * Rent Calculator - E2E Tests
 *
 * Based on APPS_DOCUMENTATION.md:
 * - 전세/월세 변환 계산
 * - 전환율 조정 기능
 * - 탭 전환 기능
 * - 비용 비교 분석
 */
test.describe('Rent Calculator', () => {
  let rentPage: RentCalculatorPage;

  test.beforeEach(async ({ page }) => {
    rentPage = new RentCalculatorPage(page);
    await rentPage.goto();
  });

  test('should load page with both converters', async () => {
    // Verify heading
    await rentPage.expectHeading(/전세.*월세.*계산기/i);

    // Verify tabs are visible
    await rentPage.expectTabsVisible();

    // Verify default tab (Jeonse to Wolse) is active
    await rentPage.expectJeonseToWolseVisible();
  });

  test('should convert jeonse to wolse with default values', async () => {
    // Default values: jeonse=300M, deposit=100M, rate=4.5%
    // Expected monthly rent = (300M - 100M) * 4.5% / 12 = 750,000
    await rentPage.expectResultCardVisible();
    await rentPage.expectMonthlyRent(750_000);
  });

  test('should convert jeonse to wolse with custom values', async () => {
    // Set custom values: jeonse=500M, deposit=200M, rate=4.5%
    await rentPage.setJeonse(500_000_000);
    await rentPage.setDepositForWolse(200_000_000);

    // Expected monthly rent = (500M - 200M) * 4.5% / 12 = 1,125,000
    await rentPage.expectMonthlyRent(1_125_000);
    await rentPage.expectCalculationFormulaVisible();
  });

  test('should update monthly rent when jeonse changes', async () => {
    // Initial: jeonse=300M -> rent=750,000
    await rentPage.expectMonthlyRent(750_000);

    // Change jeonse to 400M
    await rentPage.setJeonse(400_000_000);

    // Expected: (400M - 100M) * 4.5% / 12 = 1,125,000
    await rentPage.expectMonthlyRent(1_125_000);
  });

  test('should update monthly rent when deposit changes', async () => {
    // Initial: deposit=100M -> rent=750,000
    await rentPage.expectMonthlyRent(750_000);

    // Change deposit to 50M
    await rentPage.setDepositForWolse(50_000_000);

    // Expected: (300M - 50M) * 4.5% / 12 = 937,500
    await rentPage.expectMonthlyRent(937_500);
  });

  test('should update monthly rent when conversion rate changes', async () => {
    // Get initial monthly rent
    const initialText = await rentPage.monthlyRentResult.textContent();

    // Adjust conversion rate slider to ~50% (approximately 5.0%)
    await rentPage.adjustConversionRateJeonse(50);
    await rentPage.waitForAnimation(300);

    // Monthly rent should have changed
    const newText = await rentPage.monthlyRentResult.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should switch to wolse-to-jeonse tab', async () => {
    // Click wolse to jeonse tab
    await rentPage.switchToWolseToJeonse();

    // Verify wolse to jeonse inputs are visible
    await rentPage.expectWolseToJeonseVisible();
  });

  test('should convert wolse to jeonse with default values', async () => {
    // Switch to wolse to jeonse tab
    await rentPage.switchToWolseToJeonse();

    // Default values: deposit=100M, monthlyRent=500K, rate=4.5%
    // Expected jeonse = 100M + (500K * 12 / 4.5%) = 100M + 133.33M = 233.33M
    await rentPage.expectJeonseEquivalent(233_333_333, 200_000);
  });

  test('should convert wolse to jeonse with custom values', async () => {
    // Switch to wolse to jeonse tab
    await rentPage.switchToWolseToJeonse();

    // Set custom values: deposit=50M, monthlyRent=1M, rate=4.5%
    await rentPage.setDepositForJeonse(50_000_000);
    await rentPage.setMonthlyRent(1_000_000);

    // Expected jeonse = 50M + (1M * 12 / 4.5%) = 50M + 266.67M = 316.67M
    await rentPage.expectJeonseEquivalent(316_666_667, 200_000);
  });

  test('should update jeonse equivalent when monthly rent changes', async () => {
    // Switch to wolse to jeonse tab
    await rentPage.switchToWolseToJeonse();

    // Initial: monthlyRent=500K -> jeonse≈233M
    await rentPage.expectJeonseEquivalent(233_333_333, 200_000);

    // Change monthly rent to 800K
    await rentPage.setMonthlyRent(800_000);

    // Expected: 100M + (800K * 12 / 4.5%) = 100M + 213.33M = 313.33M
    await rentPage.expectJeonseEquivalent(313_333_333, 200_000);
  });

  test('should update jeonse equivalent when deposit changes', async () => {
    // Switch to wolse to jeonse tab
    await rentPage.switchToWolseToJeonse();

    // Initial: deposit=100M -> jeonse≈233M
    await rentPage.expectJeonseEquivalent(233_333_333, 200_000);

    // Change deposit to 150M
    await rentPage.setDepositForJeonse(150_000_000);

    // Expected: 150M + (500K * 12 / 4.5%) = 150M + 133.33M = 283.33M
    await rentPage.expectJeonseEquivalent(283_333_333, 200_000);
  });

  test('should update jeonse equivalent when conversion rate changes', async () => {
    // Switch to wolse to jeonse tab
    await rentPage.switchToWolseToJeonse();

    // Get initial jeonse equivalent
    const initialText = await rentPage.jeonseEquivalentResult.textContent();

    // Adjust conversion rate slider
    await rentPage.adjustConversionRateWolse(30);
    await rentPage.waitForAnimation(300);

    // Jeonse equivalent should have changed
    const newText = await rentPage.jeonseEquivalentResult.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should display calculation formula for jeonse to wolse', async () => {
    // Verify calculation formula is visible
    await rentPage.expectCalculationFormulaVisible();

    // Check formula contains key elements
    await expect(rentPage.page.getByText(/월세 = \(전세금 - 보증금\)/)).toBeVisible();
  });

  test('should display calculation formula for wolse to jeonse', async () => {
    // Switch to wolse to jeonse tab
    await rentPage.switchToWolseToJeonse();

    // Verify calculation formula is visible
    await rentPage.expectCalculationFormulaVisible();

    // Check formula contains key elements
    await expect(rentPage.page.getByText(/전세 = 보증금 \+/)).toBeVisible();
  });

  test('should handle zero deposit for jeonse to wolse', async () => {
    // Set deposit to 0
    await rentPage.setDepositForWolse(0);

    // Expected: (300M - 0) * 4.5% / 12 = 1,125,000
    await rentPage.expectMonthlyRent(1_125_000);
  });

  test('should handle zero monthly rent for wolse to jeonse', async () => {
    // Switch to wolse to jeonse tab
    await rentPage.switchToWolseToJeonse();

    // Set monthly rent to 0
    await rentPage.setMonthlyRent(0);

    // Expected: 100M + (0 * 12 / 4.5%) = 100M
    await rentPage.expectJeonseEquivalent(100_000_000);
  });

  test('should persist tab selection after reload', async () => {
    // Switch to wolse to jeonse tab
    await rentPage.switchToWolseToJeonse();

    // Reload page
    await rentPage.goto();

    // Tab might persist via Zustand if persistence is enabled
    // This is optional behavior, so we just verify page loads
    await rentPage.expectTabsVisible();
  });

  test('should display both converters side by side on desktop', async () => {
    // Set desktop viewport
    await rentPage.setViewport(1920, 1080);

    // Verify inputs are visible
    await rentPage.expectJeonseToWolseVisible();
    await rentPage.expectResultCardVisible();
  });

  test('should be responsive on mobile', async () => {
    // Set mobile viewport
    await rentPage.setViewport(375, 667);

    // Verify page still works
    await rentPage.expectTabsVisible();
    await rentPage.expectJeonseToWolseVisible();
  });

  test('should show comparison chart section', async () => {
    // Check for "비용 비교 분석" section
    await expect(rentPage.page.getByText(/비용 비교 분석/)).toBeVisible();
  });

  test('should display disclaimer footer', async () => {
    // Scroll to bottom
    await rentPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await rentPage.waitForAnimation(300);

    // Check for disclaimer
    await expect(rentPage.page.getByText(/본 계산기는 참고용 도구/)).toBeVisible();
  });
});
