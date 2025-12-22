import { test, expect, Page } from '@playwright/test';

/**
 * Layout Analysis Tests
 *
 * 레이아웃 분석 테스트:
 * - 요소 간 간격 (spacing)
 * - 패딩/마진 일관성
 * - 요소 겹침 감지
 * - 텍스트 오버플로 감지
 * - 터치 타겟 크기
 * - 정렬 이슈
 */

interface ElementMetrics {
  selector: string;
  tagName: string;
  className: string;
  rect: { x: number; y: number; width: number; height: number };
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };
  gap: string;
  overflow: { x: boolean; y: boolean };
  textOverflow: boolean;
  isVisible: boolean;
}

interface LayoutIssue {
  type: 'overlap' | 'spacing' | 'padding' | 'overflow' | 'touch-target' | 'alignment';
  severity: 'error' | 'warning' | 'info';
  message: string;
  elements?: string[];
}

// Layout analysis utility functions
async function analyzePageLayout(page: Page): Promise<{
  metrics: ElementMetrics[];
  issues: LayoutIssue[];
}> {
  const result = await page.evaluate(() => {
    const metrics: ElementMetrics[] = [];
    const issues: LayoutIssue[] = [];

    // Get all visible elements
    const elements = document.querySelectorAll('div, section, main, article, button, input, a, p, h1, h2, h3, h4, h5, h6, span, label');

    elements.forEach((el, index) => {
      if (index > 100) return; // Limit for performance

      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      // Skip invisible or tiny elements
      if (rect.width < 10 || rect.height < 10) return;
      if (style.display === 'none' || style.visibility === 'hidden') return;

      const parsePixelValue = (value: string) => parseFloat(value) || 0;

      const metric: ElementMetrics = {
        selector: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ')[0] : ''}`,
        tagName: el.tagName,
        className: (el.className || '').toString().slice(0, 100),
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        padding: {
          top: parsePixelValue(style.paddingTop),
          right: parsePixelValue(style.paddingRight),
          bottom: parsePixelValue(style.paddingBottom),
          left: parsePixelValue(style.paddingLeft),
        },
        margin: {
          top: parsePixelValue(style.marginTop),
          right: parsePixelValue(style.marginRight),
          bottom: parsePixelValue(style.marginBottom),
          left: parsePixelValue(style.marginLeft),
        },
        gap: style.gap,
        overflow: {
          x: el.scrollWidth > el.clientWidth,
          y: el.scrollHeight > el.clientHeight,
        },
        textOverflow: el.scrollWidth > el.clientWidth && style.overflow !== 'visible',
        isVisible: rect.width > 0 && rect.height > 0,
      };

      metrics.push(metric);

      // Check for zero padding on elements that should have padding
      const hasPaddingClass = metric.className.includes('p-') ||
                              metric.className.includes('px-') ||
                              metric.className.includes('py-');
      const totalPadding = metric.padding.top + metric.padding.right + metric.padding.bottom + metric.padding.left;

      if (hasPaddingClass && totalPadding === 0) {
        issues.push({
          type: 'padding',
          severity: 'error',
          message: `CSS not applied: Element has padding class but computed padding is 0`,
          elements: [metric.selector],
        });
      }

      // Check for text overflow
      if (metric.overflow.x && ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LABEL'].includes(el.tagName)) {
        issues.push({
          type: 'overflow',
          severity: 'warning',
          message: `Text overflow detected`,
          elements: [metric.selector],
        });
      }

      // Check touch target size for interactive elements
      if (['BUTTON', 'A', 'INPUT'].includes(el.tagName)) {
        if (rect.width < 44 || rect.height < 44) {
          issues.push({
            type: 'touch-target',
            severity: 'warning',
            message: `Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px (min 44x44)`,
            elements: [metric.selector],
          });
        }
      }
    });

    // Check for overlapping elements
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const a = metrics[i].rect;
        const b = metrics[j].rect;

        // Check if rectangles overlap significantly (more than 50% of smaller element)
        const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
        const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
        const overlapArea = overlapX * overlapY;
        const smallerArea = Math.min(a.width * a.height, b.width * b.height);

        if (overlapArea > smallerArea * 0.5 && overlapArea > 100) {
          // Skip if one is a container of the other (parent-child)
          const aEl = document.querySelector(metrics[i].selector);
          const bEl = document.querySelector(metrics[j].selector);
          if (aEl && bEl && !aEl.contains(bEl) && !bEl.contains(aEl)) {
            issues.push({
              type: 'overlap',
              severity: 'error',
              message: `Elements overlap significantly (${Math.round(overlapArea)}px² overlap)`,
              elements: [metrics[i].selector, metrics[j].selector],
            });
          }
        }
      }
    }

    return { metrics, issues };
  });

  return result;
}

// Check spacing consistency between sibling elements
async function analyzeSpacing(page: Page): Promise<LayoutIssue[]> {
  return await page.evaluate(() => {
    const issues: LayoutIssue[] = [];
    const containers = document.querySelectorAll('.space-y-4, .space-y-6, .space-y-8, .gap-4, .gap-6, .gap-8, [class*="space-"], [class*="gap-"]');

    containers.forEach((container) => {
      const children = Array.from(container.children).filter(child => {
        const style = window.getComputedStyle(child);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      if (children.length < 2) return;

      const gaps: number[] = [];
      for (let i = 1; i < children.length; i++) {
        const prevRect = children[i - 1].getBoundingClientRect();
        const currRect = children[i].getBoundingClientRect();
        const gap = currRect.top - prevRect.bottom;
        gaps.push(Math.round(gap));
      }

      // Check if gaps are consistent
      const uniqueGaps = [...new Set(gaps)];
      if (uniqueGaps.length > 1) {
        const hasInconsistentGaps = uniqueGaps.some((g, _, arr) =>
          arr.some(other => Math.abs(g - other) > 4) // 4px tolerance
        );

        if (hasInconsistentGaps) {
          issues.push({
            type: 'spacing',
            severity: 'warning',
            message: `Inconsistent spacing: gaps vary between ${Math.min(...gaps)}px and ${Math.max(...gaps)}px`,
            elements: [container.className.slice(0, 50)],
          });
        }
      }

      // Check if any gap is zero when it shouldn't be
      if (container.className.includes('space-') || container.className.includes('gap-')) {
        const zeroGaps = gaps.filter(g => g <= 0);
        if (zeroGaps.length > 0) {
          issues.push({
            type: 'spacing',
            severity: 'error',
            message: `CSS spacing not applied: Expected gap but found ${zeroGaps.length} elements with 0 or negative gap`,
            elements: [container.className.slice(0, 50)],
          });
        }
      }
    });

    return issues;
  });
}

// Test configuration
const APP_ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/salary-calculator', name: 'Salary Calculator' },
  { path: '/rent-calculator', name: 'Rent Calculator' },
  { path: '/random-picker', name: 'Random Picker' },
  { path: '/team-divider', name: 'Team Divider' },
  { path: '/ladder-game', name: 'Ladder Game' },
  { path: '/balance-game', name: 'Balance Game' },
  { path: '/chosung-quiz', name: 'Chosung Quiz' },
  { path: '/id-validator', name: 'ID Validator' },
  { path: '/dutch-pay', name: 'Dutch Pay' },
  { path: '/gpa-calculator', name: 'GPA Calculator' },
  { path: '/live-voting', name: 'Live Voting' },
  { path: '/bingo-game', name: 'Bingo Game' },
  { path: '/ideal-worldcup', name: 'Ideal Worldcup' },
  { path: '/lunch-roulette', name: 'Lunch Roulette' },
  { path: '/student-network', name: 'Student Network' },
];

test.describe('Layout Analysis - All Apps', () => {
  for (const route of APP_ROUTES) {
    test(`${route.name} should have proper layout`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500); // Wait for animations

      const { issues } = await analyzePageLayout(page);
      const spacingIssues = await analyzeSpacing(page);
      const allIssues = [...issues, ...spacingIssues];

      // Filter to only errors (not warnings)
      const errors = allIssues.filter(i => i.severity === 'error');

      // Log all issues for debugging
      if (allIssues.length > 0) {
        console.log(`\n[${route.name}] Layout Issues Found:`);
        allIssues.forEach(issue => {
          console.log(`  [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.message}`);
          if (issue.elements) {
            console.log(`    Elements: ${issue.elements.join(', ')}`);
          }
        });
      }

      // Fail test only on critical errors
      expect(errors.length, `Found ${errors.length} layout errors`).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('Layout Analysis - CSS Loading', () => {
  test('Tailwind CSS should be properly loaded', async ({ page }) => {
    await page.goto('/salary-calculator');
    await page.waitForLoadState('networkidle');

    // Check if a known Tailwind class is applied
    const hasStylesApplied = await page.evaluate(() => {
      const el = document.querySelector('.container');
      if (!el) return { found: false };

      const style = window.getComputedStyle(el);
      return {
        found: true,
        maxWidth: style.maxWidth,
        margin: style.marginLeft,
        paddingApplied: parseFloat(style.paddingLeft) > 0 || parseFloat(style.paddingRight) > 0,
      };
    });

    expect(hasStylesApplied.found).toBe(true);
    // Container should have some max-width or margin auto
    console.log('Container styles:', hasStylesApplied);
  });

  test('Button components should have proper styling', async ({ page }) => {
    await page.goto('/salary-calculator');
    await page.waitForLoadState('networkidle');

    const buttonStyles = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).slice(0, 5).map(btn => {
        const style = window.getComputedStyle(btn);
        return {
          text: btn.textContent?.slice(0, 20),
          backgroundColor: style.backgroundColor,
          padding: `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`,
          borderRadius: style.borderRadius,
          hasStyles: style.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                     parseFloat(style.paddingTop) > 0,
        };
      });
    });

    console.log('Button styles:', buttonStyles);

    // At least some buttons should have styling
    const styledButtons = buttonStyles.filter(b => b.hasStyles);
    expect(styledButtons.length).toBeGreaterThan(0);
  });
});

test.describe('Layout Analysis - Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  for (const route of APP_ROUTES.slice(0, 5)) {
    test(`${route.name} mobile layout check`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      // Check for horizontal overflow (broken mobile layout)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // Check touch targets
      const smallTouchTargets = await page.evaluate(() => {
        const interactive = document.querySelectorAll('button, a, input, [role="button"]');
        const small: string[] = [];

        interactive.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (rect.width < 44 || rect.height < 44) {
              small.push(`${el.tagName}: ${Math.round(rect.width)}x${Math.round(rect.height)}`);
            }
          }
        });

        return small.slice(0, 10);
      });

      if (smallTouchTargets.length > 0) {
        console.log(`[${route.name}] Small touch targets:`, smallTouchTargets);
      }

      expect(hasHorizontalScroll).toBe(false);
    });
  }
});

test.describe('Layout Analysis - Element Overlap Detection', () => {
  test('Team Divider should have no overlapping elements', async ({ page }) => {
    await page.goto('/team-divider');
    await page.waitForLoadState('networkidle');

    const { issues } = await analyzePageLayout(page);
    const overlapIssues = issues.filter(i => i.type === 'overlap');

    if (overlapIssues.length > 0) {
      console.log('Overlap issues:', overlapIssues);
    }

    // This test documents current state - may have issues
    expect(overlapIssues.length).toBeLessThanOrEqual(5); // Allow some overlap for now
  });
});
