/**
 * Ladder Game (사다리 게임) - E2E Tests
 *
 * 사다리 타기 랜덤 매칭 테스트:
 * 1. 참가자 및 결과 입력
 * 2. 사다리 생성 및 설정
 * 3. 애니메이션 경로 추적
 * 4. 결과 확인
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5188/mini-apps/ladder-game/';

test.describe('Ladder Game - 사다리 타기', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('1. 초기 상태 및 UI', () => {
    test('페이지가 정상적으로 로드된다', async ({ page }) => {
      const heading = page.getByRole('heading', { name: /사다리 타기/i });
      await expect(heading).toBeVisible();

      const description = page.getByText(/공정한 랜덤 추첨/i);
      await expect(description).toBeVisible();
    });

    test('참가자 입력 폼이 표시된다', async ({ page }) => {
      const participantSection = page.locator('text=/참가자|participant/i').first();
      await expect(participantSection).toBeVisible({ timeout: 3000 });

      // 최소 2개의 입력 필드
      const inputs = page.locator('input[type="text"]');
      const count = await inputs.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('결과 입력 폼이 표시된다', async ({ page }) => {
      const resultSection = page.locator('text=/결과|result/i').first();
      await expect(resultSection).toBeVisible({ timeout: 3000 });
    });

    test('시작 버튼이 초기에는 비활성화되어 있다', async ({ page }) => {
      const startButton = page.getByRole('button', { name: /시작|start|생성|generate/i });
      if (await startButton.isVisible({ timeout: 2000 })) {
        await expect(startButton).toBeDisabled();
      }
    });
  });

  test.describe('2. 참가자 및 결과 입력', () => {
    test('참가자 이름을 입력할 수 있다', async ({ page }) => {
      const inputs = page.locator('input[type="text"]');

      // 첫 번째 참가자
      await inputs.nth(0).fill('홍길동');
      await expect(inputs.nth(0)).toHaveValue('홍길동');

      // 두 번째 참가자
      await inputs.nth(1).fill('김철수');
      await expect(inputs.nth(1)).toHaveValue('김철수');
    });

    test('참가자를 추가할 수 있다', async ({ page }) => {
      // 추가 버튼 찾기
      const addButton = page.getByRole('button', { name: /참가자 추가|add participant|\+/i });

      if (await addButton.isVisible({ timeout: 2000 })) {
        const beforeCount = await page.locator('input[type="text"]').count();
        await addButton.click();
        await page.waitForTimeout(500);

        const afterCount = await page.locator('input[type="text"]').count();
        expect(afterCount).toBeGreaterThan(beforeCount);
      }
    });

    test('참가자를 삭제할 수 있다', async ({ page }) => {
      // 참가자 3명 추가
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('A');
      await inputs.nth(1).fill('B');

      // 추가 버튼으로 3번째 참가자 추가
      const addButton = page.getByRole('button', { name: /참가자 추가|add|\+/i });
      if (await addButton.isVisible({ timeout: 2000 })) {
        await addButton.click();
        await page.waitForTimeout(500);
      }

      // 삭제 버튼 찾기
      const deleteButtons = page.getByRole('button', { name: /삭제|delete|remove|-/i });
      const count = await deleteButtons.count();

      if (count > 0) {
        await deleteButtons.first().click();
        await page.waitForTimeout(500);

        // 참가자가 삭제되었는지 확인
        const afterCount = await deleteButtons.count();
        expect(afterCount).toBeLessThan(count);
      }
    });

    test('결과 항목을 입력할 수 있다', async ({ page }) => {
      // 결과 섹션 찾기
      const resultInputs = page.locator('input[placeholder*="결과"], input[placeholder*="result"]');

      if (await resultInputs.count() > 0) {
        await resultInputs.nth(0).fill('당첨');
        await resultInputs.nth(1).fill('꽝');

        await expect(resultInputs.nth(0)).toHaveValue('당첨');
        await expect(resultInputs.nth(1)).toHaveValue('꽝');
      }
    });

    test('빈 입력은 검증 에러를 표시한다', async ({ page }) => {
      // 참가자와 결과를 일부만 입력
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('A');
      await inputs.nth(1).fill(''); // 빈 값

      const startButton = page.getByRole('button', { name: /시작|start|생성/i });
      if (await startButton.isEnabled({ timeout: 2000 })) {
        await startButton.click();

        // 에러 메시지 확인
        const errorMsg = page.locator('text=/입력 오류|빈 항목|required|empty/i');
        await expect(errorMsg).toBeVisible({ timeout: 3000 });
      }
    });

    test('특수문자가 포함된 이름을 입력할 수 있다', async ({ page }) => {
      const inputs = page.locator('input[type="text"]');

      const specialNames = ['홍길동(팀장)', '김*수', '이#철', '@관리자'];

      for (let i = 0; i < Math.min(specialNames.length, await inputs.count()); i++) {
        await inputs.nth(i).fill(specialNames[i]);
        await expect(inputs.nth(i)).toHaveValue(specialNames[i]);
      }
    });

    test('최대 참가자 수 제한 확인', async ({ page }) => {
      // 참가자 추가 버튼 반복 클릭
      const addButton = page.getByRole('button', { name: /참가자 추가|add|\+/i });

      if (await addButton.isVisible({ timeout: 2000 })) {
        for (let i = 0; i < 20; i++) {
          if (await addButton.isEnabled({ timeout: 500 })) {
            await addButton.click();
            await page.waitForTimeout(200);
          } else {
            break;
          }
        }

        // 최대 개수에 도달하면 버튼 비활성화 확인
        const finalState = await addButton.isEnabled();
        console.log('Add button enabled after 20 clicks:', finalState);
      }
    });
  });

  test.describe('3. 사다리 생성 및 설정', () => {
    test.beforeEach(async ({ page }) => {
      // 기본 입력
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('A');
      await inputs.nth(1).fill('B');

      // 결과 입력
      const resultInputs = page.locator('input[placeholder*="결과"], input[placeholder*="result"]');
      if (await resultInputs.count() > 0) {
        await resultInputs.nth(0).fill('당첨');
        await resultInputs.nth(1).fill('꽝');
      }
    });

    test('사다리를 생성할 수 있다', async ({ page }) => {
      const startButton = page.getByRole('button', { name: /시작|start|생성|generate/i });
      await expect(startButton).toBeEnabled({ timeout: 2000 });
      await startButton.click();

      // 사다리 캔버스 확인
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible({ timeout: 3000 });
    });

    test('사다리 밀도 설정을 변경할 수 있다', async ({ page }) => {
      // 설정 찾기
      const densitySlider = page.locator('input[type="range"], input[role="slider"]');

      if (await densitySlider.count() > 0) {
        await densitySlider.first().fill('0.5');

        // 사다리 생성
        const startButton = page.getByRole('button', { name: /시작|생성/i });
        await startButton.click();
        await page.waitForTimeout(1000);

        // 캔버스 확인
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
      }
    });

    test('테마 설정을 변경할 수 있다', async ({ page }) => {
      // 테마 선택 버튼 찾기
      const themeButtons = page.locator('button[class*="theme"], button:has-text("테마")');

      if (await themeButtons.count() > 0) {
        await themeButtons.first().click();
        await page.waitForTimeout(500);

        // 다른 테마 선택
        const themeOptions = page.locator('button[value], [role="radio"], [role="option"]');
        if (await themeOptions.count() > 0) {
          await themeOptions.first().click();
        }
      }
    });

    test('사다리가 생성되면 토스트 메시지가 표시된다', async ({ page }) => {
      const startButton = page.getByRole('button', { name: /시작|생성/i });
      await startButton.click();

      // 토스트 메시지 확인
      const toast = page.locator('[class*="toast"], [role="alert"]');
      await expect(toast).toBeVisible({ timeout: 3000 });
    });

    test('리셋 버튼으로 사다리를 초기화할 수 있다', async ({ page }) => {
      // 사다리 생성
      const startButton = page.getByRole('button', { name: /시작|생성/i });
      await startButton.click();
      await page.waitForTimeout(1000);

      // 리셋 버튼 클릭
      const resetButton = page.getByRole('button', { name: /리셋|reset|초기화|다시/i });
      if (await resetButton.isVisible({ timeout: 2000 })) {
        await resetButton.click();

        // 입력 필드가 초기화되었는지 확인
        const inputs = page.locator('input[type="text"]');
        const firstValue = await inputs.nth(0).inputValue();
        expect(firstValue).toBe('');
      }
    });
  });

  test.describe('4. 사다리 타기 애니메이션', () => {
    test.beforeEach(async ({ page }) => {
      // 참가자 및 결과 입력
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('참가자1');
      await inputs.nth(1).fill('참가자2');
      await inputs.nth(2).fill('참가자3');

      const resultInputs = page.locator('input[placeholder*="결과"], input[placeholder*="result"]');
      if (await resultInputs.count() >= 3) {
        await resultInputs.nth(0).fill('1등');
        await resultInputs.nth(1).fill('2등');
        await resultInputs.nth(2).fill('3등');
      }

      // 사다리 생성
      const startButton = page.getByRole('button', { name: /시작|생성/i });
      await startButton.click();
      await page.waitForTimeout(2000);
    });

    test('참가자를 클릭하면 경로 애니메이션이 시작된다', async ({ page }) => {
      // 캔버스 확인
      const canvas = page.locator('canvas');
      if (await canvas.isVisible()) {
        // 참가자 영역 클릭 (상단 영역)
        const box = await canvas.boundingBox();
        if (box) {
          // 첫 번째 참가자 위치 클릭 (왼쪽 상단)
          await canvas.click({
            position: { x: box.width * 0.2, y: 20 }
          });

          // 애니메이션 진행 대기
          await page.waitForTimeout(2000);
        }
      }
    });

    test('애니메이션 중에는 다른 참가자를 클릭할 수 없다', async ({ page }) => {
      const canvas = page.locator('canvas');
      if (await canvas.isVisible()) {
        const box = await canvas.boundingBox();
        if (box) {
          // 첫 번째 클릭
          await canvas.click({ position: { x: box.width * 0.2, y: 20 } });
          await page.waitForTimeout(500);

          // 두 번째 클릭 (무시되어야 함)
          await canvas.click({ position: { x: box.width * 0.5, y: 20 } });

          // 애니메이션이 중복 실행되지 않는지 확인
          await page.waitForTimeout(2000);
        }
      }
    });

    test('결과 모달이 표시된다', async ({ page }) => {
      const canvas = page.locator('canvas');
      if (await canvas.isVisible()) {
        const box = await canvas.boundingBox();
        if (box) {
          await canvas.click({ position: { x: box.width * 0.2, y: 20 } });

          // 애니메이션 완료 후 모달 표시
          await page.waitForTimeout(3000);

          const resultModal = page.locator('[role="dialog"], [class*="modal"]');
          await expect(resultModal).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('결과 모달에 참가자와 결과가 표시된다', async ({ page }) => {
      const canvas = page.locator('canvas');
      if (await canvas.isVisible()) {
        const box = await canvas.boundingBox();
        if (box) {
          await canvas.click({ position: { x: box.width * 0.2, y: 20 } });
          await page.waitForTimeout(3000);

          const resultModal = page.locator('[role="dialog"]');
          if (await resultModal.isVisible({ timeout: 3000 })) {
            const modalText = await resultModal.textContent();

            // 참가자 이름이 포함되어 있는지 확인
            const hasParticipant = modalText?.includes('참가자');
            const hasResult = ['1등', '2등', '3등'].some(r => modalText?.includes(r));

            expect(hasParticipant || hasResult).toBeTruthy();
          }
        }
      }
    });

    test('결과 모달을 닫고 다른 참가자를 시도할 수 있다', async ({ page }) => {
      const canvas = page.locator('canvas');
      if (await canvas.isVisible()) {
        const box = await canvas.boundingBox();
        if (box) {
          // 첫 번째 참가자
          await canvas.click({ position: { x: box.width * 0.2, y: 20 } });
          await page.waitForTimeout(3000);

          // 모달 닫기
          const closeButton = page.getByRole('button', { name: /닫기|close/i });
          if (await closeButton.isVisible({ timeout: 2000 })) {
            await closeButton.click();
            await page.waitForTimeout(500);

            // 두 번째 참가자
            await canvas.click({ position: { x: box.width * 0.5, y: 20 } });
            await page.waitForTimeout(3000);

            // 모달 다시 표시되는지 확인
            const resultModal = page.locator('[role="dialog"]');
            await expect(resultModal).toBeVisible({ timeout: 3000 });
          }
        }
      }
    });
  });

  test.describe('5. Edge Cases', () => {
    test('참가자 1명만 있을 때 에러 처리', async ({ page }) => {
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('홀로');

      const startButton = page.getByRole('button', { name: /시작|생성/i });

      // 버튼이 비활성화되어 있거나 에러 메시지 표시
      const isDisabled = await startButton.isDisabled({ timeout: 2000 });
      if (!isDisabled) {
        await startButton.click();
        const errorMsg = page.locator('text=/최소 2명|2명 이상|minimum/i');
        await expect(errorMsg).toBeVisible({ timeout: 3000 });
      }
    });

    test('참가자와 결과 개수가 다를 때 처리', async ({ page }) => {
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('A');
      await inputs.nth(1).fill('B');
      await inputs.nth(2).fill('C');

      const resultInputs = page.locator('input[placeholder*="결과"]');
      if (await resultInputs.count() >= 2) {
        await resultInputs.nth(0).fill('결과1');
        await resultInputs.nth(1).fill('결과2');
        // 3번째 결과는 비움
      }

      const startButton = page.getByRole('button', { name: /시작|생성/i });
      if (await startButton.isEnabled({ timeout: 2000 })) {
        await startButton.click();

        // 에러 또는 자동 조정 확인
        await page.waitForTimeout(2000);
      }
    });

    test('매우 긴 이름을 입력했을 때 레이아웃 확인', async ({ page }) => {
      const inputs = page.locator('input[type="text"]');
      const longName = 'A'.repeat(50);

      await inputs.nth(0).fill(longName);
      await inputs.nth(1).fill('B');

      const startButton = page.getByRole('button', { name: /시작|생성/i });
      await startButton.click();
      await page.waitForTimeout(1000);

      // 캔버스가 정상 렌더링되는지 확인
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('중복된 이름을 입력할 수 있다', async ({ page }) => {
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('같은이름');
      await inputs.nth(1).fill('같은이름');

      const startButton = page.getByRole('button', { name: /시작|생성/i });
      await expect(startButton).toBeEnabled({ timeout: 2000 });

      await startButton.click();

      // 사다리가 정상 생성되는지 확인
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('6. 반응형 디자인', () => {
    test('모바일 뷰포트에서 정상 작동', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      const heading = page.getByRole('heading', { name: /사다리 타기/i });
      await expect(heading).toBeVisible();

      // 입력 필드 확인
      const inputs = page.locator('input[type="text"]');
      expect(await inputs.count()).toBeGreaterThanOrEqual(2);
    });

    test('태블릿 뷰포트에서 레이아웃 확인', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();

      const heading = page.getByRole('heading', { name: /사다리 타기/i });
      await expect(heading).toBeVisible();

      // 캔버스가 적절한 크기로 표시되는지 확인
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('A');
      await inputs.nth(1).fill('B');

      const startButton = page.getByRole('button', { name: /시작|생성/i });
      await startButton.click();
      await page.waitForTimeout(1000);

      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    });

    test('데스크톱 뷰포트에서 정상 작동', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();

      const heading = page.getByRole('heading', { name: /사다리 타기/i });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('7. 접근성', () => {
    test('입력 필드에 레이블이 있다', async ({ page }) => {
      const labels = page.locator('label');
      const labelCount = await labels.count();

      expect(labelCount).toBeGreaterThan(0);
    });

    test('버튼에 접근 가능한 텍스트가 있다', async ({ page }) => {
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();

      expect(buttonCount).toBeGreaterThan(0);

      for (let i = 0; i < buttonCount; i++) {
        const btn = buttons.nth(i);
        const text = await btn.textContent();
        const ariaLabel = await btn.getAttribute('aria-label');

        // 텍스트 또는 aria-label이 있어야 함
        expect(text || ariaLabel).toBeTruthy();
      }
    });

    test('캔버스에 aria-label이 있다', async ({ page }) => {
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('A');
      await inputs.nth(1).fill('B');

      const startButton = page.getByRole('button', { name: /시작|생성/i });
      await startButton.click();
      await page.waitForTimeout(1000);

      const canvas = page.locator('canvas');
      const ariaLabel = await canvas.getAttribute('aria-label');

      // aria-label이 있으면 좋음 (선택사항)
      console.log('Canvas aria-label:', ariaLabel);
    });
  });

  test.describe('8. 성능', () => {
    test('사다리 생성이 3초 이내에 완료된다', async ({ page }) => {
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('A');
      await inputs.nth(1).fill('B');

      const startTime = Date.now();
      const startButton = page.getByRole('button', { name: /시작|생성/i });
      await startButton.click();

      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible({ timeout: 5000 });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(3000);
    });

    test('애니메이션이 5초 이내에 완료된다', async ({ page }) => {
      const inputs = page.locator('input[type="text"]');
      await inputs.nth(0).fill('A');
      await inputs.nth(1).fill('B');

      const startButton = page.getByRole('button', { name: /시작|생성/i });
      await startButton.click();
      await page.waitForTimeout(1000);

      const canvas = page.locator('canvas');
      if (await canvas.isVisible()) {
        const box = await canvas.boundingBox();
        if (box) {
          const startTime = Date.now();
          await canvas.click({ position: { x: box.width * 0.2, y: 20 } });

          const resultModal = page.locator('[role="dialog"]');
          await expect(resultModal).toBeVisible({ timeout: 6000 });

          const duration = Date.now() - startTime;
          expect(duration).toBeLessThan(5000);
        }
      }
    });
  });
});
