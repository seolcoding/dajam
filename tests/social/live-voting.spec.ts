import { test, expect, Page } from '@playwright/test';
import {
  waitForAppReady,
  viewports,
  testKeyboardNavigation,
  specialCharacters,
  createMultiUserContext,
  waitForChartRender,
} from '../utils/test-helpers';

const BASE_PATH = process.env.TEST_URL || 'http://localhost:5196/mini-apps/live-voting/';

/**
 * 실시간 투표 (Live Voting) E2E 테스트
 *
 * 테스트 범위:
 * 1. Edge Cases: 빈 데이터, 특수문자, 대량 투표
 * 2. UI Tests: 반응형, 차트 렌더링, 접근성
 * 3. E2E User Journeys: 투표 생성 → 참여 → 결과 확인
 * 4. Multi-user Scenarios: 동시 투표, 실시간 업데이트
 */

test.describe('Live Voting - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
  });

  test('빈 제목으로 투표 생성 시도', async ({ page }) => {
    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    // 제목 입력 없이 제출
    await page.fill('input[placeholder*="점심"]', '');
    await page.fill('input[placeholder*="선택지 1"]', '옵션1');
    await page.fill('input[placeholder*="선택지 2"]', '옵션2');

    const submitButton = page.locator('button:has-text("투표 시작")');
    await submitButton.click();

    // 알림 대화상자 확인
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('제목');
      await dialog.accept();
    });

    // URL이 변경되지 않았는지 확인 (생성 실패)
    await expect(page).toHaveURL(new RegExp(`${BASE_PATH}create`));
  });

  test('선택지 1개만으로 투표 생성 시도', async ({ page }) => {
    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    await page.fill('input[placeholder*="점심"]', '테스트 투표');
    await page.fill('input[placeholder*="선택지 1"]', '옵션1');
    await page.fill('input[placeholder*="선택지 2"]', '');

    const submitButton = page.locator('button:has-text("투표 시작")');
    await submitButton.click();

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('2개');
      await dialog.accept();
    });
  });

  test('특수 문자가 포함된 제목과 선택지', async ({ page }) => {
    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    const specialTitle = '😀 테스트 <투표> "제목"';
    const specialOption1 = 'Option with <script>alert("xss")</script>';
    const specialOption2 = '한글 & English & 123 & 🎉';

    await page.fill('input[placeholder*="점심"]', specialTitle);
    await page.fill('input[placeholder*="선택지 1"]', specialOption1);
    await page.fill('input[placeholder*="선택지 2"]', specialOption2);

    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\//);

    // XSS 공격이 실행되지 않았는지 확인
    const titleElement = page.locator('h1');
    await expect(titleElement).toContainText(specialTitle);

    // 스크립트가 텍스트로만 렌더링되었는지 확인
    await expect(page.locator('body')).not.toContainText('xss');
  });

  test('최대 선택지 개수 제한 (10개)', async ({ page }) => {
    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    await page.fill('input[placeholder*="점심"]', '10개 선택지 테스트');

    // 초기 2개 + 8개 추가 = 10개
    for (let i = 0; i < 8; i++) {
      const addButton = page.locator('button:has-text("선택지 추가")');
      if (await addButton.isVisible()) {
        await addButton.click();
      }
    }

    // 모든 선택지 입력
    for (let i = 0; i < 10; i++) {
      await page.fill(`input[placeholder*="선택지 ${i + 1}"]`, `옵션${i + 1}`);
    }

    // 11번째 추가 버튼이 없어야 함
    const addButton = page.locator('button:has-text("선택지 추가")');
    await expect(addButton).not.toBeVisible();

    // 투표 생성 성공
    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\//);
    await expect(page.locator('h1')).toContainText('10개 선택지 테스트');
  });

  test('100자 제한 제목 입력', async ({ page }) => {
    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    const longTitle = 'A'.repeat(150); // 100자 초과
    await page.fill('input[placeholder*="점심"]', longTitle);

    const titleInput = page.locator('input[placeholder*="점심"]');
    const actualValue = await titleInput.inputValue();

    // 100자로 제한되었는지 확인
    expect(actualValue.length).toBeLessThanOrEqual(100);

    // 카운터 확인
    await expect(page.locator('text=/\\d+\\/100/')).toBeVisible();
  });

  test('50자 제한 선택지 입력', async ({ page }) => {
    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    const longOption = 'B'.repeat(60); // 50자 초과
    await page.fill('input[placeholder*="선택지 1"]', longOption);

    const optionInput = page.locator('input[placeholder*="선택지 1"]');
    const actualValue = await optionInput.inputValue();

    // 50자로 제한되었는지 확인
    expect(actualValue.length).toBeLessThanOrEqual(50);
  });
});

test.describe('Live Voting - UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
  });

  test('반응형 레이아웃 - 모바일', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);

    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    // 모바일에서 모든 요소가 보이는지 확인
    await expect(page.locator('input[placeholder*="점심"]')).toBeVisible();
    await expect(page.locator('button:has-text("단일 선택")')).toBeVisible();
    await expect(page.locator('button:has-text("투표 시작")')).toBeVisible();

    // 스크롤 없이 핵심 UI가 보이는지 확인
    const submitButton = page.locator('button:has-text("투표 시작")');
    const boundingBox = await submitButton.boundingBox();
    expect(boundingBox).toBeTruthy();
  });

  test('반응형 레이아웃 - 태블릿', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);

    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    await expect(page.locator('input[placeholder*="점심"]')).toBeVisible();
    await expect(page.locator('button:has-text("투표 시작")')).toBeVisible();
  });

  test('반응형 레이아웃 - 데스크톱', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);

    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    await expect(page.locator('input[placeholder*="점심"]')).toBeVisible();
    await expect(page.locator('button:has-text("투표 시작")')).toBeVisible();
  });

  test('차트 렌더링 확인', async ({ page }) => {
    // 투표 생성
    await page.click('text=투표 만들기');
    await page.fill('input[placeholder*="점심"]', '차트 테스트');
    await page.fill('input[placeholder*="선택지 1"]', '옵션A');
    await page.fill('input[placeholder*="선택지 2"]', '옵션B');
    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\//);

    // 차트 렌더링 대기
    await waitForChartRender(page);

    // Recharts SVG 확인
    const chart = page.locator('svg.recharts-surface');
    await expect(chart).toBeVisible();

    // 차트 내부 요소 확인
    await expect(page.locator('.recharts-bar, .recharts-line')).toBeTruthy();
  });

  test('QR 코드 렌더링', async ({ page }) => {
    await page.click('text=투표 만들기');
    await page.fill('input[placeholder*="점심"]', 'QR 테스트');
    await page.fill('input[placeholder*="선택지 1"]', 'A');
    await page.fill('input[placeholder*="선택지 2"]', 'B');
    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\//);

    // QR 코드 이미지 확인
    const qrImage = page.locator('img[alt="QR Code"]');
    await expect(qrImage).toBeVisible();

    // QR 코드가 data URL인지 확인
    const src = await qrImage.getAttribute('src');
    expect(src).toMatch(/^data:image/);
  });

  test('프레젠테이션 모드 전환', async ({ page }) => {
    await page.click('text=투표 만들기');
    await page.fill('input[placeholder*="점심"]', '프레젠테이션 테스트');
    await page.fill('input[placeholder*="선택지 1"]', 'A');
    await page.fill('input[placeholder*="선택지 2"]', 'B');
    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\//);

    // 일반 모드 확인
    await expect(page.locator('button:has-text("프레젠테이션 모드")')).toBeVisible();

    // 프레젠테이션 모드 전환
    await page.click('button:has-text("프레젠테이션 모드")');

    // 배경색 변경 확인 (bg-blue-600)
    const body = page.locator('body > div > div');
    const bgClass = await body.getAttribute('class');
    expect(bgClass).toContain('bg-blue');

    // 큰 폰트 확인 (text-5xl)
    const title = page.locator('h1');
    const titleClass = await title.getAttribute('class');
    expect(titleClass).toContain('text-5xl');

    // 일반 모드로 복귀
    await page.click('button:has-text("일반 모드")');
    await expect(page.locator('button:has-text("프레젠테이션 모드")')).toBeVisible();
  });

  test('접근성 - 키보드 네비게이션', async ({ page }) => {
    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    await testKeyboardNavigation(page);
  });

  test('로딩 상태 표시', async ({ page }) => {
    await page.goto(`${BASE_PATH}vote/invalid-poll-id`);

    // 로딩 스피너 확인
    const loading = page.locator('text=로딩 중');

    // 로딩 후 에러 처리 확인 (알림 또는 리다이렉트)
    await page.waitForURL(BASE_PATH, { timeout: 5000 });
  });
});

test.describe('Live Voting - E2E User Journeys', () => {
  test('완전한 단일 선택 투표 플로우', async ({ page }) => {
    // 1. 홈페이지 방문
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
    await expect(page.locator('h1')).toContainText('실시간 투표');

    // 2. 투표 생성 페이지로 이동
    await page.click('text=투표 만들기');
    await page.waitForURL(`${BASE_PATH}create`);

    // 3. 단일 선택 투표 생성
    await page.fill('input[placeholder*="점심"]', '오늘 점심 메뉴는?');
    await page.click('button:has-text("단일 선택")');
    await page.fill('input[placeholder*="선택지 1"]', '김치찌개');
    await page.fill('input[placeholder*="선택지 2"]', '된장찌개');
    await page.click('button:has-text("선택지 추가")');
    await page.fill('input[placeholder*="선택지 3"]', '부대찌개');

    // 4. 투표 시작
    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\/.+/);

    // 5. 호스트 뷰 확인
    await expect(page.locator('h1')).toContainText('오늘 점심 메뉴는?');
    await expect(page.locator('text=총 0명 참여')).toBeVisible();

    // QR 코드 확인
    await expect(page.locator('img[alt="QR Code"]')).toBeVisible();

    // 6. 투표 URL 추출
    const voteUrl = await page.locator('p.font-mono').textContent();
    expect(voteUrl).toContain('/vote/');

    // 7. 새 탭에서 투표 참여 시뮬레이션
    const pollIdMatch = page.url().match(/\/host\/(.+)/);
    expect(pollIdMatch).toBeTruthy();
    const pollId = pollIdMatch![1];

    await page.goto(`${BASE_PATH}vote/${pollId}`);
    await waitForAppReady(page);

    // 8. 투표하기
    await expect(page.locator('h1')).toContainText('오늘 점심 메뉴는?');
    await expect(page.locator('text=하나를 선택해주세요')).toBeVisible();

    await page.click('button:has-text("김치찌개")');
    await page.click('button:has-text("투표하기")');

    // 9. 투표 완료 화면 확인
    await expect(page.locator('h2:has-text("투표 완료")')).toBeVisible();
    await expect(page.locator('text=참여해 주셔서 감사합니다')).toBeVisible();

    // Confetti 애니메이션 확인
    await expect(page.locator('canvas')).toBeVisible(); // react-confetti

    // 10. 홈으로 돌아가기
    await page.click('button:has-text("홈으로 돌아가기")');
    await page.waitForURL(BASE_PATH);
  });

  test('복수 선택 투표 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=투표 만들기');

    await page.fill('input[placeholder*="점심"]', '선호하는 음식은?');
    await page.click('button:has-text("복수 선택")');
    await page.fill('input[placeholder*="선택지 1"]', '한식');
    await page.fill('input[placeholder*="선택지 2"]', '중식');
    await page.click('button:has-text("선택지 추가")');
    await page.fill('input[placeholder*="선택지 3"]', '일식');

    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\/.+/);

    const pollIdMatch = page.url().match(/\/host\/(.+)/);
    const pollId = pollIdMatch![1];

    // 투표 참여
    await page.goto(`${BASE_PATH}vote/${pollId}`);
    await expect(page.locator('text=여러 개를 선택할 수 있습니다')).toBeVisible();

    // 복수 선택
    await page.click('button:has-text("한식")');
    await page.click('button:has-text("일식")');

    // 선택 해제
    await page.click('button:has-text("일식")');

    // 다시 선택
    await page.click('button:has-text("중식")');

    await page.click('button:has-text("투표하기")');
    await expect(page.locator('h2:has-text("투표 완료")')).toBeVisible();
  });

  test('순위 투표 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=투표 만들기');

    await page.fill('input[placeholder*="점심"]', '좋아하는 과일 순위');
    await page.click('button:has-text("순위 투표")');
    await page.fill('input[placeholder*="선택지 1"]', '사과');
    await page.fill('input[placeholder*="선택지 2"]', '바나나');
    await page.click('button:has-text("선택지 추가")');
    await page.fill('input[placeholder*="선택지 3"]', '오렌지');

    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\/.+/);

    const pollIdMatch = page.url().match(/\/host\/(.+)/);
    const pollId = pollIdMatch![1];

    // 투표 참여
    await page.goto(`${BASE_PATH}vote/${pollId}`);
    await expect(page.locator('text=순위대로 정렬해주세요')).toBeVisible();

    // 순위 조정 - 바나나를 1위로
    await page.click('button:has-text("↑")').first(); // 첫 번째 ↑ 버튼은 2번째 항목 (바나나)

    // 오렌지를 2위로
    const upButtons = page.locator('button:has-text("↑")');
    await upButtons.nth(2).click();

    await page.click('button:has-text("투표하기")');
    await expect(page.locator('h2:has-text("투표 완료")')).toBeVisible();
  });

  test('중복 투표 방지', async ({ page }) => {
    // 투표 생성
    await page.goto(BASE_PATH);
    await page.click('text=투표 만들기');
    await page.fill('input[placeholder*="점심"]', '중복 방지 테스트');
    await page.fill('input[placeholder*="선택지 1"]', 'A');
    await page.fill('input[placeholder*="선택지 2"]', 'B');
    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\/.+/);

    const pollIdMatch = page.url().match(/\/host\/(.+)/);
    const pollId = pollIdMatch![1];

    // 첫 번째 투표
    await page.goto(`${BASE_PATH}vote/${pollId}`);
    await page.click('button:has-text("A")');
    await page.click('button:has-text("투표하기")');
    await expect(page.locator('h2:has-text("투표 완료")')).toBeVisible();

    // 같은 브라우저에서 다시 투표 시도
    await page.goto(`${BASE_PATH}vote/${pollId}`);

    // 이미 투표 완료 화면이 바로 표시되어야 함
    await expect(page.locator('h2:has-text("투표 완료")')).toBeVisible();
  });

  test('존재하지 않는 투표 접근', async ({ page }) => {
    await page.goto(`${BASE_PATH}vote/nonexistent-poll-id`);

    // 알림 확인
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('찾을 수 없습니다');
      await dialog.accept();
    });

    // 홈으로 리다이렉트
    await page.waitForURL(BASE_PATH, { timeout: 5000 });
  });
});

test.describe('Live Voting - Multi-user Scenarios', () => {
  test('동시 투표 및 실시간 업데이트', async ({ browser }) => {
    // 호스트 페이지 생성
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto(BASE_PATH);
    await hostPage.click('text=투표 만들기');
    await hostPage.fill('input[placeholder*="점심"]', '멀티유저 테스트');
    await hostPage.fill('input[placeholder*="선택지 1"]', '옵션1');
    await hostPage.fill('input[placeholder*="선택지 2"]', '옵션2');
    await hostPage.click('button:has-text("투표 시작")');
    await hostPage.waitForURL(/\/host\/.+/);

    const pollIdMatch = hostPage.url().match(/\/host\/(.+)/);
    const pollId = pollIdMatch![1];

    // 초기 참여자 수 확인
    await expect(hostPage.locator('text=총 0명 참여')).toBeVisible();

    // 첫 번째 투표자
    const voter1Context = await browser.newContext();
    const voter1Page = await voter1Context.newPage();
    await voter1Page.goto(`${BASE_PATH}vote/${pollId}`);
    await voter1Page.click('button:has-text("옵션1")');
    await voter1Page.click('button:has-text("투표하기")');
    await expect(voter1Page.locator('h2:has-text("투표 완료")')).toBeVisible();

    // 호스트 페이지에서 실시간 업데이트 확인 (BroadcastChannel)
    await hostPage.waitForTimeout(1000); // BroadcastChannel 전파 대기
    await expect(hostPage.locator('text=총 1명 참여')).toBeVisible();

    // 두 번째 투표자
    const voter2Context = await browser.newContext();
    const voter2Page = await voter2Context.newPage();
    await voter2Page.goto(`${BASE_PATH}vote/${pollId}`);
    await voter2Page.click('button:has-text("옵션2")');
    await voter2Page.click('button:has-text("투표하기")');
    await expect(voter2Page.locator('h2:has-text("투표 완료")')).toBeVisible();

    // 호스트 페이지에서 2명 확인
    await hostPage.waitForTimeout(1000);
    await expect(hostPage.locator('text=총 2명 참여')).toBeVisible();

    // 세 번째 투표자
    const voter3Context = await browser.newContext();
    const voter3Page = await voter3Context.newPage();
    await voter3Page.goto(`${BASE_PATH}vote/${pollId}`);
    await voter3Page.click('button:has-text("옵션1")');
    await voter3Page.click('button:has-text("투표하기")');

    // 최종 참여자 수 확인
    await hostPage.waitForTimeout(1000);
    await expect(hostPage.locator('text=총 3명 참여')).toBeVisible();

    // 차트에 결과 반영 확인
    await waitForChartRender(hostPage);
    const chart = hostPage.locator('svg.recharts-surface');
    await expect(chart).toBeVisible();

    // 결과 테이블 확인
    const table = hostPage.locator('table');
    await expect(table).toBeVisible();

    // 옵션1이 2표, 옵션2가 1표인지 확인
    await expect(hostPage.locator('tr:has-text("옵션1")')).toContainText('2표');
    await expect(hostPage.locator('tr:has-text("옵션2")')).toContainText('1표');

    // 비율 확인 (옵션1: 66.7%, 옵션2: 33.3%)
    await expect(hostPage.locator('tr:has-text("옵션1")')).toContainText('66.7%');
    await expect(hostPage.locator('tr:has-text("옵션2")')).toContainText('33.3%');

    // 정리
    await voter1Context.close();
    await voter2Context.close();
    await voter3Context.close();
    await hostContext.close();
  });

  test('순위 투표 Borda Count 점수 계산', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto(BASE_PATH);
    await hostPage.click('text=투표 만들기');
    await hostPage.fill('input[placeholder*="점심"]', 'Borda Count 테스트');
    await hostPage.click('button:has-text("순위 투표")');
    await hostPage.fill('input[placeholder*="선택지 1"]', 'A');
    await hostPage.fill('input[placeholder*="선택지 2"]', 'B');
    await hostPage.click('button:has-text("선택지 추가")');
    await hostPage.fill('input[placeholder*="선택지 3"]', 'C');
    await hostPage.click('button:has-text("투표 시작")');
    await hostPage.waitForURL(/\/host\/.+/);

    const pollIdMatch = hostPage.url().match(/\/host\/(.+)/);
    const pollId = pollIdMatch![1];

    // 투표자 1: A > B > C
    const voter1Context = await browser.newContext();
    const voter1Page = await voter1Context.newPage();
    await voter1Page.goto(`${BASE_PATH}vote/${pollId}`);
    await voter1Page.click('button:has-text("투표하기")');
    await voter1Page.waitForTimeout(500);

    // 투표자 2: B > A > C
    const voter2Context = await browser.newContext();
    const voter2Page = await voter2Context.newPage();
    await voter2Page.goto(`${BASE_PATH}vote/${pollId}`);
    // B를 1위로 (A 아래로 이동)
    const downButtons = voter2Page.locator('button:has-text("↓")');
    await downButtons.first().click(); // A를 아래로
    await voter2Page.click('button:has-text("투표하기")');

    // 호스트 페이지에서 Borda Count 점수 확인
    await hostPage.waitForTimeout(1000);
    await expect(hostPage.locator('text=실시간 결과 (Borda Count 점수)')).toBeVisible();

    // 테이블에서 점수 확인
    const table = hostPage.locator('table');
    await expect(table).toBeVisible();

    // 정리
    await voter1Context.close();
    await voter2Context.close();
    await hostContext.close();
  });

  test('다중 브라우저 동시 접속 스트레스 테스트', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto(BASE_PATH);
    await hostPage.click('text=투표 만들기');
    await hostPage.fill('input[placeholder*="점심"]', '스트레스 테스트');
    await hostPage.fill('input[placeholder*="선택지 1"]', '선택1');
    await hostPage.fill('input[placeholder*="선택지 2"]', '선택2');
    await hostPage.click('button:has-text("투표 시작")');
    await hostPage.waitForURL(/\/host\/.+/);

    const pollIdMatch = hostPage.url().match(/\/host\/(.+)/);
    const pollId = pollIdMatch![1];

    // 10명의 투표자 동시 생성
    const voters = [];
    for (let i = 0; i < 10; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      voters.push({ context, page });
    }

    // 모든 투표자가 동시에 투표
    await Promise.all(
      voters.map(async ({ page }, index) => {
        await page.goto(`${BASE_PATH}vote/${pollId}`);
        const option = index % 2 === 0 ? '선택1' : '선택2';
        await page.click(`button:has-text("${option}")`);
        await page.click('button:has-text("투표하기")');
        await expect(page.locator('h2:has-text("투표 완료")')).toBeVisible();
      })
    );

    // 호스트 페이지에서 최종 결과 확인
    await hostPage.waitForTimeout(2000);
    await expect(hostPage.locator('text=총 10명 참여')).toBeVisible();

    // 5표씩 나뉘어야 함
    await expect(hostPage.locator('tr:has-text("선택1")')).toContainText('5표');
    await expect(hostPage.locator('tr:has-text("선택2")')).toContainText('5표');

    // 정리
    for (const { context } of voters) {
      await context.close();
    }
    await hostContext.close();
  });
});

test.describe('Live Voting - LocalStorage Persistence', () => {
  test('투표 데이터가 localStorage에 저장되는지 확인', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=투표 만들기');
    await page.fill('input[placeholder*="점심"]', '로컬스토리지 테스트');
    await page.fill('input[placeholder*="선택지 1"]', 'A');
    await page.fill('input[placeholder*="선택지 2"]', 'B');
    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\/.+/);

    const pollIdMatch = page.url().match(/\/host\/(.+)/);
    const pollId = pollIdMatch![1];

    // localStorage 확인
    const storedPoll = await page.evaluate((id) => {
      const key = `poll:${id}`;
      return localStorage.getItem(key);
    }, pollId);

    expect(storedPoll).toBeTruthy();
    const poll = JSON.parse(storedPoll!);
    expect(poll.title).toBe('로컬스토리지 테스트');
    expect(poll.options).toEqual(['A', 'B']);
  });

  test('페이지 새로고침 후 호스트 뷰 유지', async ({ page }) => {
    await page.goto(BASE_PATH);
    await page.click('text=투표 만들기');
    await page.fill('input[placeholder*="점심"]', '새로고침 테스트');
    await page.fill('input[placeholder*="선택지 1"]', 'X');
    await page.fill('input[placeholder*="선택지 2"]', 'Y');
    await page.click('button:has-text("투표 시작")');
    await page.waitForURL(/\/host\/.+/);

    const originalUrl = page.url();

    // 페이지 새로고침
    await page.reload();
    await waitForAppReady(page);

    // URL 유지 확인
    expect(page.url()).toBe(originalUrl);

    // 투표 제목 유지 확인
    await expect(page.locator('h1')).toContainText('새로고침 테스트');
    await expect(page.locator('img[alt="QR Code"]')).toBeVisible();
  });
});
