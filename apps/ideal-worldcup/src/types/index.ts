/**
 * 이상형 월드컵 타입 정의
 */

// 후보자 (Candidate)
export interface Candidate {
  id: string; // UUID
  name: string;
  imageUrl: string; // Data URL or Blob URL
  imageFile?: File; // 원본 파일 (optional)
}

// 매치 (Match)
export interface Match {
  id: string;
  round: number; // 1 (결승), 2 (준결승), 4 (8강), 8 (16강) ...
  candidateA: Candidate;
  candidateB: Candidate;
  winner?: Candidate; // 아직 선택 안 된 경우 undefined
}

// 토너먼트 (Tournament)
export interface Tournament {
  id: string;
  title: string;
  totalRounds: number; // 4, 8, 16, 32
  candidates: Candidate[];
  createdAt: Date;
}

// 게임 상태 (Game State)
export interface GameState {
  tournament: Tournament;
  currentRound: number; // 현재 진행 중인 라운드
  currentMatchIndex: number; // 현재 라운드 내 매치 인덱스
  matches: Match[]; // 현재 라운드의 모든 매치
  allMatches: Match[]; // 모든 라운드의 모든 매치 (히스토리)
  history: Candidate[]; // 선택 히스토리 (뒤로가기용)
  isComplete: boolean;
  winner?: Candidate;
  runnerUp?: Candidate;
  semiFinals?: Candidate[];
}

// 결과 (Result)
export interface TournamentResult {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  winner: Candidate;
  runnerUp?: Candidate;
  semiFinals?: Candidate[];
  completedAt: Date;
}

// Zustand Store 타입
export interface AppStore {
  // State
  tournaments: Tournament[];
  currentGame: GameState | null;
  results: TournamentResult[];

  // Actions
  createTournament: (tournament: Omit<Tournament, 'id' | 'createdAt'>) => void;
  startGame: (tournamentId: string) => void;
  selectWinner: (winner: Candidate) => void;
  goBack: () => void;
  saveResult: (result: Omit<TournamentResult, 'id' | 'completedAt'>) => void;
  deleteTournament: (id: string) => void;
  clearAll: () => void;
  resetGame: () => void;
}
