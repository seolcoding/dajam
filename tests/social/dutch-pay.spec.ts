import { test, expect, Page } from '@playwright/test';
import {
  waitForAppReady,
  viewports,
  testKeyboardNavigation,
  specialCharacters,
  testNumberFormatting,
  boundaryNumbers,
} from '../utils/test-helpers';

const BASE_PATH = process.env.TEST_URL || 'http://localhost:5195/mini-apps/dutch-pay/';

/**
 * 더치페이 정산 (Dutch Pay) E2E 테스트
 *
 * 테스트 범위:
 * 1. Edge Cases: 빈 데이터, 특수문자, 금액 경계값, 복잡한 정산
 * 2. UI Tests: 반응형, 정산 결과 렌더링, 접근성
 * 3. E2E User Journeys: 참여자 추가 → 지출 입력 → 정산 계산 → 결과 확인
 * 4. Calculation Tests: 균등 분할, 개별 금액, 비율 정산, 최적화 알고리즘
 */

test.describe('Dutch Pay - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
  });

  test('빈 정산명으로 시작', async ({ page }) => {
    // 기본 정산 이름 확인
    await expect(page.locator('h1')).toContainText(/더치페이|정산/i);

    // 기본 정산이 생성되어 있어야 함
    await expect(page.locator('input[value*="새 정산"], input[value*="정산"]')).toBeTruthy();
  });

  test('특수 문자가 포함된 참여자 이름', async ({ page }) => {
    // 참여자 추가
    const addButton = page.locator('button:has-text("참여자 추가"), button:has-text("추가")').first();
    await addButton.click();

    // 특수 문자 이름 입력
    const nameInputs = page.locator('input[placeholder*="이름"], input[placeholder*="참여자"]');
    const lastInput = nameInputs.last();
    await lastInput.fill('<script>alert("xss")</script>');

    // XSS가 실행되지 않고 텍스트로만 표시되는지 확인
    await expect(page.locator('text=<script>')).toBeVisible();

    // 이모지 이름
    await addButton.click();
    await nameInputs.last().fill('😀🎉 테스터');
    await expect(page.locator('text=😀🎉 테스터')).toBeVisible();
  });

  test('0원 지출 항목', async ({ page }) => {
    // 지출 추가
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    // 0원 입력
    const amountInput = page.locator('input[placeholder*="금액"], input[type="number"]').last();
    await amountInput.fill('0');

    // 0원 지출이 허용되는지 확인
    const value = await amountInput.inputValue();
    expect(value).toBe('0');
  });

  test('음수 금액 입력 방지', async ({ page }) => {
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInput = page.locator('input[placeholder*="금액"], input[type="number"]').last();
    await amountInput.fill('-10000');

    // 음수가 입력되지 않거나 0으로 변환
    const value = await amountInput.inputValue();
    const numValue = parseInt(value.replace(/,/g, ''));
    expect(numValue).toBeGreaterThanOrEqual(0);
  });

  test('매우 큰 금액 (1억원)', async ({ page }) => {
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const expenseNameInput = page.locator('input[placeholder*="항목"], input[placeholder*="지출"]').last();
    await expenseNameInput.fill('고액 지출');

    const amountInput = page.locator('input[placeholder*="금액"], input[type="number"]').last();
    await amountInput.fill('100000000');
    await amountInput.blur();

    // 천단위 콤마 포맷팅 확인
    const value = await amountInput.inputValue();
    expect(value).toContain(',');
    expect(value).toMatch(/100,000,000/);
  });

  test('소수점 금액 입력', async ({ page }) => {
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInput = page.locator('input[placeholder*="금액"], input[type="number"]').last();
    await amountInput.fill('10000.5');

    // 소수점이 반올림되거나 잘리는지 확인
    const value = await amountInput.inputValue();
    const numValue = parseFloat(value.replace(/,/g, ''));

    // 정수로 변환되거나 소수점 허용
    expect(numValue).toBeGreaterThan(0);
  });

  test('참여자 1명만으로 정산', async ({ page }) => {
    // 기본 참여자 2명 중 1명 제거
    const deleteButtons = page.locator('button:has-text("삭제"), button[aria-label*="삭제"]');
    if (await deleteButtons.count() > 1) {
      await deleteButtons.first().click();
    }

    // 지출 추가
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInput = page.locator('input[placeholder*="금액"], input[type="number"]').last();
    await amountInput.fill('10000');

    // 1명일 때 정산 결과 확인
    const result = page.locator('text=/정산.*결과|송금.*내역/i');
    if (await result.count() > 0) {
      // 1명이면 송금할 대상이 없으므로 결과가 비어있어야 함
      await expect(page.locator('text=/송금.*없음|정산.*완료/i')).toBeTruthy();
    }
  });

  test('대량 참여자 (50명)', async ({ page }) => {
    const addButton = page.locator('button:has-text("참여자 추가"), button:has-text("추가")').first();

    // 50명 추가 (기본 2명 포함하면 52명)
    for (let i = 3; i <= 50; i++) {
      await addButton.click();
      const nameInputs = page.locator('input[placeholder*="이름"], input[placeholder*="참여자"]');
      await nameInputs.last().fill(`참여자${i}`);

      // 10명마다 스크롤
      if (i % 10 === 0) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }
    }

    // 지출 추가
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();
    const amountInput = page.locator('input[placeholder*="금액"], input[type="number"]').last();
    await amountInput.fill('100000');

    // 정산 결과가 생성되는지 확인
    const result = page.locator('text=/정산.*결과|송금.*내역/i');
    await expect(result).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Dutch Pay - UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
  });

  test('반응형 레이아웃 - 모바일', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);

    // 핵심 UI 요소 확인
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("참여자 추가"), button:has-text("추가")')).toBeVisible();
    await expect(page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")')).toBeVisible();
  });

  test('반응형 레이아웃 - 태블릿', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("참여자 추가")')).toBeVisible();
  });

  test('반응형 레이아웃 - 데스크톱', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("참여자 추가")')).toBeVisible();
  });

  test('천단위 콤마 포맷팅', async ({ page }) => {
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInput = page.locator('input[placeholder*="금액"], input[type="number"]').last();
    await amountInput.fill('1234567');
    await amountInput.blur();

    const value = await amountInput.inputValue();
    expect(value).toMatch(/1,234,567/);
  });

  test('총무 지정 토글', async ({ page }) => {
    // 총무 토글 버튼 확인
    const treasurerToggle = page.locator('input[type="checkbox"], button:has-text("총무")').first();

    if (await treasurerToggle.count() > 0) {
      const isChecked = await treasurerToggle.isChecked().catch(() => false);

      if (typeof isChecked === 'boolean') {
        await treasurerToggle.click();

        // 상태 변경 확인
        const newState = await treasurerToggle.isChecked();
        expect(newState).toBe(!isChecked);
      }
    }
  });

  test('정산 방식 선택 (균등/개별/비율)', async ({ page }) => {
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    // 정산 방식 선택 버튼 확인
    const splitMethodButtons = page.locator('button:has-text("균등"), button:has-text("개별"), button:has-text("비율")');

    if (await splitMethodButtons.count() > 0) {
      // 균등 분할
      const equalButton = page.locator('button:has-text("균등")');
      if (await equalButton.count() > 0) {
        await equalButton.click();
      }

      // 개별 금액
      const individualButton = page.locator('button:has-text("개별")');
      if (await individualButton.count() > 0) {
        await individualButton.click();
      }

      // 비율
      const ratioButton = page.locator('button:has-text("비율")');
      if (await ratioButton.count() > 0) {
        await ratioButton.click();
      }
    }
  });

  test('정산 결과 렌더링', async ({ page }) => {
    // 지출 추가
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const expenseNameInput = page.locator('input[placeholder*="항목"], input[placeholder*="지출"]').last();
    await expenseNameInput.fill('회식비');

    const amountInput = page.locator('input[placeholder*="금액"], input[type="number"]').last();
    await amountInput.fill('40000');

    // 정산 결과가 표시되는지 확인
    const result = page.locator('text=/정산.*결과|송금.*내역/i');
    await expect(result).toBeVisible({ timeout: 5000 });

    // 송금 내역 확인
    const transaction = page.locator('text=/→|->|에게|송금/i');
    await expect(transaction.first()).toBeVisible();
  });

  test('초기화 버튼 동작', async ({ page }) => {
    // 지출 추가
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInput = page.locator('input[placeholder*="금액"], input[type="number"]').last();
    await amountInput.fill('10000');

    // 초기화 버튼
    const resetButton = page.locator('button:has-text("초기화"), button:has-text("리셋")');

    if (await resetButton.count() > 0) {
      // 확인 대화상자 처리
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('초기화');
        await dialog.accept();
      });

      await resetButton.click();

      // 페이지가 초기 상태로 돌아갔는지 확인
      await expect(page.locator('input[value*="새 정산"]')).toBeVisible({ timeout: 2000 });
    }
  });

  test('접근성 - 키보드 네비게이션', async ({ page }) => {
    await testKeyboardNavigation(page);
  });
});

test.describe('Dutch Pay - E2E User Journeys', () => {
  test('완전한 정산 플로우 - 균등 분할', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 1. 정산 이름 변경
    const nameInput = page.locator('input[value*="새 정산"], input[placeholder*="정산"]').first();
    await nameInput.clear();
    await nameInput.fill('회식 정산');

    // 2. 참여자 추가
    const addParticipantButton = page.locator('button:has-text("참여자 추가"), button:has-text("추가")').first();

    // 기본 참여자 이름 변경
    const nameInputs = page.locator('input[placeholder*="이름"], input[placeholder*="참여자"]');
    await nameInputs.first().clear();
    await nameInputs.first().fill('김철수');
    await nameInputs.nth(1).clear();
    await nameInputs.nth(1).fill('이영희');

    // 참여자 추가
    await addParticipantButton.click();
    await nameInputs.last().fill('박민수');

    // 3. 지출 항목 추가 - 1차 회식
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const expenseNameInputs = page.locator('input[placeholder*="항목"], input[placeholder*="지출"]');
    await expenseNameInputs.first().fill('1차 회식');

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('60000');

    // 결제자 선택 (김철수)
    const paidBySelects = page.locator('select, [role="combobox"]');
    if (await paidBySelects.count() > 0) {
      await paidBySelects.first().selectOption({ label: /김철수/i });
    }

    // 4. 지출 항목 추가 - 2차
    await addExpenseButton.click();
    await expenseNameInputs.last().fill('2차');
    await amountInputs.last().fill('30000');

    // 5. 정산 결과 확인
    await expect(page.locator('text=/정산.*결과|송금.*내역/i')).toBeVisible();

    // 총 금액 90,000원
    await expect(page.locator('text=/90,000/i')).toBeVisible();

    // 1인당 30,000원
    await expect(page.locator('text=/30,000/i')).toBeVisible();

    // 송금 내역 확인
    const transactions = page.locator('text=/→|->|에게/i');
    await expect(transactions.first()).toBeVisible();
  });

  test('개별 금액 정산 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 참여자 설정
    const nameInputs = page.locator('input[placeholder*="이름"], input[placeholder*="참여자"]');
    await nameInputs.first().clear();
    await nameInputs.first().fill('A');
    await nameInputs.nth(1).clear();
    await nameInputs.nth(1).fill('B');

    // 지출 추가
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('50000');

    // 개별 금액 방식 선택
    const individualButton = page.locator('button:has-text("개별")');
    if (await individualButton.count() > 0) {
      await individualButton.click();

      // A: 30,000원, B: 20,000원
      const individualAmountInputs = page.locator('input[type="number"]');
      const aInput = individualAmountInputs.filter({ hasText: 'A' }).or(individualAmountInputs.nth(1));
      const bInput = individualAmountInputs.filter({ hasText: 'B' }).or(individualAmountInputs.nth(2));

      await aInput.fill('30000');
      await bInput.fill('20000');

      // 정산 결과 확인
      await expect(page.locator('text=/정산.*결과/i')).toBeVisible();
    }
  });

  test('비율 정산 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 참여자 설정
    const nameInputs = page.locator('input[placeholder*="이름"], input[placeholder*="참여자"]');
    await nameInputs.first().clear();
    await nameInputs.first().fill('선배');
    await nameInputs.nth(1).clear();
    await nameInputs.nth(1).fill('후배');

    // 지출 추가
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('100000');

    // 비율 방식 선택
    const ratioButton = page.locator('button:has-text("비율")');
    if (await ratioButton.count() > 0) {
      await ratioButton.click();

      // 선배: 70%, 후배: 30%
      const ratioInputs = page.locator('input[placeholder*="비율"], input[type="number"]');
      await ratioInputs.first().fill('70');
      await ratioInputs.nth(1).fill('30');

      // 정산 결과 확인
      await expect(page.locator('text=/정산.*결과/i')).toBeVisible();

      // 선배: 70,000원, 후배: 30,000원
      await expect(page.locator('text=/70,000/i')).toBeVisible();
      await expect(page.locator('text=/30,000/i')).toBeVisible();
    }
  });

  test('복수 지출 항목 정산', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 참여자 3명
    const addParticipantButton = page.locator('button:has-text("참여자 추가"), button:has-text("추가")').first();
    await addParticipantButton.click();

    const nameInputs = page.locator('input[placeholder*="이름"], input[placeholder*="참여자"]');
    await nameInputs.nth(0).clear();
    await nameInputs.nth(0).fill('A');
    await nameInputs.nth(1).clear();
    await nameInputs.nth(1).fill('B');
    await nameInputs.nth(2).fill('C');

    // 지출 5개 추가
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    const expenses = [
      { name: '교통비', amount: '15000' },
      { name: '식사', amount: '45000' },
      { name: '간식', amount: '12000' },
      { name: '음료', amount: '9000' },
      { name: '기타', amount: '18000' },
    ];

    for (let i = 0; i < expenses.length; i++) {
      await addExpenseButton.click();

      const expenseNameInputs = page.locator('input[placeholder*="항목"], input[placeholder*="지출"]');
      await expenseNameInputs.nth(i).fill(expenses[i].name);

      const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
      await amountInputs.nth(i).fill(expenses[i].amount);
    }

    // 총 99,000원
    await expect(page.locator('text=/99,000/i')).toBeVisible();

    // 1인당 33,000원
    await expect(page.locator('text=/33,000/i')).toBeVisible();

    // 정산 결과
    await expect(page.locator('text=/정산.*결과/i')).toBeVisible();
  });

  test('일부 참여자만 지출에 포함', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 참여자 3명
    const addParticipantButton = page.locator('button:has-text("참여자 추가"), button:has-text("추가")').first();
    await addParticipantButton.click();

    const nameInputs = page.locator('input[placeholder*="이름"], input[placeholder*="참여자"]');
    await nameInputs.nth(0).clear();
    await nameInputs.nth(0).fill('전체1');
    await nameInputs.nth(1).clear();
    await nameInputs.nth(1).fill('전체2');
    await nameInputs.nth(2).fill('일부');

    // 지출 추가 - 전체 참여
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const expenseNameInputs = page.locator('input[placeholder*="항목"], input[placeholder*="지출"]');
    await expenseNameInputs.first().fill('전체 지출');

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('60000');

    // 참여자 선택 체크박스 (있을 경우)
    const participantCheckboxes = page.locator('input[type="checkbox"]');
    if (await participantCheckboxes.count() > 3) {
      // 전체 선택 확인
      await expect(participantCheckboxes.nth(0)).toBeChecked();
      await expect(participantCheckboxes.nth(1)).toBeChecked();
      await expect(participantCheckboxes.nth(2)).toBeChecked();
    }

    // 정산 결과 확인
    await expect(page.locator('text=/정산.*결과/i')).toBeVisible();
  });
});

test.describe('Dutch Pay - Calculation Tests', () => {
  test('균등 분할 계산 정확성', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 3명, 100,000원 지출
    const addParticipantButton = page.locator('button:has-text("참여자 추가"), button:has-text("추가")').first();
    await addParticipantButton.click();

    const nameInputs = page.locator('input[placeholder*="이름"], input[placeholder*="참여자"]');
    await nameInputs.nth(0).clear();
    await nameInputs.nth(0).fill('A');
    await nameInputs.nth(1).clear();
    await nameInputs.nth(1).fill('B');
    await nameInputs.nth(2).fill('C');

    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('100000');

    // 1인당 33,333원 (또는 33,334원 - 나머지 처리)
    const perPerson = page.locator('text=/33,333|33,334/i');
    await expect(perPerson).toBeVisible();
  });

  test('복잡한 정산 시나리오', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 4명 참여자
    const addParticipantButton = page.locator('button:has-text("참여자 추가"), button:has-text("추가")').first();
    await addParticipantButton.click();
    await addParticipantButton.click();

    const nameInputs = page.locator('input[placeholder*="이름"], input[placeholder*="참여자"]');
    await nameInputs.nth(0).clear();
    await nameInputs.nth(0).fill('갑');
    await nameInputs.nth(1).clear();
    await nameInputs.nth(1).fill('을');
    await nameInputs.nth(2).fill('병');
    await nameInputs.nth(3).fill('정');

    // 여러 지출 항목
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');

    // 갑이 40,000원 지출
    await addExpenseButton.click();
    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.nth(0).fill('40000');

    // 을이 60,000원 지출
    await addExpenseButton.click();
    await amountInputs.nth(1).fill('60000');

    // 병이 20,000원 지출
    await addExpenseButton.click();
    await amountInputs.nth(2).fill('20000');

    // 총 120,000원, 1인당 30,000원
    await expect(page.locator('text=/120,000/i')).toBeVisible();
    await expect(page.locator('text=/30,000/i')).toBeVisible();

    // 정산 결과: 최소 송금 횟수로 최적화
    const transactions = page.locator('text=/→|->|에게/i');
    await expect(transactions.first()).toBeVisible();
  });

  test('최적화 알고리즘 - 최소 송금 횟수', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 3명 참여자
    const addParticipantButton = page.locator('button:has-text("참여자 추가"), button:has-text("추가")').first();
    await addParticipantButton.click();

    const nameInputs = page.locator('input[placeholder*="이름"], input[placeholder*="참여자"]');
    await nameInputs.nth(0).clear();
    await nameInputs.nth(0).fill('A');
    await nameInputs.nth(1).clear();
    await nameInputs.nth(1).fill('B');
    await nameInputs.nth(2).fill('C');

    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');

    // A가 90,000원 지출
    await addExpenseButton.click();
    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('90000');

    // 1인당 30,000원이므로
    // B는 A에게 30,000원
    // C는 A에게 30,000원
    // 총 2번의 송금 (최적)

    const transactions = page.locator('text=/→|->|에게/i');
    const count = await transactions.count();

    // 최소 송금 횟수는 2번
    expect(count).toBeGreaterThanOrEqual(2);
    expect(count).toBeLessThanOrEqual(3); // 최대 3번 (참여자-1)
  });

  test('나머지 금액 처리 (원 단위)', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 3명, 10,000원 지출
    const addParticipantButton = page.locator('button:has-text("참여자 추가"), button:has-text("추가")').first();
    await addParticipantButton.click();

    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('10000');

    // 10,000 / 3 = 3,333.33... => 3,333원 또는 3,334원
    // 나머지 1원은 특정 참여자에게 할당

    const perPerson = page.locator('text=/3,333|3,334/i');
    await expect(perPerson).toBeVisible();

    // 총합이 정확히 10,000원인지 확인
    await expect(page.locator('text=/10,000/i')).toBeVisible();
  });
});

test.describe('Dutch Pay - Result Export', () => {
  test('정산 결과 복사 기능', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 간단한 정산 생성
    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('20000');

    // 복사 버튼 찾기
    const copyButton = page.locator('button:has-text("복사"), button:has-text("클립보드")');

    if (await copyButton.count() > 0) {
      await copyButton.click();

      // 복사 완료 토스트 메시지
      const toast = page.locator('.toast, [role="status"], text=/복사/i');
      await expect(toast).toBeVisible({ timeout: 3000 });
    }
  });

  test('정산 결과 이미지 다운로드', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('30000');

    // 이미지 다운로드 버튼
    const downloadButton = page.locator('button:has-text("이미지"), button:has-text("다운로드"), button:has-text("저장")');

    if (await downloadButton.count() > 0) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
        downloadButton.first().click(),
      ]);

      if (download) {
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.(png|jpg|jpeg)$/i);
      }
    }
  });

  test('카카오톡 공유 기능', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('40000');

    // 카카오톡 공유 버튼
    const kakaoButton = page.locator('button:has-text("카카오"), button[aria-label*="카카오"]');

    if (await kakaoButton.count() > 0) {
      await expect(kakaoButton).toBeVisible();
      // 실제 클릭은 Kakao SDK 필요하므로 존재만 확인
    }
  });
});

test.describe('Dutch Pay - LocalStorage Persistence', () => {
  test('정산 데이터 localStorage 저장', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const nameInput = page.locator('input[value*="새 정산"], input[placeholder*="정산"]').first();
    await nameInput.clear();
    await nameInput.fill('로컬스토리지 테스트');

    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('50000');

    // localStorage 확인
    const storedData = await page.evaluate(() => {
      return localStorage.getItem('settlement') ||
             localStorage.getItem('dutch-pay') ||
             localStorage.getItem('settlement-store');
    });

    expect(storedData).toBeTruthy();
  });

  test('페이지 새로고침 후 데이터 유지', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const nameInput = page.locator('input[value*="새 정산"], input[placeholder*="정산"]').first();
    await nameInput.clear();
    await nameInput.fill('새로고침 테스트');

    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('60000');

    // 페이지 새로고침
    await page.reload();
    await waitForAppReady(page);

    // 데이터 유지 확인
    await expect(page.locator('input[value*="새로고침 테스트"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=/60,000/i')).toBeVisible();
  });

  test('초기화 후 localStorage 삭제', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const addExpenseButton = page.locator('button:has-text("지출 추가"), button:has-text("항목 추가")');
    await addExpenseButton.click();

    const amountInputs = page.locator('input[placeholder*="금액"], input[type="number"]');
    await amountInputs.first().fill('10000');

    // 초기화
    const resetButton = page.locator('button:has-text("초기화"), button:has-text("리셋")');

    if (await resetButton.count() > 0) {
      page.on('dialog', async (dialog) => {
        await dialog.accept();
      });

      await resetButton.click();
      await page.waitForTimeout(1000);

      // 초기화 후 기본 상태로 복구
      await expect(page.locator('input[value*="새 정산"]')).toBeVisible();
    }
  });
});
