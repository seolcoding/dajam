/**
 * Human Bingo 유틸리티 함수
 */

import type { Trait, BingoCell, BingoLine, GridSize, ParticipantCard } from '../types';

/**
 * Fisher-Yates 셔플
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 난이도별 밸런싱된 빙고 특성 선택
 * easy 40%, medium 40%, hard 20%
 */
export function generateBalancedTraits(
  allTraits: Trait[],
  gridSize: GridSize,
  centerFree: boolean = true
): Trait[] {
  const totalCells = gridSize * gridSize;
  const neededCount = centerFree ? totalCells - 1 : totalCells;

  // 난이도별 비율
  const easyCount = Math.floor(neededCount * 0.4);
  const mediumCount = Math.floor(neededCount * 0.4);
  const hardCount = neededCount - easyCount - mediumCount;

  const easyTraits = shuffleArray(allTraits.filter(t => t.difficulty === 'easy')).slice(0, easyCount);
  const mediumTraits = shuffleArray(allTraits.filter(t => t.difficulty === 'medium')).slice(0, mediumCount);
  const hardTraits = shuffleArray(allTraits.filter(t => t.difficulty === 'hard')).slice(0, hardCount);

  const selected = [...easyTraits, ...mediumTraits, ...hardTraits];
  return shuffleArray(selected);
}

/**
 * 빙고판 생성 (2D 배열)
 */
export function createBingoCard(
  traits: Trait[],
  gridSize: GridSize,
  participantId: string,
  participantName: string
): ParticipantCard {
  const cells: BingoCell[][] = [];
  const centerIndex = Math.floor(gridSize / 2);
  let traitIndex = 0;

  for (let row = 0; row < gridSize; row++) {
    cells[row] = [];
    for (let col = 0; col < gridSize; col++) {
      // Center cell is FREE
      const isFreeCell = row === centerIndex && col === centerIndex && gridSize === 5;

      cells[row][col] = {
        trait: isFreeCell ? null : traits[traitIndex++],
        isChecked: isFreeCell,
        row,
        col,
      };
    }
  }

  return {
    participantId,
    participantName,
    card: cells,
    completedLines: [],
    checkedCount: gridSize === 5 ? 1 : 0, // FREE cell counted
  };
}

/**
 * 빙고 라인 체크 (가로, 세로, 대각선)
 */
export function checkBingoLines(card: BingoCell[][]): BingoLine[] {
  const gridSize = card.length;
  const lines: BingoLine[] = [];

  // 가로줄 체크
  for (let row = 0; row < gridSize; row++) {
    if (card[row].every(cell => cell.isChecked)) {
      lines.push({
        type: 'row',
        index: row,
        cells: card[row].map((cell) => [cell.row, cell.col] as [number, number]),
      });
    }
  }

  // 세로줄 체크
  for (let col = 0; col < gridSize; col++) {
    const columnCells = card.map(row => row[col]);
    if (columnCells.every(cell => cell.isChecked)) {
      lines.push({
        type: 'column',
        index: col,
        cells: columnCells.map((cell) => [cell.row, cell.col] as [number, number]),
      });
    }
  }

  // 주 대각선 체크 (\)
  const mainDiagonal = card.map((row, i) => row[i]);
  if (mainDiagonal.every(cell => cell.isChecked)) {
    lines.push({
      type: 'diagonal',
      cells: mainDiagonal.map((cell) => [cell.row, cell.col] as [number, number]),
    });
  }

  // 부 대각선 체크 (/)
  const antiDiagonal = card.map((row, i) => row[gridSize - 1 - i]);
  if (antiDiagonal.every(cell => cell.isChecked)) {
    lines.push({
      type: 'diagonal',
      cells: antiDiagonal.map((cell) => [cell.row, cell.col] as [number, number]),
    });
  }

  return lines;
}

/**
 * 셀 체크 처리
 */
export function checkCell(
  card: ParticipantCard,
  row: number,
  col: number,
  checkedByName: string
): { updatedCard: ParticipantCard; newLines: BingoLine[] } {
  const cell = card.card[row][col];

  // 이미 체크된 경우 또는 FREE 셀인 경우
  if (cell.isChecked || cell.trait === null) {
    return { updatedCard: card, newLines: [] };
  }

  // 셀 체크
  cell.isChecked = true;
  cell.checkedBy = checkedByName;
  cell.checkedAt = new Date().toISOString();

  // 체크 카운트 증가
  const updatedCard = {
    ...card,
    checkedCount: card.checkedCount + 1,
  };

  // 빙고 라인 체크
  const previousLineCount = card.completedLines.length;
  const currentLines = checkBingoLines(card.card);
  const newLines = currentLines.slice(previousLineCount);

  updatedCard.completedLines = currentLines;

  // 첫 빙고 달성 시간 기록
  if (newLines.length > 0 && !card.bingoAt) {
    updatedCard.bingoAt = new Date().toISOString();
  }

  return { updatedCard, newLines };
}

/**
 * 승리 조건 체크
 */
export function checkWinCondition(
  lineCount: number,
  condition: 'single-line' | 'two-lines' | 'three-lines' | 'full-house',
  totalCells: number,
  checkedCount: number
): boolean {
  switch (condition) {
    case 'single-line':
      return lineCount >= 1;
    case 'two-lines':
      return lineCount >= 2;
    case 'three-lines':
      return lineCount >= 3;
    case 'full-house':
      return checkedCount === totalCells;
    default:
      return false;
  }
}

/**
 * 리더보드 정렬
 */
export function sortLeaderboard(participants: ParticipantCard[]): ParticipantCard[] {
  return [...participants].sort((a, b) => {
    // 1순위: 빙고 줄 수
    if (b.completedLines.length !== a.completedLines.length) {
      return b.completedLines.length - a.completedLines.length;
    }

    // 2순위: 빙고 달성 시간 (빠른 순)
    if (a.bingoAt && b.bingoAt) {
      return new Date(a.bingoAt).getTime() - new Date(b.bingoAt).getTime();
    }
    if (a.bingoAt) return -1;
    if (b.bingoAt) return 1;

    // 3순위: 체크 수
    return b.checkedCount - a.checkedCount;
  });
}

/**
 * 셀이 빙고 라인에 포함되는지 확인
 */
export function isCellInBingoLine(row: number, col: number, lines: BingoLine[]): boolean {
  return lines.some(line =>
    line.cells.some(([r, c]) => r === row && c === col)
  );
}
