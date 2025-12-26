import { test, expect } from '@playwright/test';
import {
  validateAboveTheFold,
  validateAllVisibleInViewport,
  validateSidebarLayout,
  validateChatLayout,
  validateSlideLayout,
  validateGridLayout,
  detectLayoutType,
  validatePageLayout,
  generateLayoutReport,
  type LayoutValidationResult,
} from '../utils/layout-validator';

/**
 * Layout Validation Tests (범용 레이아웃 검증)
 *
 * 다양한 UI 패턴에 대한 레이아웃 검증:
 * 1. Above-the-fold - 주요 콘텐츠가 스크롤 없이 보이는지
 * 2. Sidebar Layout - 대시보드 사이드바 + 메인 레이아웃
 * 3. Chat UI - 채팅 인터페이스 레이아웃
 * 4. Slide/Presentation - 슬라이드 UI 레이아웃
 * 5. Grid/Gallery - 카드 그리드 레이아웃
 */

// =============================================================================
// 1. Dashboard Layout Tests (사이드바 + 메인)
// =============================================================================
test.describe('Layout Validation - Dashboard (Sidebar)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Dashboard main content should be visible without scrolling', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const result = await validateSidebarLayout(page, {
      sidebarSelector: 'aside',
      mainSelector: 'main',
    });

    console.log(generateLayoutReport(result, 'Dashboard'));

    // 주요 검증: 메인 콘텐츠가 뷰포트 상단 30% 내에 있어야 함
    expect(result.passed, `Sidebar layout issues: ${result.issues.map(i => i.message).join(', ')}`).toBe(true);
    expect(result.metrics.mainContentY).toBeLessThan(result.metrics.viewportHeight * 0.3);
  });

  test('Dashboard sidebar should be horizontally aligned with main content', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const result = await validateSidebarLayout(page);

    // 사이드바와 메인이 수직으로 쌓이면 안 됨
    const alignmentIssue = result.issues.find(i => i.message.includes('not horizontally aligned'));
    expect(alignmentIssue).toBeUndefined();
  });

  test('Dashboard settings page layout check', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const result = await validateSidebarLayout(page);
    console.log(generateLayoutReport(result, 'Dashboard Settings'));

    expect(result.passed).toBe(true);
  });

  test('Dashboard my-sessions page layout check', async ({ page }) => {
    await page.goto('/dashboard/my-sessions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const result = await validateSidebarLayout(page);
    console.log(generateLayoutReport(result, 'Dashboard My Sessions'));

    expect(result.passed).toBe(true);
  });
});

// =============================================================================
// 2. Individual App Tests (Above-the-fold)
// =============================================================================
test.describe('Layout Validation - Individual Apps', () => {
  const APP_ROUTES = [
    '/salary-calculator',
    '/rent-calculator',
    '/gpa-calculator',
    '/random-picker',
    '/team-divider',
    '/ladder-game',
    '/balance-game',
    '/chosung-quiz',
    '/dutch-pay',
    '/live-voting',
    '/bingo-game',
    '/ideal-worldcup',
  ];

  for (const route of APP_ROUTES) {
    const appName = route.slice(1).split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');

    test(`${appName} - main content above the fold`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      // 첫 번째 h1 또는 h2가 보일 때까지 대기
      const heading = page.locator('h1, h2').first();
      await heading.waitFor({ state: 'visible', timeout: 10000 });

      const headingBox = await heading.boundingBox();
      const viewport = page.viewportSize();

      expect(headingBox).not.toBeNull();
      expect(viewport).not.toBeNull();

      // 제목이 뷰포트 상단 50% 내에 있어야 함
      const maxY = viewport!.height * 0.5;
      expect(
        headingBox!.y,
        `${appName}: Heading pushed too far down (Y=${headingBox!.y}px, max=${maxY}px)`
      ).toBeLessThan(maxY);
    });
  }

  test('All apps should have critical elements visible', async ({ page }) => {
    const criticalSelectors = [
      'h1, h2, [class*="title"], [class*="Title"]',
      'button, [role="button"]',
      'form, input, [class*="card"], [class*="Card"]',
    ];

    await page.goto('/salary-calculator');
    await page.waitForLoadState('networkidle');

    const result = await validateAllVisibleInViewport(page, criticalSelectors);
    console.log(generateLayoutReport(result, 'Critical Elements'));

    // 최소한 에러가 없어야 함 (경고는 허용)
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });
});

// =============================================================================
// 3. Mobile Responsive Tests
// =============================================================================
test.describe('Layout Validation - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  const MOBILE_PRIORITY_APPS = [
    { path: '/salary-calculator', name: 'Salary Calculator' },
    { path: '/random-picker', name: 'Random Picker' },
    { path: '/live-voting', name: 'Live Voting' },
    { path: '/balance-game', name: 'Balance Game' },
  ];

  for (const route of MOBILE_PRIORITY_APPS) {
    test(`${route.name} mobile - content above fold`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      // 모바일에서는 50% 기준 (헤더가 더 클 수 있음)
      const result = await validateAboveTheFold(page, '.container, main, #root > div', 0.5);

      if (!result.passed) {
        console.log(generateLayoutReport(result, `${route.name} (Mobile)`));
      }

      // 모바일에서도 메인 콘텐츠는 뷰포트의 60% 이내에 있어야 함
      if (result.metrics.mainContentY > 0) {
        expect(result.metrics.mainContentY).toBeLessThan(result.metrics.viewportHeight * 0.6);
      }
    });
  }

  test('Dashboard mobile - sidebar hidden, main visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 모바일에서 사이드바는 숨겨져야 함
    const sidebar = page.locator('aside').first();
    const sidebarBox = await sidebar.boundingBox();

    // 사이드바가 화면 밖에 있거나 보이지 않아야 함
    if (sidebarBox) {
      expect(sidebarBox.x).toBeLessThan(0); // 화면 왼쪽 밖
    }

    // 메인 콘텐츠는 보여야 함
    const main = page.locator('main').first();
    const mainBox = await main.boundingBox();
    expect(mainBox).not.toBeNull();
    expect(mainBox!.y).toBeLessThan(400);
  });
});

// =============================================================================
// 4. Grid Layout Tests (App Gallery)
// =============================================================================
test.describe('Layout Validation - Grid Layout', () => {
  test('Home page app grid should not have overlapping cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    const result = await validateGridLayout(page, {
      containerSelector: '.grid, [class*="grid-cols"]',
      itemSelector: '.grid > a, .grid > div',
    });

    console.log(generateLayoutReport(result, 'App Grid'));

    // 그리드 아이템 겹침 없어야 함
    const overlapIssues = result.issues.filter(i => i.type === 'overlap');
    expect(overlapIssues.length).toBe(0);
  });

  test('App gallery grid responsive columns', async ({ page }) => {
    await page.goto('/apps');
    await page.waitForLoadState('networkidle');

    // Desktop: 3-4 columns expected
    await page.setViewportSize({ width: 1280, height: 800 });
    const desktopResult = await validateGridLayout(page);

    // Mobile: 1-2 columns expected
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    const mobileResult = await validateGridLayout(page);

    console.log('Desktop:', generateLayoutReport(desktopResult, 'Grid Desktop'));
    console.log('Mobile:', generateLayoutReport(mobileResult, 'Grid Mobile'));

    // 양쪽 다 에러 없어야 함
    expect(desktopResult.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(mobileResult.issues.filter(i => i.severity === 'error').length).toBe(0);
  });
});

// =============================================================================
// 5. Chat UI Tests (Live Voting, Student Network)
// =============================================================================
test.describe('Layout Validation - Chat UI', () => {
  test('Live Voting host view - input should be accessible', async ({ page }) => {
    await page.goto('/live-voting');
    await page.waitForLoadState('networkidle');

    // 투표 생성 화면에서 입력창 확인
    const result = await validateChatLayout(page, {
      containerSelector: '.container, main',
      inputSelector: 'input, textarea',
      sendButtonSelector: 'button[type="submit"], button:has-text("생성"), button:has-text("시작")',
    });

    // 입력 요소가 뷰포트 내에 있어야 함
    if (result.issues.length > 0) {
      console.log(generateLayoutReport(result, 'Live Voting'));
    }

    // 입력창이 보이지 않는 에러가 없어야 함
    const inputBelowViewport = result.issues.find(i =>
      i.message.includes('input') && i.message.includes('below viewport')
    );
    expect(inputBelowViewport).toBeUndefined();
  });

  test('Student Network - input form visible', async ({ page }) => {
    await page.goto('/student-network');
    await page.waitForLoadState('networkidle');

    const result = await validateChatLayout(page, {
      containerSelector: '.container, main',
      inputSelector: 'input[type="text"], textarea',
    });

    // 최소한 입력 관련 에러가 없어야 함
    const errors = result.issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      console.log(generateLayoutReport(result, 'Student Network'));
    }

    // 채팅 스타일 UI가 아니면 에러 허용
    expect(errors.filter(i => i.message.includes('input')).length).toBeLessThanOrEqual(1);
  });
});

// =============================================================================
// 6. Slide/Presentation Layout Tests
// =============================================================================
test.describe('Layout Validation - Slide UI', () => {
  test('Balance Game - cards should be prominently visible', async ({ page }) => {
    await page.goto('/balance-game');
    await page.waitForLoadState('networkidle');

    const result = await validateSlideLayout(page, {
      slideSelector: '[class*="card"], [class*="Card"], .slide, main > div',
      controlsSelector: 'button, [role="button"]',
    });

    console.log(generateLayoutReport(result, 'Balance Game'));

    // 슬라이드/카드가 너무 아래에 있으면 안 됨
    if (result.metrics.mainContentY > 0) {
      expect(result.metrics.mainContentY).toBeLessThan(result.metrics.viewportHeight * 0.3);
    }
  });

  test('Ideal Worldcup - options should be visible', async ({ page }) => {
    await page.goto('/ideal-worldcup');
    await page.waitForLoadState('networkidle');

    const result = await validateSlideLayout(page, {
      slideSelector: '.container, main, [class*="card"]',
      controlsSelector: 'button',
    });

    if (!result.passed) {
      console.log(generateLayoutReport(result, 'Ideal Worldcup'));
    }

    // 심각한 위치 에러 없어야 함
    const positionErrors = result.issues.filter(i => i.type === 'position' && i.severity === 'error');
    expect(positionErrors.length).toBe(0);
  });

  test('Bingo Game - grid should be visible', async ({ page }) => {
    await page.goto('/bingo-game');
    await page.waitForLoadState('networkidle');

    const result = await validateSlideLayout(page, {
      slideSelector: '.grid, [class*="bingo"], main',
    });

    console.log(generateLayoutReport(result, 'Bingo Game'));

    // 빙고 그리드가 뷰포트 상단에 있어야 함
    expect(result.metrics.mainContentY).toBeLessThan(result.metrics.viewportHeight * 0.4);
  });
});

// =============================================================================
// 7. Auto-Detection Tests
// =============================================================================
test.describe('Layout Validation - Auto Detection', () => {
  test('Detect dashboard as sidebar layout', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const layoutType = await detectLayoutType(page);
    expect(layoutType).toBe('sidebar');

    // 자동 검증도 통과해야 함
    const result = await validatePageLayout(page);
    expect(result.passed).toBe(true);
  });

  test('Detect home page as grid layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const layoutType = await detectLayoutType(page);
    // 홈페이지는 그리드 또는 simple일 수 있음
    expect(['grid', 'simple']).toContain(layoutType);
  });

  test('Auto-validate all major pages', async ({ page }) => {
    const pages = [
      { path: '/', name: 'Home' },
      { path: '/salary-calculator', name: 'Salary Calculator' },
      { path: '/random-picker', name: 'Random Picker' },
      { path: '/balance-game', name: 'Balance Game' },
    ];

    const results: { name: string; passed: boolean; type: string }[] = [];

    for (const p of pages) {
      await page.goto(p.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(200);

      const layoutType = await detectLayoutType(page);
      const result = await validatePageLayout(page);

      results.push({
        name: p.name,
        passed: result.passed,
        type: layoutType,
      });
    }

    console.log('\n📐 Auto Layout Validation Results:');
    console.log('─'.repeat(50));
    results.forEach(r => {
      const icon = r.passed ? '✅' : '❌';
      console.log(`${icon} ${r.name}: ${r.type} layout`);
    });

    // 최소 75%는 통과해야 함
    const passedCount = results.filter(r => r.passed).length;
    expect(passedCount).toBeGreaterThanOrEqual(Math.floor(pages.length * 0.75));
  });
});

// =============================================================================
// 8. Regression Tests (이전에 발견된 버그 재발 방지)
// =============================================================================
test.describe('Layout Validation - Regression Prevention', () => {
  test('REGRESSION: Dashboard content should not be pushed down by sidebar', async ({ page }) => {
    // 이슈: 사이드바와 메인 콘텐츠가 수직으로 쌓이는 버그
    // 수정: DashboardLayout.tsx에 flex 추가, DashboardSidebar.tsx CSS 수정

    // 뷰포트를 먼저 설정 (데스크탑 크기)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 사이드바가 보일 때까지 대기
    const sidebar = page.locator('aside:visible').first();
    const main = page.locator('main').first();

    await sidebar.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(300); // CSS 레이아웃 안정화

    const sidebarBox = await sidebar.boundingBox();
    const mainBox = await main.boundingBox();

    // 둘 다 보여야 함
    expect(sidebarBox).not.toBeNull();
    expect(mainBox).not.toBeNull();

    // Y 좌표가 비슷해야 함 (수평 배치)
    const yDiff = Math.abs((sidebarBox?.y ?? 0) - (mainBox?.y ?? 0));
    expect(yDiff, 'Sidebar and main should be horizontally aligned').toBeLessThan(100);

    // 메인 콘텐츠가 뷰포트 상단 근처에 있어야 함
    expect(mainBox?.y, 'Main content should be near top of viewport').toBeLessThan(200);
  });

  test('REGRESSION: Mobile sidebar should not push content down', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    const main = page.locator('main').first();
    const mainBox = await main.boundingBox();

    expect(mainBox).not.toBeNull();
    // 모바일에서 메인 콘텐츠가 너무 아래에 있으면 안 됨
    expect(mainBox?.y, 'Main content pushed too far down on mobile').toBeLessThan(400);
  });
});

// =============================================================================
// 9. Comprehensive Layout Audit
// =============================================================================
test.describe('Layout Validation - Full Audit', () => {
  test('Complete layout audit for critical pages', async ({ page }) => {
    const criticalPages = [
      { path: '/dashboard', name: 'Dashboard', expectedType: 'sidebar' as const },
      { path: '/salary-calculator', name: 'Salary Calculator', expectedType: 'simple' as const },
      { path: '/', name: 'Home', expectedType: 'grid' as const },
    ];

    console.log('\n' + '═'.repeat(70));
    console.log('📋 COMPREHENSIVE LAYOUT AUDIT');
    console.log('═'.repeat(70));

    const auditResults: { page: string; passed: boolean; issues: number }[] = [];

    for (const p of criticalPages) {
      await page.goto(p.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      const result = await validatePageLayout(page);
      console.log(generateLayoutReport(result, p.name));

      auditResults.push({
        page: p.name,
        passed: result.passed,
        issues: result.issues.length,
      });
    }

    console.log('\n📊 AUDIT SUMMARY');
    console.log('─'.repeat(50));
    auditResults.forEach(r => {
      const icon = r.passed ? '✅' : '❌';
      console.log(`${icon} ${r.page}: ${r.issues} issues`);
    });

    const totalIssues = auditResults.reduce((sum, r) => sum + (r.passed ? 0 : 1), 0);
    console.log(`\n🎯 Pages with issues: ${totalIssues}/${auditResults.length}`);
    console.log('═'.repeat(70));

    // 모든 critical 페이지가 통과해야 함
    expect(totalIssues).toBe(0);
  });
});
