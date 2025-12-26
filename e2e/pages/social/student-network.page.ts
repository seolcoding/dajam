import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Student Network Page Object
 *
 * 테스트 시나리오:
 * - 프로필 생성 및 수정
 * - 교실(Room) 생성 및 참여
 * - QR 코드 표시
 * - 참여자 목록 확인
 * - 관심사 기반 매칭
 */
export class StudentNetworkPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ====================
  // Profile Form Locators
  // ====================
  get profileNameInput() {
    return this.page.getByLabel(/이름/i);
  }

  get profileTaglineInput() {
    return this.page.getByLabel(/한줄 소개/i);
  }

  get profileFieldSelect() {
    return this.page.locator('select#field-select');
  }

  get profileImageInput() {
    return this.page.locator('input[type="file"]');
  }

  get emailInput() {
    return this.page.getByPlaceholder(/이메일/i);
  }

  get githubInput() {
    return this.page.getByPlaceholder(/GitHub/i);
  }

  get linkedinInput() {
    return this.page.getByPlaceholder(/LinkedIn/i);
  }

  get websiteInput() {
    return this.page.getByPlaceholder(/웹사이트/i);
  }

  get createProfileButton() {
    return this.page.getByRole('button', { name: /프로필 생성하기/i });
  }

  // Interest tags
  get interestTagButtons() {
    return this.page.locator('button').filter({ hasText: /React|JavaScript|Python|AI|디자인/ });
  }

  get selectedInterestTags() {
    return this.page.locator('.bg-blue-600.text-white').filter({ hasText: /React|JavaScript|Python/ });
  }

  // ====================
  // Room Manager Locators
  // ====================
  get roomNameInput() {
    return this.page.getByPlaceholder(/교실 이름/i);
  }

  get createLocalRoomButton() {
    return this.page.getByRole('button', { name: /로컬 교실/i });
  }

  get createCloudRoomButton() {
    return this.page.getByRole('button', { name: /클라우드 교실/i });
  }

  get joinCodeInput() {
    return this.page.getByPlaceholder(/코드 입력/i);
  }

  get joinRoomButton() {
    return this.page.getByRole('button', { name: /참여하기/i });
  }

  get showCodeButton() {
    return this.page.getByRole('button', { name: /코드 보기/i }).first();
  }

  get hideCodeButton() {
    return this.page.getByRole('button', { name: /코드 숨기기/i }).first();
  }

  get copyCodeButton() {
    return this.page.getByRole('button', { name: /복사/i }).first();
  }

  get leaveRoomButton() {
    return this.page.getByRole('button', { name: /나가기/i }).first();
  }

  get enterRoomButton() {
    return this.page.getByRole('button', { name: /교실 입장하기/i }).first();
  }

  get roomCards() {
    return this.page.locator('.shadow-sm').filter({ hasText: /참여자.*명/ });
  }

  // ====================
  // Room View Locators
  // ====================
  get backButton() {
    return this.page.getByRole('button', { name: /뒤로가기/i });
  }

  get myProfileCardButton() {
    return this.page.getByRole('button', { name: /내 프로필 카드/i });
  }

  get profileCardModal() {
    return this.page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
  }

  get closeProfileCardButton() {
    return this.page.getByRole('button', { name: /닫기/i });
  }

  // Tabs
  get membersTab() {
    return this.page.getByRole('tab', { name: /참여자/i });
  }

  get matchingTab() {
    return this.page.getByRole('tab', { name: /관심사 매칭/i });
  }

  get icebreakerTab() {
    return this.page.getByRole('tab', { name: /아이스브레이킹/i });
  }

  // Member cards in room
  get memberCards() {
    return this.page.locator('.grid .rounded-lg').filter({ hasText: /.+/ });
  }

  // Settings
  get settingsButton() {
    return this.page.getByRole('button').filter({ has: this.page.locator('svg') }).first();
  }

  get exportDataButton() {
    return this.page.getByRole('button', { name: /데이터 백업/i });
  }

  get clearDataButton() {
    return this.page.getByRole('button', { name: /모든 데이터 삭제/i });
  }

  // ====================
  // Actions
  // ====================
  async goto() {
    await super.goto('/student-network');
  }

  /**
   * Create a complete profile with all required fields
   */
  async createProfile(data: {
    name: string;
    tagline: string;
    field: string;
    interests?: string[];
    email?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  }) {
    // Fill required fields
    await this.profileNameInput.fill(data.name);
    await this.profileTaglineInput.fill(data.tagline);
    await this.profileFieldSelect.selectOption(data.field);

    // Add interest tags
    if (data.interests && data.interests.length > 0) {
      for (const interest of data.interests.slice(0, 5)) {
        const tagButton = this.page.getByRole('button', { name: interest, exact: true });
        if (await tagButton.isVisible()) {
          await tagButton.click();
          await this.waitForAnimation(100);
        }
      }
    }

    // Fill optional contact fields
    if (data.email) {
      await this.emailInput.fill(data.email);
    }
    if (data.github) {
      await this.githubInput.fill(data.github);
    }
    if (data.linkedin) {
      await this.linkedinInput.fill(data.linkedin);
    }
    if (data.website) {
      await this.websiteInput.fill(data.website);
    }

    // Submit form
    await this.createProfileButton.click();
    await this.waitForAnimation(500);
  }

  /**
   * Create a local room
   */
  async createLocalRoom(roomName: string) {
    await this.roomNameInput.fill(roomName);
    await this.createLocalRoomButton.click();
    await this.waitForAnimation(300);
  }

  /**
   * Create a cloud room
   */
  async createCloudRoom(roomName: string) {
    await this.roomNameInput.fill(roomName);
    await this.createCloudRoomButton.click();
    await this.waitForAnimation(500);
  }

  /**
   * Join a room with code
   */
  async joinRoom(code: string) {
    await this.joinCodeInput.fill(code);
    await this.joinRoomButton.click();
    await this.waitForAnimation(500);
  }

  /**
   * Show room code
   */
  async showRoomCode() {
    await this.showCodeButton.click();
    await this.waitForAnimation(200);
  }

  /**
   * Get room code from UI
   */
  async getRoomCode(): Promise<string> {
    await this.showRoomCode();
    const codeElement = this.page.locator('.font-mono.text-2xl.font-bold');
    return await codeElement.textContent() || '';
  }

  /**
   * Enter a room
   */
  async enterRoom() {
    await this.enterRoomButton.click();
    await this.waitForAnimation(500);
  }

  /**
   * Leave a room
   */
  async leaveRoom() {
    await this.leaveRoomButton.click();
    await this.waitForAnimation(300);
  }

  /**
   * Open profile card modal
   */
  async openProfileCard() {
    await this.myProfileCardButton.click();
    await this.waitForAnimation(200);
  }

  /**
   * Close profile card modal
   */
  async closeProfileCard() {
    await this.closeProfileCardButton.click();
    await this.waitForAnimation(200);
  }

  /**
   * Switch to a tab in room view
   */
  async switchToTab(tab: 'members' | 'matching' | 'icebreaker') {
    switch (tab) {
      case 'members':
        await this.membersTab.click();
        break;
      case 'matching':
        await this.matchingTab.click();
        break;
      case 'icebreaker':
        await this.icebreakerTab.click();
        break;
    }
    await this.waitForAnimation(200);
  }

  // ====================
  // Assertions
  // ====================

  /**
   * Expect profile form to be visible
   */
  async expectProfileFormVisible() {
    await expect(this.profileNameInput).toBeVisible();
    await expect(this.profileTaglineInput).toBeVisible();
    await expect(this.profileFieldSelect).toBeVisible();
    await expect(this.createProfileButton).toBeVisible();
  }

  /**
   * Expect room manager to be visible
   */
  async expectRoomManagerVisible() {
    await expect(this.roomNameInput).toBeVisible();
    await expect(this.createLocalRoomButton).toBeVisible();
    await expect(this.joinCodeInput).toBeVisible();
  }

  /**
   * Expect room code to be visible
   */
  async expectRoomCodeVisible() {
    await this.showRoomCode();
    const codeElement = this.page.locator('.font-mono.text-2xl.font-bold');
    await expect(codeElement).toBeVisible();
  }

  /**
   * Expect specific number of room cards
   */
  async expectRoomCount(count: number) {
    await expect(this.roomCards).toHaveCount(count);
  }

  /**
   * Expect specific number of members in room
   */
  async expectMemberCount(count: number) {
    const memberCountText = this.page.locator('text=/참여자.*명/').first();
    await expect(memberCountText).toContainText(`${count}명`);
  }

  /**
   * Expect profile card modal to be visible
   */
  async expectProfileCardVisible() {
    await expect(this.profileCardModal).toBeVisible();
  }

  /**
   * Expect to be in room view
   */
  async expectInRoomView() {
    await expect(this.backButton).toBeVisible();
    await expect(this.membersTab).toBeVisible();
  }

  /**
   * Expect specific interest tag to be selected
   */
  async expectInterestSelected(interest: string) {
    const selectedTag = this.page.locator('.bg-blue-600.text-white').filter({ hasText: interest });
    await expect(selectedTag).toBeVisible();
  }

  /**
   * Expect room to have specific name
   */
  async expectRoomName(name: string) {
    await expect(this.page.getByRole('heading', { name })).toBeVisible();
  }
}
