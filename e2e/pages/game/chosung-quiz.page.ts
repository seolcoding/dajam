import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Chosung Quiz Page Object
 *
 * Game Flow:
 * 1. Settings: Select category, question count, time limit
 * 2. Playing: View chosung, submit answer, use hints
 * 3. Result: View score and answer review
 */
export class ChosungQuizPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Settings Page
  get movieCategoryButton() {
    return this.page.getByRole('button', { name: /영화/i });
  }

  get foodCategoryButton() {
    return this.page.getByRole('button', { name: /음식/i });
  }

  get kpopCategoryButton() {
    return this.page.getByRole('button', { name: /K-POP/i });
  }

  get proverbCategoryButton() {
    return this.page.getByRole('button', { name: /속담/i });
  }

  get questionCountSlider() {
    return this.page.getByLabel(/문제 개수/i);
  }

  get timeLimitSlider() {
    return this.page.getByLabel(/제한 시간/i);
  }

  get startGameButton() {
    return this.page.getByRole('button', { name: /게임 시작하기/i });
  }

  // Locators - Game Play Page
  get chosungDisplay() {
    return this.page.locator('[data-testid="chosung-display"], .chosung-display, .text-8xl, .text-9xl').first();
  }

  get answerInput() {
    return this.page.getByPlaceholder(/정답을 입력하세요/i);
  }

  get submitButton() {
    return this.page.getByRole('button', { name: '', exact: false }).filter({ has: this.page.locator('svg') }).first();
  }

  get skipButton() {
    return this.page.getByRole('button', { name: /패스하기/i });
  }

  get hintButtons() {
    return this.page.getByRole('button', { name: /힌트/i });
  }

  get scoreDisplay() {
    return this.page.locator('text=/\\d+점/').first();
  }

  get questionProgress() {
    return this.page.locator('text=/\\d+\\/\\d+/');
  }

  get timerDisplay() {
    return this.page.locator('[data-testid="timer"], .timer, text=/\\d+초/').first();
  }

  get feedbackMessage() {
    return this.page.locator('text=/정답입니다|아쉽네요/i');
  }

  get correctAnswer() {
    return this.page.locator('text=/정답:/i').locator('..').locator('span').last();
  }

  // Locators - Result Page
  get finalScoreDisplay() {
    return this.page.locator('text=/최종 점수/i').locator('..').locator('text=/\\d+점/');
  }

  get correctCountDisplay() {
    return this.page.locator('text=/정답 개수/i').locator('..').locator('text=/\\d+\\/\\d+/');
  }

  get accuracyDisplay() {
    return this.page.locator('text=/정답률/i').locator('..').locator('text=/\\d+%/');
  }

  get averageTimeDisplay() {
    return this.page.locator('text=/평균 시간/i').locator('..').locator('text=/\\d+초/');
  }

  get retryButton() {
    return this.page.getByRole('button', { name: /다시 하기/i });
  }

  get settingsButton() {
    return this.page.getByRole('button', { name: /설정/i });
  }

  get shareButton() {
    return this.page.getByRole('button', { name: /공유/i });
  }

  get answerReviewSection() {
    return this.page.locator('text=/정답 확인/i').locator('..');
  }

  // Actions
  async goto() {
    await super.goto('/chosung-quiz');
  }

  async selectCategory(category: 'movie' | 'food' | 'kpop' | 'proverb') {
    const buttonMap = {
      movie: this.movieCategoryButton,
      food: this.foodCategoryButton,
      kpop: this.kpopCategoryButton,
      proverb: this.proverbCategoryButton
    };

    await buttonMap[category].click();
    await this.waitForAnimation(200);
  }

  async setQuestionCount(count: number) {
    await this.questionCountSlider.fill(count.toString());
  }

  async setTimeLimit(seconds: number) {
    await this.timeLimitSlider.fill(seconds.toString());
  }

  async startGame() {
    await this.startGameButton.click();
    await this.waitForPageLoad();
    await this.waitForAnimation(500);
  }

  async submitAnswer(answer: string) {
    await this.answerInput.fill(answer);
    await this.submitButton.click();
    await this.waitForAnimation(1600); // Wait for feedback animation
  }

  async skipQuestion() {
    await this.skipButton.click();
    await this.waitForAnimation(500);
  }

  async useHint(level: number) {
    const hints = await this.hintButtons.all();
    if (hints[level - 1]) {
      await hints[level - 1].click();
      await this.waitForAnimation(200);
    }
  }

  async getCurrentChosung(): Promise<string> {
    return await this.chosungDisplay.textContent() || '';
  }

  async getScore(): Promise<number> {
    const scoreText = await this.scoreDisplay.textContent() || '0점';
    return parseInt(scoreText.replace(/[^0-9]/g, '')) || 0;
  }

  async getQuestionNumber(): Promise<{ current: number; total: number }> {
    const progressText = await this.questionProgress.textContent() || '1/10';
    const [current, total] = progressText.split('/').map(n => parseInt(n));
    return { current, total };
  }

  async getTimeRemaining(): Promise<number> {
    const timerText = await this.timerDisplay.textContent() || '30';
    return parseInt(timerText.replace(/[^0-9]/g, '')) || 0;
  }

  async waitForNextQuestion() {
    await this.waitForAnimation(1600);
  }

  async waitForGameOver() {
    await this.expectResultVisible();
  }

  // Assertions
  async expectSettingsVisible() {
    await expect(this.startGameButton).toBeVisible();
    await expect(this.page.getByText(/초성 퀴즈/i)).toBeVisible();
  }

  async expectGameStarted() {
    await expect(this.chosungDisplay).toBeVisible();
    await expect(this.answerInput).toBeVisible();
    await expect(this.scoreDisplay).toBeVisible();
  }

  async expectQuestionVisible() {
    await expect(this.chosungDisplay).toBeVisible();
    const chosung = await this.getCurrentChosung();
    expect(chosung.length).toBeGreaterThan(0);
  }

  async expectScore(value: number) {
    const score = await this.getScore();
    expect(score).toBe(value);
  }

  async expectScoreGreaterThan(value: number) {
    const score = await this.getScore();
    expect(score).toBeGreaterThan(value);
  }

  async expectCorrectFeedback() {
    await expect(this.feedbackMessage).toContainText(/정답입니다/i);
  }

  async expectIncorrectFeedback() {
    await expect(this.feedbackMessage).toContainText(/아쉽네요/i);
  }

  async expectResultVisible() {
    await expect(this.finalScoreDisplay).toBeVisible({ timeout: 10000 });
    await expect(this.retryButton).toBeVisible();
  }

  async expectGameOver() {
    await this.expectResultVisible();
    await expect(this.answerReviewSection).toBeVisible();
  }

  async expectHintVisible(level: number) {
    const hints = await this.hintButtons.all();
    if (hints[level - 1]) {
      await expect(hints[level - 1]).toBeVisible();
    }
  }

  async expectTimerRunning() {
    const time1 = await this.getTimeRemaining();
    await this.waitForAnimation(1000);
    const time2 = await this.getTimeRemaining();
    expect(time2).toBeLessThan(time1);
  }

  async expectQuestionProgress(current: number, total: number) {
    const progress = await this.getQuestionNumber();
    expect(progress.current).toBe(current);
    expect(progress.total).toBe(total);
  }
}
