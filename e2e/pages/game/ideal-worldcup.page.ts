import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Ideal Worldcup Page Object
 *
 * 테스트 시나리오:
 * - 홈 화면: 템플릿/직접 만들기 선택
 * - 템플릿 선택: 인기 템플릿으로 게임 시작
 * - 게임 플레이: 1:1 대결을 통한 토너먼트 진행
 * - 결과 화면: 우승자 및 준우승자 확인
 */
export class IdealWorldcupPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Home Screen Locators
  get templateButton() {
    return this.page.getByRole('button', { name: /템플릿|template/i });
  }

  get createButton() {
    return this.page.getByRole('button', { name: /직접 만들기|만들기/i });
  }

  get multiplayerButton() {
    return this.page.getByRole('button', { name: /친구들과|함께하기/i });
  }

  // Template Selection Locators
  get templateCards() {
    return this.page.locator('[data-template], .template-card, article, .card').filter({
      has: this.page.locator('img, [role="img"]')
    });
  }

  get skipTemplateButton() {
    return this.page.getByRole('button', { name: /건너뛰기|skip/i });
  }

  // Match View Locators
  get candidateCards() {
    return this.page.locator('button').filter({
      has: this.page.locator('img, [role="img"]')
    }).filter({
      hasText: /.+/ // Has some text (candidate name)
    });
  }

  get roundDisplay() {
    return this.page.locator('h1').filter({ hasText: /강|결승|준결승|final|semi/i });
  }

  get matchProgress() {
    return this.page.locator('[role="progressbar"], .progress, progress');
  }

  get backButton() {
    return this.page.getByRole('button', { name: /뒤로|back/i });
  }

  get vsIndicator() {
    return this.page.locator('text=VS, [data-vs], .vs');
  }

  // Result View Locators
  get winnerCard() {
    return this.page.locator('.winner, [data-winner]').or(
      this.page.locator('img').filter({
        has: this.page.locator('text=🏆')
      }).locator('..')
    );
  }

  get winnerName() {
    return this.page.locator('text=🏆').locator('..').locator('h2, h3, .text-4xl, .text-5xl').first();
  }

  get runnerUpCard() {
    return this.page.locator('text=🥈').locator('..');
  }

  get downloadButton() {
    return this.page.getByRole('button', { name: /다운로드|download/i });
  }

  get shareButton() {
    return this.page.getByRole('button', { name: /공유|share/i });
  }

  get restartButton() {
    return this.page.getByRole('button', { name: /다시|restart/i });
  }

  get homeButton() {
    return this.page.getByRole('button', { name: /홈으로|home/i });
  }

  // Actions
  async goto() {
    await super.goto('/ideal-worldcup');
  }

  async selectTemplate(index: number = 0) {
    await this.templateButton.click();
    await this.waitForAnimation();

    const templates = await this.templateCards.all();
    if (templates[index]) {
      await templates[index].click();
      await this.waitForAnimation(1000); // Wait for game initialization
    } else {
      throw new Error(`Template at index ${index} not found`);
    }
  }

  async selectCandidate(index: number) {
    const candidates = await this.candidateCards.all();
    if (candidates[index]) {
      await candidates[index].click();
      await this.waitForAnimation(500);
    } else {
      throw new Error(`Candidate at index ${index} not found`);
    }
  }

  async selectLeftCandidate() {
    await this.selectCandidate(0);
  }

  async selectRightCandidate() {
    await this.selectCandidate(1);
  }

  async playFullTournament(strategy: 'left' | 'right' | 'random' = 'random') {
    let matchCount = 0;
    const maxMatches = 15; // 8강 토너먼트는 총 7경기 (4+2+1)

    while (matchCount < maxMatches) {
      try {
        // Wait for candidates to be visible
        await this.candidateCards.first().waitFor({ state: 'visible', timeout: 2000 });

        const candidates = await this.candidateCards.all();
        if (candidates.length !== 2) {
          // No more matches, tournament complete
          break;
        }

        // Select based on strategy
        if (strategy === 'left') {
          await this.selectLeftCandidate();
        } else if (strategy === 'right') {
          await this.selectRightCandidate();
        } else {
          // Random selection
          const choice = Math.random() > 0.5 ? 0 : 1;
          await this.selectCandidate(choice);
        }

        matchCount++;
      } catch (error) {
        // Tournament completed or error
        break;
      }
    }
  }

  async goBackOneMatch() {
    await this.backButton.click();
    await this.waitForAnimation();
  }

  async restart() {
    await this.restartButton.click();
    await this.waitForAnimation(1000);
  }

  async goHome() {
    await this.homeButton.click();
    await this.waitForAnimation();
  }

  // Assertions
  async expectHomeScreen() {
    await expect(this.page.getByRole('heading', { name: /이상형 월드컵/i })).toBeVisible();
    await expect(this.templateButton).toBeVisible();
    await expect(this.createButton).toBeVisible();
  }

  async expectTemplateSelectionScreen() {
    await expect(this.page.getByRole('heading', { name: /템플릿/i })).toBeVisible();
    await expect(this.templateCards.first()).toBeVisible();
  }

  async expectMatchView() {
    await expect(this.candidateCards.first()).toBeVisible();
    const count = await this.candidateCards.count();
    expect(count).toBe(2); // Should have exactly 2 candidates
  }

  async expectRound(roundText: string | RegExp) {
    await expect(this.roundDisplay).toContainText(roundText);
  }

  async expectFinalRound() {
    await this.expectRound(/결승|final/i);
  }

  async expectResultScreen() {
    // Winner trophy emoji should be visible
    await expect(this.page.locator('text=🏆')).toBeVisible();

    // Result buttons should be visible
    await expect(this.downloadButton).toBeVisible();
    await expect(this.restartButton).toBeVisible();
    await expect(this.homeButton).toBeVisible();
  }

  async expectWinner(expectedName?: string) {
    const winnerSection = this.page.locator('text=🏆').locator('..');
    await expect(winnerSection).toBeVisible();

    if (expectedName) {
      await expect(winnerSection).toContainText(expectedName);
    }
  }

  async expectRunnerUp() {
    await expect(this.page.locator('text=🥈')).toBeVisible();
  }

  async expectProgress() {
    await expect(this.matchProgress).toBeVisible();
  }
}
