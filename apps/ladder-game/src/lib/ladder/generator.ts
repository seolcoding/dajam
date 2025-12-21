/**
 * Ladder Generation Algorithm
 *
 * 개선된 사다리 생성 알고리즘 (균등 분포 보장)
 * - 각 세로선이 최소 1개 이상의 가로선을 가짐
 * - 가로선 간 최소 간격 유지
 * - 동일 행에 인접한 가로선 금지
 * - 균등한 수직 분포 (clustering 방지)
 */

import type { Bridge, LadderData } from './types';

interface GeneratorOptions {
  density?: number;
  minGap?: number;
  ensureAllConnected?: boolean;
}

/**
 * 사다리 가로선 랜덤 생성
 */
export function generateLadder(
  columnCount: number,
  options: GeneratorOptions = {}
): LadderData {
  const {
    density = 0.5,
    minGap = 2,
    ensureAllConnected = true
  } = options;

  const rows = Math.max(10, columnCount * 3);
  const targetBridgeCount = Math.floor(
    (columnCount - 1) * rows * density
  );

  const bridges: Bridge[] = [];
  const bridgesByColumn: Map<number, number[]> = new Map();

  // 초기화
  for (let col = 0; col < columnCount - 1; col++) {
    bridgesByColumn.set(col, []);
  }

  // STEP 1: 최소 연결 보장
  if (ensureAllConnected) {
    for (let col = 0; col < columnCount - 1; col++) {
      const row = Math.floor((col + 0.5) * rows / columnCount);
      bridges.push({
        id: crypto.randomUUID(),
        fromColumn: col,
        toColumn: col + 1,
        row: row / rows
      });
      bridgesByColumn.get(col)!.push(row);
    }
  }

  // STEP 2: 남은 가로선 배치
  const remainingCount = targetBridgeCount - bridges.length;
  let attempts = 0;
  const maxAttempts = remainingCount * 50;

  while (bridges.length < targetBridgeCount && attempts < maxAttempts) {
    attempts++;

    const col = selectColumnWithBias(bridgesByColumn, columnCount);
    const row = Math.floor(Math.random() * rows);

    if (hasConflict(col, row, bridgesByColumn, minGap)) {
      continue;
    }

    bridges.push({
      id: crypto.randomUUID(),
      fromColumn: col,
      toColumn: col + 1,
      row: row / rows
    });
    bridgesByColumn.get(col)!.push(row);
  }

  // 정렬 (위에서 아래로)
  bridges.sort((a, b) => a.row - b.row);

  return {
    columnCount,
    bridges,
    rowHeight: 50,
    minBridgeGap: minGap
  };
}

/**
 * 가로선이 적은 열에 우선 배치 (Weighted Random Selection)
 */
function selectColumnWithBias(
  bridgesByColumn: Map<number, number[]>,
  columnCount: number
): number {
  const counts = Array.from(bridgesByColumn.values()).map(arr => arr.length);
  const maxCount = Math.max(...counts);
  const weights = counts.map(count => maxCount - count + 1);

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }

  return columnCount - 2;
}

/**
 * 충돌 검사 (인접 열, 최소 간격)
 */
function hasConflict(
  col: number,
  row: number,
  bridgesByColumn: Map<number, number[]>,
  minGap: number
): boolean {
  // 1. 동일 열 검사
  const sameColBridges = bridgesByColumn.get(col) || [];
  for (const existingRow of sameColBridges) {
    if (Math.abs(existingRow - row) < minGap) {
      return true;
    }
  }

  // 2. 인접 열 검사
  for (const adjacentCol of [col - 1, col + 1]) {
    if (adjacentCol < 0 || adjacentCol >= bridgesByColumn.size) {
      continue;
    }

    const adjacentBridges = bridgesByColumn.get(adjacentCol) || [];
    for (const existingRow of adjacentBridges) {
      if (Math.abs(existingRow - row) < minGap) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 입력값 검증
 */
export function validateInput(config: {
  participants: string[];
  results: string[];
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.participants.length < 2) {
    errors.push('참가자는 최소 2명 이상이어야 합니다');
  }

  if (config.participants.length > 8) {
    errors.push('참가자는 최대 8명까지 가능합니다');
  }

  if (config.participants.length !== config.results.length) {
    errors.push('참가자 수와 결과 수가 일치해야 합니다');
  }

  const hasDuplicate = (arr: string[]) => new Set(arr).size !== arr.length;

  if (hasDuplicate(config.participants)) {
    errors.push('중복된 참가자 이름이 있습니다');
  }

  if (hasDuplicate(config.results)) {
    errors.push('중복된 결과 이름이 있습니다');
  }

  const hasEmpty = (arr: string[]) => arr.some(s => !s.trim());

  if (hasEmpty(config.participants)) {
    errors.push('참가자 이름을 모두 입력해주세요');
  }

  if (hasEmpty(config.results)) {
    errors.push('결과 이름을 모두 입력해주세요');
  }

  return { valid: errors.length === 0, errors };
}
