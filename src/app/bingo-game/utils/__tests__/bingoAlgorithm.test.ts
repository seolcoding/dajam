import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeBingoState,
  markItem,
  toggleCell,
  checkBingo,
  getBingoCount,
  checkWinCondition,
} from '../bingoAlgorithm';
import type { BingoState } from '../../types/bingo.types';

describe('bingoAlgorithm', () => {
  describe('initializeBingoState', () => {
    it('3x3 빙고판을 초기화해야 함', () => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];

      const state = initializeBingoState(card);

      expect(state.gridSize).toBe(3);
      expect(state.cells).toHaveLength(3);
      expect(state.cells[0]).toHaveLength(3);
      expect(state.rowCounts).toHaveLength(3);
      expect(state.colCounts).toHaveLength(3);
    });

    it('5x5 빙고판을 초기화해야 함', () => {
      const card = Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => {
          if (row === 2 && col === 2) return 'FREE';
          return `${row * 5 + col + 1}`;
        })
      );

      const state = initializeBingoState(card);

      expect(state.gridSize).toBe(5);
      expect(state.cells).toHaveLength(5);
    });

    it('FREE 칸을 자동으로 마킹해야 함', () => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];

      const state = initializeBingoState(card);

      expect(state.cells[1][1].isMarked).toBe(true);
      expect(state.cells[0][0].isMarked).toBe(false);
    });

    it('FREE 칸의 카운터를 초기화해야 함', () => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];

      const state = initializeBingoState(card);

      // FREE가 [1][1]에 있으므로 row=1, col=1 카운터가 1
      expect(state.rowCounts[1]).toBe(1);
      expect(state.colCounts[1]).toBe(1);
      // 두 대각선 모두 FREE를 포함
      expect(state.diagCount1).toBe(1);
      expect(state.diagCount2).toBe(1);
    });

    it('itemToCoord 맵을 올바르게 생성해야 함', () => {
      const card = [
        ['A', 'B', 'C'],
        ['D', 'E', 'F'],
        ['G', 'H', 'I'],
      ];

      const state = initializeBingoState(card);

      expect(state.itemToCoord.get('A')).toEqual([0, 0]);
      expect(state.itemToCoord.get('E')).toEqual([1, 1]);
      expect(state.itemToCoord.get('I')).toEqual([2, 2]);
    });

    it('FREE 없는 빙고판도 처리해야 함', () => {
      const card = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ];

      const state = initializeBingoState(card);

      expect(state.rowCounts.every(c => c === 0)).toBe(true);
      expect(state.colCounts.every(c => c === 0)).toBe(true);
      expect(state.diagCount1).toBe(0);
      expect(state.diagCount2).toBe(0);
    });
  });

  describe('markItem', () => {
    let state: BingoState;

    beforeEach(() => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];
      state = initializeBingoState(card);
    });

    it('아이템을 마킹해야 함', () => {
      const result = markItem(state, '1');

      expect(result).toBe(true);
      expect(state.cells[0][0].isMarked).toBe(true);
    });

    it('카운터를 업데이트해야 함', () => {
      markItem(state, '1');

      expect(state.rowCounts[0]).toBe(1);
      expect(state.colCounts[0]).toBe(1);
      expect(state.diagCount1).toBe(2); // FREE + '1' (둘 다 주대각선)
    });

    it('없는 아이템은 false 반환해야 함', () => {
      const result = markItem(state, '존재하지 않음');

      expect(result).toBe(false);
    });

    it('이미 마킹된 아이템은 false 반환해야 함', () => {
      markItem(state, '1');
      const result = markItem(state, '1');

      expect(result).toBe(false);
    });

    it('부 대각선 카운터를 업데이트해야 함', () => {
      markItem(state, '3'); // [0][2] - 부대각선

      expect(state.diagCount2).toBe(2); // FREE + '3'
    });
  });

  describe('toggleCell', () => {
    let state: BingoState;

    beforeEach(() => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];
      state = initializeBingoState(card);
    });

    it('셀을 토글해야 함', () => {
      const result = toggleCell(state, 0, 0);

      expect(result).toBe(true);
      expect(state.cells[0][0].isMarked).toBe(true);

      toggleCell(state, 0, 0);
      expect(state.cells[0][0].isMarked).toBe(false);
    });

    it('FREE 칸은 토글할 수 없어야 함', () => {
      const result = toggleCell(state, 1, 1);

      expect(result).toBe(false);
      expect(state.cells[1][1].isMarked).toBe(true);
    });

    it('카운터를 올바르게 증감해야 함', () => {
      toggleCell(state, 0, 0); // 마킹
      expect(state.rowCounts[0]).toBe(1);

      toggleCell(state, 0, 0); // 해제
      expect(state.rowCounts[0]).toBe(0);
    });
  });

  describe('checkBingo', () => {
    it('가로줄 빙고를 감지해야 함', () => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];
      const state = initializeBingoState(card);

      // 첫 번째 행 완성
      markItem(state, '1');
      markItem(state, '2');
      markItem(state, '3');

      const newLines = checkBingo(state);

      expect(newLines).toHaveLength(1);
      expect(newLines[0].type).toBe('row');
      expect(newLines[0].index).toBe(0);
    });

    it('세로줄 빙고를 감지해야 함', () => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];
      const state = initializeBingoState(card);

      // 중간 열 완성 (FREE가 이미 마킹됨)
      markItem(state, '2');
      markItem(state, '8');

      const newLines = checkBingo(state);

      expect(newLines.some(l => l.type === 'column' && l.index === 1)).toBe(true);
    });

    it('대각선 빙고를 감지해야 함', () => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];
      const state = initializeBingoState(card);

      // 주 대각선 완성
      markItem(state, '1');
      markItem(state, '9');

      const newLines = checkBingo(state);

      expect(newLines.some(l => l.type === 'diagonal')).toBe(true);
    });

    it('동일한 빙고를 중복 감지하지 않아야 함', () => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];
      const state = initializeBingoState(card);

      markItem(state, '1');
      markItem(state, '2');
      markItem(state, '3');

      const firstCheck = checkBingo(state);
      const secondCheck = checkBingo(state);

      expect(firstCheck).toHaveLength(1);
      expect(secondCheck).toHaveLength(0);
    });

    it('여러 빙고를 동시에 감지해야 함', () => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];
      const state = initializeBingoState(card);

      // 주 대각선 + 부 대각선 + 가운데 행 + 가운데 열 완성
      markItem(state, '1');
      markItem(state, '3');
      markItem(state, '4');
      markItem(state, '6');
      markItem(state, '7');
      markItem(state, '9');

      const newLines = checkBingo(state);

      // 여러 라인이 완성됨
      expect(newLines.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getBingoCount', () => {
    it('빙고 개수를 반환해야 함', () => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];
      const state = initializeBingoState(card);

      expect(getBingoCount(state)).toBe(0);

      markItem(state, '1');
      markItem(state, '2');
      markItem(state, '3');
      checkBingo(state);

      expect(getBingoCount(state)).toBe(1);
    });
  });

  describe('checkWinCondition', () => {
    let state: BingoState;

    beforeEach(() => {
      const card = [
        ['1', '2', '3'],
        ['4', 'FREE', '6'],
        ['7', '8', '9'],
      ];
      state = initializeBingoState(card);
    });

    it('single-line 조건을 확인해야 함', () => {
      expect(checkWinCondition(state, 'single-line')).toBe(false);

      markItem(state, '1');
      markItem(state, '2');
      markItem(state, '3');
      checkBingo(state);

      expect(checkWinCondition(state, 'single-line')).toBe(true);
    });

    it('double-line 조건을 확인해야 함', () => {
      markItem(state, '1');
      markItem(state, '2');
      markItem(state, '3');
      checkBingo(state);

      expect(checkWinCondition(state, 'double-line')).toBe(false);

      markItem(state, '4');
      markItem(state, '6');
      checkBingo(state);

      expect(checkWinCondition(state, 'double-line')).toBe(true);
    });

    it('four-corners 조건을 확인해야 함', () => {
      expect(checkWinCondition(state, 'four-corners')).toBe(false);

      markItem(state, '1');
      markItem(state, '3');
      markItem(state, '7');
      markItem(state, '9');

      expect(checkWinCondition(state, 'four-corners')).toBe(true);
    });

    it('full-house 조건을 확인해야 함', () => {
      expect(checkWinCondition(state, 'full-house')).toBe(false);

      // 모든 셀 마킹
      markItem(state, '1');
      markItem(state, '2');
      markItem(state, '3');
      markItem(state, '4');
      markItem(state, '6');
      markItem(state, '7');
      markItem(state, '8');
      markItem(state, '9');

      expect(checkWinCondition(state, 'full-house')).toBe(true);
    });

    it('알 수 없는 조건은 false 반환해야 함', () => {
      expect(checkWinCondition(state, 'unknown-condition' as any)).toBe(false);
    });
  });

  describe('5x5 Grid Tests', () => {
    it('5x5 빙고판에서 빙고를 감지해야 함', () => {
      const items = Array.from({ length: 25 }, (_, i) => {
        if (i === 12) return 'FREE';
        return `${i + 1}`;
      });
      const card: string[][] = [];
      for (let i = 0; i < 5; i++) {
        card.push(items.slice(i * 5, (i + 1) * 5));
      }

      const state = initializeBingoState(card);

      // 첫 번째 행 완성
      markItem(state, '1');
      markItem(state, '2');
      markItem(state, '3');
      markItem(state, '4');
      markItem(state, '5');

      const newLines = checkBingo(state);

      expect(newLines.some(l => l.type === 'row' && l.index === 0)).toBe(true);
    });

    it('5x5 대각선 빙고를 감지해야 함', () => {
      const items = Array.from({ length: 25 }, (_, i) => {
        if (i === 12) return 'FREE';
        return `${i + 1}`;
      });
      const card: string[][] = [];
      for (let i = 0; i < 5; i++) {
        card.push(items.slice(i * 5, (i + 1) * 5));
      }

      const state = initializeBingoState(card);

      // 주 대각선: [0,0], [1,1], [2,2](FREE), [3,3], [4,4]
      markItem(state, '1');   // [0][0]
      markItem(state, '7');   // [1][1]
      markItem(state, '19');  // [3][3]
      markItem(state, '25');  // [4][4]

      const newLines = checkBingo(state);

      expect(newLines.some(l => l.type === 'diagonal')).toBe(true);
    });
  });
});
