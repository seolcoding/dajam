/**
 * Ladder Path Tracing Algorithm
 *
 * 경로 추적 알고리즘 (O(n) 시간 복잡도)
 */

import type { LadderData, PathPoint, TraceResult, CanvasConfig } from './types';

/**
 * 경로 추적 알고리즘
 */
export function tracePath(
  startColumn: number,
  ladder: LadderData,
  config: CanvasConfig
): TraceResult {
  const { columnCount, bridges, rowHeight } = ladder;
  const { padding, width } = config;

  const path: PathPoint[] = [];
  const bridgesCrossed = [];

  const usableWidth = width - padding * 2;
  const columnGap = usableWidth / (columnCount - 1);
  const totalHeight = bridges.length > 0
    ? Math.max(...bridges.map(b => b.row)) * rowHeight * columnCount
    : rowHeight * 8;

  let currentColumn = startColumn;
  let currentY = padding + 40;

  // 시작점
  path.push({
    x: padding + currentColumn * columnGap,
    y: currentY,
    direction: 'down'
  });

  // 가로선은 이미 row 순으로 정렬되어 있음
  for (const bridge of bridges) {
    if (bridge.fromColumn === currentColumn) {
      const bridgeY = padding + 40 + bridge.row * totalHeight;

      // 가로선 시작점 도달
      path.push({
        x: padding + currentColumn * columnGap,
        y: bridgeY,
        direction: 'down'
      });

      // 오른쪽으로 이동
      currentColumn = bridge.toColumn;
      path.push({
        x: padding + currentColumn * columnGap,
        y: bridgeY,
        direction: 'right'
      });

      bridgesCrossed.push(bridge);
    } else if (bridge.toColumn === currentColumn) {
      const bridgeY = padding + 40 + bridge.row * totalHeight;

      // 가로선 종료점 도달
      path.push({
        x: padding + currentColumn * columnGap,
        y: bridgeY,
        direction: 'down'
      });

      // 왼쪽으로 이동
      currentColumn = bridge.fromColumn;
      path.push({
        x: padding + currentColumn * columnGap,
        y: bridgeY,
        direction: 'left'
      });

      bridgesCrossed.push(bridge);
    }
  }

  // 종료점
  path.push({
    x: padding + currentColumn * columnGap,
    y: padding + 40 + totalHeight,
    direction: 'down'
  });

  return {
    endColumn: currentColumn,
    path,
    bridgesCrossed
  };
}

/**
 * 모든 참가자의 결과를 한 번에 계산
 */
export function calculateAllResults(ladder: LadderData, config: CanvasConfig): number[] {
  const results: number[] = [];

  for (let col = 0; col < ladder.columnCount; col++) {
    const { endColumn } = tracePath(col, ladder, config);
    results.push(endColumn);
  }

  return results;
}

/**
 * 결과 검증: 1:1 매칭 확인 (bijection)
 */
export function validateResults(results: number[], columnCount: number): boolean {
  const resultSet = new Set(results);

  for (const result of results) {
    if (result < 0 || result >= columnCount) {
      return false;
    }
  }

  return resultSet.size === columnCount;
}

/**
 * 경로 총 거리 계산
 */
export function calculateTotalDistance(path: PathPoint[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

/**
 * 특정 거리에서의 포인트 계산
 */
export function getPointAtDistance(path: PathPoint[], distance: number): PathPoint {
  let accumulated = 0;

  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    if (accumulated + segmentLength >= distance) {
      const remaining = distance - accumulated;
      const ratio = remaining / segmentLength;

      return {
        x: path[i - 1].x + dx * ratio,
        y: path[i - 1].y + dy * ratio,
        direction: path[i - 1].direction
      };
    }

    accumulated += segmentLength;
  }

  return path[path.length - 1];
}
