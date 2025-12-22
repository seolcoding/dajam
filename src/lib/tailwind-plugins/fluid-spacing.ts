import plugin from 'tailwindcss/plugin';

/**
 * Fluid Spacing Plugin for Tailwind CSS
 *
 * 요소 크기/뷰포트에 비례하는 간격 시스템
 *
 * 사용법:
 * - `p-fluid-sm` ~ `p-fluid-2xl`: 뷰포트 기반 비례 패딩
 * - `gap-fluid-sm` ~ `gap-fluid-2xl`: 뷰포트 기반 비례 갭
 * - `space-y-fluid-sm` ~ `space-y-fluid-2xl`: 뷰포트 기반 비례 간격
 *
 * 계산 공식:
 * fluid(min, max) = clamp(min, preferred, max)
 * preferred = min + (max - min) * ((100vw - minViewport) / (maxViewport - minViewport))
 */

// 뷰포트 기준값
const MIN_VIEWPORT = 320; // 모바일 최소
const MAX_VIEWPORT = 1440; // 데스크톱 최대

// 스케일 정의 (px 단위)
const FLUID_SCALES = {
  xs: { min: 4, max: 8 },
  sm: { min: 8, max: 16 },
  md: { min: 12, max: 24 },
  lg: { min: 16, max: 32 },
  xl: { min: 24, max: 48 },
  '2xl': { min: 32, max: 64 },
  '3xl': { min: 48, max: 96 },
};

/**
 * clamp() 기반 fluid 값 생성
 */
function generateFluidValue(min: number, max: number): string {
  const slope = (max - min) / (MAX_VIEWPORT - MIN_VIEWPORT);
  const yAxisIntersection = -MIN_VIEWPORT * slope + min;

  const minRem = min / 16;
  const maxRem = max / 16;
  const slopeVw = slope * 100;
  const interceptRem = yAxisIntersection / 16;

  return `clamp(${minRem}rem, ${interceptRem.toFixed(4)}rem + ${slopeVw.toFixed(4)}vw, ${maxRem}rem)`;
}

/**
 * CSS 변수로 fluid 값 생성
 */
function generateCSSVariables(): Record<string, string> {
  const variables: Record<string, string> = {};

  for (const [scale, { min, max }] of Object.entries(FLUID_SCALES)) {
    variables[`--spacing-fluid-${scale}`] = generateFluidValue(min, max);
  }

  return variables;
}

/**
 * Tailwind 유틸리티 클래스 생성
 */
export const fluidSpacingPlugin = plugin(function ({ addBase, addUtilities, matchUtilities, theme }) {
  // CSS 변수를 :root에 추가
  addBase({
    ':root': generateCSSVariables(),
  });

  // 정적 유틸리티 클래스
  const staticUtilities: Record<string, Record<string, string>> = {};

  for (const scale of Object.keys(FLUID_SCALES)) {
    const varName = `var(--spacing-fluid-${scale})`;

    // Padding
    staticUtilities[`.p-fluid-${scale}`] = { padding: varName };
    staticUtilities[`.px-fluid-${scale}`] = {
      'padding-left': varName,
      'padding-right': varName,
    };
    staticUtilities[`.py-fluid-${scale}`] = {
      'padding-top': varName,
      'padding-bottom': varName,
    };
    staticUtilities[`.pt-fluid-${scale}`] = { 'padding-top': varName };
    staticUtilities[`.pr-fluid-${scale}`] = { 'padding-right': varName };
    staticUtilities[`.pb-fluid-${scale}`] = { 'padding-bottom': varName };
    staticUtilities[`.pl-fluid-${scale}`] = { 'padding-left': varName };

    // Margin
    staticUtilities[`.m-fluid-${scale}`] = { margin: varName };
    staticUtilities[`.mx-fluid-${scale}`] = {
      'margin-left': varName,
      'margin-right': varName,
    };
    staticUtilities[`.my-fluid-${scale}`] = {
      'margin-top': varName,
      'margin-bottom': varName,
    };
    staticUtilities[`.mt-fluid-${scale}`] = { 'margin-top': varName };
    staticUtilities[`.mr-fluid-${scale}`] = { 'margin-right': varName };
    staticUtilities[`.mb-fluid-${scale}`] = { 'margin-bottom': varName };
    staticUtilities[`.ml-fluid-${scale}`] = { 'margin-left': varName };

    // Gap
    staticUtilities[`.gap-fluid-${scale}`] = { gap: varName };
    staticUtilities[`.gap-x-fluid-${scale}`] = { 'column-gap': varName };
    staticUtilities[`.gap-y-fluid-${scale}`] = { 'row-gap': varName };

    // Space between (using > * + *)
    staticUtilities[`.space-y-fluid-${scale} > * + *`] = { 'margin-top': varName };
    staticUtilities[`.space-x-fluid-${scale} > * + *`] = { 'margin-left': varName };

    // Inset
    staticUtilities[`.inset-fluid-${scale}`] = {
      top: varName,
      right: varName,
      bottom: varName,
      left: varName,
    };
  }

  addUtilities(staticUtilities);
});

/**
 * 컨테이너 쿼리 기반 비례 간격 (cqw 단위)
 *
 * 부모 컨테이너 크기에 비례
 */
export const containerQuerySpacingPlugin = plugin(function ({ addUtilities }) {
  const cqUtilities: Record<string, Record<string, string>> = {};

  // 컨테이너 쿼리 단위 기반 간격 (컨테이너 너비의 %)
  const CQ_SCALES = {
    'cq-1': '1cqw',
    'cq-2': '2cqw',
    'cq-3': '3cqw',
    'cq-4': '4cqw',
    'cq-5': '5cqw',
    'cq-6': '6cqw',
    'cq-8': '8cqw',
    'cq-10': '10cqw',
  };

  for (const [scale, value] of Object.entries(CQ_SCALES)) {
    cqUtilities[`.p-${scale}`] = { padding: value };
    cqUtilities[`.px-${scale}`] = { 'padding-left': value, 'padding-right': value };
    cqUtilities[`.py-${scale}`] = { 'padding-top': value, 'padding-bottom': value };
    cqUtilities[`.m-${scale}`] = { margin: value };
    cqUtilities[`.gap-${scale}`] = { gap: value };
  }

  // 컨테이너 정의 유틸리티
  cqUtilities['.container-query'] = { 'container-type': 'inline-size' };
  cqUtilities['.container-query-size'] = { 'container-type': 'size' };

  addUtilities(cqUtilities);
});

export default fluidSpacingPlugin;
