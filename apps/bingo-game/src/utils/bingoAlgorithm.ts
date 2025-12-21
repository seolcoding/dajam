import type { BingoCell, BingoLine, BingoState } from '@/types/bingo.types';

/**
 * 빙고판 초기화
 */
export function initializeBingoState(card: string[][]): BingoState {
  const gridSize = card.length;
  const itemToCoord = new Map<string, [number, number]>();
  const cells: BingoCell[][] = [];

  for (let row = 0; row < gridSize; row++) {
    cells[row] = [];
    for (let col = 0; col < gridSize; col++) {
      const value = card[row][col];
      cells[row][col] = {
        value,
        isMarked: value === 'FREE', // FREE 칸은 자동 마킹
        row,
        col,
      };
      itemToCoord.set(value, [row, col]);
    }
  }

  // FREE 칸이 있으면 해당 카운터 증가
  const freeRow = Math.floor(gridSize / 2);
  const freeCol = Math.floor(gridSize / 2);
  const hasFree = card[freeRow]?.[freeCol] === 'FREE';

  return {
    gridSize,
    cells,
    itemToCoord,
    rowCounts: new Array(gridSize).fill(hasFree ? 0 : 0).map((_, i) =>
      hasFree && i === freeRow ? 1 : 0
    ),
    colCounts: new Array(gridSize).fill(hasFree ? 0 : 0).map((_, i) =>
      hasFree && i === freeCol ? 1 : 0
    ),
    diagCount1: hasFree && freeRow === freeCol ? 1 : 0,
    diagCount2: hasFree && freeRow + freeCol === gridSize - 1 ? 1 : 0,
    completedLines: [],
  };
}

/**
 * 아이템 호출 시 마킹
 */
export function markItem(state: BingoState, item: string): boolean {
  const coord = state.itemToCoord.get(item);
  if (!coord) return false; // 빙고판에 없는 아이템

  const [row, col] = coord;
  const cell = state.cells[row][col];

  if (cell.isMarked) return false; // 이미 마킹됨

  // 마킹 처리
  cell.isMarked = true;

  // 카운터 업데이트
  state.rowCounts[row]++;
  state.colCounts[col]++;

  // 주 대각선 체크 (row === col)
  if (row === col) {
    state.diagCount1++;
  }

  // 부 대각선 체크 (row + col === gridSize - 1)
  if (row + col === state.gridSize - 1) {
    state.diagCount2++;
  }

  return true;
}

/**
 * 셀 직접 마킹 (플레이어 모드)
 */
export function toggleCell(state: BingoState, row: number, col: number): boolean {
  const cell = state.cells[row][col];

  // FREE 칸은 토글 불가
  if (cell.value === 'FREE') return false;

  const wasMarked = cell.isMarked;
  cell.isMarked = !cell.isMarked;

  // 카운터 업데이트
  const delta = wasMarked ? -1 : 1;
  state.rowCounts[row] += delta;
  state.colCounts[col] += delta;

  // 주 대각선
  if (row === col) {
    state.diagCount1 += delta;
  }

  // 부 대각선
  if (row + col === state.gridSize - 1) {
    state.diagCount2 += delta;
  }

  return true;
}

/**
 * 라인 고유 ID 생성 (중복 체크용)
 */
function getLineId(line: BingoLine): string {
  if (line.type === 'row') return `row-${line.index}`;
  if (line.type === 'column') return `col-${line.index}`;

  // 대각선은 cells로 구분
  const cellsKey = line.cells.map(([r, c]) => `${r},${c}`).join('|');
  return `diag-${cellsKey}`;
}

/**
 * 빙고 체크 (마킹 후 호출)
 */
export function checkBingo(state: BingoState): BingoLine[] {
  const { gridSize, rowCounts, colCounts, diagCount1, diagCount2 } = state;
  const newLines: BingoLine[] = [];

  // 기존 완성된 라인 제외하고 체크
  const existingLineIds = new Set(
    state.completedLines.map(line => getLineId(line))
  );

  // 1. 가로줄 체크
  for (let row = 0; row < gridSize; row++) {
    if (rowCounts[row] === gridSize) {
      const line: BingoLine = {
        type: 'row',
        index: row,
        cells: Array.from({ length: gridSize }, (_, col) => [row, col] as [number, number]),
      };

      const lineId = getLineId(line);
      if (!existingLineIds.has(lineId)) {
        newLines.push(line);
      }
    }
  }

  // 2. 세로줄 체크
  for (let col = 0; col < gridSize; col++) {
    if (colCounts[col] === gridSize) {
      const line: BingoLine = {
        type: 'column',
        index: col,
        cells: Array.from({ length: gridSize }, (_, row) => [row, col] as [number, number]),
      };

      const lineId = getLineId(line);
      if (!existingLineIds.has(lineId)) {
        newLines.push(line);
      }
    }
  }

  // 3. 주 대각선 체크 (\)
  if (diagCount1 === gridSize) {
    const line: BingoLine = {
      type: 'diagonal',
      cells: Array.from({ length: gridSize }, (_, i) => [i, i] as [number, number]),
    };

    const lineId = getLineId(line);
    if (!existingLineIds.has(lineId)) {
      newLines.push(line);
    }
  }

  // 4. 부 대각선 체크 (/)
  if (diagCount2 === gridSize) {
    const line: BingoLine = {
      type: 'diagonal',
      cells: Array.from({ length: gridSize }, (_, i) => [i, gridSize - 1 - i] as [number, number]),
    };

    const lineId = getLineId(line);
    if (!existingLineIds.has(lineId)) {
      newLines.push(line);
    }
  }

  // 새로운 라인 추가
  state.completedLines.push(...newLines);

  return newLines;
}

/**
 * 전체 빙고 개수 반환
 */
export function getBingoCount(state: BingoState): number {
  return state.completedLines.length;
}

/**
 * 승리 조건 체크
 */
export function checkWinCondition(
  state: BingoState,
  condition: string
): boolean {
  const bingoCount = getBingoCount(state);

  switch (condition) {
    case 'single-line':
      return bingoCount >= 1;
    case 'double-line':
      return bingoCount >= 2;
    case 'triple-line':
      return bingoCount >= 3;
    case 'four-corners':
      return checkFourCorners(state);
    case 'full-house':
      return checkFullHouse(state);
    default:
      return false;
  }
}

/**
 * 네 모서리 체크
 */
function checkFourCorners(state: BingoState): boolean {
  const { cells, gridSize } = state;
  const corners = [
    cells[0][0],
    cells[0][gridSize - 1],
    cells[gridSize - 1][0],
    cells[gridSize - 1][gridSize - 1],
  ];

  return corners.every(cell => cell.isMarked);
}

/**
 * 전체 완성 체크
 */
function checkFullHouse(state: BingoState): boolean {
  const { cells } = state;
  return cells.every(row => row.every(cell => cell.isMarked));
}
