import { Page, Locator, expect } from '@playwright/test';

/**
 * 범용 레이아웃 검증 유틸리티
 *
 * UI 레이아웃 문제를 미연에 방지하기 위한 테스트 헬퍼
 * - Above-the-fold 검증
 * - Flexbox/Grid 레이아웃 검증
 * - 사이드바/메인 배치 검증
 * - 채팅 UI 검증
 * - 슬라이드/프레젠테이션 검증
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutIssue {
  type: 'position' | 'size' | 'overlap' | 'overflow' | 'alignment';
  severity: 'error' | 'warning';
  message: string;
  element?: string;
  expected?: string;
  actual?: string;
}

export interface LayoutValidationResult {
  passed: boolean;
  issues: LayoutIssue[];
  metrics: {
    viewportHeight: number;
    viewportWidth: number;
    mainContentY: number;
    visibleAreaPercentage: number;
  };
}

// ============================================================================
// 1. Above-the-Fold 검증
// ============================================================================

/**
 * 주요 콘텐츠가 뷰포트 상단에 보이는지 검증
 *
 * @param page Playwright Page
 * @param selector 검증할 요소의 셀렉터
 * @param maxY 최대 허용 Y 위치 (기본: 뷰포트 높이의 30%)
 */
export async function validateAboveTheFold(
  page: Page,
  selector: string,
  maxYPercent: number = 0.3
): Promise<LayoutValidationResult> {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Viewport not set');

  const issues: LayoutIssue[] = [];
  const element = page.locator(selector).first();
  const box = await element.boundingBox();

  const maxY = viewport.height * maxYPercent;

  if (!box) {
    issues.push({
      type: 'position',
      severity: 'error',
      message: `Element not found or not visible: ${selector}`,
      element: selector,
    });
  } else if (box.y > maxY) {
    issues.push({
      type: 'position',
      severity: 'error',
      message: `Content pushed below fold`,
      element: selector,
      expected: `y < ${Math.round(maxY)}px (${maxYPercent * 100}% of viewport)`,
      actual: `y = ${Math.round(box.y)}px`,
    });
  }

  return {
    passed: issues.length === 0,
    issues,
    metrics: {
      viewportHeight: viewport.height,
      viewportWidth: viewport.width,
      mainContentY: box?.y ?? -1,
      visibleAreaPercentage: box ? Math.max(0, (viewport.height - box.y) / viewport.height * 100) : 0,
    },
  };
}

/**
 * 여러 요소가 모두 뷰포트 내에 보이는지 검증
 */
export async function validateAllVisibleInViewport(
  page: Page,
  selectors: string[]
): Promise<LayoutValidationResult> {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Viewport not set');

  const issues: LayoutIssue[] = [];
  let lowestY = 0;

  for (const selector of selectors) {
    const element = page.locator(selector).first();
    const isVisible = await element.isVisible().catch(() => false);

    if (!isVisible) {
      issues.push({
        type: 'position',
        severity: 'warning',
        message: `Element not visible`,
        element: selector,
      });
      continue;
    }

    const box = await element.boundingBox();
    if (box) {
      lowestY = Math.max(lowestY, box.y);

      // 요소가 뷰포트 밖에 있는지 체크
      if (box.y > viewport.height) {
        issues.push({
          type: 'position',
          severity: 'error',
          message: `Element completely below viewport`,
          element: selector,
          actual: `y = ${Math.round(box.y)}px (viewport height: ${viewport.height}px)`,
        });
      }
    }
  }

  return {
    passed: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    metrics: {
      viewportHeight: viewport.height,
      viewportWidth: viewport.width,
      mainContentY: lowestY,
      visibleAreaPercentage: Math.max(0, (viewport.height - lowestY) / viewport.height * 100),
    },
  };
}

// ============================================================================
// 2. 사이드바 + 메인 레이아웃 검증
// ============================================================================

export interface SidebarLayoutOptions {
  sidebarSelector?: string;
  mainSelector?: string;
  expectedSidebarWidth?: number;
  tolerance?: number;
}

/**
 * 사이드바와 메인 콘텐츠가 나란히 배치되는지 검증
 */
export async function validateSidebarLayout(
  page: Page,
  options: SidebarLayoutOptions = {}
): Promise<LayoutValidationResult> {
  const {
    sidebarSelector = 'aside',
    mainSelector = 'main',
    expectedSidebarWidth = 256, // 64 * 4 = 256px (w-64)
    tolerance = 50,
  } = options;

  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Viewport not set');

  const issues: LayoutIssue[] = [];

  const sidebar = page.locator(sidebarSelector).first();
  const main = page.locator(mainSelector).first();

  const sidebarBox = await sidebar.boundingBox();
  const mainBox = await main.boundingBox();

  // 1. 사이드바 존재 확인
  if (!sidebarBox) {
    issues.push({
      type: 'position',
      severity: 'warning',
      message: 'Sidebar not found or not visible',
      element: sidebarSelector,
    });
  }

  // 2. 메인 콘텐츠 존재 확인
  if (!mainBox) {
    issues.push({
      type: 'position',
      severity: 'error',
      message: 'Main content not found or not visible',
      element: mainSelector,
    });
    return { passed: false, issues, metrics: { viewportHeight: viewport.height, viewportWidth: viewport.width, mainContentY: -1, visibleAreaPercentage: 0 } };
  }

  // 3. Y 좌표 비교 (나란히 배치되어야 함)
  if (sidebarBox && mainBox) {
    const yDiff = Math.abs(sidebarBox.y - mainBox.y);

    if (yDiff > tolerance) {
      issues.push({
        type: 'alignment',
        severity: 'error',
        message: 'Sidebar and main content are not horizontally aligned (likely stacked vertically)',
        expected: `Y positions within ${tolerance}px`,
        actual: `Sidebar Y=${Math.round(sidebarBox.y)}, Main Y=${Math.round(mainBox.y)} (diff: ${Math.round(yDiff)}px)`,
      });
    }

    // 4. 사이드바가 메인 콘텐츠 왼쪽에 있는지
    if (sidebarBox.x > mainBox.x) {
      issues.push({
        type: 'position',
        severity: 'error',
        message: 'Sidebar should be on the left of main content',
        actual: `Sidebar X=${Math.round(sidebarBox.x)}, Main X=${Math.round(mainBox.x)}`,
      });
    }

    // 5. 메인 콘텐츠가 뷰포트 상단에 있는지
    if (mainBox.y > viewport.height * 0.3) {
      issues.push({
        type: 'position',
        severity: 'error',
        message: 'Main content pushed too far down',
        expected: `y < ${Math.round(viewport.height * 0.3)}px`,
        actual: `y = ${Math.round(mainBox.y)}px`,
      });
    }
  }

  return {
    passed: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    metrics: {
      viewportHeight: viewport.height,
      viewportWidth: viewport.width,
      mainContentY: mainBox?.y ?? -1,
      visibleAreaPercentage: mainBox ? Math.max(0, (viewport.height - mainBox.y) / viewport.height * 100) : 0,
    },
  };
}

// ============================================================================
// 3. 채팅 UI 레이아웃 검증
// ============================================================================

export interface ChatLayoutOptions {
  containerSelector?: string;
  messagesSelector?: string;
  inputSelector?: string;
  sendButtonSelector?: string;
}

/**
 * 채팅 UI 레이아웃 검증
 * - 메시지 영역이 스크롤 가능해야 함
 * - 입력창이 하단에 고정되어야 함
 * - 전송 버튼이 입력창 옆에 있어야 함
 */
export async function validateChatLayout(
  page: Page,
  options: ChatLayoutOptions = {}
): Promise<LayoutValidationResult> {
  const {
    containerSelector = '[data-testid="chat-container"], .chat-container',
    messagesSelector = '[data-testid="chat-messages"], .chat-messages, .messages',
    inputSelector = '[data-testid="chat-input"], input[type="text"], textarea',
    sendButtonSelector = '[data-testid="send-button"], button[type="submit"]',
  } = options;

  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Viewport not set');

  const issues: LayoutIssue[] = [];

  const container = page.locator(containerSelector).first();
  const messages = page.locator(messagesSelector).first();
  const input = page.locator(inputSelector).first();
  const sendButton = page.locator(sendButtonSelector).first();

  const containerBox = await container.boundingBox().catch(() => null);
  const messagesBox = await messages.boundingBox().catch(() => null);
  const inputBox = await input.boundingBox().catch(() => null);
  const sendButtonBox = await sendButton.boundingBox().catch(() => null);

  // 1. 입력창이 뷰포트 내에 있는지
  if (inputBox) {
    if (inputBox.y + inputBox.height > viewport.height) {
      issues.push({
        type: 'position',
        severity: 'error',
        message: 'Chat input is below viewport (not visible without scrolling)',
        actual: `Input bottom: ${Math.round(inputBox.y + inputBox.height)}px, Viewport: ${viewport.height}px`,
      });
    }
  } else {
    issues.push({
      type: 'position',
      severity: 'error',
      message: 'Chat input not found',
      element: inputSelector,
    });
  }

  // 2. 메시지 영역이 입력창 위에 있는지
  if (messagesBox && inputBox) {
    if (messagesBox.y > inputBox.y) {
      issues.push({
        type: 'alignment',
        severity: 'error',
        message: 'Messages area should be above input',
        actual: `Messages Y=${Math.round(messagesBox.y)}, Input Y=${Math.round(inputBox.y)}`,
      });
    }
  }

  // 3. 전송 버튼이 입력창과 같은 Y 위치에 있는지
  if (inputBox && sendButtonBox) {
    const yDiff = Math.abs(inputBox.y - sendButtonBox.y);
    if (yDiff > 30) {
      issues.push({
        type: 'alignment',
        severity: 'warning',
        message: 'Send button not aligned with input',
        actual: `Input Y=${Math.round(inputBox.y)}, Button Y=${Math.round(sendButtonBox.y)}`,
      });
    }
  }

  return {
    passed: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    metrics: {
      viewportHeight: viewport.height,
      viewportWidth: viewport.width,
      mainContentY: containerBox?.y ?? -1,
      visibleAreaPercentage: 100,
    },
  };
}

// ============================================================================
// 4. 슬라이드/프레젠테이션 레이아웃 검증
// ============================================================================

export interface SlideLayoutOptions {
  slideSelector?: string;
  controlsSelector?: string;
  thumbnailsSelector?: string;
}

/**
 * 슬라이드/프레젠테이션 UI 레이아웃 검증
 * - 슬라이드가 뷰포트에 맞게 표시
 * - 컨트롤이 접근 가능한 위치에
 * - 썸네일이 있다면 올바른 위치에
 */
export async function validateSlideLayout(
  page: Page,
  options: SlideLayoutOptions = {}
): Promise<LayoutValidationResult> {
  const {
    slideSelector = '[data-testid="slide"], .slide, .slide-container',
    controlsSelector = '[data-testid="slide-controls"], .slide-controls, .controls',
    thumbnailsSelector = '[data-testid="thumbnails"], .thumbnails',
  } = options;

  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Viewport not set');

  const issues: LayoutIssue[] = [];

  const slide = page.locator(slideSelector).first();
  const controls = page.locator(controlsSelector).first();

  const slideBox = await slide.boundingBox().catch(() => null);
  const controlsBox = await controls.boundingBox().catch(() => null);

  // 1. 슬라이드가 뷰포트 내에 있는지
  if (slideBox) {
    // 슬라이드 상단이 너무 아래에 있으면 안 됨
    if (slideBox.y > viewport.height * 0.2) {
      issues.push({
        type: 'position',
        severity: 'error',
        message: 'Slide pushed too far down',
        expected: `y < ${Math.round(viewport.height * 0.2)}px`,
        actual: `y = ${Math.round(slideBox.y)}px`,
      });
    }

    // 슬라이드가 뷰포트를 벗어나면 안 됨
    if (slideBox.y + slideBox.height > viewport.height + 100) {
      issues.push({
        type: 'overflow',
        severity: 'warning',
        message: 'Slide extends below viewport',
        actual: `Slide bottom: ${Math.round(slideBox.y + slideBox.height)}px`,
      });
    }
  } else {
    issues.push({
      type: 'position',
      severity: 'error',
      message: 'Slide element not found',
      element: slideSelector,
    });
  }

  // 2. 컨트롤이 보이는지
  if (controlsBox) {
    if (controlsBox.y > viewport.height) {
      issues.push({
        type: 'position',
        severity: 'warning',
        message: 'Slide controls below viewport',
        actual: `Controls Y: ${Math.round(controlsBox.y)}px`,
      });
    }
  }

  return {
    passed: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    metrics: {
      viewportHeight: viewport.height,
      viewportWidth: viewport.width,
      mainContentY: slideBox?.y ?? -1,
      visibleAreaPercentage: slideBox ? Math.min(100, (viewport.height / (slideBox.height || 1)) * 100) : 0,
    },
  };
}

// ============================================================================
// 5. 앱 카드 그리드 레이아웃 검증
// ============================================================================

export interface GridLayoutOptions {
  containerSelector?: string;
  itemSelector?: string;
  expectedColumns?: number;
}

/**
 * 그리드 레이아웃 검증 (앱 카드, 갤러리 등)
 */
export async function validateGridLayout(
  page: Page,
  options: GridLayoutOptions = {}
): Promise<LayoutValidationResult> {
  const {
    containerSelector = '.grid, [class*="grid-cols"]',
    itemSelector = '.grid > *',
    expectedColumns,
  } = options;

  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Viewport not set');

  const issues: LayoutIssue[] = [];

  const items = await page.locator(itemSelector).all();

  if (items.length < 2) {
    return {
      passed: true,
      issues: [],
      metrics: { viewportHeight: viewport.height, viewportWidth: viewport.width, mainContentY: 0, visibleAreaPercentage: 100 },
    };
  }

  // 첫 번째 행의 아이템들 Y 좌표 수집
  const firstRowY = await items[0].boundingBox().then(b => b?.y ?? 0);
  let columnsInFirstRow = 0;

  for (const item of items) {
    const box = await item.boundingBox();
    if (box && Math.abs(box.y - firstRowY) < 10) {
      columnsInFirstRow++;
    }
  }

  // 예상 컬럼 수와 비교
  if (expectedColumns && columnsInFirstRow !== expectedColumns) {
    issues.push({
      type: 'alignment',
      severity: 'warning',
      message: 'Grid column count mismatch',
      expected: `${expectedColumns} columns`,
      actual: `${columnsInFirstRow} columns`,
    });
  }

  // 그리드 아이템 겹침 검사
  for (let i = 0; i < Math.min(items.length, 20); i++) {
    for (let j = i + 1; j < Math.min(items.length, 20); j++) {
      const boxA = await items[i].boundingBox();
      const boxB = await items[j].boundingBox();

      if (boxA && boxB) {
        const overlapsX = boxA.x < boxB.x + boxB.width && boxA.x + boxA.width > boxB.x;
        const overlapsY = boxA.y < boxB.y + boxB.height && boxA.y + boxA.height > boxB.y;

        if (overlapsX && overlapsY) {
          issues.push({
            type: 'overlap',
            severity: 'error',
            message: `Grid items overlap`,
            actual: `Item ${i} and ${j}`,
          });
        }
      }
    }
  }

  return {
    passed: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    metrics: {
      viewportHeight: viewport.height,
      viewportWidth: viewport.width,
      mainContentY: firstRowY,
      visibleAreaPercentage: 100,
    },
  };
}

// ============================================================================
// 6. 범용 레이아웃 검증 (자동 감지)
// ============================================================================

export type LayoutType = 'sidebar' | 'chat' | 'slide' | 'grid' | 'simple';

/**
 * 페이지 레이아웃 타입 자동 감지
 */
export async function detectLayoutType(page: Page): Promise<LayoutType> {
  const hasSidebar = await page.locator('aside').count() > 0;
  const hasChat = await page.locator('[class*="chat"], [class*="message"]').count() > 0;
  const hasSlide = await page.locator('[class*="slide"], [class*="presentation"]').count() > 0;
  const hasGrid = await page.locator('.grid, [class*="grid-cols"]').count() > 0;

  if (hasSidebar) return 'sidebar';
  if (hasChat) return 'chat';
  if (hasSlide) return 'slide';
  if (hasGrid) return 'grid';
  return 'simple';
}

/**
 * 페이지 레이아웃 자동 검증
 */
export async function validatePageLayout(page: Page): Promise<LayoutValidationResult> {
  const layoutType = await detectLayoutType(page);

  switch (layoutType) {
    case 'sidebar':
      return validateSidebarLayout(page);
    case 'chat':
      return validateChatLayout(page);
    case 'slide':
      return validateSlideLayout(page);
    case 'grid':
      return validateGridLayout(page);
    default:
      return validateAboveTheFold(page, 'main, [role="main"], .container, #root > div');
  }
}

// ============================================================================
// 7. 리포트 생성
// ============================================================================

export function generateLayoutReport(result: LayoutValidationResult, pageName: string): string {
  const lines: string[] = [];
  const status = result.passed ? '✅ PASS' : '❌ FAIL';

  lines.push(`\n${'═'.repeat(60)}`);
  lines.push(`📐 Layout Validation: ${pageName}`);
  lines.push(`${'═'.repeat(60)}`);
  lines.push(`Status: ${status}`);
  lines.push(`Viewport: ${result.metrics.viewportWidth}x${result.metrics.viewportHeight}`);
  lines.push(`Main Content Y: ${Math.round(result.metrics.mainContentY)}px`);
  lines.push(`Visible Area: ${result.metrics.visibleAreaPercentage.toFixed(1)}%`);

  if (result.issues.length > 0) {
    lines.push(`\nIssues (${result.issues.length}):`);
    result.issues.forEach((issue, i) => {
      const icon = issue.severity === 'error' ? '🔴' : '🟡';
      lines.push(`  ${icon} ${issue.type}: ${issue.message}`);
      if (issue.expected) lines.push(`     Expected: ${issue.expected}`);
      if (issue.actual) lines.push(`     Actual: ${issue.actual}`);
    });
  }

  lines.push(`${'═'.repeat(60)}\n`);

  return lines.join('\n');
}
