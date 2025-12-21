/**
 * 학점 계산기 E2E 테스트
 *
 * 테스트 범위:
 * 1. Edge Cases: 0학점, P/F 과목, 재수강, 학점 체계 변경
 * 2. UI Tests: 반응형, 학기 추가/삭제, 탭 전환, 차트 렌더링
 * 3. E2E User Journeys: 학기 추가 → 과목 입력 → GPA 계산, 목표 학점, 데이터 백업
 * 4. Calculation Accuracy: GPA 계산, 전공/교양 GPA, 누적 GPA, 목표 시뮬레이터
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5194/mini-apps/gpa-calculator/';

test.describe('학점 계산기 - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('학기 없이 시작 (초기 상태)', async ({ page }) => {
    // 학기가 없을 때 GPA가 0으로 표시되는지 확인
    await expect(page.getByText('0.00')).toBeVisible();

    // 과목 추가 버튼이 비활성화되어 있어야 함
    const addCourseSection = page.locator('text=과목 추가');
    await expect(addCourseSection).not.toBeVisible();
  });

  test('학기 추가 후 과목 없음', async ({ page }) => {
    // 학기 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();

    // 연도/학기 선택
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // 과목이 없어도 GPA는 0으로 표시
    await expect(page.getByText('0.00')).toBeVisible();
  });

  test('Pass/Fail 과목 (P/NP) GPA 계산 제외', async ({ page }) => {
    // 학기 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // 일반 과목 추가
    await page.locator('#course-name').fill('미적분학');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '3학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // P/F 과목 추가
    await page.locator('#course-name').fill('체육');
    await page.locator('#pass-fail').click(); // P/F 체크
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'P' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // GPA는 A+ 과목만 반영 (4.5)
    await expect(page.getByText('4.50')).toBeVisible();
  });

  test('F 학점 과목 (이수 학점에서 제외)', async ({ page }) => {
    // 학기 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // F 학점 과목 추가
    await page.locator('#course-name').fill('물리학');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '3학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'F' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // GPA는 0.00, 이수 학점도 0
    await expect(page.getByText('0.00')).toBeVisible();
  });

  test('학점 체계 변경 (4.5 → 4.3 → 4.0)', async ({ page }) => {
    // 학기/과목 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    await page.locator('#course-name').fill('프로그래밍');
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 4.5 만점: A+ = 4.5
    await expect(page.getByText('4.50')).toBeVisible();

    // 4.3 만점으로 변경
    await page.locator('#scale-select').click();
    await page.getByRole('option', { name: '4.3 만점' }).click();

    // A+ = 4.3
    await expect(page.getByText('4.30')).toBeVisible();

    // 4.0 만점으로 변경
    await page.locator('#scale-select').click();
    await page.getByRole('option', { name: '4.0 만점' }).click();

    // A+ = 4.0
    await expect(page.getByText('4.00')).toBeVisible();
  });

  test('0.5 학점 과목', async ({ page }) => {
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // 0.5 학점 과목 추가
    await page.locator('#course-name').fill('세미나');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '0.5학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // GPA 4.5, 총 학점 0.5
    await expect(page.getByText('4.50')).toBeVisible();
  });
});

test.describe('학점 계산기 - UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('반응형 레이아웃 - 모바일 (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await expect(page.getByText('학점 계산기')).toBeVisible();
    await expect(page.getByRole('button', { name: /학기 추가/ })).toBeVisible();
  });

  test('반응형 레이아웃 - 태블릿 (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await expect(page.getByText('학점 계산기')).toBeVisible();
    await expect(page.locator('#scale-select')).toBeVisible();
  });

  test('반응형 레이아웃 - 데스크톱 (1920px)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // GPA 디스플레이 카드들이 가로로 배치되는지 확인
    const cumulativeGPA = page.locator('text=전체 평점').first();
    const majorGPA = page.locator('text=전공 평점').first();
    const generalGPA = page.locator('text=교양 평점').first();

    await expect(cumulativeGPA).toBeVisible();
    await expect(majorGPA).toBeVisible();
    await expect(generalGPA).toBeVisible();
  });

  test('탭 전환: 과목 관리 / 목표 학점 / 데이터', async ({ page }) => {
    // 초기 탭: 과목 관리
    await expect(page.getByRole('tab', { name: '과목 관리' })).toBeVisible();

    // 목표 학점 탭
    await page.getByRole('tab', { name: '목표 학점' }).click();
    await expect(page.getByText('목표 학점 시뮬레이터')).toBeVisible();

    // 데이터 탭
    await page.getByRole('tab', { name: '데이터' }).click();
    await expect(page.getByText('데이터 내보내기')).toBeVisible();

    // 다시 과목 관리 탭
    await page.getByRole('tab', { name: '과목 관리' }).click();
    await expect(page.getByRole('button', { name: /학기 추가/ })).toBeVisible();
  });

  test('학기 추가 다이얼로그', async ({ page }) => {
    // 학기 추가 버튼 클릭
    await page.getByRole('button', { name: /학기 추가/ }).click();

    // 다이얼로그 표시 확인
    await expect(page.getByText('새 학기 추가')).toBeVisible();

    // 연도 입력 필드
    await expect(page.locator('#year')).toBeVisible();

    // 학기 선택 필드
    await expect(page.locator('#term')).toBeVisible();

    // 취소 (다이얼로그 닫기)
    await page.keyboard.press('Escape');
    await expect(page.getByText('새 학기 추가')).not.toBeVisible();
  });

  test('과목 추가 폼 유효성', async ({ page }) => {
    // 학기 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // 과목명 없이 추가 시도
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 알림 메시지 확인 (alert)
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('과목명을 입력해주세요');
      await dialog.accept();
    });
  });

  test('학기 차트 렌더링', async ({ page }) => {
    // 학기 2개 추가하고 과목 입력
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    await page.locator('#course-name').fill('수학');
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 차트가 렌더링되는지 확인
    const chart = page.locator('.recharts-wrapper');
    await expect(chart).toBeVisible({ timeout: 3000 });
  });

  test('접근성 - 학점 체계 라벨', async ({ page }) => {
    const scaleLabel = page.locator('label[for="scale-select"]');
    await expect(scaleLabel).toHaveText('학점 체계');
  });
});

test.describe('학점 계산기 - E2E User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('학기 추가 → 과목 입력 → GPA 확인 (전체 플로우)', async ({ page }) => {
    // 1. 학기 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.locator('#term').click();
    await page.getByRole('option', { name: '1학기' }).click();
    await page.getByRole('button', { name: '추가' }).click();

    // 2. 과목 추가 (전공 과목)
    await page.locator('#course-name').fill('자료구조');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '3학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.locator('#course-category').click();
    await page.getByRole('option', { name: '전공' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 3. 과목 추가 (교양 과목)
    await page.locator('#course-name').fill('영어');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '2학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'B+' }).click();
    await page.locator('#course-category').click();
    await page.getByRole('option', { name: '교양' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 4. GPA 확인
    // 전체 평점 = (3 × 4.5 + 2 × 3.5) / (3 + 2) = 20.5 / 5 = 4.10
    await expect(page.getByText('4.10')).toBeVisible({ timeout: 2000 });

    // 5. 전공 평점 확인 (4.5)
    // 전공 평점은 전공 과목만 계산: 3 × 4.5 / 3 = 4.5
    await expect(page.getByText('4.50')).toBeVisible();

    // 6. 교양 평점 확인 (3.5)
    // 교양 평점: 2 × 3.5 / 2 = 3.5
    await expect(page.getByText('3.50')).toBeVisible();
  });

  test('여러 학기 추가 및 누적 GPA', async ({ page }) => {
    // 1학기 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.locator('#term').click();
    await page.getByRole('option', { name: '1학기' }).click();
    await page.getByRole('button', { name: '추가' }).click();

    await page.locator('#course-name').fill('수학');
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 2학기 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.locator('#term').click();
    await page.getByRole('option', { name: '2학기' }).click();
    await page.getByRole('button', { name: '추가' }).click();

    // 학기 선택 (2학기로 변경)
    const semesterSelect = page.locator('select, [role="combobox"]').first();
    await semesterSelect.click();
    await page.getByRole('option', { name: /2024-2학기/ }).click();

    await page.locator('#course-name').fill('물리학');
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'B+' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 누적 GPA 확인 (두 학기 평균)
    // (3 × 4.5 + 3 × 3.5) / 6 = 4.0
    await expect(page.getByText('4.00')).toBeVisible({ timeout: 2000 });
  });

  test('과목 삭제', async ({ page }) => {
    // 학기 및 과목 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    await page.locator('#course-name').fill('삭제할 과목');
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 과목 삭제 버튼 클릭
    const deleteButton = page.locator('button[aria-label*="삭제"], button:has-text("삭제")').first();

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await deleteButton.click();

    // 과목이 삭제되었는지 확인
    await expect(page.getByText('삭제할 과목')).not.toBeVisible();
  });

  test('학기 삭제', async ({ page }) => {
    // 학기 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // 학기 삭제 버튼 클릭
    const deleteSemesterBtn = page.locator('button:has-text("학기 삭제"), button[aria-label*="학기 삭제"]').first();

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await deleteSemesterBtn.click();

    // 학기가 삭제되었는지 확인
    await expect(page.getByText('2024-1학기')).not.toBeVisible();
  });

  test('목표 학점 시뮬레이터', async ({ page }) => {
    // 기존 GPA 설정 (과목 추가)
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    await page.locator('#course-name').fill('과목1');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '3학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A0' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 목표 학점 탭으로 이동
    await page.getByRole('tab', { name: '목표 학점' }).click();

    // 목표 학점 입력
    const targetGPAInput = page.locator('input[placeholder*="목표"], input[type="number"]').first();
    await targetGPAInput.fill('4.3');

    // 남은 학점 입력
    const remainingCreditsInput = page.locator('input[placeholder*="남은"], input[type="number"]').last();
    await remainingCreditsInput.fill('30');

    // 계산 결과 확인
    await expect(page.getByText(/남은 학기에 평균/)).toBeVisible({ timeout: 2000 });
  });

  test('데이터 내보내기 (JSON)', async ({ page }) => {
    // 학기 및 과목 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    await page.locator('#course-name').fill('데이터 테스트');
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 데이터 탭으로 이동
    await page.getByRole('tab', { name: '데이터' }).click();

    // 내보내기 버튼 클릭
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /내보내기/ }).click();
    const download = await downloadPromise;

    // 다운로드된 파일명 확인
    expect(download.suggestedFilename()).toContain('.json');
  });
});

test.describe('학점 계산기 - Calculation Accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('GPA 계산 정확도 (4.5 만점)', async ({ page }) => {
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // A+ (4.5) × 3학점
    await page.locator('#course-name').fill('과목1');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '3학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // A0 (4.0) × 2학점
    await page.locator('#course-name').fill('과목2');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '2학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A0' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 예상 GPA = (4.5 × 3 + 4.0 × 2) / (3 + 2) = 21.5 / 5 = 4.30
    await expect(page.getByText('4.30')).toBeVisible({ timeout: 2000 });
  });

  test('GPA 계산 정확도 (4.3 만점)', async ({ page }) => {
    // 학점 체계 변경
    await page.locator('#scale-select').click();
    await page.getByRole('option', { name: '4.3 만점' }).click();

    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // A+ (4.3) × 3학점
    await page.locator('#course-name').fill('과목1');
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // GPA = 4.3
    await expect(page.getByText('4.30')).toBeVisible({ timeout: 2000 });
  });

  test('GPA 계산 정확도 (4.0 만점)', async ({ page }) => {
    // 학점 체계 변경
    await page.locator('#scale-select').click();
    await page.getByRole('option', { name: '4.0 만점' }).click();

    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // A (4.0) × 3학점
    await page.locator('#course-name').fill('과목1');
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // GPA = 4.0
    await expect(page.getByText('4.00')).toBeVisible({ timeout: 2000 });
  });

  test('전공/교양 GPA 분리 계산', async ({ page }) => {
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // 전공 과목 (A+)
    await page.locator('#course-name').fill('전공1');
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.locator('#course-category').click();
    await page.getByRole('option', { name: '전공' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 교양 과목 (B+)
    await page.locator('#course-name').fill('교양1');
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'B+' }).click();
    await page.locator('#course-category').click();
    await page.getByRole('option', { name: '교양' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 전공 평점 = 4.5
    const majorGPA = page.locator('text=전공 평점').locator('..').locator('text=4.50');
    await expect(majorGPA).toBeVisible({ timeout: 2000 });

    // 교양 평점 = 3.5
    const generalGPA = page.locator('text=교양 평점').locator('..').locator('text=3.50');
    await expect(generalGPA).toBeVisible({ timeout: 2000 });
  });

  test('이수 학점 vs 신청 학점 (F 과목)', async ({ page }) => {
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // 통과 과목 (A+, 3학점)
    await page.locator('#course-name').fill('통과');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '3학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // F 학점 (3학점)
    await page.locator('#course-name').fill('실패');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '3학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'F' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 신청 학점 = 6, 이수 학점 = 3 (F 제외)
    await expect(page.getByText('6')).toBeVisible(); // 신청 학점
    await expect(page.getByText('3')).toBeVisible(); // 이수 학점
  });

  test('목표 학점 달성 가능 여부', async ({ page }) => {
    // 현재 GPA 3.0, 30학점
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    await page.locator('#course-name').fill('과목');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '3학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'B0' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 목표 학점 탭
    await page.getByRole('tab', { name: '목표 학점' }).click();

    // 달성 불가능한 목표 (4.5)
    const targetInput = page.locator('input[placeholder*="목표"]').first();
    await targetInput.fill('4.5');

    const remainingInput = page.locator('input[placeholder*="남은"]').first();
    await remainingInput.fill('3');

    // 달성 불가 메시지
    await expect(page.getByText(/목표 달성 불가능/)).toBeVisible({ timeout: 2000 });
  });

  test('소수점 반올림 (2자리)', async ({ page }) => {
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // 복잡한 GPA 계산 (소수점 발생)
    // A+ (4.5) × 2학점 = 9.0
    // B+ (3.5) × 3학점 = 10.5
    // 총합 = 19.5 / 5 = 3.9

    await page.locator('#course-name').fill('과목1');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '2학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    await page.locator('#course-name').fill('과목2');
    await page.locator('#course-credit').click();
    await page.getByRole('option', { name: '3학점' }).click();
    await page.locator('#course-grade').click();
    await page.getByRole('option', { name: 'B+' }).click();
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // GPA가 소수점 2자리로 표시되는지 확인
    await expect(page.getByText('3.90')).toBeVisible({ timeout: 2000 });
  });
});

test.describe('학점 계산기 - 접근성 & 사용성', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('키보드 내비게이션', async ({ page }) => {
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // Tab으로 필드 간 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(() => document.activeElement?.id);
    expect(['course-name', 'course-credit', 'course-grade', 'course-category']).toContain(focusedElement);
  });

  test('데이터 로컬 저장 (IndexedDB)', async ({ page }) => {
    // 학기 추가
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    await page.locator('#course-name').fill('저장 테스트');
    await page.getByRole('button', { name: /과목 추가/ }).click();

    // 페이지 새로고침
    await page.reload();

    // 데이터가 유지되는지 확인
    await expect(page.getByText('저장 테스트')).toBeVisible({ timeout: 2000 });
  });

  test('빈 과목명 입력 시 알림', async ({ page }) => {
    await page.getByRole('button', { name: /학기 추가/ }).click();
    await page.locator('#year').fill('2024');
    await page.getByRole('button', { name: '추가' }).click();

    // 과목명 없이 추가 시도
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('과목명을 입력해주세요');
      await dialog.accept();
    });

    await page.getByRole('button', { name: /과목 추가/ }).click();
  });

  test('Footer 안내 문구', async ({ page }) => {
    await page.locator('text=학점 계산기 by SeolCoding').scrollIntoViewIfNeeded();
    await expect(page.getByText(/데이터는 브라우저에만 저장됩니다/)).toBeVisible();
  });
});
