/**
 * Human Bingo 타입 정의
 * 공유 컴포넌트용 - audience-engage와 독립 앱에서 모두 사용
 */

export type TraitCategory =
  | 'travel'      // 여행
  | 'hobby'       // 취미
  | 'experience'  // 경험
  | 'personal'    // 개인 특성
  | 'work'        // 직장/학교
  | 'food'        // 음식
  | 'fun';        // 재미

export type TraitDifficulty = 'easy' | 'medium' | 'hard';

export interface Trait {
  id: string;
  text: string;
  category: TraitCategory;
  difficulty: TraitDifficulty;
}

export type WinCondition =
  | 'single-line'    // 1줄 완성
  | 'two-lines'      // 2줄 완성
  | 'three-lines'    // 3줄 완성
  | 'full-house';    // 전체 완성

export type GridSize = 3 | 4 | 5;

export interface SessionSettings {
  gridSize: GridSize;
  timeLimit?: number;         // 제한 시간 (분)
  winCondition: WinCondition;
  allowSelfCheck: boolean;    // 자기 자신 체크 허용
  showOthersProgress: boolean; // 다른 사람 진행상황 표시
}

export interface HumanBingoConfig {
  gridSize: GridSize;
  traits: Trait[];      // 사용할 특성 목록
  settings: SessionSettings;
}

export interface BingoCell {
  trait: Trait | null;  // null for FREE cell
  isChecked: boolean;
  checkedBy?: string;       // 체크해준 사람 닉네임
  checkedAt?: string;
  row: number;
  col: number;
}

export interface BingoLine {
  type: 'row' | 'column' | 'diagonal';
  index?: number;
  cells: [number, number][];
}

export interface ParticipantCard {
  participantId: string;
  participantName: string;
  card: BingoCell[][];
  completedLines: BingoLine[];
  checkedCount: number;
  rank?: number;
  bingoAt?: string;
}

export interface LeaderboardEntry {
  participantId: string;
  participantName: string;
  lineCount: number;
  checkedCount: number;
  bingoAt?: string;
  rank: number;
}

export type ViewMode = 'menu' | 'host-setup' | 'host' | 'participant-join' | 'participant';
