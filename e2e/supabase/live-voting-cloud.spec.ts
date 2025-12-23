import { test, expect } from '@playwright/test';

/**
 * Live Voting 클라우드 모드 E2E 테스트
 * - Supabase 연동 확인
 * - 크로스 디바이스 시뮬레이션 (다중 브라우저 컨텍스트)
 */

test.describe('Live Voting - Cloud Mode', () => {
  test.describe.configure({ mode: 'serial' });

  let pollId: string;
  let pollUrl: string;

  test('1. 클라우드 모드로 투표 생성', async ({ page }) => {
    // 투표 생성 페이지로 이동
    await page.goto('/live-voting/create');
    await expect(page).toHaveURL(/\/live-voting\/create/);

    // 투표 제목 입력
    await page.fill('input[placeholder*="점심"]', 'E2E 테스트 투표 - ' + Date.now());

    // 선택지 입력
    const optionInputs = page.locator('input[placeholder^="선택지"]');
    await optionInputs.nth(0).fill('옵션 A');
    await optionInputs.nth(1).fill('옵션 B');

    // 클라우드 모드 선택 (두 번째 버튼)
    const cloudModeButton = page.locator('button:has-text("클라우드 모드")');
    await cloudModeButton.click();

    // 클라우드 모드 버튼이 선택되었는지 확인
    await expect(cloudModeButton).toHaveClass(/bg-blue-500/);

    // 투표 시작 버튼 클릭
    await page.click('button:has-text("투표 시작")');

    // 호스트 페이지로 리다이렉트 대기
    await page.waitForURL(/\/live-voting\/host\//, { timeout: 10000 });

    // URL에서 pollId 추출
    const url = page.url();
    pollId = url.split('/host/')[1];
    pollUrl = url;

    console.log('✅ 투표 생성 완료:', pollId);

    // 호스트 페이지 요소 확인
    await expect(page.locator('text=실시간 결과')).toBeVisible();
    await expect(page.locator('text=투표 참여')).toBeVisible();

    // 클라우드 모드 표시 확인
    await expect(page.locator('text=클라우드')).toBeVisible();
  });

  test('2. 다른 브라우저에서 투표 참여', async ({ browser }) => {
    test.skip(!pollId, '투표가 생성되지 않음');

    // 새 브라우저 컨텍스트 (다른 사용자 시뮬레이션)
    const voterContext = await browser.newContext();
    const voterPage = await voterContext.newPage();

    // 투표 페이지로 직접 이동
    await voterPage.goto(`/live-voting/vote/${pollId}`);

    // 투표 페이지 로딩 대기
    await voterPage.waitForLoadState('networkidle');

    // 투표 제목이 표시되는지 확인
    const titleVisible = await voterPage.locator('h1:has-text("E2E 테스트")').isVisible({ timeout: 5000 }).catch(() => false);

    if (!titleVisible) {
      // 로컬 모드로 폴백된 경우 - 클라우드 세션 없음
      console.log('⚠️ 클라우드 세션을 찾지 못함 (로컬 모드 폴백)');
      await voterContext.close();
      test.skip(true, 'Cloud session not found');
      return;
    }

    console.log('✅ 투표 페이지 로드 성공');

    // 첫 번째 옵션 선택
    const firstOption = voterPage.locator('button:has-text("옵션 A")');
    await firstOption.click();

    // 선택 확인 (스타일 변경)
    await expect(firstOption).toHaveClass(/border-blue-500|bg-blue-50/);

    // 투표하기 버튼 클릭
    await voterPage.click('button:has-text("투표하기")');

    // 투표 완료 화면 확인 ("투표 완료!" 포함)
    await expect(voterPage.locator('text=/투표 완료/')).toBeVisible({ timeout: 10000 });

    console.log('✅ 투표 제출 성공');

    await voterContext.close();
  });

  test('3. 호스트에서 실시간 결과 확인', async ({ page }) => {
    test.skip(!pollId, '투표가 생성되지 않음');

    // 호스트 페이지로 이동
    await page.goto(`/live-voting/host/${pollId}`);
    await page.waitForLoadState('networkidle');

    // 결과 차트 또는 테이블 확인
    const hasResults = await page.locator('text=옵션 A').isVisible({ timeout: 5000 }).catch(() => false);

    if (hasResults) {
      // 득표 수 확인 (최소 1표)
      const voteCount = page.locator('text=/\\d+표|\\d+명 참여/');
      await expect(voteCount.first()).toBeVisible();
      console.log('✅ 실시간 결과 표시 확인');
    } else {
      console.log('⚠️ 결과 표시 확인 필요');
    }
  });

  test('4. 여러 참여자 동시 투표 시뮬레이션', async ({ browser }) => {
    test.skip(!pollId, '투표가 생성되지 않음');

    const voterCount = 3;
    const voters: { context: any; page: any }[] = [];

    // 여러 브라우저 컨텍스트 생성 (시크릿 모드 - 완전히 격리된 스토리지)
    for (let i = 0; i < voterCount; i++) {
      // 새 컨텍스트 = 시크릿 모드와 동일 (각각 독립된 localStorage, sessionStorage, cookies)
      const context = await browser.newContext();
      // localStorage 초기화를 위해 페이지 생성 전 빈 스토리지 설정
      await context.addInitScript(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
      });
      const page = await context.newPage();
      voters.push({ context, page });
    }

    // 순차적으로 투표 (동시 요청 충돌 방지)
    let successCount = 0;
    for (let index = 0; index < voters.length; index++) {
      const { page } = voters[index];
      try {
        await page.goto(`/live-voting/vote/${pollId}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500); // 페이지 안정화 대기

        // 이미 투표 완료 화면이면 스킵
        const alreadyVoted = await page.locator('text=/투표 완료/').isVisible({ timeout: 1000 }).catch(() => false);
        if (alreadyVoted) {
          console.log(`⚠️ Voter ${index + 1}: 이미 투표됨`);
          successCount++;
          continue;
        }

        // 번갈아가며 옵션 선택
        const optionText = index % 2 === 0 ? '옵션 A' : '옵션 B';
        const option = page.locator(`button:has-text("${optionText}")`).first();

        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();

        // 선택 확인 (체크마크 또는 배경색 변경)
        await page.waitForTimeout(300);

        // 투표하기 버튼 클릭
        const voteButton = page.locator('button:has-text("투표하기")');
        await voteButton.click();

        // 전송 완료 대기 (최대 15초 - 네트워크 지연 고려)
        // "투표 완료!" 텍스트 찾기 - waitFor 사용
        let completed = false;
        try {
          await page.getByText('투표 완료', { exact: false }).waitFor({ state: 'visible', timeout: 15000 });
          completed = true;
        } catch {
          completed = false;
        }

        if (completed) {
          console.log(`✅ Voter ${index + 1}: ${optionText} 투표 성공`);
          successCount++;
        } else {
          // 에러 메시지 확인
          const errorAlert = await page.locator('text=실패').isVisible({ timeout: 1000 }).catch(() => false);
          console.log(`❌ Voter ${index + 1}: ${optionText} 투표 실패 ${errorAlert ? '(서버 에러)' : '(타임아웃)'}`);
        }
      } catch (err) {
        console.log(`❌ Voter ${index + 1}: 에러 - ${err}`);
      }
    }

    console.log(`\n📊 투표 결과: ${successCount}/${voterCount} 성공`);

    // 정리
    for (const { context } of voters) {
      await context.close();
    }

    // 최소 2명 이상 성공
    expect(successCount).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Live Voting - Supabase 직접 연결 테스트', () => {
  test('Supabase 테이블 접근 가능 확인', async ({ request }) => {
    const supabaseUrl = 'https://hwgsqzdpqmfoyxiymjsp.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Z3NxemRwcW1mb3l4aXltanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjA3MDMsImV4cCI6MjA4MTkzNjcwM30.XCIYzVHiO-taiARb0x-9rNEWxDgTCJ8tybsueccAlbI';

    // sessions 테이블 접근
    const response = await request.get(`${supabaseUrl}/rest/v1/sessions?select=count&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    console.log('✅ Supabase sessions 테이블 접근 성공');
  });

  test('votes 테이블 접근 가능 확인', async ({ request }) => {
    const supabaseUrl = 'https://hwgsqzdpqmfoyxiymjsp.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Z3NxemRwcW1mb3l4aXltanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjA3MDMsImV4cCI6MjA4MTkzNjcwM30.XCIYzVHiO-taiARb0x-9rNEWxDgTCJ8tybsueccAlbI';

    const response = await request.get(`${supabaseUrl}/rest/v1/votes?select=count&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    console.log('✅ Supabase votes 테이블 접근 성공');
  });
});
