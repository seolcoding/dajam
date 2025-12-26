import { test, expect } from '@playwright/test';
import { StudentNetworkPage } from '../../pages/social/student-network.page';

/**
 * Student Network - E2E Tests
 *
 * Based on APPS_DOCUMENTATION.md and CLAUDE.md:
 * - 프로필 생성 및 수정
 * - 로컬/클라우드 교실 생성
 * - 교실 참여 (코드 입력)
 * - QR 코드 표시
 * - 참여자 목록 확인
 * - 관심사 기반 매칭
 * - 아이스브레이킹
 *
 * Storage: Zustand persist (localStorage)
 * - student-network-profile
 * - student-network-rooms
 */
test.describe('Student Network', () => {
  let studentPage: StudentNetworkPage;

  test.beforeEach(async ({ page }) => {
    studentPage = new StudentNetworkPage(page);
    await studentPage.clearStorage(); // Clear localStorage before each test
    await studentPage.goto();
  });

  test.afterEach(async () => {
    await studentPage.clearStorage(); // Clean up after each test
  });

  // ====================
  // Basic Page Load Tests
  // ====================
  test.describe('Page Load', () => {
    test('should load page with profile form', async () => {
      await studentPage.expectProfileFormVisible();
      await studentPage.expectHeading(/프로필 만들기/i);
      await expect(studentPage.page.getByText(/학력이 아닌 관심사로 연결되는/i)).toBeVisible();
    });

    test('should display header with title', async () => {
      await studentPage.expectHeading(/수강생 네트워킹/i);
    });

    test('should have privacy notice in footer', async () => {
      await expect(studentPage.page.getByText(/개인정보 보호/i)).toBeVisible();
      await expect(studentPage.page.getByText(/브라우저에만 저장됩니다/i)).toBeVisible();
    });
  });

  // ====================
  // Profile Creation Tests
  // ====================
  test.describe('Profile Creation', () => {
    test('should create profile with required fields', async () => {
      await studentPage.createProfile({
        name: '홍길동',
        tagline: '웹 개발에 열정이 있는 주니어 개발자',
        field: '컴퓨터공학',
      });

      // Should navigate to room manager
      await studentPage.expectRoomManagerVisible();
    });

    test('should create profile with interests', async () => {
      await studentPage.createProfile({
        name: '김개발',
        tagline: 'React 마스터가 되고 싶습니다',
        field: '컴퓨터공학',
        interests: ['React', 'JavaScript', 'TypeScript'],
      });

      await studentPage.expectRoomManagerVisible();
    });

    test('should create profile with contact information', async () => {
      await studentPage.createProfile({
        name: '이디자인',
        tagline: 'UI/UX에 관심이 많은 디자이너',
        field: '디자인',
        interests: ['디자인', 'UX/UI'],
        email: 'test@example.com',
        github: 'https://github.com/testuser',
        linkedin: 'https://linkedin.com/in/testuser',
        website: 'https://testuser.com',
      });

      await studentPage.expectRoomManagerVisible();
    });

    test('should select interest tags', async () => {
      await studentPage.profileNameInput.fill('테스트');
      await studentPage.profileTaglineInput.fill('테스트 한줄 소개');
      await studentPage.profileFieldSelect.selectOption('컴퓨터공학');

      // Add interest tags
      const reactButton = studentPage.page.getByRole('button', { name: 'React', exact: true });
      await reactButton.click();
      await studentPage.waitForAnimation(100);

      const jsButton = studentPage.page.getByRole('button', { name: 'JavaScript', exact: true });
      await jsButton.click();
      await studentPage.waitForAnimation(100);

      // Verify tags are selected
      await studentPage.expectInterestSelected('React');
      await studentPage.expectInterestSelected('JavaScript');
    });

    test('should limit interest tags to maximum 5', async () => {
      await studentPage.profileNameInput.fill('테스트');
      await studentPage.profileTaglineInput.fill('테스트 한줄 소개');
      await studentPage.profileFieldSelect.selectOption('컴퓨터공학');

      // Try to add 6 tags
      const tags = ['React', 'JavaScript', 'TypeScript', 'Python', 'Java', 'AI/ML'];
      for (const tag of tags) {
        const tagButton = studentPage.page.getByRole('button', { name: tag, exact: true });
        if (await tagButton.isVisible() && await tagButton.isEnabled()) {
          await tagButton.click();
          await studentPage.waitForAnimation(50);
        }
      }

      // Should have maximum 5 selected tags
      const selectedCount = await studentPage.selectedInterestTags.count();
      expect(selectedCount).toBeLessThanOrEqual(5);
    });

    test('should remove interest tag', async () => {
      await studentPage.profileNameInput.fill('테스트');
      await studentPage.profileTaglineInput.fill('테스트 한줄 소개');
      await studentPage.profileFieldSelect.selectOption('컴퓨터공학');

      // Add a tag
      const reactButton = studentPage.page.getByRole('button', { name: 'React', exact: true });
      await reactButton.click();
      await studentPage.waitForAnimation(100);

      // Remove the tag
      const removeButton = studentPage.page.locator('.bg-blue-600').filter({ hasText: 'React' }).getByRole('button');
      await removeButton.click();
      await studentPage.waitForAnimation(100);

      // Tag should be removed
      const selectedCount = await studentPage.selectedInterestTags.count();
      expect(selectedCount).toBe(0);
    });

    test('should validate required fields', async () => {
      // Try to submit without filling required fields
      await studentPage.createProfileButton.click();

      // Form should not submit (browser validation)
      await studentPage.expectProfileFormVisible();
    });

    test('should enforce character limits', async () => {
      // Name: max 20 characters
      const longName = 'A'.repeat(30);
      await studentPage.profileNameInput.fill(longName);
      const nameValue = await studentPage.profileNameInput.inputValue();
      expect(nameValue.length).toBeLessThanOrEqual(20);

      // Tagline: max 30 characters
      const longTagline = 'B'.repeat(40);
      await studentPage.profileTaglineInput.fill(longTagline);
      const taglineValue = await studentPage.profileTaglineInput.inputValue();
      expect(taglineValue.length).toBeLessThanOrEqual(30);
    });
  });

  // ====================
  // Room Management Tests
  // ====================
  test.describe('Room Management', () => {
    test.beforeEach(async () => {
      // Create profile first
      await studentPage.createProfile({
        name: '테스트유저',
        tagline: '테스트 한줄 소개',
        field: '컴퓨터공학',
        interests: ['React', 'JavaScript'],
      });
    });

    test('should display room manager after profile creation', async () => {
      await studentPage.expectRoomManagerVisible();
    });

    test('should create local room', async () => {
      await studentPage.createLocalRoom('React 부트캠프 2기');
      await studentPage.waitForAnimation(300);

      // Room should appear in list
      await studentPage.expectRoomCount(1);
      await expect(studentPage.page.getByText(/React 부트캠프 2기/i)).toBeVisible();
    });

    test('should create multiple rooms', async () => {
      await studentPage.createLocalRoom('교실 1');
      await studentPage.waitForAnimation(200);

      await studentPage.createLocalRoom('교실 2');
      await studentPage.waitForAnimation(200);

      await studentPage.expectRoomCount(2);
    });

    test('should display room code', async () => {
      await studentPage.createLocalRoom('테스트 교실');
      await studentPage.waitForAnimation(300);

      await studentPage.expectRoomCodeVisible();
    });

    test('should copy room code', async ({ context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await studentPage.createLocalRoom('테스트 교실');
      await studentPage.waitForAnimation(300);

      await studentPage.showRoomCode();
      await studentPage.copyCodeButton.click();

      // Verify alert appears (clipboard copy confirmation)
      studentPage.page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('복사');
        await dialog.accept();
      });
    });

    test('should toggle room code visibility', async () => {
      await studentPage.createLocalRoom('테스트 교실');
      await studentPage.waitForAnimation(300);

      // Show code
      await studentPage.showCodeButton.click();
      await expect(studentPage.page.locator('.font-mono.text-2xl.font-bold')).toBeVisible();

      // Hide code
      await studentPage.hideCodeButton.click();
      await expect(studentPage.page.locator('.font-mono.text-2xl.font-bold')).not.toBeVisible();
    });

    test('should show room participant count', async () => {
      await studentPage.createLocalRoom('테스트 교실');
      await studentPage.waitForAnimation(300);

      // Should show 1 participant (creator)
      await expect(studentPage.page.getByText(/참여자.*1명/i)).toBeVisible();
    });

    test('should enter room', async () => {
      await studentPage.createLocalRoom('테스트 교실');
      await studentPage.waitForAnimation(300);

      await studentPage.enterRoom();

      // Should be in room view
      await studentPage.expectInRoomView();
    });

    test('should leave room', async () => {
      await studentPage.createLocalRoom('테스트 교실');
      await studentPage.waitForAnimation(300);

      await studentPage.leaveRoom();
      await studentPage.waitForAnimation(300);

      // Room should be removed from list
      await studentPage.expectRoomCount(0);
    });

    test('should display room badges (local/cloud)', async () => {
      await studentPage.createLocalRoom('로컬 교실');
      await studentPage.waitForAnimation(300);

      // Should show local badge
      await expect(studentPage.page.getByText(/로컬/i).first()).toBeVisible();
    });
  });

  // ====================
  // Room View Tests
  // ====================
  test.describe('Room View', () => {
    test.beforeEach(async () => {
      // Create profile and enter room
      await studentPage.createProfile({
        name: '테스트유저',
        tagline: '테스트 한줄 소개',
        field: '컴퓨터공학',
        interests: ['React', 'JavaScript'],
      });
      await studentPage.createLocalRoom('테스트 교실');
      await studentPage.waitForAnimation(300);
      await studentPage.enterRoom();
    });

    test('should display room name in header', async () => {
      await studentPage.expectRoomName('테스트 교실');
    });

    test('should show back button', async () => {
      await expect(studentPage.backButton).toBeVisible();
    });

    test('should navigate back to room manager', async () => {
      await studentPage.backButton.click();
      await studentPage.waitForAnimation(300);

      await studentPage.expectRoomManagerVisible();
    });

    test('should display participant count', async () => {
      await studentPage.expectMemberCount(1);
    });

    test('should open profile card modal', async () => {
      await studentPage.openProfileCard();
      await studentPage.expectProfileCardVisible();
    });

    test('should close profile card modal', async () => {
      await studentPage.openProfileCard();
      await studentPage.closeProfileCard();

      await expect(studentPage.profileCardModal).not.toBeVisible();
    });

    test('should display member in members tab', async () => {
      // Should be on members tab by default
      await expect(studentPage.page.getByText('테스트유저')).toBeVisible();
    });

    test('should switch to matching tab', async () => {
      await studentPage.switchToTab('matching');

      // Matching tab should be active
      await expect(studentPage.matchingTab).toHaveAttribute('data-state', 'active');
    });

    test('should switch to icebreaker tab', async () => {
      await studentPage.switchToTab('icebreaker');

      // Icebreaker tab should be active
      await expect(studentPage.icebreakerTab).toHaveAttribute('data-state', 'active');
    });

    test('should display all tabs', async () => {
      await expect(studentPage.membersTab).toBeVisible();
      await expect(studentPage.matchingTab).toBeVisible();
      await expect(studentPage.icebreakerTab).toBeVisible();
    });
  });

  // ====================
  // Settings Tests
  // ====================
  test.describe('Settings', () => {
    test.beforeEach(async () => {
      // Create profile
      await studentPage.createProfile({
        name: '테스트유저',
        tagline: '테스트 한줄 소개',
        field: '컴퓨터공학',
      });
    });

    test('should have settings button after profile creation', async () => {
      // Settings button should be visible in header
      const settingsButton = studentPage.page.getByRole('button').filter({ has: studentPage.page.locator('svg') }).first();
      await expect(settingsButton).toBeVisible();
    });

    test('should toggle settings panel', async () => {
      const settingsButton = studentPage.page.getByRole('button').filter({ has: studentPage.page.locator('svg') }).first();
      await settingsButton.click();

      await expect(studentPage.exportDataButton).toBeVisible();
      await expect(studentPage.clearDataButton).toBeVisible();
    });
  });

  // ====================
  // Edge Cases
  // ====================
  test.describe('Edge Cases', () => {
    test('should handle empty room name', async () => {
      await studentPage.createProfile({
        name: '테스트유저',
        tagline: '테스트 한줄 소개',
        field: '컴퓨터공학',
      });

      // Try to create room with empty name
      await studentPage.createLocalRoomButton.click();

      // Should not create room
      await studentPage.expectRoomCount(0);
    });

    test('should handle invalid join code', async () => {
      await studentPage.createProfile({
        name: '테스트유저',
        tagline: '테스트 한줄 소개',
        field: '컴퓨터공학',
      });

      // Try to join with short code
      await studentPage.joinCodeInput.fill('ABC');

      // Button should be disabled (less than 6 characters)
      await expect(studentPage.joinRoomButton).toBeDisabled();
    });

    test('should handle special characters in profile', async () => {
      await studentPage.createProfile({
        name: '홍길동 (별명)',
        tagline: '웹 개발 & UI/UX 디자인!',
        field: '컴퓨터공학',
      });

      await studentPage.expectRoomManagerVisible();
    });

    test('should persist profile in localStorage', async () => {
      await studentPage.createProfile({
        name: '테스트유저',
        tagline: '테스트 한줄 소개',
        field: '컴퓨터공학',
      });

      // Check localStorage
      const profileData = await studentPage.getStorage('student-network-profile');
      expect(profileData).toBeTruthy();
      expect(profileData.state.profile.name).toBe('테스트유저');
    });

    test('should persist rooms in localStorage', async () => {
      await studentPage.createProfile({
        name: '테스트유저',
        tagline: '테스트 한줄 소개',
        field: '컴퓨터공학',
      });

      await studentPage.createLocalRoom('테스트 교실');
      await studentPage.waitForAnimation(300);

      // Check localStorage
      const roomData = await studentPage.getStorage('student-network-rooms');
      expect(roomData).toBeTruthy();
      expect(roomData.state.rooms).toHaveLength(1);
      expect(roomData.state.rooms[0].name).toBe('테스트 교실');
    });

    test('should handle page reload with persisted data', async ({ page }) => {
      await studentPage.createProfile({
        name: '테스트유저',
        tagline: '테스트 한줄 소개',
        field: '컴퓨터공학',
      });

      await studentPage.createLocalRoom('테스트 교실');
      await studentPage.waitForAnimation(300);

      // Reload page
      await page.reload();
      await studentPage.waitForPageLoad();

      // Should still be in room manager (not profile form)
      await studentPage.expectRoomManagerVisible();
      await studentPage.expectRoomCount(1);
    });

    test('should handle Korean input in all fields', async () => {
      await studentPage.createProfile({
        name: '김개발',
        tagline: '풀스택 개발자를 꿈꾸는 열정적인 개발자입니다',
        field: '컴퓨터공학',
        interests: ['웹 개발', '모바일', '데이터베이스'],
      });

      await studentPage.expectRoomManagerVisible();
    });
  });

  // ====================
  // Integration Tests
  // ====================
  test.describe('Full Workflow', () => {
    test('should complete full workflow: create profile -> create room -> enter room', async () => {
      // Step 1: Create profile
      await studentPage.createProfile({
        name: '홍길동',
        tagline: 'React 개발자',
        field: '컴퓨터공학',
        interests: ['React', 'JavaScript', 'TypeScript'],
        email: 'hong@example.com',
      });

      await studentPage.expectRoomManagerVisible();

      // Step 2: Create room
      await studentPage.createLocalRoom('React 스터디');
      await studentPage.waitForAnimation(300);

      await studentPage.expectRoomCount(1);

      // Step 3: Enter room
      await studentPage.enterRoom();

      await studentPage.expectInRoomView();
      await studentPage.expectRoomName('React 스터디');
      await studentPage.expectMemberCount(1);

      // Step 4: Navigate through tabs
      await studentPage.switchToTab('matching');
      await studentPage.switchToTab('icebreaker');
      await studentPage.switchToTab('members');

      // Step 5: Open profile card
      await studentPage.openProfileCard();
      await studentPage.expectProfileCardVisible();
      await studentPage.closeProfileCard();

      // Step 6: Go back to room manager
      await studentPage.backButton.click();
      await studentPage.expectRoomManagerVisible();
    });
  });
});
