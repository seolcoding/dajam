/**
 * Canvas Rendering Functions
 *
 * Canvas를 사용한 사다리 렌더링
 */

import type { LadderData, CanvasConfig, PathPoint } from './types';

/**
 * 사다리 그리기
 */
export function drawLadder(
  ctx: CanvasRenderingContext2D,
  ladder: LadderData,
  participants: string[],
  results: string[],
  config: CanvasConfig
): void {
  const { width, height, padding, lineWidth } = config;
  const { columnCount, bridges, rowHeight } = ladder;

  // 캔버스 초기화
  ctx.clearRect(0, 0, width, height);

  // Subtle gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#fefefe');
  gradient.addColorStop(1, '#f8fafc');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 컬럼 간격 계산
  const usableWidth = width - padding * 2;
  const columnGap = usableWidth / (columnCount - 1);
  const totalHeight = bridges.length > 0
    ? Math.max(...bridges.map(b => b.row)) * rowHeight * columnCount
    : rowHeight * 8;

  // 1. 세로선 그리기 (with shadow and gradient)
  for (let i = 0; i < columnCount; i++) {
    const x = padding + i * columnGap;
    const y1 = padding + 40;
    const y2 = padding + 40 + totalHeight;

    // Shadow for depth
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = lineWidth + 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 2, y1);
    ctx.lineTo(x + 2, y2);
    ctx.stroke();

    // Gradient vertical line
    const vertGradient = ctx.createLinearGradient(x, y1, x, y2);
    vertGradient.addColorStop(0, '#10b981');
    vertGradient.addColorStop(0.5, '#059669');
    vertGradient.addColorStop(1, '#047857');

    ctx.strokeStyle = vertGradient;
    ctx.lineWidth = lineWidth + 1;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();

    // Highlight line on left side for 3D effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 2, y1);
    ctx.lineTo(x - 2, y2);
    ctx.stroke();
  }

  // 2. 가로선 그리기 (with rounded ends and texture)
  bridges.forEach(bridge => {
    const x1 = padding + bridge.fromColumn * columnGap;
    const x2 = padding + bridge.toColumn * columnGap;
    const y = padding + 40 + bridge.row * totalHeight;

    // Shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = lineWidth + 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y + 2);
    ctx.lineTo(x2, y + 2);
    ctx.stroke();

    // Main bridge with gradient
    const bridgeGradient = ctx.createLinearGradient(x1, y, x2, y);
    bridgeGradient.addColorStop(0, '#f59e0b');
    bridgeGradient.addColorStop(0.5, '#d97706');
    bridgeGradient.addColorStop(1, '#f59e0b');

    ctx.strokeStyle = bridgeGradient;
    ctx.lineWidth = lineWidth + 1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();

    // Highlight for 3D effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y - 2);
    ctx.lineTo(x2, y - 2);
    ctx.stroke();
  });

  // 3. 참가자 이름 (상단) - with badges
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  participants.forEach((name, i) => {
    const x = padding + i * columnGap;
    const y = padding + 20;

    // Badge background
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = 'rgba(16, 185, 129, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    const textWidth = ctx.measureText(name).width;
    const badgeWidth = Math.max(textWidth + 20, 60);
    const badgeHeight = 32;

    // Rounded rectangle
    ctx.beginPath();
    ctx.roundRect(x - badgeWidth/2, y - badgeHeight/2, badgeWidth, badgeHeight, 16);
    ctx.fill();

    // Border highlight
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Pretendard Variable", "Pretendard", sans-serif';
    ctx.fillText(name, x, y);
  });

  // 4. 결과 텍스트 (하단) - with badges
  results.forEach((result, i) => {
    const x = padding + i * columnGap;
    const y = padding + 40 + totalHeight + 20;

    // Badge background
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    const textWidth = ctx.measureText(result).width;
    const badgeWidth = Math.max(textWidth + 20, 60);
    const badgeHeight = 32;

    // Rounded rectangle
    ctx.beginPath();
    ctx.roundRect(x - badgeWidth/2, y - badgeHeight/2, badgeWidth, badgeHeight, 16);
    ctx.fill();

    // Border highlight
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Pretendard Variable", "Pretendard", sans-serif';
    ctx.fillText(result, x, y);
  });
}

/**
 * 강조된 경로 그리기
 */
export function drawHighlightedPath(
  ctx: CanvasRenderingContext2D,
  path: PathPoint[],
  currentPoint: PathPoint,
  config: CanvasConfig
): void {
  // Outer glow
  ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
  ctx.lineWidth = config.lineWidth * 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
  ctx.shadowBlur = 15;

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    const point = path[i];

    if (
      (point.y > currentPoint.y && path[i - 1].direction === 'down') ||
      (Math.abs(point.x - currentPoint.x) < 1 &&
       Math.abs(point.y - currentPoint.y) < 1)
    ) {
      ctx.lineTo(currentPoint.x, currentPoint.y);
      break;
    }

    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Main path with gradient
  const gradient = ctx.createLinearGradient(
    path[0].x,
    path[0].y,
    currentPoint.x,
    currentPoint.y
  );
  gradient.addColorStop(0, '#ec4899');
  gradient.addColorStop(0.5, '#f43f5e');
  gradient.addColorStop(1, '#ef4444');

  ctx.strokeStyle = gradient;
  ctx.lineWidth = config.lineWidth * 2.5;

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    const point = path[i];

    if (
      (point.y > currentPoint.y && path[i - 1].direction === 'down') ||
      (Math.abs(point.x - currentPoint.x) < 1 &&
       Math.abs(point.y - currentPoint.y) < 1)
    ) {
      ctx.lineTo(currentPoint.x, currentPoint.y);
      break;
    }

    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();
}

/**
 * 현재 위치 마커 그리기
 */
export function drawMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  _config: CanvasConfig
): void {
  const radius = 10;
  const time = Date.now() / 500;

  // Animated pulsing outer ring
  const pulseRadius = radius + 5 + Math.sin(time) * 3;
  ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
  ctx.beginPath();
  ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
  ctx.fill();

  // Glow effect
  ctx.shadowColor = 'rgba(236, 72, 153, 0.8)';
  ctx.shadowBlur = 20;

  // Gradient outer circle
  const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, radius + 3);
  outerGradient.addColorStop(0, '#fbbf24');
  outerGradient.addColorStop(1, '#f59e0b');

  ctx.fillStyle = outerGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Inner gradient circle
  const innerGradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, radius);
  innerGradient.addColorStop(0, '#fef3c7');
  innerGradient.addColorStop(0.3, '#fbbf24');
  innerGradient.addColorStop(1, '#f59e0b');

  ctx.fillStyle = innerGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // White highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(x - 3, y - 3, radius / 3, 0, Math.PI * 2);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * 테마별 색상 가져오기
 */
export function getThemeColors(theme: 'light' | 'dark' | 'colorful') {
  switch (theme) {
    case 'dark':
      return {
        line: '#9CA3AF',
        text: '#F3F4F6',
        highlight: '#60A5FA',
        background: '#1F2937'
      };
    case 'colorful':
      return {
        line: '#8B5CF6',
        text: '#1F2937',
        highlight: '#EC4899',
        background: '#FEF3C7'
      };
    default: // light
      return {
        line: '#374151',
        text: '#111827',
        highlight: '#3B82F6',
        background: '#FFFFFF'
      };
  }
}
