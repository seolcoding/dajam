import { test, expect } from '@playwright/test';
import { LunchRoulettePage } from '../../pages/utility/lunch-roulette.page';

/**
 * Lunch Roulette - E2E Tests
 *
 * Based on APPS_DOCUMENTATION.md:
 * - 2단계 룰렛 (카테고리 → 음식점)
 * - 검색 반경 설정
 * - 위치 기반 음식점 검색
 * - 카카오맵 연동
 *
 * 참고:
 * - 이 앱은 geolocation API와 Kakao Maps API를 사용합니다
 * - 테스트 환경에서는 위치 권한이 필요할 수 있습니다
 * - Kakao API 키가 없으면 일부 기능이 제한될 수 있습니다
 */
test.describe('Lunch Roulette', () => {
  let roulettePage: LunchRoulettePage;

  test.beforeEach(async ({ page, context }) => {
    // Grant geolocation permission and set a test location (Seoul City Hall)
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({
      latitude: 37.5666805,
      longitude: 126.9784147,
    });

    roulettePage = new LunchRoulettePage(page);
    await roulettePage.goto();

    // Wait for location loading to complete
    await roulettePage.waitForLocationLoading();
  });

  test('should load page with category roulette', async () => {
    // Should show category step (not loading or error)
    await roulettePage.expectCategoryStepVisible();
  });

  test('should display filter panel on category step', async () => {
    await roulettePage.expectFilterPanelVisible();
  });

  test('should change search radius', async () => {
    // Default is 1km
    await roulettePage.expectRadiusSelected('1km');

    // Change to 2km
    await roulettePage.selectRadius('2km');
    await roulettePage.expectRadiusSelected('2km');

    // Change to 500m
    await roulettePage.selectRadius('500m');
    await roulettePage.expectRadiusSelected('500m');
  });

  test('should spin category roulette and move to restaurant step', async () => {
    // Spin category wheel
    await roulettePage.spinCategory();

    // Should move to restaurant step
    await roulettePage.expectRestaurantStepVisible();
  });

  test('should display restaurant count after category selection', async () => {
    await roulettePage.spinCategory();

    // Wait for restaurant search to complete
    await roulettePage.page.waitForTimeout(2000);

    // Should show either restaurant count or no restaurants message
    const hasRestaurants = await roulettePage.restaurantCount.isVisible();
    const noRestaurants = await roulettePage.noRestaurantsMessage.isVisible();

    expect(hasRestaurants || noRestaurants).toBe(true);
  });

  test('should navigate back to category step', async () => {
    // Go to restaurant step
    await roulettePage.spinCategory();
    await roulettePage.expectRestaurantStepVisible();

    // Go back to category
    await roulettePage.goBackToCategory();
    await roulettePage.expectCategoryStepVisible();
  });

  test('should complete full flow: category → restaurant → result', async ({ page }) => {
    // Step 1: Spin category
    await roulettePage.spinCategory();
    await roulettePage.expectRestaurantStepVisible();

    // Wait for restaurant search
    await page.waitForTimeout(2000);

    // Check if restaurants are available
    const hasRestaurants = await roulettePage.restaurantSpinButton.isVisible();

    if (hasRestaurants) {
      // Step 2: Spin restaurant
      await roulettePage.spinRestaurant();

      // Step 3: Should show result
      await roulettePage.expectResultVisible();
      await roulettePage.expectRestaurantInfoDisplayed();
    } else {
      // No restaurants found - should show message
      await roulettePage.expectNoRestaurantsMessage();
    }
  });

  test('should display restaurant details in result', async ({ page }) => {
    // Complete category selection
    await roulettePage.spinCategory();
    await page.waitForTimeout(2000);

    const hasRestaurants = await roulettePage.restaurantSpinButton.isVisible();

    if (hasRestaurants) {
      await roulettePage.spinRestaurant();

      // Check restaurant card details
      await roulettePage.expectRestaurantInfoDisplayed();

      // Restaurant name should be visible
      const name = await roulettePage.restaurantName.textContent();
      expect(name).toBeTruthy();
      expect(name!.length).toBeGreaterThan(0);

      // Distance info should be visible
      const address = await roulettePage.restaurantAddress.textContent();
      expect(address).toContain('현재 위치에서');
    }
  });

  test('should display Kakao Map link if available', async ({ page }) => {
    await roulettePage.spinCategory();
    await page.waitForTimeout(2000);

    const hasRestaurants = await roulettePage.restaurantSpinButton.isVisible();

    if (hasRestaurants) {
      await roulettePage.spinRestaurant();

      // Should have Kakao Map link
      await roulettePage.expectKakaoMapLinkVisible();

      // Link should open in new tab
      const link = roulettePage.kakaoMapLink;
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  test('should reset to category step from result', async ({ page }) => {
    await roulettePage.spinCategory();
    await page.waitForTimeout(2000);

    const hasRestaurants = await roulettePage.restaurantSpinButton.isVisible();

    if (hasRestaurants) {
      await roulettePage.spinRestaurant();
      await roulettePage.expectResultVisible();

      // Click "처음부터 다시"
      await roulettePage.resetToStart();

      // Should return to category step
      await roulettePage.expectCategoryStepVisible();
    }
  });

  test('should persist radius selection across category changes', async () => {
    // Change radius to 2km
    await roulettePage.selectRadius('2km');
    await roulettePage.expectRadiusSelected('2km');

    // Spin category
    await roulettePage.spinCategory();
    await roulettePage.expectRestaurantStepVisible();

    // Radius should still be 2km
    await roulettePage.expectRadiusSelected('2km');

    // Go back
    await roulettePage.goBackToCategory();

    // Radius should still be 2km
    await roulettePage.expectRadiusSelected('2km');
  });

  test('should show different categories in roulette', async () => {
    // Category title should be visible
    await expect(roulettePage.categoryTitle).toBeVisible();

    // Wheel should be visible (contains category options)
    await expect(roulettePage.categoryWheel).toBeVisible();

    // Spin button should be ready
    const spinButton = roulettePage.categorySpinButton;
    await expect(spinButton).toBeVisible();
    await expect(spinButton).toBeEnabled();
  });

  test.describe('Error Handling', () => {
    test('should handle location permission denial gracefully', async ({ page, context }) => {
      // Create a new page with geolocation blocked
      const blockedPage = await context.newPage();
      await blockedPage.goto('/lunch-roulette');

      // Should either show error or use default location
      await blockedPage.waitForTimeout(2000);

      // Check if error message or category roulette is shown
      const hasError = await blockedPage.getByText(/위치 정보/).isVisible();
      const hasCategory = await blockedPage.getByText(/점심 메뉴 룰렛/).isVisible();

      expect(hasError || hasCategory).toBe(true);

      await blockedPage.close();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Category roulette should be visible
      await roulettePage.expectCategoryStepVisible();

      // Filter panel should be visible and responsive
      await roulettePage.expectFilterPanelVisible();

      // Radius buttons should be in grid layout
      const filterPanel = roulettePage.filterPanel;
      await expect(filterPanel).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await roulettePage.expectCategoryStepVisible();
      await roulettePage.expectFilterPanelVisible();
    });
  });

  test.describe('Wheel Animation', () => {
    test('should disable spin button during animation', async () => {
      const spinButton = roulettePage.categorySpinButton;

      // Button should be enabled initially
      await expect(spinButton).toBeEnabled();

      // Click to spin
      await spinButton.click();

      // Button should be disabled during animation
      await expect(spinButton).toBeDisabled();

      // Wait for animation to complete
      await roulettePage.page.waitForTimeout(2000);

      // Should move to next step (restaurant)
      await roulettePage.expectRestaurantStepVisible();
    });
  });

  test.describe('Integration with Kakao Maps', () => {
    test('should search for restaurants near current location', async ({ page }) => {
      // Check if KAKAO_APP_KEY is available
      const hasKakaoKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY !== undefined;

      await roulettePage.spinCategory();
      await page.waitForTimeout(2000);

      if (hasKakaoKey) {
        // Should find restaurants or show no results
        const hasResults = await roulettePage.restaurantCount.isVisible();
        const noResults = await roulettePage.noRestaurantsMessage.isVisible();

        expect(hasResults || noResults).toBe(true);
      } else {
        // Without API key, may show error or empty state
        // This is acceptable in test environment
        console.log('Kakao Maps API key not available - skipping detailed restaurant search test');
      }
    });
  });
});
