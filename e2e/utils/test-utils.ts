import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Test utilities for SeolCoding Apps
 */

// Accessibility testing
export async function checkAccessibility(page: Page, options?: {
  disableRules?: string[];
  includeSelectors?: string[];
}) {
  let axeBuilder = new AxeBuilder({ page });

  if (options?.disableRules) {
    axeBuilder = axeBuilder.disableRules(options.disableRules);
  }

  if (options?.includeSelectors) {
    axeBuilder = axeBuilder.include(options.includeSelectors);
  }

  const results = await axeBuilder.analyze();

  return {
    violations: results.violations,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    hasViolations: results.violations.length > 0,
  };
}

// Responsive testing
export async function testResponsive(page: Page, route: string, viewports: {
  name: string;
  width: number;
  height: number;
}[]) {
  const results: { name: string; success: boolean; error?: string }[] = [];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    try {
      // Check no horizontal scrollbar
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        results.push({
          name: viewport.name,
          success: false,
          error: 'Horizontal scroll detected',
        });
        continue;
      }

      // Check main content is visible
      const mainContent = page.locator('main, [role="main"], .container, #__next > div');
      await expect(mainContent.first()).toBeVisible();

      results.push({ name: viewport.name, success: true });
    } catch (error) {
      results.push({
        name: viewport.name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

// Common viewport configurations
export const VIEWPORTS = {
  mobile: { name: 'mobile', width: 375, height: 667 },
  tablet: { name: 'tablet', width: 768, height: 1024 },
  desktop: { name: 'desktop', width: 1280, height: 720 },
  widescreen: { name: 'widescreen', width: 1920, height: 1080 },
};

// Performance measurement
export async function measurePerformance(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      loadComplete: navigation.loadEventEnd - navigation.startTime,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    };
  });

  return metrics;
}

// Form testing helpers
export async function fillForm(page: Page, data: Record<string, string>) {
  for (const [name, value] of Object.entries(data)) {
    const input = page.locator(`[name="${name}"], [aria-label="${name}"], label:has-text("${name}") + input, label:has-text("${name}") + select`);

    const tagName = await input.evaluate(el => el.tagName.toLowerCase());

    if (tagName === 'select') {
      await input.selectOption(value);
    } else if (tagName === 'input') {
      const type = await input.getAttribute('type');
      if (type === 'checkbox' || type === 'radio') {
        if (value === 'true') {
          await input.check();
        }
      } else {
        await input.fill(value);
      }
    } else {
      await input.fill(value);
    }
  }
}

// Random data generators for testing
export const testData = {
  koreanName: () => {
    const surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
    const names = ['민수', '영희', '철수', '수진', '지훈', '미영', '성민', '은지'];
    return surnames[Math.floor(Math.random() * surnames.length)] +
           names[Math.floor(Math.random() * names.length)];
  },

  randomNumber: (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomAmount: () => {
    return (Math.floor(Math.random() * 100) + 1) * 1000;
  },

  randomItems: (items: string[], count: number) => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },
};

// Wait for specific conditions
export async function waitForCondition(
  page: Page,
  condition: () => Promise<boolean>,
  options?: { timeout?: number; interval?: number }
) {
  const timeout = options?.timeout || 10000;
  const interval = options?.interval || 100;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await page.waitForTimeout(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

// Console error collector
export function collectConsoleErrors(page: Page) {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  return () => errors;
}
