import { test, expect, Page } from '@playwright/test';
import {
  waitForAppReady,
  viewports,
  testKeyboardNavigation,
  specialCharacters,
} from '../utils/test-helpers';

const BASE_PATH = process.env.TEST_URL || 'http://localhost:5187/mini-apps/student-network/';

/**
 * 학생 네트워크 (Student Network) E2E 테스트
 *
 * 테스트 범위:
 * 1. Edge Cases: 빈 데이터, 특수문자, 대량 태그, 프라이버시
 * 2. UI Tests: 반응형, 프로필 카드, 네트워크 그래프, 접근성
 * 3. E2E User Journeys: 프로필 생성 → 교실 생성/참여 → 매칭 → 아이스브레이커
 * 4. Privacy Tests: 로컬 스토리지, 데이터 삭제, 백업/복원
 */

test.describe('Student Network - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
  });

  test('빈 이름으로 프로필 생성 시도', async ({ page }) => {
    // 프로필 폼 확인
    await expect(page.locator('h1, h2')).toContainText(/수강생|네트워킹|프로필/i);

    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();

    // 에러 메시지 또는 비활성화 확인
    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
      // 에러 메시지 확인
      const error = page.locator('text=/이름.*필수|이름.*입력/i');
      await expect(error).toBeVisible({ timeout: 2000 });
    }
  });

  test('특수 문자가 포함된 프로필 정보', async ({ page }) => {
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('<script>alert("xss")</script>');

    const taglineInput = page.locator('input[placeholder*="소개"], textarea[placeholder*="소개"]').first();
    if (await taglineInput.count() > 0) {
      await taglineInput.fill('😀 코딩 "좋아요" & 개발자');
    }

    const fieldInput = page.locator('input[placeholder*="전공"], input[placeholder*="분야"]').first();
    if (await fieldInput.count() > 0) {
      await fieldInput.fill('컴퓨터공학 & AI/ML');
    }

    // XSS가 실행되지 않고 텍스트로만 표시되는지 확인
    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    if (!await submitButton.isDisabled()) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // XSS가 실행되지 않았는지 확인
      await expect(page.locator('text=<script>')).toBeVisible();
    }
  });

  test('관심사 태그 최대 개수 제한 (5개)', async ({ page }) => {
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('태그테스터');

    // 관심사 입력
    const interestInput = page.locator('input[placeholder*="관심사"], input[placeholder*="태그"]').first();

    if (await interestInput.count() > 0) {
      const tags = ['Python', 'JavaScript', 'React', 'Node.js', 'TypeScript', '추가태그'];

      for (const tag of tags) {
        await interestInput.fill(tag);
        await interestInput.press('Enter');
      }

      // 최대 5개만 추가되어야 함
      const tagElements = page.locator('[data-tag], .tag, .badge, .chip');
      const count = await tagElements.count();
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  test('매우 긴 한줄 소개 (200자)', async ({ page }) => {
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('긴소개테스터');

    const taglineInput = page.locator('input[placeholder*="소개"], textarea[placeholder*="소개"]').first();

    if (await taglineInput.count() > 0) {
      const longText = 'A'.repeat(250);
      await taglineInput.fill(longText);

      // 최대 길이 제한 확인
      const value = await taglineInput.inputValue();
      expect(value.length).toBeLessThanOrEqual(200);
    }
  });

  test('중복 교실 코드 처리', async ({ page }) => {
    // 프로필 생성
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('교실테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // 교실 생성
    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();

    if (await createRoomButton.count() > 0) {
      await createRoomButton.click();

      const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
      await roomNameInput.fill('테스트 교실');

      const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
      await createButton.click();
      await page.waitForTimeout(1000);

      // 교실 코드가 생성되었는지 확인 (6자리)
      const roomCode = page.locator('text=/[A-Z0-9]{6}/i, .room-code, [data-room-code]');
      if (await roomCode.count() > 0) {
        await expect(roomCode.first()).toBeVisible();
      }
    }
  });

  test('잘못된 교실 코드로 참여 시도', async ({ page }) => {
    // 프로필 생성
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('참여테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // 교실 참여
    const joinButton = page.locator('button:has-text("교실 참여"), button:has-text("참여")').first();

    if (await joinButton.count() > 0) {
      await joinButton.click();

      const codeInput = page.locator('input[placeholder*="코드"]').first();
      await codeInput.fill('INVALID');

      const confirmButton = page.locator('button:has-text("참여"), button:has-text("확인")').last();
      await confirmButton.click();

      // 에러 메시지 확인
      const error = page.locator('text=/찾을 수 없습니다|존재하지 않습니다|유효하지/i');
      await expect(error).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Student Network - UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
  });

  test('반응형 레이아웃 - 모바일', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);

    await expect(page.locator('h1, h2')).toBeVisible();
    await expect(page.locator('input[placeholder*="이름"]')).toBeVisible();
  });

  test('반응형 레이아웃 - 태블릿', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);

    await expect(page.locator('h1, h2')).toBeVisible();
    await expect(page.locator('input[placeholder*="이름"]')).toBeVisible();
  });

  test('반응형 레이아웃 - 데스크톱', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);

    await expect(page.locator('h1, h2')).toBeVisible();
    await expect(page.locator('input[placeholder*="이름"]')).toBeVisible();
  });

  test('프로필 카드 렌더링', async ({ page }) => {
    // 프로필 생성
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('카드테스터');

    const taglineInput = page.locator('input[placeholder*="소개"], textarea[placeholder*="소개"]').first();
    if (await taglineInput.count() > 0) {
      await taglineInput.fill('테스트 한줄 소개');
    }

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // 프로필 카드 확인
    const profileCard = page.locator('[data-profile], .profile-card, .card');
    if (await profileCard.count() > 0) {
      await expect(profileCard.first()).toBeVisible();
      await expect(page.locator('text=카드테스터')).toBeVisible();
    }
  });

  test('관심사 태그 렌더링', async ({ page }) => {
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('태그렌더링');

    const interestInput = page.locator('input[placeholder*="관심사"], input[placeholder*="태그"]').first();

    if (await interestInput.count() > 0) {
      await interestInput.fill('React');
      await interestInput.press('Enter');

      await interestInput.fill('TypeScript');
      await interestInput.press('Enter');

      // 태그가 표시되는지 확인
      await expect(page.locator('text=React')).toBeVisible();
      await expect(page.locator('text=TypeScript')).toBeVisible();
    }
  });

  test('네트워크 그래프 렌더링', async ({ page }) => {
    // 프로필 생성 및 교실 참여 후 매칭 뷰에서 확인
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('그래프테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // 교실 생성
    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();

    if (await createRoomButton.count() > 0) {
      await createRoomButton.click();

      const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
      await roomNameInput.fill('그래프 테스트 교실');

      const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
      await createButton.click();
      await page.waitForTimeout(1000);

      // 교실 입장 후 매칭 또는 네트워크 그래프 확인
      const networkView = page.locator('svg, canvas, .network-graph, .visualization');
      if (await networkView.count() > 0) {
        await expect(networkView.first()).toBeVisible();
      }
    }
  });

  test('아바타 이미지 업로드', async ({ page }) => {
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('아바타테스터');

    // 파일 업로드 input 찾기
    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.count() > 0) {
      // 테스트 이미지 경로 (실제 파일 필요)
      // await fileInput.setInputFiles('path/to/test-avatar.png');

      // 파일 선택 버튼이 있는지 확인
      const uploadButton = page.locator('button:has-text("사진"), button:has-text("이미지"), button:has-text("업로드")');
      await expect(uploadButton.first()).toBeVisible();
    }
  });

  test('접근성 - 키보드 네비게이션', async ({ page }) => {
    await testKeyboardNavigation(page);
  });

  test('설정 패널 토글', async ({ page }) => {
    // 프로필 생성
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('설정테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // 설정 버튼 찾기
    const settingsButton = page.locator('button:has-text("설정"), button[aria-label*="설정"]');

    if (await settingsButton.count() > 0) {
      await settingsButton.click();

      // 설정 패널 표시
      await expect(page.locator('text=/데이터.*백업|데이터.*삭제/i')).toBeVisible();

      // 다시 클릭하면 숨김
      await settingsButton.click();
      await expect(page.locator('text=/데이터.*백업/i')).toBeHidden();
    }
  });
});

test.describe('Student Network - E2E User Journeys', () => {
  test('완전한 프로필 생성 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 1. 프로필 폼 확인
    await expect(page.locator('h1, h2')).toContainText(/수강생|네트워킹|프로필/i);

    // 2. 프로필 정보 입력
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('김학생');

    const taglineInput = page.locator('input[placeholder*="소개"], textarea[placeholder*="소개"]').first();
    if (await taglineInput.count() > 0) {
      await taglineInput.fill('풀스택 개발자 지망생');
    }

    const fieldInput = page.locator('input[placeholder*="전공"], input[placeholder*="분야"]').first();
    if (await fieldInput.count() > 0) {
      await fieldInput.fill('컴퓨터공학');
    }

    // 3. 관심사 추가
    const interestInput = page.locator('input[placeholder*="관심사"], input[placeholder*="태그"]').first();
    if (await interestInput.count() > 0) {
      const interests = ['React', 'Node.js', 'TypeScript'];
      for (const interest of interests) {
        await interestInput.fill(interest);
        await interestInput.press('Enter');
      }
    }

    // 4. 연락처 정보 (선택사항)
    const emailInput = page.locator('input[placeholder*="이메일"], input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('student@example.com');
    }

    const githubInput = page.locator('input[placeholder*="github"]');
    if (await githubInput.count() > 0) {
      await githubInput.fill('github.com/student');
    }

    // 5. 프로필 생성
    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();

    // 6. 교실 관리 화면으로 이동
    await page.waitForTimeout(1000);
    await expect(page.locator('text=김학생')).toBeVisible();

    // 7. 교실 생성 버튼 확인
    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")');
    await expect(createRoomButton.first()).toBeVisible();
  });

  test('교실 생성 및 코드 공유 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    // 프로필 생성
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('교실호스트');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // 교실 만들기
    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();
    await createRoomButton.click();

    // 교실명 입력
    const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
    await roomNameInput.fill('풀스택 웹개발 교실');

    const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
    await createButton.click();
    await page.waitForTimeout(1000);

    // 교실 코드 확인 (6자리)
    const roomCodeElement = page.locator('text=/[A-Z0-9]{6}/i, .room-code, [data-room-code]');
    if (await roomCodeElement.count() > 0) {
      const roomCode = await roomCodeElement.first().textContent();
      expect(roomCode).toMatch(/[A-Z0-9]{6}/);

      // 코드 복사 버튼
      const copyButton = page.locator('button:has-text("복사"), button[aria-label*="복사"]');
      if (await copyButton.count() > 0) {
        await copyButton.first().click();

        // 복사 완료 메시지
        const toast = page.locator('.toast, [role="status"], text=/복사/i');
        await expect(toast).toBeVisible({ timeout: 3000 });
      }
    }

    // 교실 목록에서 확인
    await expect(page.locator('text=풀스택 웹개발 교실')).toBeVisible();
  });

  test('교실 참여 플로우', async ({ page }) => {
    // 먼저 교실을 생성하는 컨텍스트
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('호스트');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();
    await createRoomButton.click();

    const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
    await roomNameInput.fill('참여 테스트 교실');

    const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
    await createButton.click();
    await page.waitForTimeout(1000);

    // 교실 코드 추출
    let roomCode = '';
    const roomCodeElement = page.locator('text=/[A-Z0-9]{6}/i, .room-code, [data-room-code]');
    if (await roomCodeElement.count() > 0) {
      roomCode = (await roomCodeElement.first().textContent()) || '';
    }

    // 프로필 재설정 (다른 사용자 시뮬레이션)
    await page.evaluate(() => {
      localStorage.removeItem('profile');
      localStorage.removeItem('student-network-profile');
    });
    await page.reload();
    await waitForAppReady(page);

    // 새 프로필 생성
    await page.locator('input[placeholder*="이름"]').first().fill('참여자');
    await page.locator('button:has-text("시작"), button:has-text("생성")').first().click();
    await page.waitForTimeout(1000);

    // 교실 참여
    const joinButton = page.locator('button:has-text("교실 참여"), button:has-text("참여")').first();
    if (await joinButton.count() > 0 && roomCode) {
      await joinButton.click();

      const codeInput = page.locator('input[placeholder*="코드"]').first();
      await codeInput.fill(roomCode);

      const confirmButton = page.locator('button:has-text("참여"), button:has-text("확인")').last();
      await confirmButton.click();
      await page.waitForTimeout(1000);

      // 교실 목록에 추가되었는지 확인
      await expect(page.locator('text=참여 테스트 교실')).toBeVisible();
    }
  });

  test('교실 뷰 및 멤버 확인 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('멤버확인');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();
    await createRoomButton.click();

    const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
    await roomNameInput.fill('멤버 확인 교실');

    const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
    await createButton.click();
    await page.waitForTimeout(1000);

    // 교실 입장
    const enterButton = page.locator('button:has-text("입장"), button:has-text("보기")').first();
    if (await enterButton.count() > 0) {
      await enterButton.click();
      await page.waitForTimeout(1000);

      // 멤버 목록 확인
      await expect(page.locator('text=멤버확인')).toBeVisible();

      // 뒤로 가기
      const backButton = page.locator('button:has-text("뒤로"), button:has-text("나가기")');
      if (await backButton.count() > 0) {
        await backButton.click();
      }
    }
  });

  test('매칭 기능 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('매칭테스터');

    const interestInput = page.locator('input[placeholder*="관심사"], input[placeholder*="태그"]').first();
    if (await interestInput.count() > 0) {
      await interestInput.fill('React');
      await interestInput.press('Enter');
      await interestInput.fill('JavaScript');
      await interestInput.press('Enter');
    }

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();
    await createRoomButton.click();

    const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
    await roomNameInput.fill('매칭 테스트');

    const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
    await createButton.click();
    await page.waitForTimeout(1000);

    // 교실 입장 후 매칭 확인
    const enterButton = page.locator('button:has-text("입장"), button:has-text("보기")').first();
    if (await enterButton.count() > 0) {
      await enterButton.click();
      await page.waitForTimeout(1000);

      // 매칭 탭 또는 버튼
      const matchingTab = page.locator('button:has-text("매칭"), a:has-text("매칭")');
      if (await matchingTab.count() > 0) {
        await matchingTab.first().click();

        // 매칭 결과 확인
        const matchResult = page.locator('.match, .matching-result, text=/관심사/i');
        await expect(matchResult.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('아이스브레이커 질문 답변 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('아이스브레이커');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();
    await createRoomButton.click();

    const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
    await roomNameInput.fill('아이스브레이커 테스트');

    const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
    await createButton.click();
    await page.waitForTimeout(1000);

    // 교실 입장
    const enterButton = page.locator('button:has-text("입장"), button:has-text("보기")').first();
    if (await enterButton.count() > 0) {
      await enterButton.click();
      await page.waitForTimeout(1000);

      // 아이스브레이커 탭
      const icebreakerTab = page.locator('button:has-text("아이스브레이커"), a:has-text("아이스브레이커")');
      if (await icebreakerTab.count() > 0) {
        await icebreakerTab.first().click();

        // 질문 확인
        const questionElement = page.locator('.question, [data-question], text=/\\?$/');
        if (await questionElement.count() > 0) {
          await expect(questionElement.first()).toBeVisible();

          // 답변 입력
          const answerInput = page.locator('textarea, input[placeholder*="답변"]').first();
          if (await answerInput.count() > 0) {
            await answerInput.fill('저는 코딩을 좋아하고 새로운 기술을 배우는 것을 즐깁니다.');

            const submitAnswerButton = page.locator('button:has-text("답변"), button:has-text("제출")').first();
            await submitAnswerButton.click();

            // 답변 저장 확인
            await expect(page.locator('text=/답변.*완료|저장.*완료/i')).toBeVisible({ timeout: 3000 });
          }
        }
      }
    }
  });

  test('교실 나가기 플로우', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('나가기테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();
    await createRoomButton.click();

    const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
    await roomNameInput.fill('나가기 테스트');

    const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
    await createButton.click();
    await page.waitForTimeout(1000);

    // 교실 나가기 버튼
    const leaveButton = page.locator('button:has-text("나가기"), button:has-text("삭제")').first();

    if (await leaveButton.count() > 0) {
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('나가기');
        await dialog.accept();
      });

      await leaveButton.click();
      await page.waitForTimeout(1000);

      // 교실 목록에서 사라졌는지 확인
      const roomExists = await page.locator('text=나가기 테스트').count() > 0;
      expect(roomExists).toBeFalsy();
    }
  });
});

test.describe('Student Network - Privacy & Data Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);
  });

  test('데이터가 로컬에만 저장되는지 확인', async ({ page }) => {
    // 프로필 생성
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('로컬저장테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // localStorage 확인
    const storedProfile = await page.evaluate(() => {
      return localStorage.getItem('profile') ||
             localStorage.getItem('student-network-profile') ||
             localStorage.getItem('profileStore');
    });

    expect(storedProfile).toBeTruthy();

    // 프로필 데이터 확인
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      expect(profile).toBeTruthy();
    }
  });

  test('데이터 백업 기능', async ({ page }) => {
    // 프로필 생성
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('백업테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // 설정 열기
    const settingsButton = page.locator('button:has-text("설정"), button[aria-label*="설정"]');

    if (await settingsButton.count() > 0) {
      await settingsButton.click();

      // 데이터 백업 버튼
      const backupButton = page.locator('button:has-text("백업"), button:has-text("다운로드")');

      if (await backupButton.count() > 0) {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
          backupButton.first().click(),
        ]);

        if (download) {
          const filename = download.suggestedFilename();
          expect(filename).toMatch(/\.json$/i);
        }
      }
    }
  });

  test('모든 데이터 삭제 기능', async ({ page }) => {
    // 프로필 생성
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('삭제테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // 설정 열기
    const settingsButton = page.locator('button:has-text("설정"), button[aria-label*="설정"]');

    if (await settingsButton.count() > 0) {
      await settingsButton.click();

      // 모든 데이터 삭제 버튼
      const deleteButton = page.locator('button:has-text("모든 데이터 삭제"), button:has-text("삭제")');

      if (await deleteButton.count() > 0) {
        page.on('dialog', async (dialog) => {
          expect(dialog.message()).toMatch(/삭제|주의|확인/i);
          await dialog.accept();
        });

        await deleteButton.first().click();
        await page.waitForTimeout(1000);

        // 초기 화면으로 돌아갔는지 확인
        await expect(page.locator('input[placeholder*="이름"]')).toBeVisible();

        // localStorage가 비워졌는지 확인
        const storedProfile = await page.evaluate(() => {
          return localStorage.getItem('profile') ||
                 localStorage.getItem('student-network-profile');
        });

        expect(storedProfile).toBeNull();
      }
    }
  });

  test('페이지 새로고침 후 프로필 유지', async ({ page }) => {
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('새로고침테스터');

    const taglineInput = page.locator('input[placeholder*="소개"], textarea[placeholder*="소개"]').first();
    if (await taglineInput.count() > 0) {
      await taglineInput.fill('새로고침 테스트 소개');
    }

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // 페이지 새로고침
    await page.reload();
    await waitForAppReady(page);

    // 프로필 정보 유지 확인
    await expect(page.locator('text=새로고침테스터')).toBeVisible();
  });

  test('프라이버시 안내 표시', async ({ page }) => {
    // 푸터에 프라이버시 안내가 있는지 확인
    const privacyNotice = page.locator('text=/개인정보.*보호|서버.*전송.*않습니다|브라우저.*저장/i');

    if (await privacyNotice.count() > 0) {
      await expect(privacyNotice.first()).toBeVisible();
    }
  });

  test('서버로 데이터 전송하지 않는지 확인', async ({ page }) => {
    // 네트워크 요청 모니터링
    const requests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      // API 호출이 없어야 함 (정적 리소스 제외)
      if (url.includes('/api/') || url.includes('profile')) {
        requests.push(url);
      }
    });

    // 프로필 생성
    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('네트워크테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(2000);

    // API 호출이 없어야 함
    const apiCalls = requests.filter(url => !url.includes('.js') && !url.includes('.css'));
    expect(apiCalls.length).toBe(0);
  });
});

test.describe('Student Network - Edge Cases for Network Features', () => {
  test('교실에 멤버 1명만 있을 때', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('혼자테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();
    await createRoomButton.click();

    const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
    await roomNameInput.fill('혼자 교실');

    const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
    await createButton.click();
    await page.waitForTimeout(1000);

    const enterButton = page.locator('button:has-text("입장"), button:has-text("보기")').first();
    if (await enterButton.count() > 0) {
      await enterButton.click();

      // 멤버 1명 안내 메시지
      const notice = page.locator('text=/다른.*참여자|멤버.*없습니다/i');
      if (await notice.count() > 0) {
        await expect(notice).toBeVisible();
      }
    }
  });

  test('동일한 관심사가 없는 경우 매칭', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('관심사테스터');

    // 관심사 없이 프로필 생성
    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();
    await createRoomButton.click();

    const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
    await roomNameInput.fill('관심사 테스트');

    const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
    await createButton.click();
    await page.waitForTimeout(1000);

    const enterButton = page.locator('button:has-text("입장"), button:has-text("보기")').first();
    if (await enterButton.count() > 0) {
      await enterButton.click();

      const matchingTab = page.locator('button:has-text("매칭"), a:has-text("매칭")');
      if (await matchingTab.count() > 0) {
        await matchingTab.first().click();

        // 매칭 결과가 없거나 안내 메시지
        const noMatch = page.locator('text=/관심사.*없습니다|매칭.*없습니다/i');
        if (await noMatch.count() > 0) {
          await expect(noMatch).toBeVisible();
        }
      }
    }
  });

  test('매우 긴 답변 입력 (아이스브레이커)', async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForAppReady(page);

    const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first();
    await nameInput.fill('긴답변테스터');

    const submitButton = page.locator('button:has-text("시작"), button:has-text("생성"), button:has-text("완료")').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    const createRoomButton = page.locator('button:has-text("교실 만들기"), button:has-text("만들기")').first();
    await createRoomButton.click();

    const roomNameInput = page.locator('input[placeholder*="교실"], input[placeholder*="이름"]').first();
    await roomNameInput.fill('긴답변 테스트');

    const createButton = page.locator('button:has-text("생성"), button:has-text("만들기")').last();
    await createButton.click();
    await page.waitForTimeout(1000);

    const enterButton = page.locator('button:has-text("입장"), button:has-text("보기")').first();
    if (await enterButton.count() > 0) {
      await enterButton.click();

      const icebreakerTab = page.locator('button:has-text("아이스브레이커"), a:has-text("아이스브레이커")');
      if (await icebreakerTab.count() > 0) {
        await icebreakerTab.first().click();

        const answerInput = page.locator('textarea, input[placeholder*="답변"]').first();
        if (await answerInput.count() > 0) {
          const longAnswer = 'A'.repeat(1000);
          await answerInput.fill(longAnswer);

          // 최대 길이 제한 확인
          const value = await answerInput.inputValue();
          expect(value.length).toBeLessThanOrEqual(500);
        }
      }
    }
  });
});
