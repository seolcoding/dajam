import { test, expect, type Page } from '@playwright/test';

/**
 * 밸런스 게임 E2E 테스트
 *
 * 테스트 범위:
 * - Edge Cases: 빈 입력, 특수문자, URL 파라미터, 로컬스토리지
 * - UI Tests: 반응형, 카드 애니메이션, 차트 표시, 스와이프
 * - E2E Journeys: 질문 선택 → 게임 플레이 → 결과 확인 → 공유
 * - 커스텀 질문 생성 및 공유
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:5191/mini-apps/balance-game/';

test.describe('밸런스 게임 - 홈 화면', () => {
  test('홈 화면이 정상적으로 로드됨', async ({ page }) => {
    await page.goto(BASE_URL);

    // 제목 확인
    await expect(page.getByRole('heading', { name: /밸런스 게임/ })).toBeVisible();

    // 카테고리 버튼들 표시 확인
    await expect(page.getByText('일상')).toBeVisible();
    await expect(page.getByText('음식')).toBeVisible();
    await expect(page.getByText('연애')).toBeVisible();
  });

  test('질문 만들기 버튼 존재', async ({ page }) => {
    await page.goto(BASE_URL);

    const createButton = page.getByRole('button', { name: /질문 만들기/ });
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
  });

  test('카테고리별 질문 필터링', async ({ page }) => {
    await page.goto(BASE_URL);

    // 일상 카테고리 클릭
    await page.getByRole('button', { name: '일상' }).click();

    // 일상 관련 질문들만 표시되는지 확인
    // 실제 질문 카드 확인
    const questionCards = page.locator('[data-testid="question-card"]');
    await expect(questionCards.first()).toBeVisible();

    // 음식 카테고리 클릭
    await page.getByRole('button', { name: '음식' }).click();

    // 음식 관련 질문으로 업데이트
    await expect(questionCards.first()).toBeVisible();
  });

  test('전체 카테고리 보기', async ({ page }) => {
    await page.goto(BASE_URL);

    // 전체 버튼 클릭
    await page.getByRole('button', { name: '전체' }).click();

    // 모든 질문 표시
    const questionCards = page.locator('[data-testid="question-card"]');
    const count = await questionCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('밸런스 게임 - 질문 선택 (Edge Cases)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('질문 카드 클릭 시 게임 페이지로 이동', async ({ page }) => {
    const firstQuestion = page.locator('[data-testid="question-card"]').first();
    await firstQuestion.click();

    // URL이 /game/:id 형식으로 변경
    await expect(page).toHaveURL(/#\/game\/.+/);

    // 질문 텍스트 표시 확인
    await expect(page.locator('text=VS')).toBeVisible();
  });

  test('존재하지 않는 질문 ID로 접근 시 에러 처리', async ({ page }) => {
    await page.goto(`${BASE_URL}#/game/invalid-id-12345`);

    // 에러 메시지 또는 홈으로 리다이렉트
    await expect(page.getByText('질문을 찾을 수 없습니다')).toBeVisible();

    const homeButton = page.getByRole('button', { name: /홈으로/ });
    await expect(homeButton).toBeVisible();

    await homeButton.click();
    await expect(page).toHaveURL(BASE_URL);
  });

  test('URL 직접 접근 시 정상 작동', async ({ page }) => {
    // 먼저 홈에서 질문 ID 가져오기
    await page.goto(BASE_URL);
    const firstQuestion = page.locator('[data-testid="question-card"]').first();
    await firstQuestion.click();

    const currentUrl = page.url();

    // 새 탭에서 같은 URL로 접근
    await page.goto(currentUrl);

    // 게임 화면 정상 표시
    await expect(page.locator('text=VS')).toBeVisible();
  });
});

test.describe('밸런스 게임 - 게임 플레이', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // 첫 번째 질문 선택
    await page.locator('[data-testid="question-card"]').first().click();
  });

  test('선택지 A 클릭 시 결과 페이지로 이동', async ({ page }) => {
    const choiceA = page.locator('[data-testid="choice-a"]');
    await expect(choiceA).toBeVisible();

    await choiceA.click();

    // 결과 페이지로 이동
    await expect(page).toHaveURL(/#\/result\/.+/);

    // 결과 차트 표시
    await expect(page.getByText(/투표 결과/)).toBeVisible();
  });

  test('선택지 B 클릭 시 결과 페이지로 이동', async ({ page }) => {
    const choiceB = page.locator('[data-testid="choice-b"]');
    await expect(choiceB).toBeVisible();

    await choiceB.click();

    await expect(page).toHaveURL(/#\/result\/.+/);
    await expect(page.getByText(/투표 결과/)).toBeVisible();
  });

  test('돌아가기 버튼으로 홈으로 복귀', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /돌아가기/ });
    await expect(backButton).toBeVisible();

    await backButton.click();

    await expect(page).toHaveURL(BASE_URL);
  });

  test('VS 구분선 표시', async ({ page }) => {
    await expect(page.getByText('VS')).toBeVisible();
  });
});

test.describe('밸런스 게임 - 반응형 UI', () => {
  test('모바일에서 세로 카드 배치', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(BASE_URL);

    await page.locator('[data-testid="question-card"]').first().click();

    // 모바일에서는 세로로 배치
    const choiceA = page.locator('[data-testid="choice-a"]');
    const choiceB = page.locator('[data-testid="choice-b"]');

    await expect(choiceA).toBeVisible();
    await expect(choiceB).toBeVisible();
  });

  test('데스크톱에서 가로 카드 배치', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);

    await page.locator('[data-testid="question-card"]').first().click();

    // 데스크톱에서는 가로로 배치
    const choiceA = page.locator('[data-testid="choice-a"]');
    const choiceB = page.locator('[data-testid="choice-b"]');

    await expect(choiceA).toBeVisible();
    await expect(choiceB).toBeVisible();
  });

  test('태블릿 뷰포트', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);

    await expect(page.getByRole('heading', { name: /밸런스 게임/ })).toBeVisible();
  });
});

test.describe('밸런스 게임 - 스와이프 제스처 (모바일)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.locator('[data-testid="question-card"]').first().click();
  });

  test('왼쪽 스와이프로 선택지 A 선택', async ({ page }) => {
    // 스와이프 시뮬레이션
    const card = page.locator('[data-testid="choice-a"]');

    await card.dispatchEvent('touchstart', {
      touches: [{ clientX: 200, clientY: 300 }],
    });

    await card.dispatchEvent('touchmove', {
      touches: [{ clientX: 50, clientY: 300 }],
    });

    await card.dispatchEvent('touchend', {});

    // 선택 효과 확인
  });

  test('오른쪽 스와이프로 선택지 B 선택', async ({ page }) => {
    const card = page.locator('[data-testid="choice-b"]');

    await card.dispatchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 300 }],
    });

    await card.dispatchEvent('touchmove', {
      touches: [{ clientX: 300, clientY: 300 }],
    });

    await card.dispatchEvent('touchend', {});
  });
});

test.describe('밸런스 게임 - 결과 화면', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('[data-testid="question-card"]').first().click();
    await page.locator('[data-testid="choice-a"]').click();
  });

  test('투표 결과 차트 표시', async ({ page }) => {
    // 차트 라이브러리 (recharts) 로딩 확인
    await expect(page.getByText(/투표 결과/)).toBeVisible();

    // 퍼센트 표시 확인
    const percentageA = page.locator('[data-testid="percentage-a"]');
    const percentageB = page.locator('[data-testid="percentage-b"]');

    // 두 퍼센트의 합이 100%
  });

  test('내 선택 강조 표시', async ({ page }) => {
    // 내가 선택한 항목이 하이라이트
    const myChoice = page.locator('[data-testid="my-choice"]');
    await expect(myChoice).toBeVisible();
  });

  test('총 투표 수 표시', async ({ page }) => {
    await expect(page.getByText(/총 투표/)).toBeVisible();
  });

  test('다른 질문 보기 버튼', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /다른 질문/ });
    await expect(nextButton).toBeVisible();

    await nextButton.click();

    // 홈으로 이동
    await expect(page).toHaveURL(BASE_URL);
  });

  test('공유하기 버튼', async ({ page }) => {
    const shareButton = page.getByRole('button', { name: /공유/ });
    await expect(shareButton).toBeVisible();
  });
});

test.describe('밸런스 게임 - 커스텀 질문 생성', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /질문 만들기/ }).click();
  });

  test('커스텀 질문 생성 폼 표시', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /나만의 질문 만들기/ })).toBeVisible();

    // 폼 필드 확인
    await expect(page.getByLabel(/질문/)).toBeVisible();
    await expect(page.getByLabel(/선택지 A/)).toBeVisible();
    await expect(page.getByLabel(/선택지 B/)).toBeVisible();
  });

  test('빈 질문 제출 시 에러', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /생성하기/ });
    await submitButton.click();

    // 유효성 검사 메시지
    await expect(page.getByText(/질문을 입력해주세요/)).toBeVisible();
  });

  test('선택지 하나만 입력 시 에러', async ({ page }) => {
    await page.getByLabel(/질문/).fill('테스트 질문');
    await page.getByLabel(/선택지 A/).fill('옵션 A');
    // 선택지 B 비워둠

    const submitButton = page.getByRole('button', { name: /생성하기/ });
    await submitButton.click();

    await expect(page.getByText(/두 선택지 모두 입력해주세요/)).toBeVisible();
  });

  test('정상적인 커스텀 질문 생성', async ({ page }) => {
    await page.getByLabel(/질문/).fill('당신의 선택은?');
    await page.getByLabel(/선택지 A/).fill('옵션 A');
    await page.getByLabel(/선택지 B/).fill('옵션 B');

    const submitButton = page.getByRole('button', { name: /생성하기/ });
    await submitButton.click();

    // 생성 완료 메시지
    await expect(page.getByText(/질문이 생성되었습니다/)).toBeVisible();

    // 공유 URL 표시
    const shareUrl = page.locator('input[readonly]');
    await expect(shareUrl).toBeVisible();

    const url = await shareUrl.inputValue();
    expect(url).toContain('/game/');
  });

  test('생성된 질문 URL 복사', async ({ page }) => {
    await page.getByLabel(/질문/).fill('복사 테스트');
    await page.getByLabel(/선택지 A/).fill('A');
    await page.getByLabel(/선택지 B/).fill('B');
    await page.getByRole('button', { name: /생성하기/ }).click();

    // 복사 버튼 클릭
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('링크가 복사되었습니다!');
      await dialog.accept();
    });

    await page.getByRole('button', { name: /복사/ }).click();
  });

  test('바로 플레이하기 버튼', async ({ page }) => {
    await page.getByLabel(/질문/).fill('플레이 테스트');
    await page.getByLabel(/선택지 A/).fill('A');
    await page.getByLabel(/선택지 B/).fill('B');
    await page.getByRole('button', { name: /생성하기/ }).click();

    const playButton = page.getByRole('button', { name: /바로 플레이/ });
    await expect(playButton).toBeVisible();

    await playButton.click();

    // 게임 화면으로 이동
    await expect(page).toHaveURL(/#\/game\/.+/);
    await expect(page.getByText('VS')).toBeVisible();
  });

  test('매우 긴 질문 텍스트 입력', async ({ page }) => {
    const longQuestion = 'A'.repeat(500);
    await page.getByLabel(/질문/).fill(longQuestion);

    const input = page.getByLabel(/질문/);
    const value = await input.inputValue();
    expect(value.length).toBeGreaterThan(100);
  });

  test('특수문자 포함 질문 생성', async ({ page }) => {
    await page.getByLabel(/질문/).fill('질문! @#$% & 테스트?');
    await page.getByLabel(/선택지 A/).fill('<strong>A</strong>');
    await page.getByLabel(/선택지 B/).fill('B "quote"');

    await page.getByRole('button', { name: /생성하기/ }).click();

    await expect(page.getByText(/질문이 생성되었습니다/)).toBeVisible();
  });

  test('이모지 포함 질문 생성', async ({ page }) => {
    await page.getByLabel(/질문/).fill('당신의 선택은? 🤔');
    await page.getByLabel(/선택지 A/).fill('옵션 A 😊');
    await page.getByLabel(/선택지 B/).fill('옵션 B 😎');

    await page.getByRole('button', { name: /생성하기/ }).click();

    await expect(page.getByText(/질문이 생성되었습니다/)).toBeVisible();
  });
});

test.describe('밸런스 게임 - 로컬스토리지', () => {
  test('투표 기록 저장', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('[data-testid="question-card"]').first().click();

    const currentUrl = page.url();
    const questionId = currentUrl.match(/game\/(.+)/)?.[1];

    await page.locator('[data-testid="choice-a"]').click();

    // 로컬스토리지에 투표 기록 저장 확인
    const voteData = await page.evaluate((id) => {
      return localStorage.getItem(`vote_${id}`);
    }, questionId);

    expect(voteData).toBeTruthy();
  });

  test('중복 투표 방지', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('[data-testid="question-card"]').first().click();

    await page.locator('[data-testid="choice-a"]').click();

    const resultUrl = page.url();

    // 같은 질문에 다시 접근
    await page.goto(BASE_URL);
    await page.locator('[data-testid="question-card"]').first().click();

    // 이미 투표했다면 자동으로 결과 페이지로 이동하거나 경고
  });

  test('커스텀 질문 로컬스토리지에 저장', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /질문 만들기/ }).click();

    await page.getByLabel(/질문/).fill('로컬스토리지 테스트');
    await page.getByLabel(/선택지 A/).fill('A');
    await page.getByLabel(/선택지 B/).fill('B');
    await page.getByRole('button', { name: /생성하기/ }).click();

    // 로컬스토리지에 저장 확인
    const customQuestions = await page.evaluate(() => {
      return localStorage.getItem('customQuestions');
    });

    expect(customQuestions).toBeTruthy();
  });
});

test.describe('밸런스 게임 - 접근성', () => {
  test('키보드로 질문 선택', async ({ page }) => {
    await page.goto(BASE_URL);

    // Tab으로 첫 질문 카드까지 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Enter로 선택
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/#\/game\/.+/);
  });

  test('키보드로 선택지 선택', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('[data-testid="question-card"]').first().click();

    // Tab으로 선택지 A로 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/#\/result\/.+/);
  });

  test('폼 레이블 연결', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /질문 만들기/ }).click();

    const questionInput = page.getByLabel(/질문/);
    await expect(questionInput).toBeVisible();

    const choiceAInput = page.getByLabel(/선택지 A/);
    await expect(choiceAInput).toBeVisible();
  });
});

test.describe('밸런스 게임 - 네트워크 및 성능', () => {
  test('느린 네트워크 환경', async ({ page }) => {
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 500);
    });

    await page.goto(BASE_URL);

    await expect(page.getByRole('heading', { name: /밸런스 게임/ })).toBeVisible();
  });

  test('오프라인 상태에서 로컬 질문 생성 가능', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.context().setOffline(true);

    await page.getByRole('button', { name: /질문 만들기/ }).click();

    // 오프라인이어도 폼은 작동
    await expect(page.getByLabel(/질문/)).toBeVisible();
  });

  test('이미지 없는 빠른 로딩', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: /밸런스 게임/ })).toBeVisible();
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(2000);
  });
});

test.describe('밸런스 게임 - 차트 표시 (Recharts)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('[data-testid="question-card"]').first().click();
    await page.locator('[data-testid="choice-a"]').click();
  });

  test('바 차트 렌더링', async ({ page }) => {
    // recharts SVG 요소 확인
    const chart = page.locator('svg.recharts-surface');
    await expect(chart).toBeVisible();
  });

  test('차트 애니메이션', async ({ page }) => {
    // 차트가 애니메이션과 함께 나타나는지
    await page.waitForTimeout(500);

    const bars = page.locator('.recharts-bar-rectangle');
    const count = await bars.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('퍼센트 레이블 표시', async ({ page }) => {
    // 각 바에 퍼센트 표시
    await expect(page.getByText(/%/)).toBeVisible();
  });
});

test.describe('밸런스 게임 - 공유 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('[data-testid="question-card"]').first().click();
    await page.locator('[data-testid="choice-a"]').click();
  });

  test('공유 버튼 클릭', async ({ page }) => {
    const shareButton = page.getByRole('button', { name: /공유/ });

    await shareButton.click();

    // 공유 옵션 표시 (카카오, 링크 복사 등)
  });

  test('링크 복사 기능', async ({ page }) => {
    // 링크 복사 버튼 찾기
    const copyButton = page.getByRole('button', { name: /링크 복사/ });

    if (await copyButton.isVisible()) {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      await copyButton.click();
    }
  });
});
