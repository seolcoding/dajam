import { Page, expect } from '@playwright/test';

/**
 * 공통 테스트 헬퍼 함수들
 */

/**
 * 페이지 로딩 대기 및 초기 상태 확인
 */
export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#root')).toBeVisible();
}

/**
 * 반응형 테스트를 위한 뷰포트 설정
 */
export const viewports = {
  mobile: { width: 375, height: 812 },    // iPhone X
  tablet: { width: 768, height: 1024 },   // iPad
  desktop: { width: 1280, height: 800 },  // Desktop
};

/**
 * 접근성 검사: 키보드 네비게이션 테스트
 */
export async function testKeyboardNavigation(page: Page) {
  // Tab 키로 모든 인터랙티브 요소 순회 가능한지 확인
  const focusableElements = await page.locator(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ).all();

  for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  }
}

/**
 * 스크린샷 비교를 위한 유틸리티
 */
export async function takeComponentScreenshot(page: Page, selector: string, name: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await element.screenshot({ path: `screenshots/${name}.png` });
}

/**
 * 로딩 상태 테스트
 */
export async function testLoadingState(page: Page, triggerSelector: string) {
  const trigger = page.locator(triggerSelector);
  await trigger.click();

  // 로딩 인디케이터가 나타났다가 사라지는지 확인
  const loadingIndicator = page.locator('[data-loading], .loading, .spinner');
  if (await loadingIndicator.count() > 0) {
    await expect(loadingIndicator).toBeVisible();
    await expect(loadingIndicator).toBeHidden({ timeout: 10000 });
  }
}

/**
 * 에러 메시지 테스트
 */
export async function testErrorMessage(page: Page, expectedText: string | RegExp) {
  const errorElement = page.locator('[role="alert"], .error, .error-message');
  await expect(errorElement).toContainText(expectedText);
}

/**
 * 입력 필드 유효성 검사 테스트
 */
export async function testInputValidation(
  page: Page,
  inputSelector: string,
  invalidValue: string,
  submitSelector: string
) {
  const input = page.locator(inputSelector);
  await input.fill(invalidValue);

  const submit = page.locator(submitSelector);
  await submit.click();

  // 에러 상태 확인
  const isInvalid = await input.evaluate((el) => {
    return el.getAttribute('aria-invalid') === 'true' ||
           el.classList.contains('invalid') ||
           el.classList.contains('error');
  });

  return isInvalid;
}

/**
 * 숫자 입력 포맷팅 테스트 (천단위 콤마)
 */
export async function testNumberFormatting(page: Page, inputSelector: string, value: string) {
  const input = page.locator(inputSelector);
  await input.fill(value);
  await input.blur();

  const displayedValue = await input.inputValue();
  return displayedValue;
}

/**
 * 공유 기능 테스트
 */
export async function testShareButton(page: Page, shareButtonSelector: string) {
  const shareButton = page.locator(shareButtonSelector);
  await expect(shareButton).toBeVisible();
  await shareButton.click();

  // 공유 모달이나 복사 완료 메시지 확인
  const shareModal = page.locator('[role="dialog"], .share-modal, .toast');
  await expect(shareModal).toBeVisible();
}

/**
 * 로컬 스토리지 상태 확인
 */
export async function getLocalStorage(page: Page, key: string) {
  return await page.evaluate((k) => localStorage.getItem(k), key);
}

export async function setLocalStorage(page: Page, key: string, value: string) {
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
}

/**
 * 멀티 유저 테스트를 위한 브라우저 컨텍스트 생성
 */
export async function createMultiUserContext(page: Page) {
  const context = page.context();
  const browser = context.browser();
  if (!browser) throw new Error('Browser not available');

  const newContext = await browser.newContext();
  const newPage = await newContext.newPage();
  return { context: newContext, page: newPage };
}

/**
 * 결과 내보내기 테스트 (이미지 다운로드)
 */
export async function testExportImage(page: Page, exportButtonSelector: string) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator(exportButtonSelector).click(),
  ]);

  const filename = download.suggestedFilename();
  expect(filename).toMatch(/\.(png|jpg|jpeg|webp)$/i);
  return download;
}

/**
 * 애니메이션 완료 대기
 */
export async function waitForAnimation(page: Page, selector: string, timeout = 5000) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });

  // CSS 애니메이션/트랜지션 완료 대기
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return true;
      const style = getComputedStyle(el);
      return style.animationPlayState !== 'running' &&
             !el.classList.contains('animating');
    },
    selector,
    { timeout }
  );
}

/**
 * 차트/그래프 렌더링 확인
 */
export async function waitForChartRender(page: Page) {
  // Recharts나 기타 차트 라이브러리 렌더링 대기
  await page.waitForSelector('svg.recharts-surface, canvas, .chart-container svg', {
    state: 'visible',
    timeout: 5000,
  }).catch(() => {
    // 차트가 없을 수도 있음
  });
}

/**
 * 토스트 메시지 확인
 */
export async function waitForToast(page: Page, message?: string | RegExp) {
  const toast = page.locator('.toast, [role="status"], .notification');
  await expect(toast).toBeVisible();
  if (message) {
    await expect(toast).toContainText(message);
  }
  return toast;
}

/**
 * 폼 제출 후 결과 대기
 */
export async function submitFormAndWaitForResult(
  page: Page,
  submitSelector: string,
  resultSelector: string
) {
  await page.locator(submitSelector).click();
  await page.locator(resultSelector).waitFor({ state: 'visible' });
  return page.locator(resultSelector);
}

/**
 * 긴 문자열 입력 테스트
 */
export function generateLongString(length: number): string {
  return 'A'.repeat(length);
}

/**
 * 특수 문자 테스트 케이스
 */
export const specialCharacters = [
  '<script>alert("xss")</script>',
  '한글테스트',
  '😀🎉🚀',
  '   공백   ',
  'Line1\nLine2\nLine3',
  '"quotes" and \'apostrophes\'',
  '&lt;&gt;&amp;',
  '../../../etc/passwd',
];

/**
 * 경계값 테스트를 위한 숫자들
 */
export const boundaryNumbers = {
  zero: 0,
  negative: -1,
  maxSafeInteger: Number.MAX_SAFE_INTEGER,
  minSafeInteger: Number.MIN_SAFE_INTEGER,
  decimal: 0.123456789,
  largeDecimal: 999999999.99,
};
