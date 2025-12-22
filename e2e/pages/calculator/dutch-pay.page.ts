import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Dutch Pay Page Object
 *
 * 테스트 시나리오:
 * - 참가자 추가
 * - 지출 추가
 * - 정산 계산
 */
export class DutchPayPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get participantInput() {
    return this.page.getByPlaceholder(/참가자|이름|name/i);
  }

  get addParticipantButton() {
    return this.page.getByRole('button', { name: /참가자.*추가|add.*participant/i });
  }

  get participantList() {
    return this.page.locator('.participant-list, [data-testid="participants"]');
  }

  get participantChips() {
    return this.page.locator('.participant-chip, [data-participant], .badge');
  }

  get expenseAmountInput() {
    return this.page.getByLabel(/금액|amount/i);
  }

  get expenseDescInput() {
    return this.page.getByLabel(/항목|설명|description/i);
  }

  get payerSelect() {
    return this.page.getByLabel(/결제자|payer/i);
  }

  get addExpenseButton() {
    return this.page.getByRole('button', { name: /지출.*추가|add.*expense/i });
  }

  get expenseList() {
    return this.page.locator('.expense-list, [data-testid="expenses"]');
  }

  get calculateButton() {
    return this.page.getByRole('button', { name: /정산|calculate|계산/i });
  }

  get settlementResult() {
    return this.page.locator('.settlement-result, [data-testid="settlement"]');
  }

  get totalAmount() {
    return this.page.locator('.total-amount, [data-testid="total"]');
  }

  // Actions
  async goto() {
    await super.goto('/dutch-pay');
  }

  async addParticipant(name: string) {
    await this.participantInput.fill(name);
    await this.addParticipantButton.click();
    await this.waitForAnimation();
  }

  async addParticipants(names: string[]) {
    for (const name of names) {
      await this.addParticipant(name);
    }
  }

  async addExpense(amount: number, description: string, payerIndex?: number) {
    if (await this.expenseAmountInput.isVisible()) {
      await this.expenseAmountInput.fill(amount.toString());
    }

    if (await this.expenseDescInput.isVisible()) {
      await this.expenseDescInput.fill(description);
    }

    if (payerIndex !== undefined && await this.payerSelect.isVisible()) {
      const options = await this.payerSelect.locator('option').all();
      if (options[payerIndex]) {
        await this.payerSelect.selectOption({ index: payerIndex });
      }
    }

    await this.addExpenseButton.click();
    await this.waitForAnimation();
  }

  async calculate() {
    await this.calculateButton.click();
    await this.waitForAnimation();
  }

  // Assertions
  async expectParticipantCount(count: number) {
    await expect(this.participantChips).toHaveCount(count);
  }

  async expectSettlementVisible() {
    await expect(this.settlementResult).toBeVisible();
  }

  async expectTotalAmount(amount: number) {
    const text = await this.totalAmount.textContent();
    expect(text).toContain(amount.toLocaleString());
  }
}
