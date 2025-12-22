import { Page } from '@playwright/test';

/**
 * Spacing Analyzer - 요소 간격 비례성 분석
 *
 * 요소 크기에 비례하는 간격인지 검사
 * - 패딩이 요소 크기의 일정 비율인지
 * - 간격이 일관된 비율인지
 * - 모바일/데스크톱에서 비례적으로 조정되는지
 */

export interface SpacingMetrics {
  element: string;
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    ratioToWidth: { horizontal: number; vertical: number };
    ratioToHeight: { horizontal: number; vertical: number };
  };
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  childrenGap: number[];
  averageGap: number;
  gapToSizeRatio: number;
}

export interface SpacingIssue {
  type: 'disproportionate-padding' | 'inconsistent-gap' | 'zero-spacing' | 'excessive-spacing';
  severity: 'error' | 'warning' | 'info';
  message: string;
  element: string;
  expected?: string;
  actual?: string;
}

/**
 * 요소의 간격 메트릭 수집
 */
export async function collectSpacingMetrics(page: Page): Promise<SpacingMetrics[]> {
  return await page.evaluate(() => {
    const metrics: SpacingMetrics[] = [];
    const containers = document.querySelectorAll('div, section, article, main, aside, .card, [class*="card"]');

    containers.forEach((el, index) => {
      if (index > 50) return;

      const rect = el.getBoundingClientRect();
      if (rect.width < 100 || rect.height < 50) return;

      const style = window.getComputedStyle(el);
      const parsePixel = (v: string) => parseFloat(v) || 0;

      const paddingTop = parsePixel(style.paddingTop);
      const paddingRight = parsePixel(style.paddingRight);
      const paddingBottom = parsePixel(style.paddingBottom);
      const paddingLeft = parsePixel(style.paddingLeft);

      const horizontalPadding = paddingLeft + paddingRight;
      const verticalPadding = paddingTop + paddingBottom;

      // 자식 요소 간 간격 계산
      const children = Array.from(el.children).filter(child => {
        const childStyle = window.getComputedStyle(child);
        return childStyle.display !== 'none' && childStyle.visibility !== 'hidden';
      });

      const gaps: number[] = [];
      for (let i = 1; i < children.length; i++) {
        const prevRect = children[i - 1].getBoundingClientRect();
        const currRect = children[i].getBoundingClientRect();
        const gap = currRect.top - prevRect.bottom;
        if (gap > 0) gaps.push(Math.round(gap));
      }

      const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;

      metrics.push({
        element: `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ')[0] : ''}`,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        padding: {
          top: paddingTop,
          right: paddingRight,
          bottom: paddingBottom,
          left: paddingLeft,
          ratioToWidth: {
            horizontal: rect.width > 0 ? horizontalPadding / rect.width : 0,
            vertical: rect.width > 0 ? verticalPadding / rect.width : 0,
          },
          ratioToHeight: {
            horizontal: rect.height > 0 ? horizontalPadding / rect.height : 0,
            vertical: rect.height > 0 ? verticalPadding / rect.height : 0,
          },
        },
        margin: {
          top: parsePixel(style.marginTop),
          bottom: parsePixel(style.marginBottom),
          left: parsePixel(style.marginLeft),
          right: parsePixel(style.marginRight),
        },
        childrenGap: gaps,
        averageGap: avgGap,
        gapToSizeRatio: Math.min(rect.width, rect.height) > 0
          ? avgGap / Math.min(rect.width, rect.height)
          : 0,
      });
    });

    return metrics;
  });
}

/**
 * 비례적 간격 이슈 분석
 */
export function analyzeProportionalSpacing(metrics: SpacingMetrics[]): SpacingIssue[] {
  const issues: SpacingIssue[] = [];

  // 권장 비율 범위
  const RECOMMENDED_PADDING_RATIO = { min: 0.02, max: 0.15 }; // 너비의 2-15%
  const RECOMMENDED_GAP_RATIO = { min: 0.01, max: 0.1 }; // 크기의 1-10%

  for (const metric of metrics) {
    // 1. 패딩이 너무 작거나 큰 경우
    const hPaddingRatio = metric.padding.ratioToWidth.horizontal;
    if (metric.width > 200) { // 충분히 큰 요소만 검사
      if (hPaddingRatio === 0 && metric.padding.left === 0 && metric.padding.right === 0) {
        // 패딩이 전혀 없는 경우는 의도적일 수 있으므로 스킵
      } else if (hPaddingRatio > 0 && hPaddingRatio < RECOMMENDED_PADDING_RATIO.min) {
        issues.push({
          type: 'disproportionate-padding',
          severity: 'warning',
          message: `Padding too small for element size`,
          element: metric.element,
          expected: `${(RECOMMENDED_PADDING_RATIO.min * 100).toFixed(1)}% or more of width`,
          actual: `${(hPaddingRatio * 100).toFixed(2)}% (${metric.padding.left + metric.padding.right}px of ${metric.width}px)`,
        });
      } else if (hPaddingRatio > RECOMMENDED_PADDING_RATIO.max) {
        issues.push({
          type: 'excessive-spacing',
          severity: 'warning',
          message: `Padding excessive for element size`,
          element: metric.element,
          expected: `${(RECOMMENDED_PADDING_RATIO.max * 100).toFixed(1)}% or less of width`,
          actual: `${(hPaddingRatio * 100).toFixed(2)}% (${metric.padding.left + metric.padding.right}px of ${metric.width}px)`,
        });
      }
    }

    // 2. 자식 요소 간 간격 불일치
    if (metric.childrenGap.length >= 2) {
      const minGap = Math.min(...metric.childrenGap);
      const maxGap = Math.max(...metric.childrenGap);
      const variance = maxGap - minGap;

      // 간격 변동이 평균의 50% 이상이면 불일치
      if (metric.averageGap > 0 && variance > metric.averageGap * 0.5) {
        issues.push({
          type: 'inconsistent-gap',
          severity: 'warning',
          message: `Gap between children varies significantly`,
          element: metric.element,
          expected: `Consistent gaps (±${(metric.averageGap * 0.25).toFixed(0)}px)`,
          actual: `Gaps range from ${minGap}px to ${maxGap}px (variance: ${variance}px)`,
        });
      }
    }

    // 3. 간격이 요소 크기에 비례하지 않음
    if (metric.averageGap > 0 && metric.width > 200) {
      if (metric.gapToSizeRatio < RECOMMENDED_GAP_RATIO.min) {
        issues.push({
          type: 'disproportionate-padding',
          severity: 'info',
          message: `Gap may be too small relative to container size`,
          element: metric.element,
          actual: `${(metric.gapToSizeRatio * 100).toFixed(2)}% of container size`,
        });
      }
    }
  }

  return issues;
}

/**
 * 뷰포트 간 비례성 비교
 *
 * 모바일/데스크톱에서 간격이 비례적으로 조정되는지 확인
 */
export async function compareViewportSpacing(
  page: Page,
  mobileViewport: { width: number; height: number },
  desktopViewport: { width: number; height: number },
  selector: string = 'body'
): Promise<{
  mobile: SpacingMetrics[];
  desktop: SpacingMetrics[];
  issues: SpacingIssue[];
}> {
  // 모바일 측정
  await page.setViewportSize(mobileViewport);
  await page.waitForTimeout(300);
  const mobileMetrics = await collectSpacingMetrics(page);

  // 데스크톱 측정
  await page.setViewportSize(desktopViewport);
  await page.waitForTimeout(300);
  const desktopMetrics = await collectSpacingMetrics(page);

  const issues: SpacingIssue[] = [];

  // 같은 요소의 간격 비율 비교
  const viewportRatio = desktopViewport.width / mobileViewport.width;

  for (const mobileMet of mobileMetrics) {
    const desktopMet = desktopMetrics.find(d => d.element === mobileMet.element);
    if (!desktopMet) continue;

    const mobilePadding = mobileMet.padding.left + mobileMet.padding.right;
    const desktopPadding = desktopMet.padding.left + desktopMet.padding.right;

    if (mobilePadding > 0 && desktopPadding > 0) {
      const paddingRatio = desktopPadding / mobilePadding;

      // 패딩이 뷰포트 비율과 비례하지 않으면 경고
      // (완벽히 비례할 필요는 없지만, 너무 다르면 문제)
      if (paddingRatio < viewportRatio * 0.3 || paddingRatio > viewportRatio * 2) {
        issues.push({
          type: 'disproportionate-padding',
          severity: 'info',
          message: `Spacing doesn't scale proportionally between mobile and desktop`,
          element: mobileMet.element,
          expected: `Padding to scale ~${viewportRatio.toFixed(1)}x (viewport ratio)`,
          actual: `Padding scales ${paddingRatio.toFixed(1)}x (${mobilePadding}px → ${desktopPadding}px)`,
        });
      }
    }
  }

  return { mobile: mobileMetrics, desktop: desktopMetrics, issues };
}

/**
 * 간격 분석 요약 리포트 생성
 */
export function generateSpacingReport(metrics: SpacingMetrics[], issues: SpacingIssue[]): string {
  let report = `\n📐 Spacing Analysis Report\n`;
  report += `${'─'.repeat(40)}\n`;
  report += `Elements analyzed: ${metrics.length}\n`;
  report += `Issues found: ${issues.length}\n\n`;

  // 통계
  const paddingValues = metrics.map(m => m.padding.left + m.padding.right).filter(p => p > 0);
  const gapValues = metrics.map(m => m.averageGap).filter(g => g > 0);

  if (paddingValues.length > 0) {
    report += `Padding Statistics:\n`;
    report += `  Range: ${Math.min(...paddingValues)}px - ${Math.max(...paddingValues)}px\n`;
    report += `  Average: ${(paddingValues.reduce((a, b) => a + b, 0) / paddingValues.length).toFixed(1)}px\n`;
  }

  if (gapValues.length > 0) {
    report += `\nGap Statistics:\n`;
    report += `  Range: ${Math.min(...gapValues)}px - ${Math.max(...gapValues)}px\n`;
    report += `  Average: ${(gapValues.reduce((a, b) => a + b, 0) / gapValues.length).toFixed(1)}px\n`;
  }

  if (issues.length > 0) {
    report += `\nIssues:\n`;
    issues.forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      report += `  ${icon} [${issue.type}] ${issue.message}\n`;
      report += `     Element: ${issue.element}\n`;
      if (issue.expected) report += `     Expected: ${issue.expected}\n`;
      if (issue.actual) report += `     Actual: ${issue.actual}\n`;
    });
  }

  return report;
}
