/**
 * 전월세 계산기 E2E 테스트
 *
 * 테스트 범위:
 * 1. Edge Cases: 0, 음수, 보증금 > 전세금, 전환율 경계값
 * 2. UI Tests: 반응형, 숫자 포맷, 탭 전환, 슬라이더, 차트
 * 3. E2E User Journeys: 전세→월세, 월세→전세, 비교 분석
 * 4. Calculation Accuracy: 전환 공식, 법정 전환율, 반올림
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5176/mini-apps/rent-calculator/';

test.describe('전월세 계산기 - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('전세금 0원 입력', async ({ page }) => {
    // 전세 → 월세 탭 (기본값)
    await page.locator('#jeonse').fill('0');
    await page.locator('#deposit-wolse').fill('0');

    // 월세가 0원으로 계산되는지 확인
    await expect(page.locator('text=0원')).toBeVisible();
  });

  test('보증금이 전세금보다 큰 경우 에러', async ({ page }) => {
    // 전세금 1억
    await page.locator('#jeonse').fill('100000000');

    // 보증금 2억 (전세금보다 큼)
    await page.locator('#deposit-wolse').fill('200000000');

    // 에러 메시지 표시
    await expect(page.getByText(/보증금은 전세금보다 낮아야/)).toBeVisible({ timeout: 2000 });
  });

  test('전환율 최소값 (0.1%)', async ({ page }) => {
    await page.locator('#jeonse').fill('100000000');
    await page.locator('#deposit-wolse').fill('50000000');

    // 슬라이더를 최소값으로
    const slider = page.locator('#conversion-rate-jeonse');
    await slider.fill('0.1');

    // 전환율이 0.1%로 표시되는지 확인
    await expect(page.getByText('0.1%')).toBeVisible();

    // 월세가 계산되는지 확인
    const result = page.locator('text=월세').first();
    await expect(result).toBeVisible();
  });

  test('전환율 최대값 (10%)', async ({ page }) => {
    await page.locator('#jeonse').fill('100000000');
    await page.locator('#deposit-wolse').fill('50000000');

    // 슬라이더를 최대값으로
    const slider = page.locator('#conversion-rate-jeonse');
    await slider.fill('10');

    // 전환율이 10%로 표시되는지 확인
    await expect(page.getByText('10.0%')).toBeVisible();

    // 월세가 계산되는지 확인
    const result = page.locator('text=월세').first();
    await expect(result).toBeVisible();
  });

  test('초대형 금액 (10억원) 입력', async ({ page }) => {
    await page.locator('#jeonse').fill('1000000000');
    await page.locator('#deposit-wolse').fill('500000000');

    // 계산 결과가 overflow 없이 표시되는지 확인
    const monthlyRent = page.locator('.text-3xl.font-bold.text-blue-600');
    await expect(monthlyRent).toBeVisible();
  });

  test('문자 입력 방지 (NumberInput)', async ({ page }) => {
    await page.locator('#jeonse').fill('abc123def');

    // 숫자만 남아있는지 확인
    const value = await page.locator('#jeonse').inputValue();
    expect(value.replace(/,/g, '')).toBe('123');
  });

  test('음수 입력 방지', async ({ page }) => {
    await page.locator('#jeonse').fill('-100000000');

    const value = await page.locator('#jeonse').inputValue();
    expect(parseInt(value.replace(/,/g, ''))).toBeGreaterThanOrEqual(0);
  });
});

test.describe('전월세 계산기 - UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('반응형 레이아웃 - 모바일 (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // 주요 요소가 표시되는지 확인
    await expect(page.getByText('전세/월세 계산기')).toBeVisible();
    await expect(page.locator('#jeonse')).toBeVisible();
    await expect(page.getByRole('tab', { name: '전세 → 월세' })).toBeVisible();
  });

  test('반응형 레이아웃 - 태블릿 (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await expect(page.getByText('전세/월세 계산기')).toBeVisible();
    await expect(page.locator('#jeonse')).toBeVisible();
  });

  test('반응형 레이아웃 - 데스크톱 (1920px)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 데스크톱에서 그리드 레이아웃 확인 (입력 | 결과 2열)
    const inputCard = page.locator('text=입력').first();
    const resultCard = page.locator('text=결과').first();

    await expect(inputCard).toBeVisible();
    await expect(resultCard).toBeVisible();
  });

  test('탭 전환: 전세 → 월세 / 월세 → 전세', async ({ page }) => {
    // 초기 탭: 전세 → 월세
    await expect(page.locator('#jeonse')).toBeVisible();

    // 월세 → 전세 탭으로 전환
    await page.getByRole('tab', { name: '월세 → 전세' }).click();

    // 입력 필드가 변경되었는지 확인
    await expect(page.locator('#deposit-jeonse')).toBeVisible();
    await expect(page.locator('#monthly-rent')).toBeVisible();

    // 다시 전세 → 월세로 전환
    await page.getByRole('tab', { name: '전세 → 월세' }).click();

    await expect(page.locator('#jeonse')).toBeVisible();
  });

  test('슬라이더 조작 및 값 표시', async ({ page }) => {
    const slider = page.locator('#conversion-rate-jeonse');

    // 초기값 확인 (4.5% 기본값)
    await expect(page.getByText('4.5%')).toBeVisible();

    // 슬라이더 값 변경
    await slider.fill('6.5');

    // 변경된 값 표시 확인
    await expect(page.getByText('6.5%')).toBeVisible();
  });

  test('통화 포맷 (천단위 콤마)', async ({ page }) => {
    await page.locator('#jeonse').fill('100000000');
    await page.locator('#jeonse').blur();

    // 콤마가 추가되는지 확인
    const value = await page.locator('#jeonse').inputValue();
    expect(value).toContain(',');
    expect(value).toBe('100,000,000');
  });

  test('Info 툴팁 표시', async ({ page }) => {
    // 전환율 Info 아이콘 hover
    const infoIcon = page.locator('text=전월세 전환율').locator('..').locator('svg').first();
    await infoIcon.hover();

    // 툴팁 메시지 확인
    await expect(page.getByText(/법정 상한은 기준금리/)).toBeVisible({ timeout: 2000 });
  });

  test('비용 비교 차트 렌더링', async ({ page }) => {
    // 비용 비교 분석 섹션으로 스크롤
    await page.locator('text=비용 비교 분석').scrollIntoViewIfNeeded();

    // 차트가 렌더링되는지 확인
    const chart = page.locator('.recharts-wrapper');
    await expect(chart).toBeVisible({ timeout: 3000 });
  });

  test('접근성 - 라벨과 입력 필드 연결', async ({ page }) => {
    // 전세금 라벨
    const jeonseLabel = page.locator('label[for="jeonse"]');
    await expect(jeonseLabel).toHaveText(/전세금/);

    // 월세 보증금 라벨
    const depositLabel = page.locator('label[for="deposit-wolse"]');
    await expect(depositLabel).toHaveText(/월세 보증금/);

    // 전환율 라벨
    const rateLabel = page.locator('label[for="conversion-rate-jeonse"]');
    await expect(rateLabel).toHaveText(/전월세 전환율/);
  });
});

test.describe('전월세 계산기 - E2E User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('전세 → 월세 변환 (전체 플로우)', async ({ page }) => {
    // 1. 전세금 입력 (2억)
    await page.locator('#jeonse').fill('200000000');

    // 2. 월세 보증금 입력 (1억)
    await page.locator('#deposit-wolse').fill('100000000');

    // 3. 전환율 설정 (4.5%)
    const slider = page.locator('#conversion-rate-jeonse');
    await slider.fill('4.5');

    // 4. 결과 확인
    await expect(page.locator('text=월세').first()).toBeVisible();

    // 5. 계산 공식 확인
    await expect(page.getByText('계산 공식')).toBeVisible();
    await expect(page.getByText(/월세 = \(전세금 - 보증금\)/)).toBeVisible();

    // 6. 보증금 + 월세 합계 표시 확인
    await expect(page.getByText('보증금 + 월세')).toBeVisible();
  });

  test('월세 → 전세 변환 (전체 플로우)', async ({ page }) => {
    // 1. 월세 → 전세 탭으로 전환
    await page.getByRole('tab', { name: '월세 → 전세' }).click();

    // 2. 보증금 입력 (5천만원)
    await page.locator('#deposit-jeonse').fill('50000000');

    // 3. 월세 입력 (50만원)
    await page.locator('#monthly-rent').fill('500000');

    // 4. 전환율 설정 (4.5%)
    const slider = page.locator('#conversion-rate-wolse');
    await slider.fill('4.5');

    // 5. 결과 확인 (전세 환산액)
    await expect(page.locator('text=전세 환산액').first()).toBeVisible();

    // 6. 계산 공식 확인
    await expect(page.getByText('계산 공식')).toBeVisible();
  });

  test('전환율 변경 시 실시간 재계산', async ({ page }) => {
    // 전세금, 보증금 입력
    await page.locator('#jeonse').fill('200000000');
    await page.locator('#deposit-wolse').fill('100000000');

    // 전환율 4.5%로 설정
    const slider = page.locator('#conversion-rate-jeonse');
    await slider.fill('4.5');

    await page.waitForTimeout(300);
    const monthlyRent1 = await page.locator('.text-3xl.font-bold.text-blue-600').textContent();

    // 전환율 6.0%로 변경
    await slider.fill('6.0');

    await page.waitForTimeout(300);
    const monthlyRent2 = await page.locator('.text-3xl.font-bold.text-blue-600').textContent();

    // 전환율이 높아지면 월세가 증가해야 함
    expect(monthlyRent1).not.toBe(monthlyRent2);
  });

  test('다양한 시나리오 비교', async ({ page }) => {
    // 시나리오 1: 전세 3억, 보증금 1억
    await page.locator('#jeonse').fill('300000000');
    await page.locator('#deposit-wolse').fill('100000000');

    await page.waitForTimeout(300);
    const result1 = await page.locator('.text-3xl.font-bold.text-blue-600').textContent();

    // 시나리오 2: 전세 3억, 보증금 2억
    await page.locator('#deposit-wolse').fill('200000000');

    await page.waitForTimeout(300);
    const result2 = await page.locator('.text-3xl.font-bold.text-blue-600').textContent();

    // 보증금이 높을수록 월세가 낮아야 함
    expect(result1).not.toBe(result2);
  });

  test('비용 비교 차트와의 연동', async ({ page }) => {
    // 전세금 입력
    await page.locator('#jeonse').fill('200000000');
    await page.locator('#deposit-wolse').fill('100000000');

    // 비용 비교 분석 섹션으로 스크롤
    await page.locator('text=비용 비교 분석').scrollIntoViewIfNeeded();

    // 차트가 표시되는지 확인
    await expect(page.locator('.recharts-wrapper')).toBeVisible({ timeout: 3000 });

    // 차트 내 데이터가 있는지 확인
    const bars = page.locator('.recharts-bar');
    await expect(bars.first()).toBeVisible();
  });
});

test.describe('전월세 계산기 - Calculation Accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('전세 → 월세 계산 정확도', async ({ page }) => {
    // 전세 2억, 보증금 1억, 전환율 4.5%
    await page.locator('#jeonse').fill('200000000');
    await page.locator('#deposit-wolse').fill('100000000');
    await page.locator('#conversion-rate-jeonse').fill('4.5');

    // 예상 계산:
    // 월세 = (200,000,000 - 100,000,000) × 4.5% ÷ 12
    //      = 100,000,000 × 0.045 ÷ 12
    //      = 375,000원

    await page.waitForTimeout(300);

    const monthlyRentText = await page.locator('.text-3xl.font-bold.text-blue-600').textContent();
    const monthlyRent = parseInt(monthlyRentText?.replace(/[^0-9]/g, '') || '0');

    // 375,000원 근처인지 확인 (±1,000원 오차 허용)
    expect(monthlyRent).toBeGreaterThanOrEqual(374000);
    expect(monthlyRent).toBeLessThanOrEqual(376000);
  });

  test('월세 → 전세 계산 정확도', async ({ page }) => {
    // 월세 → 전세 탭으로 전환
    await page.getByRole('tab', { name: '월세 → 전세' }).click();

    // 보증금 1억, 월세 50만원, 전환율 4.5%
    await page.locator('#deposit-jeonse').fill('100000000');
    await page.locator('#monthly-rent').fill('500000');
    await page.locator('#conversion-rate-wolse').fill('4.5');

    // 예상 계산:
    // 전세 = 100,000,000 + (500,000 × 12) ÷ 0.045
    //      = 100,000,000 + 6,000,000 ÷ 0.045
    //      = 100,000,000 + 133,333,333
    //      = 233,333,333원

    await page.waitForTimeout(300);

    const jeonseText = await page.locator('.text-3xl.font-bold.text-blue-600').textContent();
    const jeonse = parseInt(jeonseText?.replace(/[^0-9]/g, '') || '0');

    // 2억 3천만원 근처인지 확인
    expect(jeonse).toBeGreaterThanOrEqual(230000000);
    expect(jeonse).toBeLessThanOrEqual(235000000);
  });

  test('법정 전환율 (4.5%) 기본값', async ({ page }) => {
    // 페이지 로드 시 기본 전환율이 4.5%인지 확인
    await expect(page.getByText('4.5%')).toBeVisible();
  });

  test('반올림 정확도', async ({ page }) => {
    // 복잡한 금액으로 소수점 발생 케이스
    await page.locator('#jeonse').fill('187654321');
    await page.locator('#deposit-wolse').fill('93827160');
    await page.locator('#conversion-rate-jeonse').fill('4.7');

    await page.waitForTimeout(300);

    // 결과가 정수로 반올림되는지 확인 (소수점 없음)
    const monthlyRentText = await page.locator('.text-3xl.font-bold.text-blue-600').textContent();
    expect(monthlyRentText).not.toContain('.');

    // 천단위 콤마는 포함되어야 함
    expect(monthlyRentText).toContain(',');
  });

  test('경계값: 전환율 0.1% (최소)', async ({ page }) => {
    await page.locator('#jeonse').fill('100000000');
    await page.locator('#deposit-wolse').fill('50000000');
    await page.locator('#conversion-rate-jeonse').fill('0.1');

    // 월세 = 50,000,000 × 0.001 ÷ 12 = 4,167원

    await page.waitForTimeout(300);

    const monthlyRent = parseInt(
      (await page.locator('.text-3xl.font-bold.text-blue-600').textContent())?.replace(/[^0-9]/g, '') || '0'
    );

    expect(monthlyRent).toBeGreaterThan(0);
    expect(monthlyRent).toBeLessThan(10000);
  });

  test('경계값: 전환율 10% (최대)', async ({ page }) => {
    await page.locator('#jeonse').fill('100000000');
    await page.locator('#deposit-wolse').fill('50000000');
    await page.locator('#conversion-rate-jeonse').fill('10');

    // 월세 = 50,000,000 × 0.1 ÷ 12 = 416,667원

    await page.waitForTimeout(300);

    const monthlyRent = parseInt(
      (await page.locator('.text-3xl.font-bold.text-blue-600').textContent())?.replace(/[^0-9]/g, '') || '0'
    );

    expect(monthlyRent).toBeGreaterThan(400000);
    expect(monthlyRent).toBeLessThan(420000);
  });

  test('전세금 = 보증금 (월세 0원)', async ({ page }) => {
    await page.locator('#jeonse').fill('100000000');
    await page.locator('#deposit-wolse').fill('100000000');

    await page.waitForTimeout(300);

    // 에러 메시지 표시되어야 함
    await expect(page.getByText(/보증금은 전세금보다 낮아야/)).toBeVisible();
  });
});

test.describe('전월세 계산기 - 접근성 & 사용성', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('키보드 내비게이션', async ({ page }) => {
    // Tab으로 필드 간 이동
    await page.keyboard.press('Tab');

    // 입력 필드에 포커스 가능한지 확인
    const focusedElement = await page.evaluate(() => document.activeElement?.id);
    expect(['jeonse', 'deposit-wolse', 'conversion-rate-jeonse']).toContain(focusedElement);
  });

  test('안내 문구 표시', async ({ page }) => {
    // 하단 안내 문구 표시 확인
    await page.locator('text=본 계산기는 참고용 도구이며').scrollIntoViewIfNeeded();
    await expect(page.getByText(/법적 구속력이 없습니다/)).toBeVisible();
  });

  test('결과 카드 배경색 구분 (입력 vs 결과)', async ({ page }) => {
    // 입력 카드 (흰색 배경)
    const inputCard = page.locator('text=입력').locator('..').locator('..');
    await expect(inputCard).toBeVisible();

    // 결과 카드 (파란색 배경)
    const resultCard = page.locator('text=결과').locator('..').locator('..');
    await expect(resultCard).toHaveClass(/bg-blue-50/);
  });

  test('실시간 계산 (입력 시 즉시 업데이트)', async ({ page }) => {
    await page.locator('#jeonse').fill('100000000');
    await page.locator('#deposit-wolse').fill('50000000');

    // 입력 후 즉시 결과가 표시되는지 확인 (버튼 클릭 불필요)
    await page.waitForTimeout(300);
    const monthlyRent = page.locator('.text-3xl.font-bold.text-blue-600');
    await expect(monthlyRent).toBeVisible();
  });
});
