import { defineConfig, devices } from '@playwright/test';

/**
 * SeolCoding Apps - Playwright E2E Test Configuration
 *
 * Next.js 15 App Router 기반 통합 테스트 설정
 * - 시나리오 테스트: 사용자 플로우 검증
 * - UI 테스트: 컴포넌트 렌더링 검증
 * - 스마트 테스트: 접근성, 반응형, 성능
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const IS_DEPLOYED_TEST = BASE_URL !== 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile devices
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],

  // Next.js dev server - disabled when testing against deployed version
  webServer: IS_DEPLOYED_TEST
    ? undefined
    : {
        command: 'npm run dev',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});

// App routes for testing
export const APP_ROUTES = {
  home: '/',
  balanceGame: '/balance-game',
  bingoGame: '/bingo-game',
  chosungQuiz: '/chosung-quiz',
  dutchPay: '/dutch-pay',
  gpaCalculator: '/gpa-calculator',
  groupOrder: '/group-order',
  idValidator: '/id-validator',
  idealWorldcup: '/ideal-worldcup',
  ladderGame: '/ladder-game',
  liveVoting: '/live-voting',
  lunchRoulette: '/lunch-roulette',
  randomPicker: '/random-picker',
  rentCalculator: '/rent-calculator',
  salaryCalculator: '/salary-calculator',
  studentNetwork: '/student-network',
  teamDivider: '/team-divider',
} as const;

export type AppRoute = keyof typeof APP_ROUTES;
