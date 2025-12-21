import { test, expect } from '@playwright/test';
import { RandomPickerPage } from '../../pages/utility/random-picker.page';

/**
 * Random Picker - E2E Tests
 *
 * Based on APPS_DOCUMENTATION.md:
 * - 항목 추가 확인
 * - 휠 회전 확인
 * - 결과 표시 확인
 */
test.describe('Random Picker', () => {
  let pickerPage: RandomPickerPage;

  test.beforeEach(async ({ page }) => {
    pickerPage = new RandomPickerPage(page);
    await pickerPage.goto();
  });

  test('should load page with wheel', async () => {
    await pickerPage.expectWheelVisible();
  });

  test('should add items to wheel', async () => {
    const items = ['점심', '저녁', '야식'];

    for (const item of items) {
      await pickerPage.addItem(item);
    }

    await pickerPage.expectItemCount(items.length);
  });

  test('should spin wheel and show result', async () => {
    const items = ['A', 'B', 'C'];
    await pickerPage.addItems(items);

    await pickerPage.spin();

    await pickerPage.expectResultVisible();
  });

  test('should display items in wheel', async () => {
    const items = ['짜장면', '짬뽕', '탕수육'];
    await pickerPage.addItems(items);

    for (const item of items) {
      await pickerPage.expectItemInWheel(item);
    }
  });

  test('should track history after multiple spins', async () => {
    const items = ['A', 'B', 'C'];
    await pickerPage.addItems(items);

    // Spin multiple times
    await pickerPage.spin();
    await pickerPage.closeModal();

    await pickerPage.spin();
    await pickerPage.closeModal();

    // History should have 2 entries
    await pickerPage.expectHistoryCount(2);
  });

  test('should remove items', async () => {
    const items = ['A', 'B', 'C'];
    await pickerPage.addItems(items);

    await pickerPage.removeItem('B');

    await pickerPage.expectItemCount(2);
  });

  test('should handle single item', async () => {
    await pickerPage.addItem('Only One');
    await pickerPage.spin();

    await pickerPage.expectResultVisible();
  });
});
