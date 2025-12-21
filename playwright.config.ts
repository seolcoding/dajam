import { defineConfig, devices } from '@playwright/test';

/**
 * Mini Apps Playwright E2E Test Configuration
 *
 * 각 앱은 개발 서버에서 동적 포트를 사용하므로,
 * 테스트 전에 앱을 수동으로 실행하거나 CI에서 빌드된 파일을 사용합니다.
 *
 * 로컬 개발: pnpm --filter {app-name} dev
 * 테스트 실행: pnpm test
 */

// 앱별 포트 매핑 (개발 서버 기본 포트: 5173)
const APP_PORTS: Record<string, number> = {
  'ideal-worldcup': 5173,
  'balance-game': 5174,
  'chosung-quiz': 5175,
  'bingo-game': 5176,
  'lunch-roulette': 5177,
  'random-picker': 5178,
  'ladder-game': 5179,
  'team-divider': 5180,
  'salary-calculator': 5181,
  'rent-calculator': 5182,
  'gpa-calculator': 5183,
  'id-validator': 5184,
  'live-voting': 5185,
  'group-order': 5186,
  'dutch-pay': 5187,
  'student-network': 5188,
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 30000,

  use: {
    // 기본 URL은 테스트 파일에서 앱별로 설정
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],

  // 테스트 전 앱 서버를 시작하려면 주석 해제
  // CI 환경에서는 빌드된 정적 파일을 serve하는 것을 권장
  // webServer: {
  //   command: 'pnpm --filter ideal-worldcup dev',
  //   url: 'http://localhost:5173/mini-apps/ideal-worldcup/',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});

// 앱 URL 헬퍼 함수 export
export function getAppUrl(appName: string): string {
  const port = APP_PORTS[appName] || 5173;
  return `http://localhost:${port}/mini-apps/${appName}/`;
}

export { APP_PORTS };
