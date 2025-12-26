import { test, expect } from '@playwright/test';
import { IdealWorldcupPage } from '../../pages/game/ideal-worldcup.page';

/**
 * E2E Tests: Ideal Worldcup (이상형 월드컵)
 *
 * 테스트 범위:
 * - 홈 화면 로드 및 버튼 확인
 * - 템플릿 선택 및 게임 시작
 * - 토너먼트 진행 (8강 → 4강 → 준결승 → 결승)
 * - 결과 화면 확인
 * - 게임 재시작
 * - 뒤로가기 기능
 */

test.describe('Ideal Worldcup - 이상형 월드컵', () => {
  let idealWorldcupPage: IdealWorldcupPage;

  test.beforeEach(async ({ page }) => {
    idealWorldcupPage = new IdealWorldcupPage(page);
    await idealWorldcupPage.goto();
  });

  test('should load home screen with all options', async () => {
    await test.step('홈 화면 로드 확인', async () => {
      await idealWorldcupPage.expectHomeScreen();
    });

    await test.step('모든 버튼 표시 확인', async () => {
      // Template button
      await expect(idealWorldcupPage.templateButton).toBeVisible();

      // Create button
      await expect(idealWorldcupPage.createButton).toBeVisible();

      // Multiplayer button
      await expect(idealWorldcupPage.multiplayerButton).toBeVisible();
    });
  });

  test('should display template selection screen', async () => {
    await test.step('템플릿 버튼 클릭', async () => {
      await idealWorldcupPage.templateButton.click();
      await idealWorldcupPage.waitForAnimation();
    });

    await test.step('템플릿 목록 확인', async () => {
      await idealWorldcupPage.expectTemplateSelectionScreen();

      // At least one template should be visible
      const templateCount = await idealWorldcupPage.templateCards.count();
      expect(templateCount).toBeGreaterThan(0);
    });
  });

  test('should start tournament with template', async () => {
    await test.step('템플릿 선택', async () => {
      await idealWorldcupPage.selectTemplate(0);
    });

    await test.step('첫 번째 매치 확인', async () => {
      await idealWorldcupPage.expectMatchView();
      await idealWorldcupPage.expectProgress();

      // Should show round name (8강, 16강, etc.)
      await expect(idealWorldcupPage.roundDisplay).toBeVisible();
    });
  });

  test('should progress through tournament rounds', async () => {
    await test.step('템플릿으로 게임 시작', async () => {
      await idealWorldcupPage.selectTemplate(0);
      await idealWorldcupPage.expectMatchView();
    });

    await test.step('첫 번째 라운드 확인 (8강)', async () => {
      // 8강 토너먼트이므로 "8강" 또는 "준준결승" 표시
      const roundText = await idealWorldcupPage.roundDisplay.textContent();
      expect(roundText).toBeTruthy();
    });

    await test.step('몇 경기 진행', async () => {
      // Play 3 matches
      for (let i = 0; i < 3; i++) {
        await idealWorldcupPage.selectLeftCandidate();
      }
    });

    await test.step('진행 상태 확인', async () => {
      // Still in match view
      await idealWorldcupPage.expectMatchView();
    });
  });

  test('should complete full tournament and show results', async () => {
    await test.step('템플릿으로 게임 시작', async () => {
      await idealWorldcupPage.selectTemplate(0);
    });

    await test.step('전체 토너먼트 진행', async () => {
      await idealWorldcupPage.playFullTournament('left');
    });

    await test.step('결과 화면 확인', async () => {
      await idealWorldcupPage.expectResultScreen();
      await idealWorldcupPage.expectWinner();
    });

    await test.step('우승자 및 준우승자 표시 확인', async () => {
      // Winner should be visible with trophy
      await expect(idealWorldcupPage.page.locator('text=🏆')).toBeVisible();

      // Runner-up should be visible
      await idealWorldcupPage.expectRunnerUp();
    });

    await test.step('결과 버튼 확인', async () => {
      await expect(idealWorldcupPage.downloadButton).toBeVisible();
      await expect(idealWorldcupPage.restartButton).toBeVisible();
      await expect(idealWorldcupPage.homeButton).toBeVisible();
    });
  });

  test('should restart tournament from results', async () => {
    await test.step('토너먼트 완료', async () => {
      await idealWorldcupPage.selectTemplate(0);
      await idealWorldcupPage.playFullTournament('random');
      await idealWorldcupPage.expectResultScreen();
    });

    await test.step('다시하기 버튼 클릭', async () => {
      await idealWorldcupPage.restart();
    });

    await test.step('새 토너먼트 시작 확인', async () => {
      await idealWorldcupPage.expectMatchView();

      // Should be back to first round
      const roundText = await idealWorldcupPage.roundDisplay.textContent();
      expect(roundText).toBeTruthy();
    });
  });

  test('should navigate back to home from results', async () => {
    await test.step('토너먼트 완료', async () => {
      await idealWorldcupPage.selectTemplate(0);
      await idealWorldcupPage.playFullTournament('left');
      await idealWorldcupPage.expectResultScreen();
    });

    await test.step('홈으로 버튼 클릭', async () => {
      await idealWorldcupPage.goHome();
    });

    await test.step('홈 화면 복귀 확인', async () => {
      await idealWorldcupPage.expectHomeScreen();
    });
  });

  test('should allow going back during tournament', async () => {
    await test.step('게임 시작 및 몇 경기 진행', async () => {
      await idealWorldcupPage.selectTemplate(0);
      await idealWorldcupPage.selectLeftCandidate();
      await idealWorldcupPage.selectLeftCandidate();
    });

    await test.step('뒤로가기 버튼 확인', async () => {
      await expect(idealWorldcupPage.backButton).toBeEnabled();
    });

    await test.step('뒤로가기 실행', async () => {
      await idealWorldcupPage.goBackOneMatch();
    });

    await test.step('이전 매치로 복귀 확인', async () => {
      await idealWorldcupPage.expectMatchView();
    });
  });

  test('should show different templates', async () => {
    await test.step('템플릿 선택 화면 이동', async () => {
      await idealWorldcupPage.templateButton.click();
      await idealWorldcupPage.waitForAnimation();
    });

    await test.step('여러 템플릿 확인', async () => {
      const templateCount = await idealWorldcupPage.templateCards.count();

      // Should have at least 3 templates (based on templates.ts)
      expect(templateCount).toBeGreaterThanOrEqual(3);

      // Each template should have an image
      const firstTemplate = idealWorldcupPage.templateCards.first();
      await expect(firstTemplate.locator('img')).toBeVisible();
    });
  });

  test('should maintain game state during matches', async () => {
    await test.step('게임 시작', async () => {
      await idealWorldcupPage.selectTemplate(0);
    });

    await test.step('첫 후보자 이름 저장', async () => {
      const candidateNames = await idealWorldcupPage.candidateCards.allTextContents();
      expect(candidateNames.length).toBe(2);
      expect(candidateNames[0]).toBeTruthy();
      expect(candidateNames[1]).toBeTruthy();
    });

    await test.step('선택 후 다음 매치로 이동', async () => {
      await idealWorldcupPage.selectLeftCandidate();
    });

    await test.step('새로운 매치 확인', async () => {
      await idealWorldcupPage.expectMatchView();
      const newCandidates = await idealWorldcupPage.candidateCards.allTextContents();
      expect(newCandidates.length).toBe(2);
    });
  });

  test('should complete tournament with random selections', async () => {
    await test.step('게임 시작', async () => {
      await idealWorldcupPage.selectTemplate(0);
    });

    await test.step('랜덤 선택으로 토너먼트 완료', async () => {
      await idealWorldcupPage.playFullTournament('random');
    });

    await test.step('결과 확인', async () => {
      await idealWorldcupPage.expectResultScreen();
      await idealWorldcupPage.expectWinner();

      // Winner name should exist and not be empty
      const winnerElement = idealWorldcupPage.page.locator('text=🏆').locator('..');
      const winnerText = await winnerElement.textContent();
      expect(winnerText).toBeTruthy();
    });
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    await test.step('모바일 뷰포트 설정', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await idealWorldcupPage.goto();
    });

    await test.step('홈 화면 확인', async () => {
      await idealWorldcupPage.expectHomeScreen();
    });

    await test.step('템플릿 선택 및 게임 시작', async () => {
      await idealWorldcupPage.selectTemplate(0);
      await idealWorldcupPage.expectMatchView();
    });

    await test.step('몇 경기 진행', async () => {
      await idealWorldcupPage.selectLeftCandidate();
      await idealWorldcupPage.selectRightCandidate();
    });

    await test.step('계속 진행 가능 확인', async () => {
      await idealWorldcupPage.expectMatchView();
    });
  });
});
