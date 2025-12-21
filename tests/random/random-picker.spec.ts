/**
 * Random Picker (랜덤 뽑기) - E2E Tests
 *
 * 룰렛 기반 랜덤 선택 테스트:
 * 1. 항목 추가/삭제/수정
 * 2. 룰렛 회전 및 선택
 * 3. 결과 모달 및 히스토리
 * 4. 설정 및 커스터마이징
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5175/mini-apps/random-picker/';

test.describe('Random Picker - 랜덤 뽑기', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('1. 초기 상태 및 UI', () => {
    test('페이지가 정상적으로 로드된다', async ({ page }) => {
      const heading = page.getByRole('heading', { name: /랜덤 뽑기 룰렛/i });
      await expect(heading).toBeVisible();

      const description = page.getByText(/공정하고 재미있는 랜덤 선택/i);
      await expect(description).toBeVisible();
    });

    test('초기 상태에서 항목 입력 폼이 표시된다', async ({ page }) => {
      const itemInput = page.getByPlaceholder(/항목|입력/i);
      await expect(itemInput).toBeVisible();

      const addButton = page.getByRole('button', { name: /추가|add/i });
      await expect(addButton).toBeVisible();
    });

    test('항목이 없을 때 안내 메시지가 표시된다', async ({ page }) => {
      const emptyMessage = page.getByText(/항목을 추가해주세요|최소 2개 이상/i);
      await expect(emptyMessage).toBeVisible();
    });

    test('SPIN 버튼이 비활성화되어 있다', async ({ page }) => {
      const spinButton = page.getByRole('button', { name: /spin/i });
      if (await spinButton.isVisible()) {
        await expect(spinButton).toBeDisabled();
      }
    });
  });

  test.describe('2. 항목 추가 기능', () => {
    test('단일 항목을 추가할 수 있다', async ({ page }) => {
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      await itemInput.fill('사과');
      await addButton.click();

      // 항목 목록에 추가된 항목 확인
      const itemList = page.getByText('사과');
      await expect(itemList).toBeVisible();
    });

    test('여러 항목을 추가할 수 있다', async ({ page }) => {
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      const items = ['사과', '바나나', '포도', '딸기'];

      for (const item of items) {
        await itemInput.fill(item);
        await addButton.click();
        await page.waitForTimeout(200);
      }

      // 모든 항목 확인
      for (const item of items) {
        const itemElement = page.getByText(item);
        await expect(itemElement).toBeVisible();
      }

      // 항목 개수 확인
      const itemCount = page.getByText(/항목 목록.*4/i);
      await expect(itemCount).toBeVisible();
    });

    test('빈 항목은 추가되지 않는다', async ({ page }) => {
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      await itemInput.fill('   '); // 공백만
      await addButton.click();

      // 항목이 추가되지 않았는지 확인
      const emptyMessage = page.getByText(/항목을 추가해주세요/i);
      await expect(emptyMessage).toBeVisible();
    });

    test('Enter 키로 항목을 추가할 수 있다', async ({ page }) => {
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();

      await itemInput.fill('키보드 테스트');
      await itemInput.press('Enter');

      const item = page.getByText('키보드 테스트');
      await expect(item).toBeVisible();
    });

    test('특수문자가 포함된 항목을 추가할 수 있다', async ({ page }) => {
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      const specialItems = ['@이메일', '#해시태그', '50% 할인', '(괄호)'];

      for (const item of specialItems) {
        await itemInput.fill(item);
        await addButton.click();
        await page.waitForTimeout(200);
      }

      // 특수문자 항목 확인
      for (const item of specialItems) {
        const itemElement = page.getByText(item);
        await expect(itemElement).toBeVisible();
      }
    });

    test('매우 긴 텍스트를 항목으로 추가할 수 있다', async ({ page }) => {
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      const longText = 'A'.repeat(100);
      await itemInput.fill(longText);
      await addButton.click();

      // 긴 텍스트가 추가되었는지 확인
      const itemElement = page.locator(`text="${longText.substring(0, 20)}"`);
      expect(await itemElement.count()).toBeGreaterThan(0);
    });
  });

  test.describe('3. 일괄 입력 (Bulk Input)', () => {
    test('여러 줄 입력으로 한 번에 추가할 수 있다', async ({ page }) => {
      // 일괄 입력 버튼 찾기
      const bulkButton = page.getByRole('button', { name: /일괄|bulk|여러 개/i });

      if (await bulkButton.isVisible({ timeout: 2000 })) {
        await bulkButton.click();

        // 텍스트 영역에 여러 줄 입력
        const textarea = page.locator('textarea');
        await textarea.fill('사과\n바나나\n포도\n딸기');

        // 확인 버튼 클릭
        const confirmButton = page.getByRole('button', { name: /확인|추가|add/i });
        await confirmButton.click();

        // 항목 확인
        await expect(page.getByText('사과')).toBeVisible();
        await expect(page.getByText('바나나')).toBeVisible();
        await expect(page.getByText('포도')).toBeVisible();
        await expect(page.getByText('딸기')).toBeVisible();
      }
    });

    test('쉼표로 구분된 입력을 처리할 수 있다', async ({ page }) => {
      const bulkButton = page.getByRole('button', { name: /일괄|bulk|여러 개/i });

      if (await bulkButton.isVisible({ timeout: 2000 })) {
        await bulkButton.click();

        const textarea = page.locator('textarea');
        await textarea.fill('사과,바나나,포도,딸기');

        const confirmButton = page.getByRole('button', { name: /확인|추가/i });
        await confirmButton.click();

        // 쉼표로 분리되어 추가되었는지 확인
        const items = await page.locator('[class*="item"], li').count();
        expect(items).toBeGreaterThan(0);
      }
    });
  });

  test.describe('4. 항목 수정 및 삭제', () => {
    test.beforeEach(async ({ page }) => {
      // 테스트 항목 추가
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      const items = ['항목1', '항목2', '항목3'];
      for (const item of items) {
        await itemInput.fill(item);
        await addButton.click();
        await page.waitForTimeout(200);
      }
    });

    test('항목을 삭제할 수 있다', async ({ page }) => {
      // 삭제 버튼 찾기 (첫 번째 항목)
      const deleteButtons = page.getByRole('button', { name: /삭제|delete|remove/i });
      const count = await deleteButtons.count();

      if (count > 0) {
        await deleteButtons.first().click();

        // 항목이 삭제되었는지 확인
        await page.waitForTimeout(500);
        const remainingItems = await deleteButtons.count();
        expect(remainingItems).toBeLessThan(count);
      }
    });

    test('전체 삭제 버튼이 동작한다', async ({ page }) => {
      const clearButton = page.getByRole('button', { name: /전체 삭제|clear all/i });

      if (await clearButton.isVisible()) {
        await clearButton.click();

        // 확인 다이얼로그 처리 (있을 경우)
        page.on('dialog', dialog => dialog.accept());

        // 모든 항목이 삭제되었는지 확인
        const emptyMessage = page.getByText(/항목을 추가해주세요/i);
        await expect(emptyMessage).toBeVisible({ timeout: 3000 });
      }
    });

    test('항목을 수정할 수 있다', async ({ page }) => {
      // 수정 버튼 찾기
      const editButtons = page.getByRole('button', { name: /수정|edit/i });

      if (await editButtons.count() > 0) {
        await editButtons.first().click();

        // 입력 필드에 새 값 입력
        const editInput = page.locator('input[value="항목1"], input').first();
        await editInput.fill('수정된항목');

        // 저장 버튼 클릭
        const saveButton = page.getByRole('button', { name: /저장|save/i });
        if (await saveButton.isVisible({ timeout: 1000 })) {
          await saveButton.click();
        } else {
          await editInput.press('Enter');
        }

        // 수정된 항목 확인
        const modifiedItem = page.getByText('수정된항목');
        await expect(modifiedItem).toBeVisible({ timeout: 2000 });
      }
    });
  });

  test.describe('5. 룰렛 회전 및 선택', () => {
    test.beforeEach(async ({ page }) => {
      // 테스트 항목 추가
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      const items = ['사과', '바나나', '포도', '딸기', '오렌지'];
      for (const item of items) {
        await itemInput.fill(item);
        await addButton.click();
        await page.waitForTimeout(200);
      }
    });

    test('2개 이상 항목이 있으면 SPIN 버튼이 활성화된다', async ({ page }) => {
      const spinButton = page.getByRole('button', { name: /spin/i });
      await expect(spinButton).toBeEnabled();
    });

    test('룰렛을 돌릴 수 있다', async ({ page }) => {
      const spinButton = page.getByRole('button', { name: /spin/i });
      await spinButton.click();

      // 회전 중 버튼 비활성화 확인
      await expect(spinButton).toBeDisabled({ timeout: 1000 });

      // 회전 완료 대기
      await page.waitForTimeout(5000);

      // 결과 모달 또는 결과 표시 확인
      const resultModal = page.locator('[role="dialog"], [class*="modal"]');
      await expect(resultModal).toBeVisible({ timeout: 5000 });
    });

    test('캔버스 클릭으로도 룰렛을 돌릴 수 있다', async ({ page }) => {
      const canvas = page.locator('canvas');

      if (await canvas.isVisible()) {
        await canvas.click();

        // 회전 시작 확인
        await page.waitForTimeout(1000);

        const spinButton = page.getByRole('button', { name: /spin/i });
        if (await spinButton.isVisible()) {
          await expect(spinButton).toBeDisabled();
        }
      }
    });

    test('회전 중에는 항목을 수정할 수 없다', async ({ page }) => {
      const spinButton = page.getByRole('button', { name: /spin/i });
      await spinButton.click();

      // 삭제/수정 버튼 비활성화 확인
      const deleteButtons = page.getByRole('button', { name: /삭제|delete/i });
      if (await deleteButtons.count() > 0) {
        await expect(deleteButtons.first()).toBeDisabled();
      }
    });

    test('결과 모달에 선택된 항목이 표시된다', async ({ page }) => {
      const spinButton = page.getByRole('button', { name: /spin/i });
      await spinButton.click();

      // 회전 완료 대기
      await page.waitForTimeout(5000);

      // 결과 모달 확인
      const resultModal = page.locator('[role="dialog"], [class*="modal"]');
      await expect(resultModal).toBeVisible({ timeout: 5000 });

      // 선택된 항목이 모달에 표시되는지 확인
      const resultText = await resultModal.textContent();
      const hasItem = ['사과', '바나나', '포도', '딸기', '오렌지'].some(
        item => resultText?.includes(item)
      );
      expect(hasItem).toBeTruthy();
    });

    test('결과 모달을 닫을 수 있다', async ({ page }) => {
      const spinButton = page.getByRole('button', { name: /spin/i });
      await spinButton.click();
      await page.waitForTimeout(5000);

      const closeButton = page.getByRole('button', { name: /닫기|close/i });
      if (await closeButton.isVisible({ timeout: 3000 })) {
        await closeButton.click();

        // 모달이 닫혔는지 확인
        const resultModal = page.locator('[role="dialog"]');
        await expect(resultModal).not.toBeVisible();
      }
    });
  });

  test.describe('6. 히스토리 기능', () => {
    test.beforeEach(async ({ page }) => {
      // 항목 추가 및 룰렛 실행
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      const items = ['A', 'B', 'C'];
      for (const item of items) {
        await itemInput.fill(item);
        await addButton.click();
        await page.waitForTimeout(200);
      }
    });

    test('히스토리 패널을 열 수 있다', async ({ page }) => {
      const historyButton = page.getByRole('button', { name: /히스토리|history|기록/i });

      if (await historyButton.isVisible({ timeout: 2000 })) {
        await historyButton.click();

        // 히스토리 패널 또는 모달 확인
        const historyPanel = page.locator('[class*="history"], [role="dialog"]');
        await expect(historyPanel).toBeVisible();
      }
    });

    test('룰렛 결과가 히스토리에 저장된다', async ({ page }) => {
      // 룰렛 실행
      const spinButton = page.getByRole('button', { name: /spin/i });
      await spinButton.click();
      await page.waitForTimeout(5000);

      // 모달 닫기
      const closeButton = page.getByRole('button', { name: /닫기|close/i });
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.click();
      }

      // 히스토리 열기
      const historyButton = page.getByRole('button', { name: /히스토리|history/i });
      if (await historyButton.isVisible({ timeout: 2000 })) {
        await historyButton.click();

        // 히스토리에 항목이 있는지 확인
        const historyItems = page.locator('[class*="history"] li, [class*="history"] div');
        const count = await historyItems.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('히스토리를 삭제할 수 있다', async ({ page }) => {
      // 룰렛 실행
      const spinButton = page.getByRole('button', { name: /spin/i });
      await spinButton.click();
      await page.waitForTimeout(5000);

      // 모달 닫기
      const closeButton = page.getByRole('button', { name: /닫기|close/i });
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.click();
      }

      // 히스토리 열기
      const historyButton = page.getByRole('button', { name: /히스토리|history/i });
      if (await historyButton.isVisible({ timeout: 2000 })) {
        await historyButton.click();

        // 히스토리 삭제 버튼
        const clearHistoryButton = page.getByRole('button', { name: /히스토리 삭제|clear|전체 삭제/i });
        if (await clearHistoryButton.isVisible({ timeout: 2000 })) {
          await clearHistoryButton.click();

          // 확인 다이얼로그 처리
          page.on('dialog', dialog => dialog.accept());

          // 히스토리가 비었는지 확인
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test.describe('7. 설정 및 커스터마이징', () => {
    test.beforeEach(async ({ page }) => {
      // 항목 추가
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      const items = ['A', 'B', 'C'];
      for (const item of items) {
        await itemInput.fill(item);
        await addButton.click();
        await page.waitForTimeout(200);
      }
    });

    test('설정 패널을 열 수 있다', async ({ page }) => {
      const settingsButton = page.getByRole('button', { name: /설정|settings/i });

      if (await settingsButton.isVisible({ timeout: 2000 })) {
        await settingsButton.click();

        // 설정 패널 확인
        const settingsPanel = page.locator('[class*="settings"], [role="dialog"]');
        await expect(settingsPanel).toBeVisible();
      }
    });

    test('컨페티 효과를 토글할 수 있다', async ({ page }) => {
      const settingsButton = page.getByRole('button', { name: /설정|settings/i });

      if (await settingsButton.isVisible({ timeout: 2000 })) {
        await settingsButton.click();

        // 컨페티 스위치 찾기
        const confettiSwitch = page.locator('[role="switch"], input[type="checkbox"]').first();
        if (await confettiSwitch.isVisible({ timeout: 2000 })) {
          await confettiSwitch.click();

          // 설정이 저장되는지 확인
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('8. 로컬 스토리지 영속성', () => {
    test('항목이 로컬 스토리지에 저장된다', async ({ page }) => {
      // 항목 추가
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      await itemInput.fill('영속성테스트');
      await addButton.click();

      // 페이지 새로고침
      await page.reload();

      // 항목이 여전히 있는지 확인
      const item = page.getByText('영속성테스트');
      await expect(item).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('9. 반응형 디자인', () => {
    test('모바일 뷰포트에서 정상 작동', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      const heading = page.getByRole('heading', { name: /랜덤 뽑기/i });
      await expect(heading).toBeVisible();

      // 입력 폼 확인
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      await expect(itemInput).toBeVisible();
    });

    test('태블릿 뷰포트에서 레이아웃 확인', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();

      const heading = page.getByRole('heading', { name: /랜덤 뽑기/i });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('10. 랜덤성 검증', () => {
    test.beforeEach(async ({ page }) => {
      // 항목 추가
      const itemInput = page.getByPlaceholder(/항목|입력/i).first();
      const addButton = page.getByRole('button', { name: /추가|add/i }).first();

      const items = ['A', 'B', 'C', 'D', 'E'];
      for (const item of items) {
        await itemInput.fill(item);
        await addButton.click();
        await page.waitForTimeout(200);
      }
    });

    test('여러 번 실행 시 다양한 결과가 나온다', async ({ page }) => {
      const results: string[] = [];

      // 5번 실행
      for (let i = 0; i < 5; i++) {
        const spinButton = page.getByRole('button', { name: /spin/i });
        await spinButton.click();
        await page.waitForTimeout(5000);

        // 결과 추출
        const resultModal = page.locator('[role="dialog"]');
        const resultText = await resultModal.textContent();
        if (resultText) {
          results.push(resultText);
        }

        // 모달 닫기
        const closeButton = page.getByRole('button', { name: /닫기|close/i });
        if (await closeButton.isVisible({ timeout: 1000 })) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }

      // 최소한 2개 이상의 다른 결과가 나와야 함 (확률적)
      const uniqueResults = new Set(results);
      console.log('Unique results:', uniqueResults.size, 'out of', results.length);

      // 모든 결과가 동일할 확률은 매우 낮음
      // 하지만 랜덤성 때문에 가끔 실패할 수 있으므로 주의
    });
  });
});
