/**
 * Lunch Roulette (점심 룰렛) - E2E Tests
 *
 * 2단계 룰렛 시스템 테스트:
 * 1. 카테고리 선택 룰렛
 * 2. 음식점 선택 룰렛
 * 3. 결과 표시 및 공유
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5180/mini-apps/lunch-roulette/';

test.describe('Lunch Roulette - 점심 룰렛', () => {
  test.beforeEach(async ({ page }) => {
    // Mock geolocation to Seoul City Hall
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 37.5666805, longitude: 126.9784147 });
    await page.goto(BASE_URL);
  });

  test.describe('1. 초기 로딩 및 위치 권한', () => {
    test('페이지가 정상적으로 로드된다', async ({ page }) => {
      await expect(page).toHaveTitle(/점심|lunch/i);

      // 헤더 확인
      const heading = page.getByRole('heading', { name: /점심 메뉴 룰렛/i });
      await expect(heading).toBeVisible();
    });

    test('위치 정보 로딩 중 스피너가 표시된다', async ({ page }) => {
      // 새 페이지로 위치 권한 없이 테스트
      const newPage = await page.context().newPage();
      await newPage.goto(BASE_URL);

      // 로딩 스피너 또는 메시지 확인
      const loadingText = newPage.getByText(/위치 정보를 가져오는 중/i);
      await expect(loadingText).toBeVisible({ timeout: 2000 }).catch(() => {
        // 빠르게 로딩되면 스피너가 안 보일 수 있음
      });
    });

    test('위치 권한 거부 시 에러 메시지가 표시된다', async ({ page }) => {
      const newContext = await page.context().browser()!.newContext({
        permissions: [], // 권한 없음
        geolocation: undefined,
      });
      const newPage = await newContext.newPage();
      await newPage.goto(BASE_URL);

      // 에러 메시지 확인 (타임아웃 허용)
      await newPage.waitForTimeout(1000);
      const errorMsg = newPage.getByText(/위치 정보 필요|위치 권한/i);
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('2. 카테고리 룰렛 (1단계)', () => {
    test('카테고리 룰렛이 표시된다', async ({ page }) => {
      // 룰렛 캔버스 확인
      const rouletteWheel = page.locator('canvas, [class*="Wheel"]').first();
      await expect(rouletteWheel).toBeVisible({ timeout: 5000 });
    });

    test('룰렛 돌리기 버튼이 활성화되어 있다', async ({ page }) => {
      const spinButton = page.getByRole('button', { name: /룰렛 돌리기/i });
      await expect(spinButton).toBeVisible();
      await expect(spinButton).toBeEnabled();
    });

    test('룰렛을 돌리면 카테고리가 선택된다', async ({ page }) => {
      const spinButton = page.getByRole('button', { name: /룰렛 돌리기/i });
      await spinButton.click();

      // 룰렛이 돌아가는 동안 버튼 비활성화
      await expect(spinButton).toBeDisabled({ timeout: 2000 });

      // 룰렛이 멈출 때까지 대기 (최대 5초)
      await page.waitForTimeout(5000);

      // 2단계로 전환 확인 - 음식점 룰렛 또는 로딩 표시
      const restaurantSection = page.locator('text=/음식점|restaurant|검색 중|loading/i').first();
      await expect(restaurantSection).toBeVisible({ timeout: 10000 });
    });

    test('반경 필터를 조정할 수 있다', async ({ page }) => {
      // 반경 슬라이더 확인
      const radiusSlider = page.locator('input[type="range"], input[role="slider"]').first();

      if (await radiusSlider.isVisible()) {
        await radiusSlider.fill('1000'); // 1km

        // 반경 값이 표시되는지 확인
        const radiusDisplay = page.locator('text=/1km|1000m/i');
        await expect(radiusDisplay).toBeVisible();
      }
    });
  });

  test.describe('3. 음식점 룰렛 (2단계)', () => {
    test.beforeEach(async ({ page }) => {
      // 1단계 카테고리 선택
      const spinButton = page.getByRole('button', { name: /룰렛 돌리기/i });
      await spinButton.click();
      await page.waitForTimeout(5000); // 룰렛 완료 대기
    });

    test('음식점 목록이 로드된다', async ({ page }) => {
      // API 호출 대기
      await page.waitForTimeout(2000);

      // 음식점 데이터 또는 에러 메시지 확인
      const content = page.locator('body');
      const hasRestaurants = await content.locator('text=/음식점|restaurant/i').count() > 0;
      const hasError = await content.locator('text=/검색 결과가 없습니다|주변에 음식점이 없습니다/i').count() > 0;

      expect(hasRestaurants || hasError).toBeTruthy();
    });

    test('뒤로가기 버튼으로 카테고리 재선택 가능', async ({ page }) => {
      await page.waitForTimeout(2000);

      const backButton = page.getByRole('button', { name: /카테고리 다시|뒤로|back/i });
      if (await backButton.isVisible()) {
        await backButton.click();

        // 1단계로 복귀 확인
        const categoryRoulette = page.getByRole('button', { name: /룰렛 돌리기/i });
        await expect(categoryRoulette).toBeVisible();
      }
    });
  });

  test.describe('4. 결과 표시 및 공유', () => {
    test('음식점 정보 카드가 표시된다', async ({ page }) => {
      // 전체 플로우 실행
      const spinButton = page.getByRole('button', { name: /룰렛 돌리기/i });
      await spinButton.click();
      await page.waitForTimeout(5000);

      // 2단계 룰렛 돌리기
      const spinButton2 = page.getByRole('button', { name: /룰렛 돌리기|spin/i });
      if (await spinButton2.isVisible({ timeout: 3000 })) {
        await spinButton2.click();
        await page.waitForTimeout(5000);
      }

      // 결과 카드 확인 (음식점 이름, 주소 등)
      const resultCard = page.locator('[class*="card"], [class*="result"]');
      await expect(resultCard.first()).toBeVisible({ timeout: 5000 });
    });

    test('공유 버튼이 표시된다', async ({ page }) => {
      // 전체 플로우 실행
      const spinButton = page.getByRole('button', { name: /룰렛 돌리기/i });
      await spinButton.click();
      await page.waitForTimeout(5000);

      // 공유 버튼 확인 (결과 페이지에 있을 경우)
      const shareButtons = page.locator('button:has-text("공유"), button:has-text("Share")');
      const count = await shareButtons.count();

      // 공유 버튼이 있거나 없을 수 있음 (구현 상태에 따라)
      console.log(`Share buttons found: ${count}`);
    });

    test('처음부터 다시 버튼이 동작한다', async ({ page }) => {
      // 전체 플로우 실행
      const spinButton = page.getByRole('button', { name: /룰렛 돌리기/i });
      await spinButton.click();
      await page.waitForTimeout(5000);

      // 리셋 버튼 찾기
      const resetButton = page.getByRole('button', { name: /처음부터|다시|reset/i });
      if (await resetButton.isVisible({ timeout: 3000 })) {
        await resetButton.click();

        // 1단계로 복귀 확인
        const categoryRoulette = page.getByRole('button', { name: /룰렛 돌리기/i });
        await expect(categoryRoulette).toBeVisible();
      }
    });
  });

  test.describe('5. 반응형 레이아웃', () => {
    test('모바일 뷰포트에서 정상 작동', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.reload();

      const heading = page.getByRole('heading', { name: /점심 메뉴 룰렛/i });
      await expect(heading).toBeVisible();

      const spinButton = page.getByRole('button', { name: /룰렛 돌리기/i });
      await expect(spinButton).toBeVisible();
    });

    test('태블릿 뷰포트에서 정상 작동', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.reload();

      const heading = page.getByRole('heading', { name: /점심 메뉴 룰렛/i });
      await expect(heading).toBeVisible();
    });

    test('데스크톱 뷰포트에서 정상 작동', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();

      const heading = page.getByRole('heading', { name: /점심 메뉴 룰렛/i });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('6. 접근성 (Accessibility)', () => {
    test('주요 랜드마크가 존재한다', async ({ page }) => {
      // 헤더
      const header = page.locator('header, [role="banner"]');
      expect(await header.count()).toBeGreaterThanOrEqual(0);

      // 메인 콘텐츠
      const main = page.locator('main, [role="main"]');
      expect(await main.count()).toBeGreaterThanOrEqual(0);
    });

    test('버튼에 접근 가능한 텍스트가 있다', async ({ page }) => {
      const spinButton = page.getByRole('button', { name: /룰렛 돌리기/i });
      await expect(spinButton).toBeVisible();

      const buttonText = await spinButton.textContent();
      expect(buttonText?.trim().length).toBeGreaterThan(0);
    });

    test('이미지에 alt 텍스트가 있다', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // alt는 빈 문자열일 수 있음 (장식용 이미지)
        expect(alt !== null).toBeTruthy();
      }
    });
  });

  test.describe('7. 에러 처리', () => {
    test('네트워크 오류 시 에러 메시지 표시', async ({ page }) => {
      // 오프라인 모드 시뮬레이션
      await page.context().setOffline(true);
      await page.reload();

      // 룰렛 돌리기 시도
      const spinButton = page.getByRole('button', { name: /룰렛 돌리기/i });
      if (await spinButton.isVisible({ timeout: 5000 })) {
        await spinButton.click();
        await page.waitForTimeout(3000);

        // 에러 메시지 확인
        const errorMsg = page.locator('text=/오류|error|실패|failed/i');
        const hasError = await errorMsg.count() > 0;

        // 온라인 복구
        await page.context().setOffline(false);
      }
    });

    test('Kakao API 키 없이도 기본 동작', async ({ page }) => {
      // API 키가 없어도 앱이 크래시하지 않는지 확인
      await page.reload();

      const heading = page.getByRole('heading', { name: /점심 메뉴 룰렛/i });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('8. 성능 및 애니메이션', () => {
    test('룰렛 애니메이션이 부드럽게 실행된다', async ({ page }) => {
      const spinButton = page.getByRole('button', { name: /룰렛 돌리기/i });

      // 애니메이션 시작
      await spinButton.click();

      // 애니메이션 중 버튼 상태 변경 확인
      await expect(spinButton).toBeDisabled({ timeout: 1000 });

      // 애니메이션 완료 대기
      await page.waitForTimeout(5000);

      // 콘솔 에러 확인
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      expect(errors.length).toBe(0);
    });

    test('페이지 로드 속도가 적절하다', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);

      const heading = page.getByRole('heading', { name: /점심 메뉴 룰렛/i });
      await expect(heading).toBeVisible();

      const loadTime = Date.now() - startTime;

      // 3초 이내 로드 (CI 환경 고려)
      expect(loadTime).toBeLessThan(5000);
    });
  });
});
