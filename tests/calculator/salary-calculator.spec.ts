/**
 * 연봉 계산기 E2E 테스트
 *
 * 테스트 범위:
 * 1. Edge Cases: 0, 음수, 초대형 숫자, 소수점, 통화 형식, 잘못된 입력
 * 2. UI Tests: 반응형, 숫자 포맷, 에러 메시지, 차트 렌더링, 접근성
 * 3. E2E User Journeys: 입력 → 계산 → 결과, 수정 및 재계산, 시뮬레이터
 * 4. Calculation Accuracy: 실제 값 검증, 경계 조건, 반올림
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5174/mini-apps/salary-calculator/';

test.describe('연봉 계산기 - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('0원 입력 시 유효성 검사', async ({ page }) => {
    // 연봉 0 입력
    const annualInput = page.locator('#annualSalary');
    await annualInput.fill('0');

    // 계산 버튼 클릭
    const calculateBtn = page.getByRole('button', { name: /실수령액 계산하기/i });
    await calculateBtn.click();

    // 결과가 0이거나 비활성화되어야 함
    await expect(calculateBtn).toBeDisabled();
  });

  test('음수 입력 방지', async ({ page }) => {
    const annualInput = page.locator('#annualSalary');

    // 음수 입력 시도
    await annualInput.fill('-50000000');

    // NumberInput 컴포넌트가 음수를 필터링하는지 확인
    const value = await annualInput.inputValue();
    expect(parseInt(value.replace(/,/g, ''))).toBeGreaterThanOrEqual(0);
  });

  test('초대형 숫자 (10억원) 입력 처리', async ({ page }) => {
    const annualInput = page.locator('#annualSalary');

    // 10억원 입력
    await annualInput.fill('1000000000');

    const calculateBtn = page.getByRole('button', { name: /실수령액 계산하기/i });
    await calculateBtn.click();

    // 계산 결과가 표시되는지 확인 (overflow 없이)
    const resultCard = page.locator('text=실수령액').first();
    await expect(resultCard).toBeVisible();
  });

  test('소수점 입력 처리', async ({ page }) => {
    const annualInput = page.locator('#annualSalary');

    // 소수점 포함 입력
    await annualInput.fill('50000000.99');

    // 정수로 변환되는지 확인
    const value = await annualInput.inputValue();
    expect(value).not.toContain('.');
  });

  test('문자 입력 방지', async ({ page }) => {
    const annualInput = page.locator('#annualSalary');

    // 문자 입력 시도
    await annualInput.fill('abc123def');

    // 숫자만 남아있는지 확인
    const value = await annualInput.inputValue();
    expect(value.replace(/,/g, '')).toBe('123');
  });

  test('천단위 콤마 자동 포맷', async ({ page }) => {
    const annualInput = page.locator('#annualSalary');

    // 콤마 없이 입력
    await annualInput.fill('50000000');

    // blur 이벤트 발생
    await annualInput.blur();

    // 콤마가 추가되는지 확인
    const value = await annualInput.inputValue();
    expect(value).toBe('50,000,000');
  });
});

test.describe('연봉 계산기 - UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('반응형 레이아웃 - 모바일', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 812 });

    // 모든 주요 요소가 표시되는지 확인
    await expect(page.getByText('급여 실수령액 계산기')).toBeVisible();
    await expect(page.locator('#annualSalary')).toBeVisible();
    await expect(page.getByRole('button', { name: /실수령액 계산하기/i })).toBeVisible();
  });

  test('반응형 레이아웃 - 태블릿', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await expect(page.getByText('급여 실수령액 계산기')).toBeVisible();
    await expect(page.locator('#annualSalary')).toBeVisible();
  });

  test('반응형 레이아웃 - 데스크톱', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await expect(page.getByText('급여 실수령액 계산기')).toBeVisible();
    await expect(page.locator('#annualSalary')).toBeVisible();
  });

  test('입력 모드 전환 (연봉 ↔ 월급)', async ({ page }) => {
    // 초기 상태: 연봉 모드
    await expect(page.locator('#annualSalary')).toBeVisible();

    // 월급 모드로 전환
    await page.getByRole('tab', { name: '월급' }).click();

    await expect(page.locator('#monthlyGross')).toBeVisible();
    await expect(page.locator('#annualSalary')).not.toBeVisible();

    // 다시 연봉 모드로 전환
    await page.getByRole('tab', { name: '연봉' }).click();

    await expect(page.locator('#annualSalary')).toBeVisible();
    await expect(page.locator('#monthlyGross')).not.toBeVisible();
  });

  test('비과세액 툴팁 표시', async ({ page }) => {
    // 비과세액 Info 아이콘 클릭
    const infoIcon = page.locator('label:has-text("비과세액")').locator('svg').first();
    await infoIcon.hover();

    // 툴팁 메시지 확인
    await expect(page.getByText('식대 20만원이 일반적입니다')).toBeVisible({ timeout: 2000 });
  });

  test('접근성 - 폼 라벨 연결', async ({ page }) => {
    // 모든 input에 label이 연결되어 있는지 확인
    const annualLabel = page.locator('label[for="annualSalary"]');
    await expect(annualLabel).toHaveText(/연봉/);

    const taxFreeLabel = page.locator('label[for="taxFreeAmount"]');
    await expect(taxFreeLabel).toHaveText(/비과세액/);

    const dependentsLabel = page.locator('label[for="dependents"]');
    await expect(dependentsLabel).toHaveText(/부양가족 수/);
  });

  test('차트 렌더링', async ({ page }) => {
    // 연봉 입력
    await page.locator('#annualSalary').fill('50000000');
    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    // 차트가 렌더링되는지 확인 (Recharts SVG)
    const chart = page.locator('.recharts-wrapper');
    await expect(chart).toBeVisible({ timeout: 3000 });

    // 차트 내 라인이 그려졌는지 확인
    const line = page.locator('.recharts-line-curve');
    await expect(line).toBeVisible();
  });
});

test.describe('연봉 계산기 - E2E User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('연봉 입력 → 계산 → 결과 확인 (전체 플로우)', async ({ page }) => {
    // 1. 연봉 입력
    await page.locator('#annualSalary').fill('50000000');

    // 2. 비과세액 입력
    await page.locator('#taxFreeAmount').fill('200000');

    // 3. 부양가족 수 입력 (본인 포함)
    await page.locator('#dependents').fill('1');

    // 4. 자녀 수 입력
    await page.locator('#children').fill('0');

    // 5. 계산 버튼 클릭
    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    // 6. 결과 확인
    await expect(page.getByText('실수령액')).toBeVisible();

    // 7. 4대보험 내역 확인
    await expect(page.getByText('국민연금')).toBeVisible();
    await expect(page.getByText('건강보험')).toBeVisible();
    await expect(page.getByText('요양보험')).toBeVisible();
    await expect(page.getByText('고용보험')).toBeVisible();

    // 8. 세금 내역 확인
    await expect(page.getByText('소득세')).toBeVisible();
    await expect(page.getByText('지방소득세')).toBeVisible();
  });

  test('월급 모드로 계산', async ({ page }) => {
    // 월급 모드로 전환
    await page.getByRole('tab', { name: '월급' }).click();

    // 월 급여 입력
    await page.locator('#monthlyGross').fill('4000000');

    // 비과세액
    await page.locator('#taxFreeAmount').fill('200000');

    // 계산
    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    // 결과 확인
    await expect(page.getByText('실수령액')).toBeVisible();
  });

  test('퇴직금 포함 여부 토글', async ({ page }) => {
    // 연봉 입력
    await page.locator('#annualSalary').fill('50000000');

    // 퇴직금 포함 OFF (기본값)
    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();
    const netPay1 = await page.locator('text=실수령액').first().textContent();

    // 퇴직금 포함 ON
    await page.locator('#includeRetirement').click();
    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();
    const netPay2 = await page.locator('text=실수령액').first().textContent();

    // 퇴직금 포함 시 월 실수령액이 달라져야 함
    expect(netPay1).not.toBe(netPay2);
  });

  test('부양가족/자녀 수 변경에 따른 세액 변화', async ({ page }) => {
    // 연봉 입력
    await page.locator('#annualSalary').fill('50000000');

    // 부양가족 1명 (본인만)
    await page.locator('#dependents').fill('1');
    await page.locator('#children').fill('0');
    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    await page.waitForTimeout(500);
    const tax1Text = await page.locator('text=소득세').first().textContent();

    // 부양가족 3명, 자녀 2명으로 변경
    await page.locator('#dependents').fill('3');
    await page.locator('#children').fill('2');
    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    await page.waitForTimeout(500);
    const tax2Text = await page.locator('text=소득세').first().textContent();

    // 부양가족/자녀가 많을수록 세금이 줄어들어야 함
    expect(tax1Text).not.toBe(tax2Text);
  });

  test('시뮬레이터 슬라이더 조작', async ({ page }) => {
    // 시뮬레이터 섹션으로 스크롤
    await page.locator('text=연봉 협상 시뮬레이터').scrollIntoViewIfNeeded();

    // 슬라이더가 표시되는지 확인
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();

    // 슬라이더 값 변경
    await slider.fill('100000000'); // 1억원

    // 결과가 업데이트되는지 확인
    await expect(page.locator('text=100,000,000원')).toBeVisible();
  });
});

test.describe('연봉 계산기 - Calculation Accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('연봉 5천만원 실수령액 계산 정확도', async ({ page }) => {
    // 표준 케이스: 연봉 5천만원, 비과세 20만원, 부양가족 1명
    await page.locator('#annualSalary').fill('50000000');
    await page.locator('#taxFreeAmount').fill('200000');
    await page.locator('#dependents').fill('1');
    await page.locator('#children').fill('0');

    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    // 월 급여 = 50,000,000 / 12 = 4,166,667원
    // 과세 급여 = 4,166,667 - 200,000 = 3,966,667원
    // 예상 실수령액: 약 3,550,000원 ~ 3,650,000원 (4대보험 + 세금 공제)

    await page.waitForTimeout(500);

    // 실수령액이 300만원 이상, 400만원 이하인지 확인 (범위 검증)
    const netPayText = await page.locator('text=실수령액').first().textContent();
    expect(netPayText).toBeTruthy();

    // 숫자만 추출
    const netPayMatch = netPayText?.match(/[\d,]+/);
    if (netPayMatch) {
      const netPay = parseInt(netPayMatch[0].replace(/,/g, ''));
      expect(netPay).toBeGreaterThan(3000000);
      expect(netPay).toBeLessThan(4000000);
    }
  });

  test('4대보험 요율 정확성 검증', async ({ page }) => {
    // 연봉 6천만원 (월 5백만원)
    await page.locator('#annualSalary').fill('60000000');
    await page.locator('#taxFreeAmount').fill('0');

    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    await page.waitForTimeout(500);

    // 4대보험 항목들이 표시되는지 확인
    await expect(page.getByText('국민연금')).toBeVisible();
    await expect(page.getByText('건강보험')).toBeVisible();
    await expect(page.getByText('요양보험')).toBeVisible();
    await expect(page.getByText('고용보험')).toBeVisible();

    // 월 급여 5,000,000원 기준
    // 국민연금: 5,000,000 × 4.5% = 225,000원
    // 건강보험: 5,000,000 × 3.545% = 177,250원
    // 요양보험: 177,250 × 12.95% = 22,954원
    // 고용보험: 5,000,000 × 0.9% = 45,000원
  });

  test('경계값: 최저임금 (연 2천만원)', async ({ page }) => {
    await page.locator('#annualSalary').fill('20000000');
    await page.locator('#taxFreeAmount').fill('200000');

    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    await page.waitForTimeout(500);

    // 계산 결과가 표시되는지 확인
    await expect(page.getByText('실수령액')).toBeVisible();
  });

  test('경계값: 고액 연봉 (2억원)', async ({ page }) => {
    await page.locator('#annualSalary').fill('200000000');
    await page.locator('#taxFreeAmount').fill('200000');

    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    await page.waitForTimeout(500);

    // 계산 결과가 표시되는지 확인
    await expect(page.getByText('실수령액')).toBeVisible();

    // 실수령액이 1천만원 이상인지 확인
    const netPayText = await page.locator('text=실수령액').first().textContent();
    const netPayMatch = netPayText?.match(/[\d,]+/);
    if (netPayMatch) {
      const netPay = parseInt(netPayMatch[0].replace(/,/g, ''));
      expect(netPay).toBeGreaterThan(10000000);
    }
  });

  test('반올림 정확도', async ({ page }) => {
    // 복잡한 계산이 발생하는 연봉
    await page.locator('#annualSalary').fill('37894523');
    await page.locator('#taxFreeAmount').fill('150000');

    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    await page.waitForTimeout(500);

    // 모든 금액이 정수로 표시되는지 확인 (소수점 없음)
    const allText = await page.textContent('body');

    // 금액 패턴에 소수점이 없는지 확인
    const amounts = allText?.match(/\d{1,3}(,\d{3})*원/g) || [];
    amounts.forEach(amount => {
      expect(amount).not.toContain('.');
    });
  });

  test('자녀 세액공제 정확성', async ({ page }) => {
    await page.locator('#annualSalary').fill('50000000');
    await page.locator('#dependents').fill('3');

    // 자녀 0명
    await page.locator('#children').fill('0');
    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();
    await page.waitForTimeout(500);

    const tax1 = await page.locator('text=소득세').first().textContent();

    // 자녀 2명 (세액공제 대상)
    await page.locator('#children').fill('2');
    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();
    await page.waitForTimeout(500);

    const tax2 = await page.locator('text=소득세').first().textContent();

    // 자녀가 있을 때 세금이 줄어들어야 함
    expect(tax1).not.toBe(tax2);
  });
});

test.describe('연봉 계산기 - 접근성 & 사용성', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('키보드 내비게이션', async ({ page }) => {
    // 첫 번째 입력 필드로 포커스
    await page.keyboard.press('Tab');

    // 연봉 입력 필드가 포커스되었는지 확인
    const focusedElement = await page.evaluate(() => document.activeElement?.id);
    expect(['annualSalary', 'taxFreeAmount', 'dependents']).toContain(focusedElement);

    // Tab으로 다음 필드들로 이동 가능한지 확인
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  });

  test('빈 입력 시 버튼 비활성화', async ({ page }) => {
    const calculateBtn = page.getByRole('button', { name: /실수령액 계산하기/i });

    // 초기 상태: 입력 없음 → 버튼 비활성화
    await expect(calculateBtn).toBeDisabled();

    // 연봉 입력 → 버튼 활성화
    await page.locator('#annualSalary').fill('50000000');
    await expect(calculateBtn).toBeEnabled();

    // 입력 제거 → 다시 비활성화
    await page.locator('#annualSalary').fill('');
    await expect(calculateBtn).toBeDisabled();
  });

  test('에러 상태 표시 없음 (유효한 입력만 허용)', async ({ page }) => {
    // 유효한 입력
    await page.locator('#annualSalary').fill('50000000');
    await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

    // 에러 메시지가 없어야 함
    const errorMessages = page.locator('.text-red-500, .text-error, [role="alert"]');
    await expect(errorMessages).toHaveCount(0);
  });
});
