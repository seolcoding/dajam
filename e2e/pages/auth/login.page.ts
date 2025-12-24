import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Login Page Object
 *
 * Handles login page interactions and assertions
 */
export class LoginPage extends BasePage {
  // Locators
  readonly loginCard: Locator;
  readonly loginTitle: Locator;
  readonly kakaoButton: Locator;
  readonly googleButton: Locator;
  readonly termsLink: Locator;
  readonly privacyLink: Locator;

  constructor(page: Page) {
    super(page);
    this.loginCard = page.locator('[class*="CardContent"]').first();
    // The login title is in a CardTitle (div), not a heading element
    this.loginTitle = page.getByText('로그인', { exact: true }).first();
    this.kakaoButton = page.getByRole('button', { name: /카카오로 시작하기/i });
    this.googleButton = page.getByRole('button', { name: /Google로 시작하기/i });
    this.termsLink = page.getByRole('link', { name: '이용약관' });
    this.privacyLink = page.getByRole('link', { name: '개인정보처리방침' });
  }

  async goto() {
    await super.goto('/login');
  }

  // Assertions
  async expectLoginPageVisible() {
    await expect(this.loginTitle).toBeVisible();
  }

  async expectKakaoButtonVisible() {
    await expect(this.kakaoButton).toBeVisible();
  }

  async expectGoogleButtonVisible() {
    await expect(this.googleButton).toBeVisible();
  }

  async expectOAuthButtonsEnabled() {
    await expect(this.kakaoButton).toBeEnabled();
    await expect(this.googleButton).toBeEnabled();
  }

  async expectTermsAndPrivacyLinks() {
    await expect(this.termsLink).toBeVisible();
    await expect(this.privacyLink).toBeVisible();
  }

  // Actions
  async clickKakaoLogin() {
    await this.kakaoButton.click();
  }

  async clickGoogleLogin() {
    await this.googleButton.click();
  }

  async clickTermsLink() {
    await this.termsLink.click();
  }

  async clickPrivacyLink() {
    await this.privacyLink.click();
  }
}
