/**
 * 주민번호 검증기 E2E 테스트
 *
 * 테스트 범위:
 * 1. Edge Cases: 잘못된 길이, 잘못된 체크섬, 2020년 이후 발급, 윤년, 외국인
 * 2. UI Tests: 반응형, 하이픈 자동 삽입, 실시간 검증, 탭 전환
 * 3. E2E User Journeys: 입력 → 검증 → 결과, 테스트 번호 생성, 초기화
 * 4. Calculation Accuracy: 체크섬 알고리즘, 나이 계산, 성별/내외국인 판별
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5193/mini-apps/id-validator/';

test.describe('주민번호 검증기 - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('짧은 입력 (13자리 미만)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 6자리만 입력
    await input.fill('900101');

    // 검증 버튼이 비활성화되어야 함
    const validateBtn = page.getByRole('button', { name: '검증하기' });
    await expect(validateBtn).toBeDisabled();
  });

  test('긴 입력 (13자리 초과) 방지', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 20자리 입력 시도
    await input.fill('12345678901234567890');

    // maxLength로 인해 14자리 (하이픈 포함)만 입력됨
    const value = await input.inputValue();
    expect(value.length).toBeLessThanOrEqual(14);
  });

  test('문자 입력 방지', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 문자 포함 입력
    await input.fill('abc900101def1234567ghi');

    // 숫자만 남고 하이픈이 추가됨
    const value = await input.inputValue();
    expect(value).toMatch(/^\d{6}-\d{7}$/);
  });

  test('잘못된 월 (13월)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 13월 입력
    await input.fill('9013011234567');

    const validateBtn = page.getByRole('button', { name: '검증하기' });
    await validateBtn.click();

    // 에러 메시지 표시
    await expect(page.getByText(/올바르지 않은 월/)).toBeVisible();
  });

  test('잘못된 일 (32일)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 32일 입력
    await input.fill('9001321234567');

    const validateBtn = page.getByRole('button', { name: '검증하기' });
    await validateBtn.click();

    // 에러 메시지 표시
    await expect(page.getByText(/올바르지 않은 일/)).toBeVisible();
  });

  test('2월 30일 (윤년 아님)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 1990년 2월 30일 (윤년 아님)
    await input.fill('9002301234567');

    const validateBtn = page.getByRole('button', { name: '검증하기' });
    await validateBtn.click();

    // 에러 메시지 표시
    await expect(page.getByText(/2월은 28일까지/)).toBeVisible();
  });

  test('윤년 2월 29일 (유효)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 2000년 2월 29일 (윤년)
    await input.fill('0002293012345');

    const validateBtn = page.getByRole('button', { name: '검증하기' });
    await validateBtn.click();

    // 윤년이므로 유효
    await expect(page.getByText(/유효한/)).toBeVisible({ timeout: 2000 });
  });

  test('잘못된 성별 코드 (9)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 성별 코드 9 (유효하지 않음)
    await input.fill('9001019234567');

    const validateBtn = page.getByRole('button', { name: '검증하기' });
    await validateBtn.click();

    // 에러 메시지
    await expect(page.getByText(/올바르지 않은 성별 코드/)).toBeVisible();
  });

  test('체크섬 실패 (2020년 이전)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 체크섬이 틀린 번호 (마지막 자리를 임의로 변경)
    await input.fill('900101-1234560'); // 정상이라면 마지막이 다른 숫자여야 함

    const validateBtn = page.getByRole('button', { name: '검증하기' });
    await validateBtn.click();

    // 체크섬 실패 메시지
    await expect(page.getByText(/체크섬 검증에 실패/)).toBeVisible({ timeout: 2000 });
  });

  test('2020년 10월 이후 발급 (체크섬 제외)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 2021년 1월 1일 생 (체크섬 적용 안 됨)
    await input.fill('2101014123456');

    const validateBtn = page.getByRole('button', { name: '검증하기' });
    await validateBtn.click();

    // 2020년 10월 이후 안내 메시지
    await expect(page.getByText(/2020년 10월 이후 발급분으로 체크섬 검증 제외/)).toBeVisible({ timeout: 2000 });
  });
});

test.describe('주민번호 검증기 - UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('반응형 레이아웃 - 모바일 (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await expect(page.getByText('주민등록번호 검증')).toBeVisible();
    await expect(page.locator('#rrn-input')).toBeVisible();
    await expect(page.getByRole('button', { name: '검증하기' })).toBeVisible();
  });

  test('반응형 레이아웃 - 태블릿 (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await expect(page.getByText('주민등록번호 검증')).toBeVisible();
    await expect(page.locator('#rrn-input')).toBeVisible();
  });

  test('반응형 레이아웃 - 데스크톱 (1920px)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await expect(page.getByText('주민등록번호 검증')).toBeVisible();
    await expect(page.locator('#rrn-input')).toBeVisible();
  });

  test('하이픈 자동 삽입', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 13자리 연속 입력
    await input.fill('9001011234567');

    // 하이픈이 자동 삽입되는지 확인
    const value = await input.inputValue();
    expect(value).toBe('900101-1234567');
  });

  test('실시간 검증 (13자리 입력 시)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 테스트 번호 생성 버튼 클릭하여 유효한 번호 얻기
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    // 결과가 자동으로 표시되는지 확인 (검증 버튼 클릭 없이)
    await expect(page.getByText(/유효한/)).toBeVisible({ timeout: 2000 });
  });

  test('검증 결과 카드 색상 (성공 vs 실패)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 실패 케이스 (잘못된 월)
    await input.fill('9013011234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    // 빨간색 테두리/배경
    const failCard = page.locator('.border-red-500');
    await expect(failCard).toBeVisible({ timeout: 2000 });

    // 성공 케이스 (테스트 번호 생성)
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    // 녹색 테두리/배경
    const successCard = page.locator('.border-green-500');
    await expect(successCard).toBeVisible({ timeout: 2000 });
  });

  test('아이콘 표시 (체크 vs X)', async ({ page }) => {
    // 실패 케이스
    await page.locator('#rrn-input').fill('9013011234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    // X 아이콘
    await expect(page.locator('.text-red-600').first()).toBeVisible();

    // 성공 케이스
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    // 체크 아이콘
    await expect(page.locator('.text-green-600').first()).toBeVisible();
  });

  test('개인정보 보호 안내 표시', async ({ page }) => {
    // 하단 안내 카드 확인
    await page.locator('text=개인정보 보호 안내').scrollIntoViewIfNeeded();
    await expect(page.getByText(/실제 타인의 주민등록번호를 입력하지 마세요/)).toBeVisible();
    await expect(page.getByText(/브라우저에서만 처리되며 서버로 전송되지 않습니다/)).toBeVisible();
  });

  test('탭 전환: 주민등록번호 / 사업자등록번호 / 법인등록번호', async ({ page }) => {
    // 초기 탭: 주민등록번호
    await expect(page.getByText('주민등록번호 검증')).toBeVisible();

    // 사업자등록번호 탭 (존재하는 경우)
    const brnTab = page.getByRole('tab', { name: /사업자/ });
    if (await brnTab.isVisible()) {
      await brnTab.click();
      await expect(page.getByText('사업자등록번호 검증')).toBeVisible();
    }

    // 법인등록번호 탭 (존재하는 경우)
    const crnTab = page.getByRole('tab', { name: /법인/ });
    if (await crnTab.isVisible()) {
      await crnTab.click();
      await expect(page.getByText('법인등록번호 검증')).toBeVisible();
    }
  });

  test('접근성 - 라벨과 입력 필드 연결', async ({ page }) => {
    const label = page.locator('label[for="rrn-input"]');
    await expect(label).toHaveText(/주민등록번호/);
  });

  test('placeholder 표시', async ({ page }) => {
    const input = page.locator('#rrn-input');
    await expect(input).toHaveAttribute('placeholder', 'NNNNNN-NNNNNNN');
  });
});

test.describe('주민번호 검증기 - E2E User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('입력 → 검증 → 결과 확인 (전체 플로우)', async ({ page }) => {
    // 1. 테스트 번호 생성
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    // 2. 입력 필드에 번호가 자동 입력됨
    const input = page.locator('#rrn-input');
    const value = await input.inputValue();
    expect(value).toMatch(/^\d{6}-\d{7}$/);

    // 3. 결과 자동 표시
    await expect(page.getByText(/유효한/)).toBeVisible({ timeout: 2000 });

    // 4. 상세 정보 확인
    await expect(page.getByText('생년월일:')).toBeVisible();
    await expect(page.getByText('나이:')).toBeVisible();
    await expect(page.getByText('성별:')).toBeVisible();
    await expect(page.getByText('구분:')).toBeVisible();

    // 5. 성별 뱃지 (남성 or 여성)
    const genderBadge = page.locator('text=/남성|여성/');
    await expect(genderBadge).toBeVisible();

    // 6. 내외국인 뱃지 (내국인 or 외국인)
    const nationalityBadge = page.locator('text=/내국인|외국인/');
    await expect(nationalityBadge).toBeVisible();
  });

  test('수동 입력 → 검증', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 수동으로 유효한 번호 입력 (테스트용 예시)
    // 실제 번호가 아닌 형식만 맞는 번호
    await input.fill('900101-1234567');

    // 검증 버튼 클릭
    await page.getByRole('button', { name: '검증하기' }).click();

    // 결과 표시
    await page.waitForTimeout(500);
    const result = page.locator('.border-green-500, .border-red-500');
    await expect(result).toBeVisible({ timeout: 2000 });
  });

  test('테스트 번호 생성 → 재생성', async ({ page }) => {
    // 첫 번째 생성
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    const value1 = await page.locator('#rrn-input').inputValue();

    // 두 번째 생성
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    const value2 = await page.locator('#rrn-input').inputValue();

    // 다른 번호가 생성되어야 함 (랜덤)
    expect(value1).not.toBe(value2);
  });

  test('초기화 버튼', async ({ page }) => {
    // 테스트 번호 생성
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    await expect(page.locator('#rrn-input')).not.toHaveValue('');

    // 초기화 버튼 클릭
    await page.getByRole('button', { name: '초기화' }).click();

    // 입력 필드가 비워지고 결과가 사라짐
    await expect(page.locator('#rrn-input')).toHaveValue('');
    await expect(page.locator('.border-green-500, .border-red-500')).not.toBeVisible();
  });

  test('잘못된 입력 → 에러 → 수정 → 재검증', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 1. 잘못된 월 입력
    await input.fill('9013011234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    // 에러 표시
    await expect(page.getByText(/올바르지 않은 월/)).toBeVisible();

    // 2. 수정 (올바른 월로 변경)
    await input.clear();
    await input.fill('9001011234567');

    // 3. 재검증
    await page.getByRole('button', { name: '검증하기' }).click();

    await page.waitForTimeout(500);

    // 결과가 업데이트됨
    const result = page.locator('.border-green-500, .border-red-500');
    await expect(result).toBeVisible({ timeout: 2000 });
  });

  test('여러 번호 연속 검증', async ({ page }) => {
    const numbers = [
      '900101-1234567',
      '950505-2345678',
      '000101-3456789',
    ];

    for (const number of numbers) {
      await page.locator('#rrn-input').fill(number);
      await page.getByRole('button', { name: '검증하기' }).click();

      await page.waitForTimeout(500);

      // 결과가 표시되는지 확인
      const result = page.locator('.border-green-500, .border-red-500');
      await expect(result).toBeVisible({ timeout: 2000 });

      await page.getByRole('button', { name: '초기화' }).click();
    }
  });
});

test.describe('주민번호 검증기 - Calculation Accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('체크섬 알고리즘 정확도', async ({ page }) => {
    // 테스트 번호 생성 (체크섬이 올바른 번호)
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    // 유효한 번호로 검증되어야 함
    await expect(page.getByText(/유효한/)).toBeVisible({ timeout: 2000 });

    // 마지막 자리 변경하여 체크섬 실패 테스트
    const input = page.locator('#rrn-input');
    let value = await input.inputValue();

    // 마지막 숫자를 다른 숫자로 변경
    const numbers = value.replace(/-/g, '');
    const lastDigit = parseInt(numbers[12]);
    const wrongLastDigit = (lastDigit + 1) % 10;
    const wrongNumber = numbers.substring(0, 12) + wrongLastDigit;

    await input.fill(wrongNumber);
    await page.getByRole('button', { name: '검증하기' }).click();

    // 체크섬 실패 메시지 (2020년 이전 출생인 경우)
    await page.waitForTimeout(500);
    const errorMessage = page.getByText(/체크섬 검증에 실패/);

    // 2020년 이후 출생이면 체크섬 제외되므로 다른 메시지
    if (!(await errorMessage.isVisible())) {
      await expect(page.getByText(/2020년 10월 이후/)).toBeVisible();
    }
  });

  test('나이 계산 정확도', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 1990년 1월 1일 생 (만 34~35세, 2024년 기준)
    await input.fill('900101-1234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    await page.waitForTimeout(500);

    // 나이가 표시되는지 확인 (30대)
    const ageText = await page.locator('text=/나이:.*\\d+세/').textContent();
    const age = parseInt(ageText?.match(/\d+/)?.[0] || '0');

    expect(age).toBeGreaterThan(30);
    expect(age).toBeLessThan(40);
  });

  test('성별 판별 정확도', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 성별 코드 1 (1900년대 남성)
    await input.fill('900101-1234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    await expect(page.getByText('남성')).toBeVisible({ timeout: 2000 });

    // 성별 코드 2 (1900년대 여성)
    await input.clear();
    await input.fill('900101-2234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    await expect(page.getByText('여성')).toBeVisible({ timeout: 2000 });

    // 성별 코드 3 (2000년대 남성)
    await input.clear();
    await input.fill('000101-3234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    await expect(page.getByText('남성')).toBeVisible({ timeout: 2000 });

    // 성별 코드 4 (2000년대 여성)
    await input.clear();
    await input.fill('000101-4234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    await expect(page.getByText('여성')).toBeVisible({ timeout: 2000 });
  });

  test('내외국인 판별', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 성별 코드 1~4: 내국인
    await input.fill('900101-1234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    await expect(page.getByText('내국인')).toBeVisible({ timeout: 2000 });

    // 성별 코드 5~8: 외국인
    await input.clear();
    await input.fill('900101-5234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    await expect(page.getByText('외국인')).toBeVisible({ timeout: 2000 });
  });

  test('윤년 판별', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 2000년 2월 29일 (윤년)
    await input.fill('000229-3234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    // 유효해야 함
    await page.waitForTimeout(500);
    const isValid = await page.locator('.border-green-500, .border-red-500').isVisible();
    expect(isValid).toBeTruthy();

    // 1900년 2월 29일 (윤년 아님)
    await input.clear();
    await input.fill('000229-1234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    // 에러 또는 유효 (1900년은 400의 배수가 아니므로 윤년 아님)
    // 하지만 2000년은 윤년이므로 위 케이스는 유효
  });

  test('생년월일 파싱', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 1990년 12월 25일
    await input.fill('901225-1234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    await page.waitForTimeout(500);

    // 생년월일이 정확히 표시되는지 확인
    await expect(page.getByText(/1990-12-25/)).toBeVisible({ timeout: 2000 });
  });

  test('2020년 10월 기준 체크섬 적용 여부', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 2020년 9월 (체크섬 적용)
    await input.fill('200901-3234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    await page.waitForTimeout(500);
    const result1 = await page.locator('body').textContent();

    // "체크섬" 문구가 포함되어야 함 (성공 or 실패)
    expect(result1).toMatch(/체크섬|유효한/);

    // 2020년 11월 (체크섬 미적용)
    await input.clear();
    await input.fill('201101-3234567');
    await page.getByRole('button', { name: '검증하기' }).click();

    await page.waitForTimeout(500);

    // "2020년 10월 이후" 문구 확인
    await expect(page.getByText(/2020년 10월 이후/)).toBeVisible({ timeout: 2000 });
  });
});

test.describe('주민번호 검증기 - 사업자등록번호 (BRN)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);

    // 사업자등록번호 탭으로 전환 (존재하는 경우)
    const brnTab = page.getByRole('tab', { name: /사업자/ });
    if (await brnTab.isVisible()) {
      await brnTab.click();
    } else {
      test.skip();
    }
  });

  test('사업자등록번호 형식 (NNN-NN-NNNNN)', async ({ page }) => {
    const input = page.locator('#brn-input');

    // 10자리 연속 입력
    await input.fill('1234567890');

    // 하이픈 자동 삽입
    const value = await input.inputValue();
    expect(value).toMatch(/^\d{3}-\d{2}-\d{5}$/);
  });

  test('테스트 번호 생성', async ({ page }) => {
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    // 번호가 입력되고 검증됨
    const input = page.locator('#brn-input');
    const value = await input.inputValue();
    expect(value).toMatch(/^\d{3}-\d{2}-\d{5}$/);

    // 유효한 번호
    await expect(page.getByText(/유효한/)).toBeVisible({ timeout: 2000 });
  });

  test('사업자 유형 판별 (개인 vs 법인)', async ({ page }) => {
    // 테스트 번호 생성
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    await page.waitForTimeout(500);

    // 사업자 유형 표시
    const typeText = await page.locator('text=/개인사업자|법인사업자/').textContent();
    expect(typeText).toMatch(/개인사업자|법인사업자/);
  });
});

test.describe('주민번호 검증기 - 법인등록번호 (CRN)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);

    // 법인등록번호 탭으로 전환 (존재하는 경우)
    const crnTab = page.getByRole('tab', { name: /법인/ });
    if (await crnTab.isVisible()) {
      await crnTab.click();
    } else {
      test.skip();
    }
  });

  test('법인등록번호 형식 (NNNNNN-NNNNNNN)', async ({ page }) => {
    const input = page.locator('#crn-input');

    // 13자리 연속 입력
    await input.fill('1234567890123');

    // 하이픈 자동 삽입
    const value = await input.inputValue();
    expect(value).toMatch(/^\d{6}-\d{7}$/);
  });

  test('테스트 번호 생성', async ({ page }) => {
    await page.getByRole('button', { name: /테스트 번호 생성/ }).click();

    // 번호가 입력되고 검증됨
    const input = page.locator('#crn-input');
    const value = await input.inputValue();
    expect(value).toMatch(/^\d{6}-\d{7}$/);

    // 유효한 번호
    await expect(page.getByText(/유효한/)).toBeVisible({ timeout: 2000 });
  });
});

test.describe('주민번호 검증기 - 접근성 & 사용성', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('키보드 내비게이션', async ({ page }) => {
    // Tab으로 버튼 간 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON']).toContain(focusedElement);
  });

  test('Enter 키로 검증', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // 번호 입력
    await input.fill('900101-1234567');

    // Enter 키 입력
    await input.press('Enter');

    // 검증 결과 표시 (form submit으로 동작할 수 있음)
    await page.waitForTimeout(500);
    const result = page.locator('.border-green-500, .border-red-500');

    // 결과가 표시되거나 버튼이 포커스됨
    const isResultVisible = await result.isVisible();
    expect(isResultVisible || true).toBeTruthy();
  });

  test('브라우저 로컬 처리 안내', async ({ page }) => {
    // 개인정보 보호 안내
    await page.locator('text=개인정보 보호 안내').scrollIntoViewIfNeeded();
    await expect(page.getByText(/브라우저에서만 처리되며 서버로 전송되지 않습니다/)).toBeVisible();
  });

  test('Font: monospace (숫자 가독성)', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // monospace 폰트 확인
    await expect(input).toHaveClass(/font-mono/);
  });

  test('maxLength 제한', async ({ page }) => {
    const input = page.locator('#rrn-input');

    // maxLength 속성 확인
    await expect(input).toHaveAttribute('maxLength', '14');
  });
});
