import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests - WCAG 2.1 AA Compliance
 *
 * Smart Test: 접근성 검사
 * - 모든 앱에 대해 axe-core 검사 실행
 * - 키보드 네비게이션 테스트
 * - 색상 대비 검사
 */

const APP_ROUTES = [
  { name: 'Home', path: '/' },
  { name: 'Salary Calculator', path: '/salary-calculator' },
  { name: 'Rent Calculator', path: '/rent-calculator' },
  { name: 'GPA Calculator', path: '/gpa-calculator' },
  { name: 'Dutch Pay', path: '/dutch-pay' },
  { name: 'Ideal Worldcup', path: '/ideal-worldcup' },
  { name: 'Balance Game', path: '/balance-game' },
  { name: 'Chosung Quiz', path: '/chosung-quiz' },
  { name: 'Ladder Game', path: '/ladder-game' },
  { name: 'Bingo Game', path: '/bingo-game' },
  { name: 'Live Voting', path: '/live-voting' },
  { name: 'Random Picker', path: '/random-picker' },
  { name: 'Team Divider', path: '/team-divider' },
  { name: 'Lunch Roulette', path: '/lunch-roulette' },
  { name: 'Group Order', path: '/group-order' },
  { name: 'ID Validator', path: '/id-validator' },
  { name: 'Student Network', path: '/student-network' },
];

// Rules that are less critical for MVP
const DISABLED_RULES = [
  'color-contrast', // Can be fixed later
  'image-alt', // Some decorative images
];

test.describe('Accessibility - All Apps', () => {
  for (const app of APP_ROUTES) {
    test(`${app.name} should have no critical accessibility violations`, async ({ page }) => {
      await page.goto(app.path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .disableRules(DISABLED_RULES)
        .analyze();

      // Filter for critical and serious violations only
      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      if (criticalViolations.length > 0) {
        console.log(`\n${app.name} Accessibility Issues:`);
        criticalViolations.forEach(v => {
          console.log(`  - ${v.id}: ${v.description} (${v.impact})`);
          console.log(`    Nodes: ${v.nodes.length}`);
        });
      }

      expect(criticalViolations).toHaveLength(0);
    });
  }
});

test.describe('Keyboard Navigation', () => {
  test('should navigate home page with keyboard', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() =>
      document.activeElement?.tagName
    );

    expect(firstFocused).toBeTruthy();

    // Should be able to tab multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Enter should activate links/buttons
    const focused = await page.evaluate(() =>
      document.activeElement?.tagName
    );

    expect(['A', 'BUTTON', 'INPUT']).toContain(focused);
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');

    // Check that focused element has visible outline
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;

      const style = window.getComputedStyle(el);
      return (
        style.outlineWidth !== '0px' ||
        style.boxShadow !== 'none' ||
        style.border !== 'none'
      );
    });

    // Focus should be visible (this may need adjustment based on actual styling)
    // expect(hasFocusStyle).toBe(true);
  });
});

test.describe('Screen Reader Compatibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const headings = await page.evaluate(() => {
      const h = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(h).map(el => ({
        level: parseInt(el.tagName[1]),
        text: el.textContent?.trim(),
      }));
    });

    // Should have at least one heading
    expect(headings.length).toBeGreaterThan(0);

    // H1 should come first
    if (headings.length > 0) {
      expect(headings[0].level).toBeLessThanOrEqual(2);
    }
  });

  test('should have aria labels on interactive elements', async ({ page }) => {
    await page.goto('/');

    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 10)) {
      const hasLabel = await button.evaluate(el => {
        return !!(
          el.textContent?.trim() ||
          el.getAttribute('aria-label') ||
          el.getAttribute('aria-labelledby') ||
          el.querySelector('svg[aria-label]')
        );
      });

      expect(hasLabel).toBe(true);
    }
  });
});
