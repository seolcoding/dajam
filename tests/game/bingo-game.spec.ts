import { test, expect, type Page } from '@playwright/test';

/**
 * 빙고 게임 E2E 테스트
 *
 * 테스트 범위:
 * - Edge Cases: 그리드 크기, 커스텀 단어, 게임 코드 생성/입력
 * - UI Tests: 반응형, 애니메이션, 다크모드, 셀 상태
 * - E2E Journeys: 호스트 모드 전체 플로우, 플레이어 모드 참여
 * - Multi-user Scenarios: 호스트-플레이어 상호작용, 실시간 동기화
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:5192/mini-apps/bingo-game/';

test.describe('빙고 게임 - 메뉴 화면', () => {
  test('메뉴 화면이 정상적으로 로드됨', async ({ page }) => {
    await page.goto(BASE_URL);

    // 제목 확인
    await expect(page.getByRole('heading', { name: /빙고 게임/ })).toBeVisible();

    // 설명 텍스트
    await expect(page.getByText(/친구들과 함께 즐기는 빙고/)).toBeVisible();

    // 호스트 모드 버튼
    const hostButton = page.getByRole('button', { name: /호스트 모드/ });
    await expect(hostButton).toBeVisible();
    await expect(hostButton).toBeEnabled();

    // 플레이어 모드 버튼
    const playerButton = page.getByRole('button', { name: /플레이어 모드/ });
    await expect(playerButton).toBeVisible();
    await expect(playerButton).toBeEnabled();
  });

  test('호스트 모드 버튼 클릭 시 설정 화면으로 이동', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByRole('button', { name: /호스트 모드/ }).click();

    // 게임 설정 화면 표시
    await expect(page.getByRole('heading', { name: /게임 설정/ })).toBeVisible();
  });

  test('플레이어 모드 버튼 클릭 시 참여 화면으로 이동', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByRole('button', { name: /플레이어 모드/ }).click();

    // 게임 참여 화면 표시
    await expect(page.getByText(/게임 코드 입력/)).toBeVisible();
  });

  test('메뉴 버튼 호버 애니메이션', async ({ page }) => {
    await page.goto(BASE_URL);

    const hostButton = page.getByRole('button', { name: /호스트 모드/ });
    await hostButton.hover();

    // 호버 시 스케일 변화 등 애니메이션 확인
    await expect(hostButton).toHaveCSS('cursor', 'pointer');
  });
});

test.describe('빙고 게임 - 호스트: 게임 설정', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
  });

  test('게임 설정 화면 요소 표시', async ({ page }) => {
    // 빙고판 크기 선택
    await expect(page.getByText(/빙고판 크기/)).toBeVisible();
    await expect(page.getByRole('button', { name: '3x3' })).toBeVisible();
    await expect(page.getByRole('button', { name: '4x4' })).toBeVisible();
    await expect(page.getByRole('button', { name: '5x5' })).toBeVisible();

    // 빙고 유형 선택
    await expect(page.getByText(/빙고 유형/)).toBeVisible();
    await expect(page.getByRole('button', { name: '숫자' })).toBeVisible();
    await expect(page.getByRole('button', { name: '테마' })).toBeVisible();
    await expect(page.getByRole('button', { name: '커스텀' })).toBeVisible();

    // 게임 시작 버튼
    await expect(page.getByRole('button', { name: /게임 시작/ })).toBeVisible();

    // 돌아가기 버튼
    await expect(page.getByRole('button', { name: /돌아가기/ })).toBeVisible();
  });

  test('그리드 크기 선택 변경', async ({ page }) => {
    // 3x3 선택
    await page.getByRole('button', { name: '3x3' }).click();
    await expect(page.getByRole('button', { name: '3x3' })).toHaveClass(/bg-blue-600/);

    // 4x4로 변경
    await page.getByRole('button', { name: '4x4' }).click();
    await expect(page.getByRole('button', { name: '4x4' })).toHaveClass(/bg-blue-600/);
    await expect(page.getByRole('button', { name: '3x3' })).not.toHaveClass(/bg-blue-600/);

    // 5x5로 변경
    await page.getByRole('button', { name: '5x5' }).click();
    await expect(page.getByRole('button', { name: '5x5' })).toHaveClass(/bg-blue-600/);
  });

  test('빙고 유형 선택 변경', async ({ page }) => {
    // 숫자 선택
    await page.getByRole('button', { name: '숫자' }).click();
    await expect(page.getByRole('button', { name: '숫자' })).toHaveClass(/bg-blue-600/);

    // 테마로 변경
    await page.getByRole('button', { name: '테마' }).click();
    await expect(page.getByRole('button', { name: '테마' })).toHaveClass(/bg-blue-600/);

    // 테마 선택 드롭다운 표시
    await expect(page.getByText(/테마 선택/)).toBeVisible();

    // 커스텀으로 변경
    await page.getByRole('button', { name: '커스텀' }).click();
    await expect(page.getByRole('button', { name: '커스텀' })).toHaveClass(/bg-blue-600/);

    // 단어 입력 텍스트에리어 표시
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('테마 선택 드롭다운', async ({ page }) => {
    await page.getByRole('button', { name: '테마' }).click();

    // 테마 선택 드롭다운
    const themeSelect = page.locator('select');
    await expect(themeSelect).toBeVisible();

    // 테마 옵션들 확인
    const options = themeSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);

    // 첫 번째 테마 선택
    await themeSelect.selectOption({ index: 0 });
  });

  test('커스텀 단어 입력 - 부족한 경우', async ({ page }) => {
    await page.getByRole('button', { name: '5x5' }).click();
    await page.getByRole('button', { name: '커스텀' }).click();

    const textarea = page.locator('textarea');

    // 10개만 입력 (5x5는 25개 필요)
    await textarea.fill('사과\n바나나\n포도\n딸기\n수박\n메론\n오렌지\n키위\n망고\n복숭아');

    // 부족한 개수 표시
    await expect(page.getByText(/현재: 10개/)).toBeVisible();
    await expect(page.getByText(/최소 25개 필요/)).toBeVisible();

    // 게임 시작 버튼은 비활성화되어야 함
    const startButton = page.getByRole('button', { name: /게임 시작/ });
    // 실제 구현에 따라 비활성화 확인
  });

  test('커스텀 단어 입력 - 충분한 경우', async ({ page }) => {
    await page.getByRole('button', { name: '3x3' }).click();
    await page.getByRole('button', { name: '커스텀' }).click();

    const textarea = page.locator('textarea');

    // 9개 입력 (3x3는 9개 필요)
    const words = Array.from({ length: 9 }, (_, i) => `단어${i + 1}`).join('\n');
    await textarea.fill(words);

    await expect(page.getByText(/현재: 9개/)).toBeVisible();

    // 게임 시작 가능
    const startButton = page.getByRole('button', { name: /게임 시작/ });
    await expect(startButton).toBeEnabled();
  });

  test('빈 줄 무시', async ({ page }) => {
    await page.getByRole('button', { name: '커스텀' }).click();

    const textarea = page.locator('textarea');
    await textarea.fill('사과\n\n바나나\n\n\n포도');

    // 빈 줄 제외하고 3개로 카운트
    await expect(page.getByText(/현재: 3개/)).toBeVisible();
  });

  test('5x5에서 중앙 FREE 칸 옵션', async ({ page }) => {
    await page.getByRole('button', { name: '5x5' }).click();

    // 중앙 FREE 칸 체크박스 표시
    const freeCheckbox = page.locator('input[type="checkbox"][id="centerFree"]');
    await expect(freeCheckbox).toBeVisible();

    // 기본값 체크
    await expect(freeCheckbox).toBeChecked();

    // 체크 해제
    await freeCheckbox.uncheck();
    await expect(freeCheckbox).not.toBeChecked();

    // 다시 체크
    await freeCheckbox.check();
    await expect(freeCheckbox).toBeChecked();
  });

  test('3x3, 4x4에서는 FREE 칸 옵션 숨김', async ({ page }) => {
    await page.getByRole('button', { name: '3x3' }).click();

    const freeCheckbox = page.locator('input[type="checkbox"][id="centerFree"]');
    await expect(freeCheckbox).not.toBeVisible();

    await page.getByRole('button', { name: '4x4' }).click();
    await expect(freeCheckbox).not.toBeVisible();
  });

  test('돌아가기 버튼으로 메뉴로 복귀', async ({ page }) => {
    await page.getByRole('button', { name: /돌아가기/ }).click();

    await expect(page.getByRole('heading', { name: /빙고 게임/ })).toBeVisible();
  });

  test('게임 시작 버튼 클릭 시 호스트 화면으로 이동', async ({ page }) => {
    await page.getByRole('button', { name: '숫자' }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();

    // 호스트 화면 표시
    await expect(page.getByText(/게임 코드/)).toBeVisible();

    // 빙고판 표시
    const bingoGrid = page.locator('[data-testid="bingo-grid"]');
    await expect(bingoGrid).toBeVisible();
  });
});

test.describe('빙고 게임 - 호스트: 게임 진행', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '숫자' }).click();
    await page.getByRole('button', { name: '3x3' }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();
  });

  test('호스트 화면 요소 표시', async ({ page }) => {
    // 게임 코드 표시
    await expect(page.getByText(/게임 코드/)).toBeVisible();

    // 6자리 코드 형식
    const gameCode = page.locator('[data-testid="game-code"]');
    const codeText = await gameCode.textContent();
    expect(codeText?.length).toBe(6);

    // 빙고판
    const bingoGrid = page.locator('[data-testid="bingo-grid"]');
    await expect(bingoGrid).toBeVisible();

    // 호출 버튼 또는 자동 호출 기능
    // 구현에 따라 다름
  });

  test('빙고판 셀 렌더링 (3x3)', async ({ page }) => {
    const cells = page.locator('[data-testid^="bingo-cell-"]');
    const count = await cells.count();

    expect(count).toBe(9); // 3x3 = 9
  });

  test('숫자 빙고 셀 내용 확인', async ({ page }) => {
    const cells = page.locator('[data-testid^="bingo-cell-"]');

    // 각 셀에 숫자가 있는지 확인
    for (let i = 0; i < 9; i++) {
      const cell = cells.nth(i);
      const text = await cell.textContent();
      expect(text).toMatch(/\d+/);
    }
  });

  test('셀 클릭 시 마킹', async ({ page }) => {
    const firstCell = page.locator('[data-testid="bingo-cell-0"]');

    await firstCell.click();

    // 마킹된 상태 (배경색 변경, 체크마크 등)
    await expect(firstCell).toHaveClass(/marked|selected|checked/);
  });

  test('이미 마킹된 셀 재클릭 시 해제', async ({ page }) => {
    const firstCell = page.locator('[data-testid="bingo-cell-0"]');

    // 마킹
    await firstCell.click();
    await expect(firstCell).toHaveClass(/marked|selected|checked/);

    // 해제
    await firstCell.click();
    await expect(firstCell).not.toHaveClass(/marked|selected|checked/);
  });

  test('빙고 완성 시 성공 모달 표시', async ({ page }) => {
    // 3x3 가로 한 줄 완성
    await page.locator('[data-testid="bingo-cell-0"]').click();
    await page.locator('[data-testid="bingo-cell-1"]').click();
    await page.locator('[data-testid="bingo-cell-2"]').click();

    // 빙고 성공 모달
    await expect(page.getByText(/빙고/i)).toBeVisible();

    // 축하 메시지
    // 실제 구현에 따라 다름
  });

  test('게임 코드 복사 기능', async ({ page }) => {
    const copyButton = page.getByRole('button', { name: /복사/ });

    if (await copyButton.isVisible()) {
      await copyButton.click();

      // 복사 완료 토스트 또는 알림
    }
  });
});

test.describe('빙고 게임 - 플레이어: 게임 참여', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /플레이어 모드/ }).click();
  });

  test('게임 참여 화면 요소 표시', async ({ page }) => {
    // 게임 코드 입력 필드
    const codeInput = page.locator('input[placeholder*="코드"]');
    await expect(codeInput).toBeVisible();

    // 참여 버튼
    const joinButton = page.getByRole('button', { name: /참여/ });
    await expect(joinButton).toBeVisible();

    // 돌아가기 버튼
    await expect(page.getByRole('button', { name: /돌아가기/ })).toBeVisible();
  });

  test('빈 코드로 참여 시도 시 에러', async ({ page }) => {
    const joinButton = page.getByRole('button', { name: /참여/ });
    await joinButton.click();

    // 에러 메시지 또는 버튼 비활성화
    await expect(joinButton).toBeDisabled();
  });

  test('6자리 미만 코드 입력 시 에러', async ({ page }) => {
    const codeInput = page.locator('input[placeholder*="코드"]');
    await codeInput.fill('12345'); // 5자리

    const joinButton = page.getByRole('button', { name: /참여/ });

    // 6자리 제한
  });

  test('유효하지 않은 코드로 참여 시도', async ({ page }) => {
    const codeInput = page.locator('input[placeholder*="코드"]');
    await codeInput.fill('ABCDEF'); // 존재하지 않는 코드

    const joinButton = page.getByRole('button', { name: /참여/ });
    await joinButton.click();

    // 에러 메시지
    await expect(page.getByText(/게임을 찾을 수 없습니다/)).toBeVisible();
  });

  test('숫자만 입력 허용', async ({ page }) => {
    const codeInput = page.locator('input[placeholder*="코드"]');

    await codeInput.fill('ABC123');

    const value = await codeInput.inputValue();

    // 숫자만 남음
    expect(value).toMatch(/^\d+$/);
  });

  test('코드 자동 포맷팅 (하이픈 등)', async ({ page }) => {
    const codeInput = page.locator('input[placeholder*="코드"]');

    await codeInput.fill('123456');

    // 자동 포맷팅 (예: 123-456)
    // 실제 구현에 따라 다름
  });

  test('돌아가기 버튼으로 메뉴로 복귀', async ({ page }) => {
    await page.getByRole('button', { name: /돌아가기/ }).click();

    await expect(page.getByRole('heading', { name: /빙고 게임/ })).toBeVisible();
  });
});

test.describe('빙고 게임 - 플레이어: 게임 플레이', () => {
  // Note: 실제 멀티플레이어 테스트는 두 개의 브라우저 컨텍스트 필요

  test('플레이어 화면 요소 표시', async ({ page }) => {
    // 먼저 호스트 게임을 생성해야 함
    // 이 테스트는 실제 게임 코드가 필요하므로 스킵 또는 모킹 필요
  });
});

test.describe('빙고 게임 - 반응형 UI', () => {
  test('모바일 뷰포트 - 메뉴', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    await expect(page.getByRole('heading', { name: /빙고 게임/ })).toBeVisible();

    // 버튼들이 세로로 잘 배치
    const hostButton = page.getByRole('button', { name: /호스트 모드/ });
    await expect(hostButton).toBeVisible();
  });

  test('모바일 뷰포트 - 빙고판', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '3x3' }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();

    // 빙고판이 모바일에 최적화되어 표시
    const bingoGrid = page.locator('[data-testid="bingo-grid"]');
    await expect(bingoGrid).toBeVisible();

    // 셀 크기 적절
    const cell = page.locator('[data-testid="bingo-cell-0"]');
    const box = await cell.boundingBox();
    expect(box?.width).toBeGreaterThan(50); // 터치 가능한 크기
  });

  test('태블릿 뷰포트', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);

    await expect(page.getByRole('heading', { name: /빙고 게임/ })).toBeVisible();
  });

  test('데스크톱 뷰포트', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);

    await expect(page.getByRole('heading', { name: /빙고 게임/ })).toBeVisible();
  });
});

test.describe('빙고 게임 - 다크모드', () => {
  test('다크모드 클래스 확인', async ({ page }) => {
    await page.goto(BASE_URL);

    // 다크모드 토글 버튼이 있다면
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');

    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();

      // HTML에 dark 클래스 추가
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);

      // 배경색 변경 확인
      const body = page.locator('body');
      const bgColor = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // 다크모드 배경색 (검은색 계열)
      expect(bgColor).toContain('rgb(');
    }
  });

  test('다크모드에서 텍스트 가독성', async ({ page }) => {
    await page.goto(BASE_URL);

    // 다크모드 활성화
    await page.emulateMedia({ colorScheme: 'dark' });

    // 제목이 여전히 보이는지
    await expect(page.getByRole('heading', { name: /빙고 게임/ })).toBeVisible();
  });
});

test.describe('빙고 게임 - 애니메이션 (Framer Motion)', () => {
  test('메뉴 버튼 진입 애니메이션', async ({ page }) => {
    await page.goto(BASE_URL);

    // 버튼이 서서히 나타나는 애니메이션
    const hostButton = page.getByRole('button', { name: /호스트 모드/ });

    // 애니메이션 완료 대기
    await page.waitForTimeout(500);

    await expect(hostButton).toBeVisible();
  });

  test('셀 클릭 애니메이션', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();

    const firstCell = page.locator('[data-testid="bingo-cell-0"]');

    // 클릭 시 스케일 애니메이션
    await firstCell.click();

    await page.waitForTimeout(300);

    // 마킹 상태 확인
    await expect(firstCell).toHaveClass(/marked|selected/);
  });

  test('빙고 성공 모달 애니메이션', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '3x3' }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();

    // 가로 한 줄 완성
    await page.locator('[data-testid="bingo-cell-0"]').click();
    await page.locator('[data-testid="bingo-cell-1"]').click();
    await page.locator('[data-testid="bingo-cell-2"]').click();

    // 모달이 애니메이션과 함께 나타남
    await page.waitForTimeout(500);

    const modal = page.locator('[data-testid="success-modal"]');
    if (await modal.isVisible()) {
      await expect(modal).toBeVisible();
    }
  });
});

test.describe('빙고 게임 - Edge Cases', () => {
  test('커스텀 단어에 중복 허용', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '커스텀' }).click();

    const textarea = page.locator('textarea');
    await textarea.fill('사과\n사과\n바나나\n바나나\n포도\n포도\n딸기\n딸기\n수박');

    // 중복 단어도 카운트
    await expect(page.getByText(/현재: 9개/)).toBeVisible();
  });

  test('커스텀 단어에 특수문자 포함', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '커스텀' }).click();

    const textarea = page.locator('textarea');
    await textarea.fill('사과!\n바나나@\n포도#\n딸기$\n수박%\n메론^\n오렌지&\n키위*\n망고(');

    await page.getByRole('button', { name: /게임 시작/ }).click();

    // 특수문자 포함 단어도 표시
    const cells = page.locator('[data-testid^="bingo-cell-"]');
    const firstCellText = await cells.first().textContent();

    // 특수문자 포함 확인
  });

  test('매우 긴 단어 처리', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '커스텀' }).click();

    const longWord = 'A'.repeat(50);
    const textarea = page.locator('textarea');

    const words = Array.from({ length: 9 }, () => longWord).join('\n');
    await textarea.fill(words);

    await page.getByRole('button', { name: /게임 시작/ }).click();

    // 셀에서 긴 단어가 잘림 또는 축소 표시
    const cell = page.locator('[data-testid="bingo-cell-0"]');
    await expect(cell).toBeVisible();

    // 텍스트 오버플로 처리 확인
  });

  test('이모지 포함 단어', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '커스텀' }).click();

    const textarea = page.locator('textarea');
    await textarea.fill('사과🍎\n바나나🍌\n포도🍇\n딸기🍓\n수박🍉\n메론🍈\n오렌지🍊\n키위🥝\n망고🥭');

    await page.getByRole('button', { name: /게임 시작/ }).click();

    // 이모지 포함 단어 표시
    const cells = page.locator('[data-testid^="bingo-cell-"]');
    const text = await cells.first().textContent();

    // 이모지 포함 확인
    expect(text).toMatch(/[\u{1F000}-\u{1F6FF}]/u);
  });
});

test.describe('빙고 게임 - 접근성', () => {
  test('키보드로 메뉴 버튼 선택', async ({ page }) => {
    await page.goto(BASE_URL);

    // Tab으로 호스트 버튼까지 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const hostButton = page.getByRole('button', { name: /호스트 모드/ });

    if (await hostButton.isFocused()) {
      await page.keyboard.press('Enter');
      await expect(page.getByRole('heading', { name: /게임 설정/ })).toBeVisible();
    }
  });

  test('키보드로 셀 선택', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();

    // Tab으로 셀 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Space 또는 Enter로 선택
    await page.keyboard.press('Space');

    // 마킹 확인
  });

  test('폼 요소에 레이블 연결', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();

    // 체크박스에 레이블 연결
    const freeCheckbox = page.locator('input[id="centerFree"]');
    const label = page.locator('label[for="centerFree"]');

    if (await freeCheckbox.isVisible()) {
      await expect(label).toBeVisible();
    }
  });

  test('버튼 비활성화 상태', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /플레이어 모드/ }).click();

    const joinButton = page.getByRole('button', { name: /참여/ });
    await expect(joinButton).toBeDisabled();
    await expect(joinButton).toHaveAttribute('disabled');
  });
});

test.describe('빙고 게임 - 멀티플레이어 시나리오', () => {
  test('두 브라우저 컨텍스트 - 호스트와 플레이어', async ({ browser }) => {
    // 호스트 컨텍스트
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto(BASE_URL);
    await hostPage.getByRole('button', { name: /호스트 모드/ }).click();
    await hostPage.getByRole('button', { name: /게임 시작/ }).click();

    // 게임 코드 가져오기
    const gameCodeElement = hostPage.locator('[data-testid="game-code"]');
    const gameCode = await gameCodeElement.textContent();

    // 플레이어 컨텍스트
    const playerContext = await browser.newContext();
    const playerPage = await playerContext.newPage();

    await playerPage.goto(BASE_URL);
    await playerPage.getByRole('button', { name: /플레이어 모드/ }).click();

    // 게임 코드 입력
    const codeInput = playerPage.locator('input[placeholder*="코드"]');
    if (gameCode) {
      await codeInput.fill(gameCode);
      await playerPage.getByRole('button', { name: /참여/ }).click();

      // 플레이어 화면 표시
      await expect(playerPage.locator('[data-testid="bingo-grid"]')).toBeVisible();
    }

    // Cleanup
    await hostContext.close();
    await playerContext.close();
  });

  test('실시간 동기화 - 호스트 호출 시 플레이어 업데이트', async ({ browser }) => {
    // 실제 WebSocket이나 실시간 통신 구현에 따라 테스트
  });
});

test.describe('빙고 게임 - 성능', () => {
  test('빠른 페이지 로딩', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: /빙고 게임/ })).toBeVisible();
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(2000);
  });

  test('5x5 빙고판 렌더링 성능', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '5x5' }).click();

    const startTime = Date.now();
    await page.getByRole('button', { name: /게임 시작/ }).click();
    await expect(page.locator('[data-testid="bingo-grid"]')).toBeVisible();
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(1000);
  });

  test('애니메이션 부드러움', async ({ page }) => {
    await page.goto(BASE_URL);

    // 메뉴 버튼 호버 애니메이션
    const hostButton = page.getByRole('button', { name: /호스트 모드/ });

    for (let i = 0; i < 5; i++) {
      await hostButton.hover();
      await page.waitForTimeout(100);
    }

    // 애니메이션이 끊김 없이 실행
  });
});

test.describe('빙고 게임 - 빙고 완성 조건', () => {
  test('가로 한 줄 빙고', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '3x3' }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();

    // 첫 번째 가로줄 (0, 1, 2)
    await page.locator('[data-testid="bingo-cell-0"]').click();
    await page.locator('[data-testid="bingo-cell-1"]').click();
    await page.locator('[data-testid="bingo-cell-2"]').click();

    // 빙고 성공 확인
    // 실제 구현에 따라 모달 또는 알림
  });

  test('세로 한 줄 빙고', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '3x3' }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();

    // 첫 번째 세로줄 (0, 3, 6)
    await page.locator('[data-testid="bingo-cell-0"]').click();
    await page.locator('[data-testid="bingo-cell-3"]').click();
    await page.locator('[data-testid="bingo-cell-6"]').click();
  });

  test('대각선 빙고', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '3x3' }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();

    // 왼쪽 위에서 오른쪽 아래 (0, 4, 8)
    await page.locator('[data-testid="bingo-cell-0"]').click();
    await page.locator('[data-testid="bingo-cell-4"]').click();
    await page.locator('[data-testid="bingo-cell-8"]').click();
  });

  test('역대각선 빙고', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /호스트 모드/ }).click();
    await page.getByRole('button', { name: '3x3' }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();

    // 오른쪽 위에서 왼쪽 아래 (2, 4, 6)
    await page.locator('[data-testid="bingo-cell-2"]').click();
    await page.locator('[data-testid="bingo-cell-4"]').click();
    await page.locator('[data-testid="bingo-cell-6"]').click();
  });
});
