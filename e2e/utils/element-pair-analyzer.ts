import { Page } from '@playwright/test';

/**
 * Element Pair Analyzer - 모든 요소 쌍의 간격 분석
 *
 * 모든 요소의 N(N-1)/2 조합을 탐색하여:
 * - 인접 요소 간 간격
 * - 중첩/겹침 감지
 * - 패딩 적절성 검사
 */

export interface ElementInfo {
  index: number;
  selector: string;
  tagName: string;
  className: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontSize: number;
  hasText: boolean;
  textLength: number;
}

export interface ElementPairRelation {
  element1: ElementInfo;
  element2: ElementInfo;
  relation: {
    type: 'horizontal-adjacent' | 'vertical-adjacent' | 'overlapping' | 'nested' | 'distant';
    horizontalGap: number;
    verticalGap: number;
    overlapArea: number;
    overlapPercentage: number;
  };
  issues: PairIssue[];
}

export interface PairIssue {
  type: 'overlap' | 'too-close' | 'insufficient-padding' | 'excessive-gap';
  severity: 'error' | 'warning' | 'info';
  message: string;
  recommendation?: string;
}

export interface AnalysisResult {
  timestamp: string;
  url: string;
  viewport: { width: number; height: number };
  totalElements: number;
  totalPairs: number;
  analyzedPairs: number;
  issues: {
    errors: number;
    warnings: number;
    info: number;
  };
  summary: {
    overlappingPairs: number;
    tooClosePairs: number;
    insufficientPaddingElements: number;
    excessiveGapPairs: number;
  };
  pairs: ElementPairRelation[];
}

// 최소 간격 기준 (px)
const MIN_SPACING = {
  betweenInteractive: 8,  // 버튼, 링크 간
  betweenText: 4,         // 텍스트 요소 간
  betweenContainers: 16,  // 컨테이너 간
  touchTarget: 44,        // 터치 가능 요소 최소 크기
};

// 패딩 기준
const PADDING_RULES = {
  minPaddingRatio: 0.02,  // 요소 크기의 2% 이상
  maxPaddingRatio: 0.25,  // 요소 크기의 25% 이하
  minTextPadding: 8,      // 텍스트 요소 최소 패딩
};

/**
 * 페이지의 모든 의미있는 요소 수집
 */
export async function collectElements(page: Page): Promise<ElementInfo[]> {
  return await page.evaluate(() => {
    const elements: ElementInfo[] = [];
    const parsePixel = (v: string) => parseFloat(v) || 0;

    // 분석 대상 셀렉터
    const selectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', 'div', 'section', 'article', 'main', 'aside',
      'button', 'a', 'input', 'select', 'textarea',
      'ul', 'ol', 'li',
      'img', 'figure', 'figcaption',
      '[class*="card"]', '[class*="container"]', '[class*="wrapper"]',
    ];

    const allElements = document.querySelectorAll(selectors.join(', '));

    allElements.forEach((el, index) => {
      if (index > 200) return; // 성능을 위해 제한

      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      // 너무 작거나 숨겨진 요소 제외
      if (rect.width < 10 || rect.height < 10) return;
      if (style.display === 'none' || style.visibility === 'hidden') return;
      if (parseFloat(style.opacity) === 0) return;

      const textContent = el.textContent?.trim() || '';

      elements.push({
        index: elements.length,
        selector: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className ? '.' + (el.className.toString().split(' ')[0] || '') : ''}`,
        tagName: el.tagName,
        className: el.className?.toString() || '',
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
        },
        padding: {
          top: parsePixel(style.paddingTop),
          right: parsePixel(style.paddingRight),
          bottom: parsePixel(style.paddingBottom),
          left: parsePixel(style.paddingLeft),
        },
        fontSize: parsePixel(style.fontSize),
        hasText: textContent.length > 0,
        textLength: textContent.length,
      });
    });

    return elements;
  });
}

/**
 * 두 요소 간 관계 분석
 */
function analyzePairRelation(el1: ElementInfo, el2: ElementInfo): ElementPairRelation {
  const r1 = el1.rect;
  const r2 = el2.rect;

  // 수평/수직 간격 계산
  const horizontalGap = r1.right < r2.left
    ? r2.left - r1.right
    : r2.right < r1.left
      ? r1.left - r2.right
      : 0;

  const verticalGap = r1.bottom < r2.top
    ? r2.top - r1.bottom
    : r2.bottom < r1.top
      ? r1.top - r2.bottom
      : 0;

  // 겹침 계산
  const overlapX = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
  const overlapY = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
  const overlapArea = overlapX * overlapY;

  const smallerArea = Math.min(r1.width * r1.height, r2.width * r2.height);
  const overlapPercentage = smallerArea > 0 ? (overlapArea / smallerArea) * 100 : 0;

  // 포함 관계 확인
  const el1ContainsEl2 = r1.left <= r2.left && r1.right >= r2.right &&
    r1.top <= r2.top && r1.bottom >= r2.bottom;
  const el2ContainsEl1 = r2.left <= r1.left && r2.right >= r1.right &&
    r2.top <= r1.top && r2.bottom >= r1.bottom;

  // 관계 유형 결정
  let relationType: ElementPairRelation['relation']['type'];

  if (el1ContainsEl2 || el2ContainsEl1) {
    relationType = 'nested';
  } else if (overlapArea > 0) {
    relationType = 'overlapping';
  } else if (horizontalGap > 0 && verticalGap === 0) {
    relationType = 'horizontal-adjacent';
  } else if (verticalGap > 0 && horizontalGap === 0) {
    relationType = 'vertical-adjacent';
  } else {
    relationType = 'distant';
  }

  // 이슈 분석
  const issues = analyzeIssues(el1, el2, {
    type: relationType,
    horizontalGap,
    verticalGap,
    overlapArea,
    overlapPercentage,
  });

  return {
    element1: el1,
    element2: el2,
    relation: {
      type: relationType,
      horizontalGap,
      verticalGap,
      overlapArea,
      overlapPercentage,
    },
    issues,
  };
}

/**
 * 요소 쌍의 이슈 분석
 */
function analyzeIssues(
  el1: ElementInfo,
  el2: ElementInfo,
  relation: ElementPairRelation['relation']
): PairIssue[] {
  const issues: PairIssue[] = [];

  const isInteractive = (el: ElementInfo) =>
    ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
  const isContainer = (el: ElementInfo) =>
    ['DIV', 'SECTION', 'ARTICLE', 'MAIN', 'ASIDE'].includes(el.tagName);

  // 1. 겹침 감지
  if (relation.type === 'overlapping' && relation.overlapPercentage > 30) {
    issues.push({
      type: 'overlap',
      severity: 'error',
      message: `Elements overlap by ${relation.overlapPercentage.toFixed(1)}% (${Math.round(relation.overlapArea)}px²)`,
      recommendation: 'Adjust positioning or use flex/grid layout',
    });
  }

  // 2. 인접 요소 간격 검사
  if (relation.type === 'horizontal-adjacent' || relation.type === 'vertical-adjacent') {
    const gap = Math.max(relation.horizontalGap, relation.verticalGap);
    const minGap = isInteractive(el1) && isInteractive(el2)
      ? MIN_SPACING.betweenInteractive
      : isContainer(el1) || isContainer(el2)
        ? MIN_SPACING.betweenContainers
        : MIN_SPACING.betweenText;

    if (gap < minGap && gap > 0) {
      issues.push({
        type: 'too-close',
        severity: 'warning',
        message: `Elements too close: ${Math.round(gap)}px (min: ${minGap}px)`,
        recommendation: `Add at least ${minGap}px gap using Tailwind gap-* or space-*`,
      });
    }

    // 과도한 간격 (100px 이상)
    if (gap > 100 && !isContainer(el1) && !isContainer(el2)) {
      issues.push({
        type: 'excessive-gap',
        severity: 'info',
        message: `Large gap between elements: ${Math.round(gap)}px`,
        recommendation: 'Consider if this spacing is intentional',
      });
    }
  }

  return issues;
}

/**
 * 개별 요소의 패딩 적절성 검사
 */
function analyzePaddingIssues(elements: ElementInfo[]): PairIssue[] {
  const issues: PairIssue[] = [];

  for (const el of elements) {
    const totalPadding = el.padding.top + el.padding.right + el.padding.bottom + el.padding.left;
    const avgPadding = totalPadding / 4;
    const minDimension = Math.min(el.rect.width, el.rect.height);

    // 텍스트 요소의 패딩 검사
    if (el.hasText && el.textLength > 0) {
      if (avgPadding < PADDING_RULES.minTextPadding && el.rect.width > 50) {
        // 패딩 클래스가 있는지 확인
        const hasPaddingClass = /\bp-\d+|\bpx-|\bpy-|\bpt-|\bpr-|\bpb-|\bpl-/.test(el.className);

        if (!hasPaddingClass) {
          issues.push({
            type: 'insufficient-padding',
            severity: 'warning',
            message: `Text element "${el.selector}" has low padding: ${avgPadding.toFixed(1)}px average`,
            recommendation: 'Consider adding padding class (p-2, p-4, etc.)',
          });
        }
      }
    }

    // 컨테이너 요소의 패딩 비율 검사
    if (['DIV', 'SECTION', 'ARTICLE'].includes(el.tagName) && minDimension > 100) {
      const paddingRatio = avgPadding / minDimension;

      if (paddingRatio > 0 && paddingRatio < PADDING_RULES.minPaddingRatio && totalPadding > 0) {
        issues.push({
          type: 'insufficient-padding',
          severity: 'info',
          message: `Container "${el.selector}" has disproportionate padding: ${(paddingRatio * 100).toFixed(2)}%`,
          recommendation: 'Consider using proportional spacing (p-fluid-* or responsive values)',
        });
      }
    }
  }

  return issues;
}

/**
 * 전체 요소 쌍 분석 실행
 */
export async function analyzeAllElementPairs(page: Page): Promise<AnalysisResult> {
  const url = page.url();
  const viewport = page.viewportSize() || { width: 0, height: 0 };
  const elements = await collectElements(page);

  const pairs: ElementPairRelation[] = [];
  const totalPairs = (elements.length * (elements.length - 1)) / 2;

  // 모든 쌍 분석 (최대 500쌍까지)
  const maxPairs = 500;
  let analyzedCount = 0;

  for (let i = 0; i < elements.length && analyzedCount < maxPairs; i++) {
    for (let j = i + 1; j < elements.length && analyzedCount < maxPairs; j++) {
      const pair = analyzePairRelation(elements[i], elements[j]);

      // 의미있는 관계만 저장 (distant 제외)
      if (pair.relation.type !== 'distant' || pair.issues.length > 0) {
        pairs.push(pair);
      }
      analyzedCount++;
    }
  }

  // 패딩 이슈 분석
  const paddingIssues = analyzePaddingIssues(elements);

  // 통계 계산
  const allIssues = [...pairs.flatMap(p => p.issues), ...paddingIssues];
  const issueStats = {
    errors: allIssues.filter(i => i.severity === 'error').length,
    warnings: allIssues.filter(i => i.severity === 'warning').length,
    info: allIssues.filter(i => i.severity === 'info').length,
  };

  const summary = {
    overlappingPairs: pairs.filter(p => p.relation.type === 'overlapping').length,
    tooClosePairs: pairs.filter(p => p.issues.some(i => i.type === 'too-close')).length,
    insufficientPaddingElements: paddingIssues.filter(i => i.type === 'insufficient-padding').length,
    excessiveGapPairs: pairs.filter(p => p.issues.some(i => i.type === 'excessive-gap')).length,
  };

  return {
    timestamp: new Date().toISOString(),
    url,
    viewport,
    totalElements: elements.length,
    totalPairs,
    analyzedPairs: analyzedCount,
    issues: issueStats,
    summary,
    pairs,
  };
}

/**
 * 분석 결과 리포트 생성
 */
export function generatePairAnalysisReport(result: AnalysisResult): string {
  let report = `\n🔍 Element Pair Analysis Report\n`;
  report += `${'═'.repeat(50)}\n`;
  report += `URL: ${result.url}\n`;
  report += `Viewport: ${result.viewport.width}x${result.viewport.height}\n`;
  report += `Timestamp: ${result.timestamp}\n\n`;

  report += `📊 Statistics\n`;
  report += `${'─'.repeat(30)}\n`;
  report += `Total elements: ${result.totalElements}\n`;
  report += `Total possible pairs: ${result.totalPairs}\n`;
  report += `Analyzed pairs: ${result.analyzedPairs}\n\n`;

  report += `⚠️ Issues Summary\n`;
  report += `${'─'.repeat(30)}\n`;
  report += `Errors: ${result.issues.errors}\n`;
  report += `Warnings: ${result.issues.warnings}\n`;
  report += `Info: ${result.issues.info}\n\n`;

  report += `📐 Spacing Summary\n`;
  report += `${'─'.repeat(30)}\n`;
  report += `Overlapping pairs: ${result.summary.overlappingPairs}\n`;
  report += `Too close pairs: ${result.summary.tooClosePairs}\n`;
  report += `Insufficient padding: ${result.summary.insufficientPaddingElements}\n`;
  report += `Excessive gaps: ${result.summary.excessiveGapPairs}\n\n`;

  // 상위 이슈 출력
  const topIssues = result.pairs
    .flatMap(p => p.issues.map(issue => ({
      ...issue,
      elements: `${p.element1.selector} ↔ ${p.element2.selector}`,
    })))
    .filter(i => i.severity === 'error' || i.severity === 'warning')
    .slice(0, 10);

  if (topIssues.length > 0) {
    report += `🚨 Top Issues\n`;
    report += `${'─'.repeat(30)}\n`;

    topIssues.forEach((issue, i) => {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      report += `${i + 1}. ${icon} [${issue.type}] ${issue.message}\n`;
      report += `   Elements: ${issue.elements}\n`;
      if (issue.recommendation) {
        report += `   💡 ${issue.recommendation}\n`;
      }
      report += `\n`;
    });
  }

  return report;
}

/**
 * 빠른 체크 - 심각한 이슈만 확인
 */
export async function quickPairCheck(page: Page): Promise<{
  passed: boolean;
  criticalIssues: PairIssue[];
  report: string;
}> {
  const result = await analyzeAllElementPairs(page);

  const criticalIssues = result.pairs
    .flatMap(p => p.issues)
    .filter(i => i.severity === 'error');

  return {
    passed: criticalIssues.length === 0,
    criticalIssues,
    report: generatePairAnalysisReport(result),
  };
}
