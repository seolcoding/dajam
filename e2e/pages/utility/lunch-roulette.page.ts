import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Lunch Roulette Page Object
 *
 * 테스트 시나리오:
 * - 2단계 룰렛 (카테고리 → 음식점)
 * - 검색 반경 필터
 * - 음식점 정보 표시
 * - 카카오맵 연동 (API 사용 가능 시)
 */
export class LunchRoulettePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get loadingIndicator() {
    return this.page.getByText(/위치 정보를 가져오는 중/);
  }

  get locationError() {
    return this.page.getByText(/위치 정보 필요/);
  }

  get retryButton() {
    return this.page.getByRole('button', { name: /다시 시도/ });
  }

  // Category Roulette (Step 1)
  get categoryTitle() {
    return this.page.getByRole('heading', { name: /점심 메뉴 룰렛/ });
  }

  get categoryWheel() {
    // Canvas element for the roulette wheel
    return this.page.locator('canvas').first();
  }

  get categorySpinButton() {
    return this.page.getByRole('button', { name: /룰렛 돌리기|룰렛 돌리는 중/ });
  }

  // Filter Panel
  get filterPanel() {
    return this.page.locator('.bg-white.p-6.rounded-xl:has-text("검색 반경 설정")');
  }

  radiusButton(radius: string) {
    return this.page.getByRole('button', { name: radius });
  }

  // Restaurant Roulette (Step 2)
  get restaurantTitle() {
    return this.page.getByRole('heading', { name: /음식점 룰렛/ });
  }

  get restaurantWheel() {
    // Canvas element (second one after category selection)
    return this.page.locator('canvas').first();
  }

  get restaurantSpinButton() {
    return this.page.getByRole('button', { name: /음식점 뽑기|음식점 고르는 중/ });
  }

  get restaurantCount() {
    return this.page.locator('p:has-text("개의 음식점을 찾았습니다")');
  }

  get backToCategoryButton() {
    return this.page.getByRole('button', { name: /카테고리 다시 선택/ }).first();
  }

  get noRestaurantsMessage() {
    return this.page.getByText(/주변에.*음식점이 없습니다/);
  }

  // Result (Step 3)
  get resultTitle() {
    return this.page.getByRole('heading', { name: /오늘의 점심 메뉴는/ });
  }

  get selectedCategory() {
    return this.page.locator('.text-2xl.font-bold.text-orange-600');
  }

  get restaurantCard() {
    return this.page.locator('.p-8.space-y-6.border-gray-200');
  }

  get restaurantName() {
    return this.restaurantCard.locator('.text-3xl.font-bold.text-gray-900');
  }

  get restaurantAddress() {
    return this.restaurantCard.getByText(/현재 위치에서/);
  }

  get restaurantPhone() {
    return this.restaurantCard.locator('a[href^="tel:"]');
  }

  get kakaoMapLink() {
    return this.restaurantCard.getByRole('link', { name: /카카오맵에서 보기/ });
  }

  get resetButton() {
    return this.page.getByRole('button', { name: /처음부터 다시/ });
  }

  // Actions
  async goto() {
    await super.goto('/lunch-roulette');
    // Wait for either loading or content to appear
    await this.page.waitForLoadState('networkidle');
  }

  async waitForLocationLoading() {
    // Wait for loading to disappear (max 10 seconds)
    await this.page.waitForTimeout(1000);
  }

  async selectRadius(radius: string) {
    await this.radiusButton(radius).click();
    await this.waitForAnimation(300);
  }

  async spinCategory() {
    await this.categorySpinButton.click();
    // Wait for wheel animation (0.8s) + transition
    await this.waitForAnimation(2000);
  }

  async spinRestaurant() {
    await this.restaurantSpinButton.click();
    // Wait for wheel animation (1.2s) + transition
    await this.waitForAnimation(3000);
  }

  async goBackToCategory() {
    await this.backToCategoryButton.click();
    await this.waitForAnimation(500);
  }

  async resetToStart() {
    await this.resetButton.click();
    await this.waitForAnimation(500);
  }

  // Assertions
  async expectLoadingVisible() {
    await expect(this.loadingIndicator).toBeVisible({ timeout: 5000 });
  }

  async expectLocationErrorVisible() {
    await expect(this.locationError).toBeVisible({ timeout: 5000 });
  }

  async expectCategoryStepVisible() {
    await expect(this.categoryTitle).toBeVisible({ timeout: 5000 });
    await expect(this.categoryWheel).toBeVisible({ timeout: 5000 });
  }

  async expectFilterPanelVisible() {
    await expect(this.filterPanel).toBeVisible({ timeout: 5000 });
  }

  async expectRadiusSelected(radius: string) {
    const button = this.radiusButton(radius);
    await expect(button).toHaveClass(/bg-orange-600/, { timeout: 3000 });
  }

  async expectRestaurantStepVisible(categoryName?: string) {
    await expect(this.restaurantTitle).toBeVisible({ timeout: 5000 });
    if (categoryName) {
      await expect(this.restaurantTitle).toContainText(categoryName);
    }
  }

  async expectRestaurantCountVisible() {
    await expect(this.restaurantCount).toBeVisible({ timeout: 5000 });
  }

  async expectNoRestaurantsMessage() {
    await expect(this.noRestaurantsMessage).toBeVisible({ timeout: 5000 });
  }

  async expectResultVisible() {
    await expect(this.resultTitle).toBeVisible({ timeout: 5000 });
    await expect(this.restaurantCard).toBeVisible({ timeout: 5000 });
  }

  async expectRestaurantInfoDisplayed() {
    await expect(this.restaurantName).toBeVisible({ timeout: 5000 });
    await expect(this.restaurantAddress).toBeVisible({ timeout: 5000 });
  }

  async expectKakaoMapLinkVisible() {
    await expect(this.kakaoMapLink).toBeVisible({ timeout: 5000 });
    await expect(this.kakaoMapLink).toHaveAttribute('href', /place\.kakao\.com/);
  }

  async expectCategoryDisplayed(categoryEmoji: string) {
    await expect(this.selectedCategory).toContainText(categoryEmoji);
  }
}
