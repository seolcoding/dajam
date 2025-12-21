export type BingoType = 'number' | 'word' | 'theme';
export type GridSize = 3 | 4 | 5;
export type WinCondition =
  | 'single-line'
  | 'double-line'
  | 'triple-line'
  | 'four-corners'
  | 'full-house';

export type GameMode = 'menu' | 'setup' | 'host' | 'join' | 'player';

export interface BingoConfig {
  type: BingoType;
  gridSize: GridSize;
  items: string[];
  winConditions: WinCondition[];
  centerFree: boolean;
}

export interface GameSession {
  gameCode: string;
  config: BingoConfig;
  hostId: string;
  createdAt: number;
  status: 'waiting' | 'playing' | 'finished';
}

export interface PlayerSession {
  playerId: string;
  nickname: string;
  card: string[][];
  state: BingoState;
  joinedAt: number;
}

export interface BingoCell {
  value: string;
  isMarked: boolean;
  row: number;
  col: number;
}

export interface BingoLine {
  type: 'row' | 'column' | 'diagonal';
  index?: number;
  cells: [number, number][];
}

export interface BingoState {
  gridSize: number;
  cells: BingoCell[][];
  itemToCoord: Map<string, [number, number]>;
  rowCounts: number[];
  colCounts: number[];
  diagCount1: number;
  diagCount2: number;
  completedLines: BingoLine[];
}

export interface CallRecord {
  item: string;
  timestamp: number;
  order: number;
}

export type SoundEffect = 'mark' | 'call' | 'bingo' | 'win';

export interface ThemePreset {
  id: string;
  name: string;
  items: string[];
  gridSize: GridSize;
}
