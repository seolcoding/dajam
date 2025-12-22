import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Bingo Game Page Object
 *
 * Multi-user scenarios:
 * - Host creates game with custom settings
 * - Player joins with game code
 * - Both see cell selections in real-time
 * - Bingo detection and celebration
 */
export class BingoGamePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Menu
  get createGameButton() {
    return this.page.getByRole('button', { name: /새.*게임|만들기|create/i });
  }

  get joinGameButton() {
    return this.page.getByRole('button', { name: /참여|join/i });
  }

  get gameCodeInput() {
    return this.page.getByPlaceholder(/코드|code/i);
  }

  // Locators - Host Setup
  get gridSizeSelect() {
    return this.page.getByLabel(/크기|size/i);
  }

  get themeSelect() {
    return this.page.getByLabel(/테마|theme/i);
  }

  get startGameButton() {
    return this.page.getByRole('button', { name: /시작|start/i });
  }

  // Locators - Game
  get bingoGrid() {
    return this.page.locator('.bingo-grid, [data-testid="bingo-grid"], .grid');
  }

  get bingoCells() {
    return this.page.locator('.bingo-cell, [data-testid="bingo-cell"], .grid button');
  }

  get gameCode() {
    return this.page.locator('[data-testid="game-code"], .game-code, code');
  }

  get callButton() {
    return this.page.getByRole('button', { name: /호출|call|부르기/i });
  }

  get currentCall() {
    return this.page.locator('[data-testid="current-call"], .current-call');
  }

  get bingoAlert() {
    return this.page.getByText(/빙고|BINGO/i);
  }

  get resetButton() {
    return this.page.getByRole('button', { name: /리셋|reset|다시/i });
  }

  // Actions
  async goto() {
    await super.goto('/bingo-game');
  }

  async createGame(gridSize?: string, theme?: string) {
    await this.createGameButton.click();

    if (gridSize && await this.gridSizeSelect.isVisible()) {
      await this.gridSizeSelect.selectOption(gridSize);
    }

    if (theme && await this.themeSelect.isVisible()) {
      await this.themeSelect.selectOption(theme);
    }

    await this.startGameButton.click();
    await this.waitForPageLoad();
  }

  async joinGame(code: string) {
    await this.joinGameButton.click();
    await this.gameCodeInput.fill(code);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  async getGameCode(): Promise<string> {
    if (await this.gameCode.isVisible()) {
      return await this.gameCode.textContent() || '';
    }
    return '';
  }

  async clickCell(index: number) {
    const cells = await this.bingoCells.all();
    if (cells[index]) {
      await cells[index].click();
    }
  }

  async callNumber() {
    await this.callButton.click();
    await this.waitForAnimation(500);
  }

  async getCellState(index: number): Promise<boolean> {
    const cells = await this.bingoCells.all();
    if (cells[index]) {
      const className = await cells[index].getAttribute('class') || '';
      return className.includes('selected') || className.includes('marked');
    }
    return false;
  }

  // Assertions
  async expectGridVisible() {
    await expect(this.bingoGrid).toBeVisible();
  }

  async expectCellCount(count: number) {
    await expect(this.bingoCells).toHaveCount(count);
  }

  async expectBingo() {
    await expect(this.bingoAlert).toBeVisible();
  }

  async expectCellSelected(index: number) {
    const cells = await this.bingoCells.all();
    if (cells[index]) {
      await expect(cells[index]).toHaveClass(/selected|marked|active/);
    }
  }
}
