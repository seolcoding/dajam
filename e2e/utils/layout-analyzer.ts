import { Page } from '@playwright/test';

/**
 * Layout Analyzer Utility
 *
 * 재사용 가능한 레이아웃 분석 도구
 * - 요소 메트릭 수집
 * - 간격 분석
 * - 겹침 감지
 * - CSS 적용 확인
 */

export interface ElementMetrics {
  selector: string;
  tagName: string;
  className: string;
  rect: DOMRect;
  computedStyles: {
    padding: { top: number; right: number; bottom: number; left: number };
    margin: { top: number; right: number; bottom: number; left: number };
    gap: string;
    display: string;
    position: string;
  };
  issues: string[];
}

export interface LayoutReport {
  url: string;
  timestamp: string;
  viewport: { width: number; height: number };
  metrics: {
    totalElements: number;
    interactiveElements: number;
    containersWithGap: number;
  };
  issues: LayoutIssue[];
  cssStatus: CSSStatus;
}

export interface LayoutIssue {
  type: 'overlap' | 'spacing' | 'padding' | 'overflow' | 'touch-target' | 'alignment' | 'css-not-applied';
  severity: 'error' | 'warning' | 'info';
  message: string;
  selector?: string;
  expected?: string;
  actual?: string;
}

export interface CSSStatus {
  tailwindLoaded: boolean;
  customCSSLoaded: boolean;
  issues: string[];
}

export class LayoutAnalyzer {
  constructor(private page: Page) {}

  /**
   * 전체 레이아웃 분석 실행
   */
  async analyze(): Promise<LayoutReport> {
    const url = this.page.url();
    const viewport = this.page.viewportSize() || { width: 0, height: 0 };

    const [elementData, cssStatus] = await Promise.all([
      this.collectElementData(),
      this.checkCSSStatus(),
    ]);

    const issues = [
      ...this.detectOverlaps(elementData.elements),
      ...this.detectSpacingIssues(elementData.spacingContainers),
      ...this.detectCSSIssues(elementData.elements),
      ...this.detectTouchTargetIssues(elementData.interactiveElements),
    ];

    return {
      url,
      timestamp: new Date().toISOString(),
      viewport,
      metrics: {
        totalElements: elementData.elements.length,
        interactiveElements: elementData.interactiveElements.length,
        containersWithGap: elementData.spacingContainers.length,
      },
      issues,
      cssStatus,
    };
  }

  /**
   * 요소 데이터 수집
   */
  private async collectElementData() {
    return await this.page.evaluate(() => {
      const parsePixel = (v: string) => parseFloat(v) || 0;

      // 모든 주요 요소 수집
      const allElements = document.querySelectorAll('div, section, main, article, button, input, a, p, h1, h2, h3, span');
      const elements: any[] = [];
      const interactiveElements: any[] = [];
      const spacingContainers: any[] = [];

      allElements.forEach((el, i) => {
        if (i > 150) return;

        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        if (rect.width < 5 || rect.height < 5) return;
        if (style.display === 'none') return;

        const elementInfo = {
          selector: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`,
          tagName: el.tagName,
          className: (el.className || '').toString(),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          padding: {
            top: parsePixel(style.paddingTop),
            right: parsePixel(style.paddingRight),
            bottom: parsePixel(style.paddingBottom),
            left: parsePixel(style.paddingLeft),
          },
          margin: {
            top: parsePixel(style.marginTop),
            bottom: parsePixel(style.marginBottom),
          },
          gap: style.gap,
        };

        elements.push(elementInfo);

        // 인터랙티브 요소
        if (['BUTTON', 'A', 'INPUT', '[role=button]'].includes(el.tagName)) {
          interactiveElements.push(elementInfo);
        }

        // 간격 컨테이너
        const className = el.className?.toString() || '';
        if (className.includes('space-') || className.includes('gap-')) {
          const children = Array.from(el.children).map(child => {
            const childRect = child.getBoundingClientRect();
            return { y: childRect.y, height: childRect.height, bottom: childRect.bottom };
          }).filter(c => c.height > 0);

          spacingContainers.push({
            className,
            children,
            expectedGap: className.match(/(?:space-y-|gap-)(\d+)/)?.[1],
          });
        }
      });

      return { elements, interactiveElements, spacingContainers };
    });
  }

  /**
   * CSS 로딩 상태 확인
   */
  private async checkCSSStatus(): Promise<CSSStatus> {
    return await this.page.evaluate(() => {
      const issues: string[] = [];

      // Tailwind CSS 확인 (주요 유틸리티 클래스가 작동하는지)
      const testEl = document.createElement('div');
      testEl.className = 'p-4';
      testEl.style.visibility = 'hidden';
      document.body.appendChild(testEl);

      const testStyle = window.getComputedStyle(testEl);
      const tailwindLoaded = parseFloat(testStyle.paddingTop) > 0;

      document.body.removeChild(testEl);

      if (!tailwindLoaded) {
        issues.push('Tailwind CSS utilities not working (p-4 class has no effect)');
      }

      // 스타일시트 로딩 확인
      const stylesheets = Array.from(document.styleSheets);
      const customCSSLoaded = stylesheets.some(sheet => {
        try {
          return sheet.cssRules && sheet.cssRules.length > 10;
        } catch {
          return false;
        }
      });

      if (!customCSSLoaded) {
        issues.push('No custom CSS rules detected');
      }

      return { tailwindLoaded, customCSSLoaded, issues };
    });
  }

  /**
   * 요소 겹침 감지
   */
  private detectOverlaps(elements: any[]): LayoutIssue[] {
    const issues: LayoutIssue[] = [];

    for (let i = 0; i < elements.length && i < 50; i++) {
      for (let j = i + 1; j < elements.length && j < 50; j++) {
        const a = elements[i].rect;
        const b = elements[j].rect;

        const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
        const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
        const overlapArea = overlapX * overlapY;
        const smallerArea = Math.min(a.width * a.height, b.width * b.height);

        // 50% 이상 겹침 감지
        if (overlapArea > smallerArea * 0.5 && overlapArea > 500) {
          issues.push({
            type: 'overlap',
            severity: 'error',
            message: `Elements overlap: ${Math.round(overlapArea)}px² (${Math.round(overlapArea / smallerArea * 100)}%)`,
            selector: `${elements[i].selector} ↔ ${elements[j].selector}`,
          });
        }
      }
    }

    return issues.slice(0, 10); // 최대 10개
  }

  /**
   * 간격 이슈 감지
   */
  private detectSpacingIssues(containers: any[]): LayoutIssue[] {
    const issues: LayoutIssue[] = [];

    for (const container of containers) {
      if (container.children.length < 2) continue;

      const gaps: number[] = [];
      for (let i = 1; i < container.children.length; i++) {
        const gap = container.children[i].y - container.children[i - 1].bottom;
        gaps.push(Math.round(gap));
      }

      // 간격이 0 이하인 경우
      const zeroGaps = gaps.filter(g => g <= 0);
      if (zeroGaps.length > 0 && container.expectedGap) {
        issues.push({
          type: 'spacing',
          severity: 'error',
          message: `Spacing class not applied`,
          selector: container.className.slice(0, 50),
          expected: `gap of ${container.expectedGap} units`,
          actual: `found ${zeroGaps.length} elements with 0 or negative gap`,
        });
      }

      // 간격 불일치
      const uniqueGaps = [...new Set(gaps.filter(g => g > 0))];
      if (uniqueGaps.length > 1) {
        const variance = Math.max(...uniqueGaps) - Math.min(...uniqueGaps);
        if (variance > 8) { // 8px 이상 차이
          issues.push({
            type: 'spacing',
            severity: 'warning',
            message: `Inconsistent spacing: ${Math.min(...gaps)}px to ${Math.max(...gaps)}px`,
            selector: container.className.slice(0, 50),
          });
        }
      }
    }

    return issues;
  }

  /**
   * CSS 미적용 이슈 감지
   */
  private detectCSSIssues(elements: any[]): LayoutIssue[] {
    const issues: LayoutIssue[] = [];

    for (const el of elements) {
      const className = el.className || '';

      // 패딩 클래스가 있지만 실제 패딩이 0인 경우
      const hasPaddingClass = /\bp-\d+|\bpx-\d+|\bpy-\d+|\bpt-\d+|\bpr-\d+|\bpb-\d+|\bpl-\d+/.test(className);
      const totalPadding = el.padding.top + el.padding.right + el.padding.bottom + el.padding.left;

      if (hasPaddingClass && totalPadding === 0) {
        issues.push({
          type: 'css-not-applied',
          severity: 'error',
          message: `Padding class not applied`,
          selector: el.selector,
          expected: `padding from class "${className.match(/p[trblxy]?-\d+/)?.[0]}"`,
          actual: '0px padding',
        });
      }
    }

    return issues.slice(0, 20);
  }

  /**
   * 터치 타겟 이슈 감지
   */
  private detectTouchTargetIssues(elements: any[]): LayoutIssue[] {
    const issues: LayoutIssue[] = [];
    const MIN_TOUCH_TARGET = 44; // WCAG recommendation

    for (const el of elements) {
      if (el.rect.width < MIN_TOUCH_TARGET || el.rect.height < MIN_TOUCH_TARGET) {
        issues.push({
          type: 'touch-target',
          severity: 'warning',
          message: `Touch target too small: ${Math.round(el.rect.width)}x${Math.round(el.rect.height)}px`,
          selector: el.selector,
          expected: `minimum ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px`,
          actual: `${Math.round(el.rect.width)}x${Math.round(el.rect.height)}px`,
        });
      }
    }

    return issues.slice(0, 10);
  }

  /**
   * 간단한 요약 리포트 생성
   */
  async getSummary(): Promise<string> {
    const report = await this.analyze();

    const errorCount = report.issues.filter(i => i.severity === 'error').length;
    const warningCount = report.issues.filter(i => i.severity === 'warning').length;

    let summary = `\n📊 Layout Analysis Report\n`;
    summary += `${'─'.repeat(40)}\n`;
    summary += `URL: ${report.url}\n`;
    summary += `Viewport: ${report.viewport.width}x${report.viewport.height}\n`;
    summary += `Elements analyzed: ${report.metrics.totalElements}\n`;
    summary += `\n`;
    summary += `CSS Status:\n`;
    summary += `  Tailwind: ${report.cssStatus.tailwindLoaded ? '✅' : '❌'}\n`;
    summary += `  Custom CSS: ${report.cssStatus.customCSSLoaded ? '✅' : '❌'}\n`;
    summary += `\n`;
    summary += `Issues: ${errorCount} errors, ${warningCount} warnings\n`;

    if (report.issues.length > 0) {
      summary += `\nTop Issues:\n`;
      report.issues.slice(0, 5).forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        summary += `  ${icon} [${issue.type}] ${issue.message}\n`;
        if (issue.selector) summary += `     → ${issue.selector}\n`;
      });
    }

    return summary;
  }
}

/**
 * Quick layout check helper
 */
export async function quickLayoutCheck(page: Page): Promise<{
  passed: boolean;
  errorCount: number;
  errors: LayoutIssue[];
}> {
  const analyzer = new LayoutAnalyzer(page);
  const report = await analyzer.analyze();
  const errors = report.issues.filter(i => i.severity === 'error');

  return {
    passed: errors.length === 0,
    errorCount: errors.length,
    errors,
  };
}
