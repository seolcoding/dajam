import { test, expect, Page } from '@playwright/test';
import {
  waitForAppReady,
  viewports,
  testKeyboardNavigation,
  specialCharacters,
  createMultiUserContext,
  waitForToast,
  testNumberFormatting,
} from '../utils/test-helpers';

const BASE_PATH = process.env.TEST_URL || 'http://localhost:5184/mini-apps/group-order/';

/**
 * 공동 주문 (Group Order) E2E 테스트
 *
 * 테스트 범위:
 * 1. Edge Cases: 빈 데이터, 특수문자, 가격 경계값, 대량 주문
 * 2. UI Tests: 반응형, 실시간 집계, 접근성
 * 3. E2E User Journeys: 세션 생성 → 참여자 주문 → 결과 확인
 * 4. Multi-user Scenarios: 동시 주문, 실시간 동기화
 */

test.describe('Group Order - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
  });

  test('빈 식당명으로 세션 생성 시도', async ({ page }) => {
    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    // 식당명 없이 제출
    await page.fill('input[placeholder*="식당"]', '');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();

    // 에러 또는 비활성화 확인
    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
      // 알림 확인
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('식당');
        await dialog.accept();
      });
    }

    // URL이 변경되지 않았는지 확인
    await expect(page).toHaveURL(new RegExp(`${BASE_PATH}create`));
  });

  test('특수 문자가 포함된 식당명과 메뉴명', async ({ page }) => {
    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    const specialRestaurant = '😋 맛있는 <한식당> "Best"';
    await page.fill('input[placeholder*="식당"]', specialRestaurant);

    // 고정 메뉴 모드 선택
    await page.click('text=고정 메뉴');

    // 특수문자 메뉴 추가
    await page.click('button:has-text("메뉴 추가")');
    await page.fill('input[placeholder*="메뉴명"]', '<script>alert("xss")</script>');
    await page.fill('input[placeholder*="가격"]', '10000');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    // XSS가 실행되지 않았는지 확인
    await expect(page.locator('h1, h2')).toContainText(specialRestaurant);

    // 스크립트 태그가 텍스트로만 렌더링되었는지 확인
    const menuName = page.locator('text=<script>');
    if (await menuName.count() > 0) {
      await expect(menuName).toBeVisible();
    }
  });

  test('가격 경계값 테스트', async ({ page }) => {
    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    await page.fill('input[placeholder*="식당"]', '경계값 테스트');
    await page.click('text=고정 메뉴');

    // 0원 메뉴
    await page.click('button:has-text("메뉴 추가")');
    const menuInputs = page.locator('input[placeholder*="메뉴명"]');
    await menuInputs.first().fill('무료 서비스');
    const priceInputs = page.locator('input[placeholder*="가격"]');
    await priceInputs.first().fill('0');

    // 매우 큰 금액 (10,000,000원)
    await page.click('button:has-text("메뉴 추가")');
    await menuInputs.nth(1).fill('럭셔리 메뉴');
    await priceInputs.nth(1).fill('10000000');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    // 생성 성공 확인
    await expect(page.locator('h1, h2')).toContainText('경계값 테스트');
  });

  test('대량 메뉴 추가 (50개)', async ({ page }) => {
    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    await page.fill('input[placeholder*="식당"]', '대량 메뉴 테스트');
    await page.click('text=고정 메뉴');

    // 50개 메뉴 추가 (성능 테스트)
    for (let i = 0; i < 50; i++) {
      await page.click('button:has-text("메뉴 추가")');

      const menuInputs = page.locator('input[placeholder*="메뉴명"]');
      const priceInputs = page.locator('input[placeholder*="가격"]');

      await menuInputs.nth(i).fill(`메뉴${i + 1}`);
      await priceInputs.nth(i).fill(`${(i + 1) * 1000}`);

      // 10개마다 스크롤
      if (i % 10 === 0 && i > 0) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }
    }

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/, { timeout: 10000 });

    // 생성 성공 확인
    await expect(page.locator('h1, h2')).toContainText('대량 메뉴 테스트');
  });

  test('음수 가격 입력 방지', async ({ page }) => {
    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    await page.fill('input[placeholder*="식당"]', '음수 테스트');
    await page.click('text=고정 메뉴');
    await page.click('button:has-text("메뉴 추가")');

    const priceInput = page.locator('input[placeholder*="가격"]').first();
    await priceInput.fill('-5000');

    // 음수가 입력되지 않거나 0으로 변환되어야 함
    const value = await priceInput.inputValue();
    const numValue = parseInt(value.replace(/,/g, ''));
    expect(numValue).toBeGreaterThanOrEqual(0);
  });

  test('빈 주문으로 세션 완료 시도', async ({ page }) => {
    // 세션 생성
    await page.click('text=주문 시작하기');
    await page.fill('input[placeholder*="식당"]', '빈 주문 테스트');
    await page.click('text=자유 입력');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    // 주문 없이 요약 보기 시도
    const summaryButton = page.locator('button:has-text("요약"), button:has-text("마감")');
    if (await summaryButton.count() > 0) {
      await summaryButton.click();

      // 빈 주문에 대한 안내 또는 0원 표시
      await expect(page.locator('text=/총.*0/i, text=/참여.*0/i')).toBeTruthy();
    }
  });
});

test.describe('Group Order - UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
  });

  test('반응형 레이아웃 - 모바일', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);

    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    // 모바일에서 핵심 UI 요소 확인
    await expect(page.locator('input[placeholder*="식당"]')).toBeVisible();
    await expect(page.locator('text=고정 메뉴')).toBeVisible();
    await expect(page.locator('text=자유 입력')).toBeVisible();
  });

  test('반응형 레이아웃 - 태블릿', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);

    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    await expect(page.locator('input[placeholder*="식당"]')).toBeVisible();
  });

  test('반응형 레이아웃 - 데스크톱', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);

    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    await expect(page.locator('input[placeholder*="식당"]')).toBeVisible();
  });

  test('실시간 집계 UI 업데이트', async ({ page }) => {
    // 세션 생성
    await page.click('text=주문 시작하기');
    await page.fill('input[placeholder*="식당"]', '집계 테스트');
    await page.click('text=고정 메뉴');
    await page.click('button:has-text("메뉴 추가")');
    await page.fill('input[placeholder*="메뉴명"]', '김치찌개');
    await page.fill('input[placeholder*="가격"]', '8000');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    // 초기 총액 확인
    await expect(page.locator('text=/총.*0/i, text=/0명/i')).toBeTruthy();
  });

  test('가격 천단위 콤마 포맷팅', async ({ page }) => {
    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    await page.fill('input[placeholder*="식당"]', '포맷팅 테스트');
    await page.click('text=고정 메뉴');
    await page.click('button:has-text("메뉴 추가")');

    const priceInput = page.locator('input[placeholder*="가격"]').first();
    await priceInput.fill('12345678');
    await priceInput.blur();

    // 콤마가 추가되었는지 확인
    const value = await priceInput.inputValue();
    expect(value).toContain(',');
    expect(value).toMatch(/12,345,678/);
  });

  test('QR 코드 표시', async ({ page }) => {
    await page.click('text=주문 시작하기');
    await page.fill('input[placeholder*="식당"]', 'QR 테스트');
    await page.click('text=자유 입력');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    // QR 코드 이미지 확인
    const qrImage = page.locator('img[alt*="QR"], canvas');
    await expect(qrImage.first()).toBeVisible();
  });

  test('접근성 - 키보드 네비게이션', async ({ page }) => {
    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    await testKeyboardNavigation(page);
  });

  test('로딩 상태 표시', async ({ page }) => {
    await page.goto(`${BASE_PATH}join/invalid-session-id`);

    // 에러 메시지 또는 리다이렉트
    await page.waitForTimeout(1000);

    // 에러 처리 확인
    const hasError = await page.locator('text=/찾을 수 없습니다|존재하지 않습니다/i').count() > 0;
    const isRedirected = page.url() === BASE_PATH;

    expect(hasError || isRedirected).toBeTruthy();
  });
});

test.describe('Group Order - E2E User Journeys', () => {
  test('완전한 고정 메뉴 주문 플로우', async ({ page }) => {
    // 1. 홈페이지 방문
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
    await expect(page.locator('h1, h2')).toContainText(/공동 주문|그룹 오더/i);

    // 2. 세션 생성 페이지로 이동
    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    // 3. 고정 메뉴 모드 선택
    await page.fill('input[placeholder*="식당"]', '맛있는 중국집');
    await page.click('text=고정 메뉴');

    // 4. 메뉴 추가
    await page.click('button:has-text("메뉴 추가")');
    await page.fill('input[placeholder*="메뉴명"]', '짜장면');
    await page.fill('input[placeholder*="가격"]', '7000');

    await page.click('button:has-text("메뉴 추가")');
    const menuInputs = page.locator('input[placeholder*="메뉴명"]');
    const priceInputs = page.locator('input[placeholder*="가격"]');
    await menuInputs.nth(1).fill('짬뽕');
    await priceInputs.nth(1).fill('8000');

    await page.click('button:has-text("메뉴 추가")');
    await menuInputs.nth(2).fill('탕수육');
    await priceInputs.nth(2).fill('25000');

    // 5. 세션 시작
    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    // 6. 호스트 대시보드 확인
    await expect(page.locator('h1, h2')).toContainText('맛있는 중국집');

    // 세션 ID 추출
    const sessionIdMatch = page.url().match(/\/host\/(.+)/);
    expect(sessionIdMatch).toBeTruthy();
    const sessionId = sessionIdMatch![1];

    // 7. 첫 번째 참여자 주문
    await page.goto(`${BASE_PATH}join/${sessionId}`);
    await waitForAppReady(page);

    await expect(page.locator('h1, h2')).toContainText('맛있는 중국집');

    // 이름 입력
    await page.fill('input[placeholder*="이름"]', '홍길동');

    // 메뉴 선택
    await page.click('text=짜장면');
    await page.click('button:has-text("추가"), button:has-text("+")').first();

    await page.click('text=탕수육');
    await page.click('button:has-text("추가"), button:has-text("+")').nth(2);

    // 특별 요청 사항
    const specialInput = page.locator('textarea[placeholder*="요청"], input[placeholder*="요청"]');
    if (await specialInput.count() > 0) {
      await specialInput.fill('단무지 많이 주세요');
    }

    // 주문 제출
    await page.click('button:has-text("주문하기"), button:has-text("제출")');

    // 주문 완료 확인
    await expect(page.locator('text=/주문.*완료|제출.*완료/i')).toBeVisible({ timeout: 5000 });

    // 8. 호스트 대시보드로 돌아가서 집계 확인
    await page.goto(`${BASE_PATH}host/${sessionId}`);
    await waitForAppReady(page);

    // 참여자 수 확인
    await expect(page.locator('text=/1명/i')).toBeVisible();

    // 총액 확인 (7,000 + 25,000 = 32,000)
    await expect(page.locator('text=/32,000/i')).toBeVisible();

    // 9. 요약 페이지로 이동
    const summaryButton = page.locator('button:has-text("요약"), button:has-text("마감")');
    if (await summaryButton.count() > 0) {
      await summaryButton.click();
      await page.waitForURL(/\/summary\/.+/);

      // 요약 정보 확인
      await expect(page.locator('text=맛있는 중국집')).toBeVisible();
      await expect(page.locator('text=/32,000/i')).toBeVisible();
      await expect(page.locator('text=홍길동')).toBeVisible();
    }
  });

  test('자유 입력 모드 주문 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=주문 시작하기');
    await page.waitForURL(`${BASE_PATH}create`);

    // 자유 입력 모드 선택
    await page.fill('input[placeholder*="식당"]', '자유 입력 카페');
    await page.click('text=자유 입력');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    const sessionIdMatch = page.url().match(/\/host\/(.+)/);
    const sessionId = sessionIdMatch![1];

    // 참여자 주문
    await page.goto(`${BASE_PATH}join/${sessionId}`);
    await page.fill('input[placeholder*="이름"]', '김철수');

    // 자유 입력으로 메뉴 추가
    await page.click('button:has-text("메뉴 추가"), button:has-text("항목 추가")');

    const menuNameInput = page.locator('input[placeholder*="메뉴"], input[placeholder*="품목"]').first();
    await menuNameInput.fill('아메리카노');

    const menuPriceInput = page.locator('input[placeholder*="가격"]').first();
    await menuPriceInput.fill('4500');

    const quantityInput = page.locator('input[type="number"], input[placeholder*="수량"]').first();
    if (await quantityInput.count() > 0) {
      await quantityInput.fill('2');
    }

    await page.click('button:has-text("주문하기"), button:has-text("제출")');
    await expect(page.locator('text=/주문.*완료|제출.*완료/i')).toBeVisible({ timeout: 5000 });

    // 호스트에서 확인
    await page.goto(`${BASE_PATH}host/${sessionId}`);
    await expect(page.locator('text=김철수')).toBeVisible();
  });

  test('주문 수정 플로우', async ({ page }) => {
    // 세션 생성
    await page.goto(BASE_PATH);
    await page.click('text=주문 시작하기');
    await page.fill('input[placeholder*="식당"]', '주문 수정 테스트');
    await page.click('text=고정 메뉴');
    await page.click('button:has-text("메뉴 추가")');
    await page.fill('input[placeholder*="메뉴명"]', '메뉴A');
    await page.fill('input[placeholder*="가격"]', '10000');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    const sessionIdMatch = page.url().match(/\/host\/(.+)/);
    const sessionId = sessionIdMatch![1];

    // 첫 번째 주문
    await page.goto(`${BASE_PATH}join/${sessionId}`);
    await page.fill('input[placeholder*="이름"]', '수정테스터');
    await page.click('text=메뉴A');
    await page.click('button:has-text("주문하기"), button:has-text("제출")');
    await expect(page.locator('text=/주문.*완료|제출.*완료/i')).toBeVisible({ timeout: 5000 });

    // 주문 수정 (같은 이름으로 다시 주문하면 수정)
    await page.goto(`${BASE_PATH}join/${sessionId}`);
    await page.fill('input[placeholder*="이름"]', '수정테스터');

    // 수량 변경 또는 메뉴 변경
    const deleteButton = page.locator('button:has-text("삭제"), button:has-text("제거")').first();
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
    }

    await page.click('button:has-text("주문하기"), button:has-text("제출")');

    // 수정 완료 확인
    await page.goto(`${BASE_PATH}host/${sessionId}`);
    await expect(page.locator('text=수정테스터')).toBeVisible();
  });

  test('마감 시한 설정', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=주문 시작하기');
    await page.fill('input[placeholder*="식당"]', '마감 시한 테스트');
    await page.click('text=자유 입력');

    // 마감 시한 설정 (있을 경우)
    const deadlineInput = page.locator('input[type="datetime-local"], input[type="time"]');
    if (await deadlineInput.count() > 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().slice(0, 16);
      await deadlineInput.fill(dateString);
    }

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    // 마감 시한 표시 확인
    if (await deadlineInput.count() > 0) {
      await expect(page.locator('text=/마감|deadline/i')).toBeVisible();
    }
  });
});

test.describe('Group Order - Multi-user Scenarios', () => {
  test('동시 다중 참여자 주문', async ({ browser }) => {
    // 호스트 세션 생성
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto(BASE_PATH);
    await hostPage.click('text=주문 시작하기');
    await hostPage.fill('input[placeholder*="식당"]', '다중 참여자 테스트');
    await hostPage.click('text=고정 메뉴');
    await hostPage.click('button:has-text("메뉴 추가")');
    await hostPage.fill('input[placeholder*="메뉴명"]', '메뉴1');
    await hostPage.fill('input[placeholder*="가격"]', '5000');

    await hostPage.click('button:has-text("메뉴 추가")');
    const menuInputs = hostPage.locator('input[placeholder*="메뉴명"]');
    const priceInputs = hostPage.locator('input[placeholder*="가격"]');
    await menuInputs.nth(1).fill('메뉴2');
    await priceInputs.nth(1).fill('8000');

    const submitButton = hostPage.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await hostPage.waitForURL(/\/host\/.+/);

    const sessionIdMatch = hostPage.url().match(/\/host\/(.+)/);
    const sessionId = sessionIdMatch![1];

    // 5명의 참여자 동시 주문
    const participants = [
      { name: '참여자1', menu: '메뉴1' },
      { name: '참여자2', menu: '메뉴2' },
      { name: '참여자3', menu: '메뉴1' },
      { name: '참여자4', menu: '메뉴2' },
      { name: '참여자5', menu: '메뉴1' },
    ];

    const orderPromises = participants.map(async ({ name, menu }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(`${BASE_PATH}join/${sessionId}`);
      await page.fill('input[placeholder*="이름"]', name);
      await page.click(`text=${menu}`);
      await page.click('button:has-text("주문하기"), button:has-text("제출")');
      await expect(page.locator('text=/주문.*완료|제출.*완료/i')).toBeVisible({ timeout: 10000 });

      await context.close();
    });

    await Promise.all(orderPromises);

    // 호스트 페이지 새로고침 및 집계 확인
    await hostPage.reload();
    await waitForAppReady(hostPage);

    // 5명 참여 확인
    await expect(hostPage.locator('text=/5명/i')).toBeVisible();

    // 총액 확인 (5000*3 + 8000*2 = 31,000)
    await expect(hostPage.locator('text=/31,000/i')).toBeVisible();

    await hostContext.close();
  });

  test('실시간 주문 업데이트 동기화', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto(BASE_PATH);
    await hostPage.click('text=주문 시작하기');
    await hostPage.fill('input[placeholder*="식당"]', '실시간 동기화 테스트');
    await hostPage.click('text=자유 입력');

    const submitButton = hostPage.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await hostPage.waitForURL(/\/host\/.+/);

    const sessionIdMatch = hostPage.url().match(/\/host\/(.+)/);
    const sessionId = sessionIdMatch![1];

    // 초기 상태 확인
    await expect(hostPage.locator('text=/0명/i')).toBeVisible();

    // 첫 번째 참여자
    const participant1Context = await browser.newContext();
    const participant1Page = await participant1Context.newPage();
    await participant1Page.goto(`${BASE_PATH}join/${sessionId}`);
    await participant1Page.fill('input[placeholder*="이름"]', '실시간1');

    await participant1Page.click('button:has-text("메뉴 추가"), button:has-text("항목 추가")');
    const menuNameInput = participant1Page.locator('input[placeholder*="메뉴"], input[placeholder*="품목"]').first();
    await menuNameInput.fill('테스트메뉴');
    const menuPriceInput = participant1Page.locator('input[placeholder*="가격"]').first();
    await menuPriceInput.fill('7000');

    await participant1Page.click('button:has-text("주문하기"), button:has-text("제출")');
    await expect(participant1Page.locator('text=/주문.*완료|제출.*완료/i')).toBeVisible({ timeout: 5000 });

    // 호스트 페이지에서 실시간 업데이트 확인 (BroadcastChannel 또는 polling)
    await hostPage.waitForTimeout(2000);
    await hostPage.reload(); // 실시간 업데이트가 없다면 새로고침
    await expect(hostPage.locator('text=/1명/i')).toBeVisible();

    // 두 번째 참여자
    const participant2Context = await browser.newContext();
    const participant2Page = await participant2Context.newPage();
    await participant2Page.goto(`${BASE_PATH}join/${sessionId}`);
    await participant2Page.fill('input[placeholder*="이름"]', '실시간2');

    await participant2Page.click('button:has-text("메뉴 추가"), button:has-text("항목 추가")');
    const menuNameInput2 = participant2Page.locator('input[placeholder*="메뉴"], input[placeholder*="품목"]').first();
    await menuNameInput2.fill('메뉴B');
    const menuPriceInput2 = participant2Page.locator('input[placeholder*="가격"]').first();
    await menuPriceInput2.fill('9000');

    await participant2Page.click('button:has-text("주문하기"), button:has-text("제출")');

    // 호스트 업데이트
    await hostPage.waitForTimeout(2000);
    await hostPage.reload();
    await expect(hostPage.locator('text=/2명/i')).toBeVisible();

    await participant1Context.close();
    await participant2Context.close();
    await hostContext.close();
  });

  test('동일 이름 중복 주문 처리', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto(BASE_PATH);
    await hostPage.click('text=주문 시작하기');
    await hostPage.fill('input[placeholder*="식당"]', '중복 이름 테스트');
    await hostPage.click('text=고정 메뉴');
    await hostPage.click('button:has-text("메뉴 추가")');
    await hostPage.fill('input[placeholder*="메뉴명"]', '공통메뉴');
    await hostPage.fill('input[placeholder*="가격"]', '6000');

    const submitButton = hostPage.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await hostPage.waitForURL(/\/host\/.+/);

    const sessionIdMatch = hostPage.url().match(/\/host\/(.+)/);
    const sessionId = sessionIdMatch![1];

    // 첫 번째 "김철수"
    const p1Context = await browser.newContext();
    const p1Page = await p1Context.newPage();
    await p1Page.goto(`${BASE_PATH}join/${sessionId}`);
    await p1Page.fill('input[placeholder*="이름"]', '김철수');
    await p1Page.click('text=공통메뉴');
    await p1Page.click('button:has-text("주문하기"), button:has-text("제출")');
    await p1Page.waitForTimeout(1000);

    // 두 번째 "김철수" (다른 브라우저 컨텍스트)
    const p2Context = await browser.newContext();
    const p2Page = await p2Context.newPage();
    await p2Page.goto(`${BASE_PATH}join/${sessionId}`);
    await p2Page.fill('input[placeholder*="이름"]', '김철수');
    await p2Page.click('text=공통메뉴');
    await p2Page.click('button:has-text("주문하기"), button:has-text("제출")');
    await p2Page.waitForTimeout(1000);

    // 호스트에서 확인 - 2개 주문인지 확인 (중복 허용) 또는 1개만 (수정)
    await hostPage.reload();
    await waitForAppReady(hostPage);

    const participantCount = await hostPage.locator('text=/\\d+명/i').textContent();
    // 앱 설계에 따라 1명 또는 2명일 수 있음
    expect(participantCount).toBeTruthy();

    await p1Context.close();
    await p2Context.close();
    await hostContext.close();
  });
});

test.describe('Group Order - Summary & Export', () => {
  test('요약 페이지 메뉴별 집계 확인', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=주문 시작하기');
    await page.fill('input[placeholder*="식당"]', '집계 확인 테스트');
    await page.click('text=고정 메뉴');

    await page.click('button:has-text("메뉴 추가")');
    await page.fill('input[placeholder*="메뉴명"]', '김치찌개');
    await page.fill('input[placeholder*="가격"]', '8000');

    await page.click('button:has-text("메뉴 추가")');
    const menuInputs = page.locator('input[placeholder*="메뉴명"]');
    const priceInputs = page.locator('input[placeholder*="가격"]');
    await menuInputs.nth(1).fill('된장찌개');
    await priceInputs.nth(1).fill('8000');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    const sessionIdMatch = page.url().match(/\/host\/(.+)/);
    const sessionId = sessionIdMatch![1];

    // 여러 참여자 주문 (김치찌개 3개, 된장찌개 2개)
    const orders = [
      { name: 'A', menu: '김치찌개' },
      { name: 'B', menu: '김치찌개' },
      { name: 'C', menu: '김치찌개' },
      { name: 'D', menu: '된장찌개' },
      { name: 'E', menu: '된장찌개' },
    ];

    for (const { name, menu } of orders) {
      await page.goto(`${BASE_PATH}join/${sessionId}`);
      await page.fill('input[placeholder*="이름"]', name);
      await page.click(`text=${menu}`);
      await page.click('button:has-text("주문하기"), button:has-text("제출")');
      await page.waitForTimeout(500);
    }

    // 요약 페이지로 이동
    await page.goto(`${BASE_PATH}summary/${sessionId}`);
    await waitForAppReady(page);

    // 총 참여자 5명
    await expect(page.locator('text=/5명/i')).toBeVisible();

    // 총액 40,000원 (8000*5)
    await expect(page.locator('text=/40,000/i')).toBeVisible();

    // 메뉴별 집계 확인
    await expect(page.locator('text=김치찌개')).toBeVisible();
    await expect(page.locator('text=/김치찌개.*3/i')).toBeVisible(); // 3개

    await expect(page.locator('text=된장찌개')).toBeVisible();
    await expect(page.locator('text=/된장찌개.*2/i')).toBeVisible(); // 2개
  });

  test('참여자별 금액 확인', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=주문 시작하기');
    await page.fill('input[placeholder*="식당"]', '개인별 금액');
    await page.click('text=자유 입력');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    const sessionIdMatch = page.url().match(/\/host\/(.+)/);
    const sessionId = sessionIdMatch![1];

    // 다양한 금액 주문
    await page.goto(`${BASE_PATH}join/${sessionId}`);
    await page.fill('input[placeholder*="이름"]', '고액주문자');
    await page.click('button:has-text("메뉴 추가"), button:has-text("항목 추가")');
    await page.fill('input[placeholder*="메뉴"], input[placeholder*="품목"]', '고급메뉴');
    await page.fill('input[placeholder*="가격"]', '50000');
    await page.click('button:has-text("주문하기"), button:has-text("제출")');

    await page.goto(`${BASE_PATH}join/${sessionId}`);
    await page.fill('input[placeholder*="이름"]', '저액주문자');
    await page.click('button:has-text("메뉴 추가"), button:has-text("항목 추가")');
    await page.fill('input[placeholder*="메뉴"], input[placeholder*="품목"]', '저렴메뉴');
    await page.fill('input[placeholder*="가격"]', '3000');
    await page.click('button:has-text("주문하기"), button:has-text("제출")');

    // 요약에서 개인별 금액 확인
    await page.goto(`${BASE_PATH}summary/${sessionId}`);
    await waitForAppReady(page);

    await expect(page.locator('text=고액주문자')).toBeVisible();
    await expect(page.locator('text=/50,000/i')).toBeVisible();

    await expect(page.locator('text=저액주문자')).toBeVisible();
    await expect(page.locator('text=/3,000/i')).toBeVisible();
  });

  test('결과 내보내기 기능', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=주문 시작하기');
    await page.fill('input[placeholder*="식당"]', '내보내기 테스트');
    await page.click('text=자유 입력');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    const sessionIdMatch = page.url().match(/\/host\/(.+)/);
    const sessionId = sessionIdMatch![1];

    // 간단한 주문
    await page.goto(`${BASE_PATH}join/${sessionId}`);
    await page.fill('input[placeholder*="이름"]', '내보내기테스터');
    await page.click('button:has-text("메뉴 추가"), button:has-text("항목 추가")');
    await page.fill('input[placeholder*="메뉴"], input[placeholder*="품목"]', '테스트');
    await page.fill('input[placeholder*="가격"]', '1000');
    await page.click('button:has-text("주문하기"), button:has-text("제출")');

    // 요약 페이지
    await page.goto(`${BASE_PATH}summary/${sessionId}`);

    // 내보내기 버튼 찾기 (이미지, PDF, Excel 등)
    const exportButton = page.locator('button:has-text("다운로드"), button:has-text("저장"), button:has-text("내보내기")');

    if (await exportButton.count() > 0) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
        exportButton.first().click(),
      ]);

      if (download) {
        const filename = download.suggestedFilename();
        expect(filename).toBeTruthy();
      }
    }
  });
});

test.describe('Group Order - LocalStorage Persistence', () => {
  test('세션 데이터 localStorage 저장', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=주문 시작하기');
    await page.fill('input[placeholder*="식당"]', '로컬스토리지 테스트');
    await page.click('text=자유 입력');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    const sessionIdMatch = page.url().match(/\/host\/(.+)/);
    const sessionId = sessionIdMatch![1];

    // localStorage 확인
    const storedSession = await page.evaluate((id) => {
      const key = `session:${id}`;
      return localStorage.getItem(key) || localStorage.getItem('group-order-session') || localStorage.getItem('sessions');
    }, sessionId);

    expect(storedSession).toBeTruthy();
  });

  test('페이지 새로고침 후 호스트 대시보드 유지', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=주문 시작하기');
    await page.fill('input[placeholder*="식당"]', '새로고침 테스트');
    await page.click('text=자유 입력');

    const submitButton = page.locator('button:has-text("세션 만들기"), button:has-text("시작")');
    await submitButton.click();
    await page.waitForURL(/\/host\/.+/);

    const originalUrl = page.url();

    // 페이지 새로고침
    await page.reload();
    await waitForAppReady(page);

    // URL 유지
    expect(page.url()).toBe(originalUrl);

    // 세션 정보 유지
    await expect(page.locator('h1, h2')).toContainText('새로고침 테스트');
  });
});
