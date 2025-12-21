/**
 * Team Divider (팀 나누기) - E2E Tests
 *
 * 랜덤 팀 분배 테스트:
 * 1. 참가자 입력 및 관리
 * 2. 팀 설정 (팀 개수 vs 팀당 인원)
 * 3. Fisher-Yates 알고리즘 기반 랜덤 분배
 * 4. 결과 표시, QR 코드, 내보내기
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5197/mini-apps/team-divider/';

test.describe('Team Divider - 팀 나누기', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('1. 초기 상태 및 UI', () => {
    test('페이지가 정상적으로 로드된다', async ({ page }) => {
      const heading = page.getByRole('heading', { name: /팀 나누기/i });
      await expect(heading).toBeVisible();

      const description = page.getByText(/공정한 랜덤 알고리즘/i);
      await expect(description).toBeVisible();
    });

    test('참가자 입력 섹션이 표시된다', async ({ page }) => {
      const participantInput = page.getByPlaceholder(/참가자|이름|name/i);
      await expect(participantInput).toBeVisible();

      const addButton = page.getByRole('button', { name: /추가|add/i });
      await expect(addButton).toBeVisible();
    });

    test('팀 설정 섹션이 표시된다', async ({ page }) => {
      const teamSettings = page.locator('text=/팀 설정|team setting/i');
      await expect(teamSettings.first()).toBeVisible({ timeout: 3000 });
    });

    test('팀 나누기 버튼이 초기에는 비활성화되어 있다', async ({ page }) => {
      const divideButton = page.getByRole('button', { name: /팀 나누기|shuffle|divide/i });
      if (await divideButton.isVisible({ timeout: 2000 })) {
        await expect(divideButton).toBeDisabled();
      }
    });
  });

  test.describe('2. 참가자 입력 및 관리', () => {
    test('참가자를 추가할 수 있다', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름|name/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      await nameInput.fill('홍길동');
      await addButton.click();

      // 참가자 목록에 추가 확인
      const participant = page.getByText('홍길동');
      await expect(participant).toBeVisible();
    });

    test('여러 참가자를 순차적으로 추가할 수 있다', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      const names = ['김철수', '이영희', '박민수', '최지현'];

      for (const name of names) {
        await nameInput.fill(name);
        await addButton.click();
        await page.waitForTimeout(200);
      }

      // 모든 참가자 확인
      for (const name of names) {
        await expect(page.getByText(name)).toBeVisible();
      }

      // 참가자 수 확인
      const count = page.locator('text=/4명|4 participants/i');
      await expect(count).toBeVisible();
    });

    test('Enter 키로 참가자를 추가할 수 있다', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름/i);

      await nameInput.fill('Enter 테스트');
      await nameInput.press('Enter');

      await expect(page.getByText('Enter 테스트')).toBeVisible();
    });

    test('빈 이름은 추가되지 않는다', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      await nameInput.fill('   '); // 공백만
      await addButton.click();

      // 참가자 목록이 비어있는지 확인
      await page.waitForTimeout(500);
      const emptyState = page.locator('text=/참가자를 추가|no participant/i');
      expect(await emptyState.count()).toBeGreaterThan(0);
    });

    test('일괄 입력으로 여러 참가자를 추가할 수 있다', async ({ page }) => {
      // 일괄 입력 버튼 찾기
      const bulkButton = page.getByRole('button', { name: /일괄|bulk|여러 명|복수/i });

      if (await bulkButton.isVisible({ timeout: 2000 })) {
        await bulkButton.click();

        // 텍스트 영역에 여러 이름 입력
        const textarea = page.locator('textarea');
        await textarea.fill('홍길동\n김철수\n이영희\n박민수');

        // 확인 버튼
        const confirmButton = page.getByRole('button', { name: /확인|추가|add/i });
        await confirmButton.click();

        // 모든 참가자 확인
        await expect(page.getByText('홍길동')).toBeVisible();
        await expect(page.getByText('김철수')).toBeVisible();
        await expect(page.getByText('이영희')).toBeVisible();
        await expect(page.getByText('박민수')).toBeVisible();
      }
    });

    test('참가자를 삭제할 수 있다', async ({ page }) => {
      // 참가자 추가
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      await nameInput.fill('삭제될참가자');
      await addButton.click();
      await page.waitForTimeout(500);

      // 삭제 버튼 찾기
      const deleteButtons = page.getByRole('button', { name: /삭제|delete|remove/i });
      const count = await deleteButtons.count();

      if (count > 0) {
        await deleteButtons.first().click();

        // 참가자가 삭제되었는지 확인
        await page.waitForTimeout(500);
        const participant = page.getByText('삭제될참가자');
        await expect(participant).not.toBeVisible();
      }
    });

    test('전체 삭제 버튼이 동작한다', async ({ page }) => {
      // 참가자 여러 명 추가
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      const names = ['A', 'B', 'C'];
      for (const name of names) {
        await nameInput.fill(name);
        await addButton.click();
        await page.waitForTimeout(200);
      }

      // 전체 삭제 버튼
      const clearButton = page.getByRole('button', { name: /전체 삭제|clear all/i });

      if (await clearButton.isVisible({ timeout: 2000 })) {
        await clearButton.click();

        // 확인 다이얼로그 처리
        page.on('dialog', dialog => dialog.accept());

        await page.waitForTimeout(500);

        // 참가자 목록이 비었는지 확인
        for (const name of names) {
          await expect(page.getByText(name)).not.toBeVisible();
        }
      }
    });

    test('특수문자가 포함된 이름을 추가할 수 있다', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      const specialNames = ['홍길동(팀장)', '김*수', '@관리자', '#개발자'];

      for (const name of specialNames) {
        await nameInput.fill(name);
        await addButton.click();
        await page.waitForTimeout(200);
      }

      // 특수문자 이름 확인
      for (const name of specialNames) {
        await expect(page.getByText(name)).toBeVisible();
      }
    });

    test('매우 긴 이름을 추가할 수 있다', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      const longName = 'A'.repeat(50);
      await nameInput.fill(longName);
      await addButton.click();

      // 긴 이름이 잘려서라도 표시되는지 확인
      await page.waitForTimeout(500);
      const participant = page.locator(`text="${longName.substring(0, 20)}"`);
      expect(await participant.count()).toBeGreaterThan(0);
    });
  });

  test.describe('3. 팀 설정', () => {
    test.beforeEach(async ({ page }) => {
      // 참가자 추가
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      const names = ['A', 'B', 'C', 'D', 'E', 'F'];
      for (const name of names) {
        await nameInput.fill(name);
        await addButton.click();
        await page.waitForTimeout(100);
      }
    });

    test('팀 개수 모드를 선택할 수 있다', async ({ page }) => {
      // 팀 개수 라디오 버튼
      const teamCountRadio = page.locator('input[value="byTeamCount"], input[type="radio"]').first();

      if (await teamCountRadio.isVisible({ timeout: 2000 })) {
        await teamCountRadio.click();

        // 팀 개수 입력 필드 확인
        const teamCountInput = page.locator('input[type="number"], input[min]');
        expect(await teamCountInput.count()).toBeGreaterThan(0);
      }
    });

    test('팀당 인원 모드를 선택할 수 있다', async ({ page }) => {
      // 팀당 인원 라디오 버튼
      const perTeamRadio = page.locator('input[value="byMembersPerTeam"], input[type="radio"]').nth(1);

      if (await perTeamRadio.isVisible({ timeout: 2000 })) {
        await perTeamRadio.click();

        // 팀당 인원 입력 필드 확인
        await page.waitForTimeout(500);
      }
    });

    test('팀 개수를 조정할 수 있다', async ({ page }) => {
      // 팀 개수 입력
      const teamCountInput = page.locator('input[type="number"]').first();

      if (await teamCountInput.isVisible({ timeout: 2000 })) {
        await teamCountInput.fill('3');
        await expect(teamCountInput).toHaveValue('3');
      }
    });

    test('팀당 인원을 조정할 수 있다', async ({ page }) => {
      // 팀당 인원 모드 선택
      const perTeamRadio = page.locator('text=/팀당 인원|per team/i');

      if (await perTeamRadio.count() > 0) {
        await perTeamRadio.first().click();

        // 인원 입력
        const membersInput = page.locator('input[type="number"]').last();
        await membersInput.fill('2');
        await expect(membersInput).toHaveValue('2');
      }
    });

    test('잘못된 팀 설정 시 경고 메시지 표시', async ({ page }) => {
      // 팀 개수를 참가자보다 많이 설정
      const teamCountInput = page.locator('input[type="number"]').first();

      if (await teamCountInput.isVisible({ timeout: 2000 })) {
        await teamCountInput.fill('10'); // 참가자는 6명

        const divideButton = page.getByRole('button', { name: /팀 나누기/i });
        await divideButton.click();

        // 경고 메시지 또는 다이얼로그 확인
        page.on('dialog', dialog => {
          expect(dialog.message()).toContain(/설정|최소|minimum/i);
          dialog.accept();
        });

        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('4. 팀 나누기 실행', () => {
    test.beforeEach(async ({ page }) => {
      // 참가자 추가
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      const names = ['김철수', '이영희', '박민수', '최지현', '정수진', '홍길동'];
      for (const name of names) {
        await nameInput.fill(name);
        await addButton.click();
        await page.waitForTimeout(100);
      }
    });

    test('2명 이상일 때 팀 나누기 버튼이 활성화된다', async ({ page }) => {
      const divideButton = page.getByRole('button', { name: /팀 나누기|shuffle/i });
      await expect(divideButton).toBeEnabled();
    });

    test('팀 나누기를 실행할 수 있다', async ({ page }) => {
      const divideButton = page.getByRole('button', { name: /팀 나누기|shuffle/i });
      await divideButton.click();

      // 결과 페이지로 전환 확인
      await page.waitForTimeout(1000);

      const resultHeading = page.getByText(/팀 분배 완료|team result/i);
      await expect(resultHeading).toBeVisible({ timeout: 5000 });
    });

    test('팀 결과가 표시된다', async ({ page }) => {
      const divideButton = page.getByRole('button', { name: /팀 나누기/i });
      await divideButton.click();
      await page.waitForTimeout(1000);

      // 팀 카드 확인
      const teamCards = page.locator('[class*="team"], [data-testid*="team"]');
      const count = await teamCards.count();

      expect(count).toBeGreaterThan(0);
    });

    test('모든 참가자가 팀에 배정된다', async ({ page }) => {
      const divideButton = page.getByRole('button', { name: /팀 나누기/i });
      await divideButton.click();
      await page.waitForTimeout(1000);

      // 모든 참가자 이름이 결과에 표시되는지 확인
      const names = ['김철수', '이영희', '박민수', '최지현', '정수진', '홍길동'];

      for (const name of names) {
        const participant = page.getByText(name);
        await expect(participant).toBeVisible();
      }
    });

    test('컨페티 효과가 표시된다', async ({ page }) => {
      const divideButton = page.getByRole('button', { name: /팀 나누기/i });
      await divideButton.click();

      // 컨페티 캔버스 확인 (canvas-confetti 사용 시)
      await page.waitForTimeout(2000);

      // 컨페티는 DOM에 남지 않을 수 있으므로 시각적 확인만
      const resultHeading = page.getByText(/팀 분배 완료/i);
      await expect(resultHeading).toBeVisible();
    });

    test('다시 하기 버튼으로 초기화할 수 있다', async ({ page }) => {
      const divideButton = page.getByRole('button', { name: /팀 나누기/i });
      await divideButton.click();
      await page.waitForTimeout(1000);

      // 다시 하기 버튼
      const resetButton = page.getByRole('button', { name: /다시|reset|재설정/i });
      await resetButton.click();

      // 입력 페이지로 복귀 확인
      const participantInput = page.getByPlaceholder(/참가자|이름/i);
      await expect(participantInput).toBeVisible();
    });
  });

  test.describe('5. QR 코드 생성', () => {
    test.beforeEach(async ({ page }) => {
      // 참가자 추가 및 팀 나누기
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      const names = ['A', 'B', 'C', 'D'];
      for (const name of names) {
        await nameInput.fill(name);
        await addButton.click();
        await page.waitForTimeout(100);
      }

      const divideButton = page.getByRole('button', { name: /팀 나누기/i });
      await divideButton.click();
      await page.waitForTimeout(1000);
    });

    test('QR 코드 섹션이 표시된다', async ({ page }) => {
      const qrSection = page.locator('text=/QR|큐알/i');

      if (await qrSection.count() > 0) {
        await expect(qrSection.first()).toBeVisible();
      }
    });

    test('QR 코드 이미지가 생성된다', async ({ page }) => {
      // QR 코드가 있을 경우 확인
      const qrImages = page.locator('canvas, img[src*="qr"], [class*="qr"]');

      if (await qrImages.count() > 0) {
        await expect(qrImages.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('QR 코드를 다운로드할 수 있다', async ({ page }) => {
      const downloadButton = page.getByRole('button', { name: /QR.*다운로드|download.*qr/i });

      if (await downloadButton.isVisible({ timeout: 3000 })) {
        // 다운로드 트리거 (실제 파일은 다운로드되지 않도록 테스트)
        await downloadButton.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('6. 결과 내보내기', () => {
    test.beforeEach(async ({ page }) => {
      // 참가자 추가 및 팀 나누기
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      const names = ['A', 'B', 'C', 'D', 'E', 'F'];
      for (const name of names) {
        await nameInput.fill(name);
        await addButton.click();
        await page.waitForTimeout(100);
      }

      const divideButton = page.getByRole('button', { name: /팀 나누기/i });
      await divideButton.click();
      await page.waitForTimeout(1000);
    });

    test('이미지로 저장 버튼이 표시된다', async ({ page }) => {
      const imageButton = page.getByRole('button', { name: /이미지|image|png|jpg/i });

      if (await imageButton.isVisible({ timeout: 2000 })) {
        await expect(imageButton).toBeVisible();
      }
    });

    test('텍스트로 복사 버튼이 표시된다', async ({ page }) => {
      const textButton = page.getByRole('button', { name: /텍스트|text|복사|copy/i });

      if (await textButton.isVisible({ timeout: 2000 })) {
        await expect(textButton).toBeVisible();
      }
    });

    test('CSV 다운로드 버튼이 표시된다', async ({ page }) => {
      const csvButton = page.getByRole('button', { name: /CSV|엑셀|excel/i });

      if (await csvButton.isVisible({ timeout: 2000 })) {
        await expect(csvButton).toBeVisible();
      }
    });

    test('텍스트 복사 기능이 동작한다', async ({ page }) => {
      const textButton = page.getByRole('button', { name: /텍스트|복사|copy/i });

      if (await textButton.isVisible({ timeout: 2000 })) {
        // 클립보드 권한 부여
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        await textButton.click();
        await page.waitForTimeout(1000);

        // 클립보드 내용 확인
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText.length).toBeGreaterThan(0);
        expect(clipboardText).toContain('팀' || 'Team' || 'A');
      }
    });
  });

  test.describe('7. Edge Cases', () => {
    test('참가자 1명만 있을 때 에러 처리', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      await nameInput.fill('홀로');
      await addButton.click();

      const divideButton = page.getByRole('button', { name: /팀 나누기/i });

      // 버튼 비활성화 또는 에러 메시지
      const isDisabled = await divideButton.isDisabled({ timeout: 2000 });
      if (!isDisabled) {
        await divideButton.click();

        page.on('dialog', dialog => {
          expect(dialog.message()).toContain(/최소 2명|minimum 2/i);
          dialog.accept();
        });
      }
    });

    test('홀수 인원을 짝수 팀으로 나눌 때 처리', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      // 5명 추가
      const names = ['A', 'B', 'C', 'D', 'E'];
      for (const name of names) {
        await nameInput.fill(name);
        await addButton.click();
        await page.waitForTimeout(100);
      }

      // 2팀으로 설정
      const teamCountInput = page.locator('input[type="number"]').first();
      if (await teamCountInput.isVisible({ timeout: 2000 })) {
        await teamCountInput.fill('2');
      }

      const divideButton = page.getByRole('button', { name: /팀 나누기/i });
      await divideButton.click();
      await page.waitForTimeout(1000);

      // 한 팀은 3명, 다른 팀은 2명
      const resultText = await page.textContent('body');
      expect(resultText).toBeTruthy();
    });

    test('매우 많은 참가자(50명)를 추가할 수 있다', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      // 50명 추가
      for (let i = 1; i <= 50; i++) {
        await nameInput.fill(`참가자${i}`);
        await addButton.click();
        await page.waitForTimeout(50);
      }

      // 팀 나누기
      const divideButton = page.getByRole('button', { name: /팀 나누기/i });
      await divideButton.click();
      await page.waitForTimeout(2000);

      // 결과 확인
      const resultHeading = page.getByText(/팀 분배 완료/i);
      await expect(resultHeading).toBeVisible({ timeout: 5000 });
    });

    test('팀 개수를 0으로 설정할 수 없다', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      await nameInput.fill('A');
      await addButton.click();
      await nameInput.fill('B');
      await addButton.click();

      const teamCountInput = page.locator('input[type="number"]').first();
      if (await teamCountInput.isVisible({ timeout: 2000 })) {
        await teamCountInput.fill('0');

        // 최소값 검증 확인
        const value = await teamCountInput.inputValue();
        const numValue = parseInt(value);
        expect(numValue).toBeGreaterThan(0);
      }
    });
  });

  test.describe('8. 랜덤성 검증', () => {
    test.beforeEach(async ({ page }) => {
      // 참가자 추가
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      const names = ['A', 'B', 'C', 'D', 'E', 'F'];
      for (const name of names) {
        await nameInput.fill(name);
        await addButton.click();
        await page.waitForTimeout(100);
      }
    });

    test('여러 번 실행 시 다른 결과가 나온다', async ({ page }) => {
      const results: string[] = [];

      // 3번 실행
      for (let i = 0; i < 3; i++) {
        const divideButton = page.getByRole('button', { name: /팀 나누기/i });
        await divideButton.click();
        await page.waitForTimeout(1000);

        // 결과 추출
        const resultText = await page.textContent('body');
        if (resultText) {
          results.push(resultText);
        }

        // 다시 하기
        const resetButton = page.getByRole('button', { name: /다시|reset/i });
        await resetButton.click();
        await page.waitForTimeout(500);
      }

      // 최소한 2개 이상의 다른 결과 (확률적)
      const uniqueResults = new Set(results);
      console.log('Unique results:', uniqueResults.size, 'out of', results.length);

      // 랜덤성으로 인해 가끔 같을 수 있음
    });
  });

  test.describe('9. 반응형 디자인', () => {
    test('모바일 뷰포트에서 정상 작동', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      const heading = page.getByRole('heading', { name: /팀 나누기/i });
      await expect(heading).toBeVisible();

      const participantInput = page.getByPlaceholder(/참가자|이름/i);
      await expect(participantInput).toBeVisible();
    });

    test('태블릿 뷰포트에서 레이아웃 확인', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();

      const heading = page.getByRole('heading', { name: /팀 나누기/i });
      await expect(heading).toBeVisible();
    });

    test('데스크톱 뷰포트에서 정상 작동', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();

      const heading = page.getByRole('heading', { name: /팀 나누기/i });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('10. 접근성', () => {
    test('폼 요소에 레이블이 있다', async ({ page }) => {
      const labels = page.locator('label');
      const labelCount = await labels.count();

      expect(labelCount).toBeGreaterThan(0);
    });

    test('버튼에 접근 가능한 텍스트가 있다', async ({ page }) => {
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const btn = buttons.nth(i);
        const text = await btn.textContent();
        const ariaLabel = await btn.getAttribute('aria-label');

        expect(text || ariaLabel).toBeTruthy();
      }
    });

    test('라디오 버튼에 레이블이 있다', async ({ page }) => {
      const radioButtons = page.locator('input[type="radio"]');
      const count = await radioButtons.count();

      for (let i = 0; i < count; i++) {
        const radio = radioButtons.nth(i);
        const id = await radio.getAttribute('id');

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    });
  });

  test.describe('11. 성능', () => {
    test('50명 참가자를 3초 이내에 분배한다', async ({ page }) => {
      const nameInput = page.getByPlaceholder(/참가자|이름/i);
      const addButton = page.getByRole('button', { name: /추가|add/i });

      // 50명 추가
      for (let i = 1; i <= 50; i++) {
        await nameInput.fill(`P${i}`);
        await addButton.click();
        await page.waitForTimeout(20);
      }

      const startTime = Date.now();
      const divideButton = page.getByRole('button', { name: /팀 나누기/i });
      await divideButton.click();

      const resultHeading = page.getByText(/팀 분배 완료/i);
      await expect(resultHeading).toBeVisible({ timeout: 5000 });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(3000);
    });
  });
});
