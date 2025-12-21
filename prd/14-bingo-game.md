# 빙고 게임 (Bingo Game)

## 1. 개요

### 1.1 서비스 목적
- 오프라인 레크리에이션, 파티, 교육 현장에서 활용 가능한 빙고 게임
- 호스트 1명이 게임을 주도하고, 다수의 플레이어가 참여하는 실시간 그룹 게임
- 숫자 빙고, 단어 빙고, 테마 빙고 등 다양한 변형 지원

### 1.2 타겟 사용자
- 교육자: 수업에서 학습 내용 복습용 빙고 게임
- 이벤트 기획자: 파티, 워크숍, 팀빌딩 활동
- 가족/친구 모임: 가벼운 레크리에이션 게임

### 1.3 핵심 가치
- 즉시 시작: 복잡한 설정 없이 빠른 게임 생성
- 공정성: 자동 셔플로 모든 플레이어가 고유한 빙고판 획득
- 실시간 상호작용: 호스트의 호출과 플레이어의 반응이 즉각적으로 연동

---

## 2. 유사 서비스 분석

### 2.1 주요 경쟁 서비스
1. **BingoMaker.com**
   - 최대 3,000장의 빙고 카드 생성 지원
   - 다양한 빙고 패턴 (가로, 세로, 대각선, Full House 등)
   - 온라인 멀티플레이 지원

2. **Virtual Bingo (2025 트렌드)**
   - 자동 넘버 마킹 (Auto-daubing)
   - 잠재적 승리 조합 자동 알림
   - 실시간 채팅 기능

3. **Mobile Bingo Apps (2025)**
   - 75-ball, 90-ball 표준 빙고 지원
   - 소셜 요소 (친구 초대, 리더보드)
   - 인앱 구매 (테마, 사운드팩)

### 2.2 차별화 전략
- **교육/레크리에이션 특화**: 게임성보다 모임 도구로서의 가치 강조
- **커스터마이징**: 사용자가 단어, 테마를 자유롭게 설정
- **오프라인 우선**: 인터넷 연결 없이도 로컬에서 작동 (Progressive Web App)
- **무료/광고 없음**: 순수한 유틸리티 도구로 포지셔닝

---

## 3. 오픈소스 라이브러리

### 3.1 그리드 레이아웃
```typescript
// CSS Grid로 구현, 별도 라이브러리 불필요
// 반응형 그리드: 3x3, 4x4, 5x5 지원
```

### 3.2 애니메이션 효과
- **Framer Motion** (https://www.framer.com/motion/)
  - 빙고 성공 시 셀 애니메이션
  - 호출된 숫자/단어 강조 효과
  - 승리 모달 등장 애니메이션

### 3.3 사운드 효과
- **Web Audio API** (브라우저 네이티브)
  - 셀 마킹 사운드
  - 빙고 성공 사운드
  - 호출 알림 사운드

### 3.4 상태 관리
- **Zustand** (https://github.com/pmndrs/zustand)
  - 경량 상태 관리
  - 빙고판 상태, 호출 히스토리, 게임 설정 관리

### 3.5 유틸리티
- **clsx** (https://github.com/lukeed/clsx)
  - 조건부 클래스명 관리
- **nanoid** (https://github.com/ai/nanoid)
  - 게임 코드 생성

---

## 4. 기술 스택

### 4.1 프론트엔드
- **Vite 6.x**: 빠른 개발 서버, HMR
- **React 19**: UI 컴포넌트
- **TypeScript 5.x**: 타입 안정성
- **Tailwind CSS v4**: 반응형 스타일링

### 4.2 데이터 저장
- **LocalStorage**: 게임 설정, 커스텀 테마 저장
- **IndexedDB** (선택): 게임 히스토리, 통계 (추후 확장)

### 4.3 배포
- **Vercel/Netlify**: 정적 사이트 호스팅
- **PWA (Service Worker)**: 오프라인 지원

---

## 5. 핵심 기능 및 구현

### 5.1 빙고 유형

#### 5.1.1 숫자 빙고
```typescript
// 75-ball Bingo (미국식)
const BINGO_75: BingoConfig = {
  type: 'number',
  gridSize: 5,
  ranges: {
    B: [1, 15],   // Column 1
    I: [16, 30],  // Column 2
    N: [31, 45],  // Column 3
    G: [46, 60],  // Column 4
    O: [61, 75],  // Column 5
  },
  centerFree: true, // 중앙 FREE 칸
};

// 25-ball Bingo (간단한 버전)
const BINGO_25: BingoConfig = {
  type: 'number',
  gridSize: 5,
  range: [1, 25],
  centerFree: false,
};
```

#### 5.1.2 단어 빙고
```typescript
// 커스텀 단어 리스트
interface WordBingoConfig {
  type: 'word';
  gridSize: 3 | 4 | 5;
  words: string[]; // 최소 gridSize^2 개 필요
  caseSensitive: boolean;
}

// 예시: 영어 학습용
const ENGLISH_VOCAB: WordBingoConfig = {
  type: 'word',
  gridSize: 4,
  words: ['apple', 'banana', 'cat', 'dog', 'elephant', ...], // 16개 이상
  caseSensitive: false,
};
```

#### 5.1.3 테마 빙고
```typescript
// 프리셋 테마
const THEME_PRESETS = {
  animals: ['lion', 'tiger', 'bear', 'elephant', ...],
  movies: ['Inception', 'Avatar', 'Titanic', ...],
  foods: ['pizza', 'burger', 'sushi', 'taco', ...],
  kpop: ['BTS', 'Blackpink', 'NewJeans', ...],
};
```

---

### 5.2 게임 생성 (호스트 모드)

#### 5.2.1 게임 설정 UI
```typescript
interface GameSetup {
  bingoType: 'number' | 'word' | 'theme';
  gridSize: 3 | 4 | 5;
  items: string[] | number[]; // 호출할 아이템 리스트
  winConditions: WinCondition[]; // 승리 조건
  gameCode: string; // 6자리 게임 코드
}

type WinCondition =
  | 'single-line'    // 1줄 완성
  | 'double-line'    // 2줄 완성
  | 'triple-line'    // 3줄 완성
  | 'four-corners'   // 네 모서리
  | 'full-house';    // 전체 완성
```

#### 5.2.2 게임 코드 생성
```typescript
import { nanoid } from 'nanoid';

function generateGameCode(): string {
  // 6자리 알파벳 대문자 + 숫자 조합
  return nanoid(6).toUpperCase().replace(/[^A-Z0-9]/g, '');
}
```

#### 5.2.3 아이템 입력 방법
- **텍스트 에리어**: 줄바꿈으로 구분된 아이템 입력
- **CSV 업로드**: 파일에서 아이템 불러오기
- **프리셋 선택**: 테마별 기본 리스트 제공

---

### 5.3 게임 참여 (플레이어 모드)

#### 5.3.1 게임 코드 입력
```typescript
interface JoinGameFlow {
  1: '게임 코드 입력 (6자리)';
  2: '닉네임 입력 (선택)';
  3: '빙고판 자동 생성 (셔플)';
  4: '게임 대기 화면';
}
```

#### 5.3.2 빙고판 자동 생성
```typescript
// Section 7 참조 (Fisher-Yates Shuffle)
function generatePlayerCard(
  items: string[],
  gridSize: number,
  seed?: string // 재현 가능한 셔플을 위한 시드 (선택)
): string[][] {
  const shuffled = fisherYatesShuffle([...items], seed);
  const totalCells = gridSize * gridSize;
  const selected = shuffled.slice(0, totalCells);

  // 2D 배열로 변환
  const card: string[][] = [];
  for (let i = 0; i < gridSize; i++) {
    card.push(selected.slice(i * gridSize, (i + 1) * gridSize));
  }

  // 5x5 빙고에서 중앙 FREE 칸 처리
  if (gridSize === 5) {
    card[2][2] = 'FREE';
  }

  return card;
}
```

#### 5.3.3 터치 마킹
```typescript
interface CellState {
  value: string;
  isMarked: boolean;
  isPartOfBingo: boolean; // 빙고 라인에 포함되는지
}

function handleCellClick(row: number, col: number) {
  // 이미 마킹된 셀은 토글 가능
  const cell = bingoCard[row][col];
  cell.isMarked = !cell.isMarked;

  // 마킹 후 즉시 빙고 체크
  checkBingo();

  // 사운드 재생
  playSoundEffect('mark');
}
```

#### 5.3.4 빙고 자동 감지
```typescript
// Section 6 참조 (빙고 판정 알고리즘)
```

---

### 5.4 호출 기능 (Caller)

#### 5.4.1 호스트 호출 UI
```typescript
interface CallerState {
  calledItems: Set<string>; // 호출된 아이템
  remainingItems: string[]; // 남은 아이템
  currentCall: string | null; // 현재 호출된 아이템
  callHistory: CallRecord[]; // 호출 히스토리
}

interface CallRecord {
  item: string;
  timestamp: number;
  order: number; // 몇 번째 호출인지
}
```

#### 5.4.2 호출 방식
```typescript
// 1. 수동 호출: 호스트가 직접 선택
function manualCall(item: string) {
  if (calledItems.has(item)) {
    alert('이미 호출된 아이템입니다.');
    return;
  }

  performCall(item);
}

// 2. 랜덤 호출: 자동으로 다음 아이템 선택
function randomCall() {
  if (remainingItems.length === 0) {
    alert('모든 아이템이 호출되었습니다.');
    return;
  }

  const randomIndex = Math.floor(Math.random() * remainingItems.length);
  const item = remainingItems[randomIndex];
  performCall(item);
}

// 3. 자동 호출 (타이머): 5초마다 자동 호출
let autoCallTimer: NodeJS.Timeout | null = null;

function startAutoCall(intervalSeconds: number = 5) {
  autoCallTimer = setInterval(() => {
    randomCall();
  }, intervalSeconds * 1000);
}

function stopAutoCall() {
  if (autoCallTimer) {
    clearInterval(autoCallTimer);
    autoCallTimer = null;
  }
}

// 공통 호출 로직
function performCall(item: string) {
  calledItems.add(item);
  remainingItems = remainingItems.filter(i => i !== item);
  currentCall = item;

  callHistory.push({
    item,
    timestamp: Date.now(),
    order: calledItems.size,
  });

  // 호출 사운드 재생
  playSoundEffect('call');

  // UI 업데이트 (큰 글씨로 표시)
  displayCurrentCall(item);
}
```

#### 5.4.3 호출 히스토리 UI
```typescript
// 최근 호출된 10개 아이템 표시
function CallHistory() {
  const recent = callHistory.slice(-10).reverse();

  return (
    <div className="call-history">
      <h3>최근 호출</h3>
      <ul>
        {recent.map((record, index) => (
          <li key={record.order}>
            <span className="order">#{record.order}</span>
            <span className="item">{record.item}</span>
            <span className="time">
              {new Date(record.timestamp).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 5.5 빙고 판정 및 애니메이션

#### 5.5.1 빙고 라인 강조
```typescript
// 빙고가 완성된 라인을 시각적으로 표시
interface BingoLine {
  type: 'row' | 'column' | 'diagonal';
  index?: number; // row/column의 경우
  cells: [number, number][]; // [row, col] 좌표
}

function highlightBingoLines(lines: BingoLine[]) {
  lines.forEach(line => {
    line.cells.forEach(([row, col]) => {
      bingoCard[row][col].isPartOfBingo = true;
    });
  });
}
```

#### 5.5.2 승리 애니메이션
```typescript
// Framer Motion 사용
import { motion } from 'framer-motion';

function BingoSuccessModal({ lines }: { lines: BingoLine[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white rounded-lg p-8 text-center"
      >
        <motion.h1
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-6xl font-bold text-yellow-500"
        >
          🎉 BINGO! 🎉
        </motion.h1>
        <p className="mt-4 text-xl">
          {lines.length}줄 완성!
        </p>
      </motion.div>
    </motion.div>
  );
}
```

---

## 6. 빙고 판정 알고리즘

### 6.1 알고리즘 개요
- **시간 복잡도**: O(N) - N은 그리드 크기 (3, 4, 5)
- **공간 복잡도**: O(N²) - 빙고판 상태 저장
- **최적화**: HashMap을 사용해 아이템 → 좌표 매핑 (O(1) 검색)

### 6.2 TypeScript 구현

```typescript
/**
 * 빙고 판정 알고리즘
 *
 * 핵심 아이디어:
 * 1. 각 행/열/대각선마다 마킹된 셀 개수를 카운트
 * 2. 카운트가 gridSize와 같으면 빙고
 * 3. HashMap으로 O(1) 좌표 검색
 */

interface BingoCell {
  value: string;
  isMarked: boolean;
  row: number;
  col: number;
}

interface BingoState {
  gridSize: number;
  cells: BingoCell[][]; // 2D 배열
  itemToCoord: Map<string, [number, number]>; // 빠른 검색용

  // 카운터
  rowCounts: number[]; // 각 행의 마킹된 셀 수
  colCounts: number[]; // 각 열의 마킹된 셀 수
  diagCount1: number; // 주 대각선 (\)
  diagCount2: number; // 부 대각선 (/)

  // 빙고 라인
  completedLines: BingoLine[];
}

/**
 * 빙고판 초기화
 */
function initializeBingoState(card: string[][]): BingoState {
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

  return {
    gridSize,
    cells,
    itemToCoord,
    rowCounts: new Array(gridSize).fill(0),
    colCounts: new Array(gridSize).fill(0),
    diagCount1: 0,
    diagCount2: 0,
    completedLines: [],
  };
}

/**
 * 아이템 호출 시 마킹
 */
function markItem(state: BingoState, item: string): boolean {
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
 * 빙고 체크 (마킹 후 호출)
 */
function checkBingo(state: BingoState): BingoLine[] {
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
        cells: Array.from({ length: gridSize }, (_, col) => [row, col]),
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
        cells: Array.from({ length: gridSize }, (_, row) => [row, col]),
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
      cells: Array.from({ length: gridSize }, (_, i) => [i, i]),
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
      cells: Array.from({ length: gridSize }, (_, i) => [i, gridSize - 1 - i]),
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
 * 전체 빙고 개수 반환
 */
function getBingoCount(state: BingoState): number {
  return state.completedLines.length;
}

/**
 * 사용 예시
 */
function exampleUsage() {
  // 5x5 빙고판 생성
  const card = [
    ['1', '2', '3', '4', '5'],
    ['6', '7', '8', '9', '10'],
    ['11', '12', 'FREE', '14', '15'],
    ['16', '17', '18', '19', '20'],
    ['21', '22', '23', '24', '25'],
  ];

  const state = initializeBingoState(card);

  // 아이템 호출
  const calledItems = ['1', '2', '3', '4', '5']; // 첫 번째 행
  calledItems.forEach(item => {
    markItem(state, item);
    const newLines = checkBingo(state);

    if (newLines.length > 0) {
      console.log(`🎉 빙고! ${newLines.length}개의 새로운 라인 완성`);
      newLines.forEach(line => {
        console.log(`  - ${line.type} ${line.index ?? ''}`);
      });
    }
  });

  console.log(`총 빙고 개수: ${getBingoCount(state)}`);
}
```

### 6.3 알고리즘 복잡도 분석

| 연산 | 시간 복잡도 | 설명 |
|------|-------------|------|
| `initializeBingoState()` | O(N²) | 빙고판 초기화 (N×N 그리드) |
| `markItem()` | O(1) | HashMap 검색 + 카운터 업데이트 |
| `checkBingo()` | O(N) | 행/열/대각선 카운터 확인 |
| **전체** | **O(N²) + M×O(N)** | M = 호출 횟수 |

- **N = 3, 4, 5** (그리드 크기)로 고정되어 있어 사실상 O(1)에 가까움
- **HashMap 최적화**로 아이템 검색이 O(1)

---

## 7. 빙고판 셔플 알고리즘

### 7.1 Fisher-Yates Shuffle

```typescript
/**
 * Fisher-Yates Shuffle Algorithm
 *
 * 시간 복잡도: O(n)
 * 공간 복잡도: O(1) (in-place)
 *
 * 특징:
 * - 완벽한 무작위 순열 생성
 * - 모든 순열이 동일한 확률로 발생
 */

function fisherYatesShuffle<T>(array: T[], seed?: string): T[] {
  const arr = [...array]; // 원본 배열 보존
  const rng = seed ? seededRandom(seed) : Math.random;

  for (let i = arr.length - 1; i > 0; i--) {
    // 0부터 i까지 랜덤 인덱스 선택
    const j = Math.floor(rng() * (i + 1));

    // arr[i]와 arr[j] 교환
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/**
 * Seeded Random Number Generator
 *
 * 동일한 seed로 항상 같은 순서 생성 (재현 가능)
 * 용도: 테스트, 디버깅, 공정성 검증
 */
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // 32bit integer로 변환
  }

  return function() {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

/**
 * 빙고판 생성 (셔플 적용)
 */
function generateBingoCard(
  items: string[],
  gridSize: number,
  options?: {
    centerFree?: boolean; // 중앙 FREE 칸
    seed?: string; // 재현 가능한 셔플
  }
): string[][] {
  const { centerFree = false, seed } = options ?? {};

  // 1. 아이템 개수 검증
  const requiredItems = centerFree ? gridSize * gridSize - 1 : gridSize * gridSize;
  if (items.length < requiredItems) {
    throw new Error(
      `최소 ${requiredItems}개의 아이템이 필요합니다. (현재: ${items.length}개)`
    );
  }

  // 2. 셔플
  const shuffled = fisherYatesShuffle(items, seed);

  // 3. 필요한 개수만큼 선택
  const selected = shuffled.slice(0, requiredItems);

  // 4. 2D 배열로 변환
  const card: string[][] = [];
  let index = 0;

  for (let row = 0; row < gridSize; row++) {
    card[row] = [];
    for (let col = 0; col < gridSize; col++) {
      // 중앙 칸 처리
      if (centerFree && row === Math.floor(gridSize / 2) && col === Math.floor(gridSize / 2)) {
        card[row][col] = 'FREE';
      } else {
        card[row][col] = selected[index++];
      }
    }
  }

  return card;
}

/**
 * 사용 예시
 */
function exampleShuffle() {
  const items = Array.from({ length: 75 }, (_, i) => String(i + 1));

  // 일반 셔플 (매번 다른 결과)
  const card1 = generateBingoCard(items, 5, { centerFree: true });
  console.log('카드 1:', card1);

  // Seeded 셔플 (재현 가능)
  const card2 = generateBingoCard(items, 5, {
    centerFree: true,
    seed: 'player-123-game-456'
  });
  console.log('카드 2:', card2);

  // 동일한 seed로 다시 생성 시 같은 결과
  const card3 = generateBingoCard(items, 5, {
    centerFree: true,
    seed: 'player-123-game-456'
  });
  console.log('카드 2 === 카드 3:', JSON.stringify(card2) === JSON.stringify(card3));
}
```

### 7.2 75-Ball Bingo 전용 셔플

```typescript
/**
 * 75-Ball Bingo (미국식)
 *
 * 규칙:
 * - B 열: 1-15
 * - I 열: 16-30
 * - N 열: 31-45 (중앙 FREE)
 * - G 열: 46-60
 * - O 열: 61-75
 */

function generate75BallBingoCard(): string[][] {
  const card: string[][] = Array.from({ length: 5 }, () => Array(5).fill(''));

  const ranges = [
    [1, 15],   // B
    [16, 30],  // I
    [31, 45],  // N
    [46, 60],  // G
    [61, 75],  // O
  ];

  for (let col = 0; col < 5; col++) {
    const [min, max] = ranges[col];
    const columnNumbers = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
    const shuffled = fisherYatesShuffle(columnNumbers);

    for (let row = 0; row < 5; row++) {
      // 중앙 칸 (N열, 3행)
      if (col === 2 && row === 2) {
        card[row][col] = 'FREE';
      } else {
        const index = row > 2 && col === 2 ? row - 1 : row;
        card[row][col] = shuffled[index];
      }
    }
  }

  return card;
}
```

---

## 8. 컴포넌트 구조

```
src/
├── components/
│   ├── bingo/
│   │   ├── BingoCard.tsx          # 빙고판 UI
│   │   ├── BingoCell.tsx          # 개별 셀
│   │   ├── BingoGrid.tsx          # 그리드 레이아웃
│   │   └── BingoSuccessModal.tsx  # 빙고 성공 모달
│   ├── host/
│   │   ├── GameSetup.tsx          # 게임 생성 UI
│   │   ├── Caller.tsx             # 호출 인터페이스
│   │   ├── CallHistory.tsx        # 호출 히스토리
│   │   └── RandomCallButton.tsx   # 랜덤 호출 버튼
│   ├── player/
│   │   ├── JoinGame.tsx           # 게임 참여 UI
│   │   ├── PlayerCard.tsx         # 플레이어 빙고판
│   │   └── BingoStatus.tsx        # 현재 빙고 개수 표시
│   └── common/
│       ├── GameCodeInput.tsx      # 게임 코드 입력
│       ├── SoundToggle.tsx        # 사운드 on/off
│       └── ThemeSelector.tsx      # 테마 선택
├── stores/
│   ├── useBingoStore.ts           # Zustand 상태 관리
│   └── useGameStore.ts            # 게임 전역 상태
├── utils/
│   ├── bingoAlgorithm.ts          # 빙고 판정 알고리즘
│   ├── shuffleAlgorithm.ts        # 셔플 알고리즘
│   ├── gameCodeGenerator.ts       # 게임 코드 생성
│   └── soundEffects.ts            # 사운드 재생
├── types/
│   └── bingo.types.ts             # 타입 정의
└── App.tsx                        # 라우팅 (호스트/플레이어 모드)
```

---

## 9. 데이터 모델

### 9.1 타입 정의

```typescript
// types/bingo.types.ts

export type BingoType = 'number' | 'word' | 'theme';
export type GridSize = 3 | 4 | 5;
export type WinCondition =
  | 'single-line'
  | 'double-line'
  | 'triple-line'
  | 'four-corners'
  | 'full-house';

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
```

### 9.2 Zustand Store

```typescript
// stores/useBingoStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BingoStore {
  // Game Config
  config: BingoConfig | null;
  setConfig: (config: BingoConfig) => void;

  // Player State
  playerCard: string[][] | null;
  bingoState: BingoState | null;
  initializePlayer: (card: string[][]) => void;
  markCell: (row: number, col: number) => void;

  // Host State
  calledItems: Set<string>;
  callHistory: CallRecord[];
  currentCall: string | null;
  performCall: (item: string) => void;

  // UI State
  soundEnabled: boolean;
  toggleSound: () => void;

  // Reset
  reset: () => void;
}

export const useBingoStore = create<BingoStore>()(
  persist(
    (set, get) => ({
      // Initial State
      config: null,
      playerCard: null,
      bingoState: null,
      calledItems: new Set(),
      callHistory: [],
      currentCall: null,
      soundEnabled: true,

      // Actions
      setConfig: (config) => set({ config }),

      initializePlayer: (card) => {
        const bingoState = initializeBingoState(card);
        set({ playerCard: card, bingoState });
      },

      markCell: (row, col) => {
        const { bingoState } = get();
        if (!bingoState) return;

        const cell = bingoState.cells[row][col];
        if (cell.isMarked) return;

        markItem(bingoState, cell.value);
        const newLines = checkBingo(bingoState);

        if (newLines.length > 0) {
          // 빙고 알림
          playSoundEffect('bingo');
        }

        set({ bingoState: { ...bingoState } });
      },

      performCall: (item) => {
        const { calledItems, callHistory } = get();

        if (calledItems.has(item)) return;

        const newCalledItems = new Set(calledItems);
        newCalledItems.add(item);

        const newRecord: CallRecord = {
          item,
          timestamp: Date.now(),
          order: newCalledItems.size,
        };

        set({
          calledItems: newCalledItems,
          callHistory: [...callHistory, newRecord],
          currentCall: item,
        });
      },

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      reset: () => set({
        config: null,
        playerCard: null,
        bingoState: null,
        calledItems: new Set(),
        callHistory: [],
        currentCall: null,
      }),
    }),
    {
      name: 'bingo-storage',
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        // 게임 상태는 세션별로 초기화
      }),
    }
  )
);
```

---

## 10. UI/UX 설계

### 10.1 반응형 레이아웃

```typescript
// 3x3, 4x4, 5x5 빙고판 크기 자동 조정
const gridSizeClasses = {
  3: 'grid-cols-3 gap-2 max-w-sm',
  4: 'grid-cols-4 gap-2 max-w-md',
  5: 'grid-cols-5 gap-1 max-w-lg',
};

// 셀 크기 (터치 친화적)
const cellSizeClasses = {
  3: 'h-24 text-2xl', // 큰 셀
  4: 'h-20 text-xl',  // 중간 셀
  5: 'h-16 text-lg',  // 작은 셀
};
```

### 10.2 색상 테마

```css
/* 기본 테마 */
.bingo-cell {
  @apply border-2 border-gray-300 rounded-lg
         flex items-center justify-center
         font-bold transition-all duration-200
         hover:bg-gray-50 active:scale-95;
}

.bingo-cell.marked {
  @apply bg-blue-500 text-white border-blue-600;
}

.bingo-cell.bingo-line {
  @apply bg-yellow-400 text-gray-900 border-yellow-600
         animate-pulse;
}

/* 다크 모드 */
@media (prefers-color-scheme: dark) {
  .bingo-cell {
    @apply border-gray-600 hover:bg-gray-800;
  }

  .bingo-cell.marked {
    @apply bg-blue-700 border-blue-500;
  }
}
```

### 10.3 접근성 (a11y)

```typescript
// 스크린 리더 지원
<button
  role="gridcell"
  aria-label={`빙고 셀: ${cell.value}, ${cell.isMarked ? '마킹됨' : '마킹 안됨'}`}
  aria-pressed={cell.isMarked}
  onClick={() => handleCellClick(row, col)}
>
  {cell.value}
</button>

// 키보드 네비게이션
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') moveFocus(-1, 0);
    if (e.key === 'ArrowDown') moveFocus(1, 0);
    if (e.key === 'ArrowLeft') moveFocus(0, -1);
    if (e.key === 'ArrowRight') moveFocus(0, 1);
    if (e.key === 'Enter' || e.key === ' ') markCurrentCell();
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 11. 사운드 효과

```typescript
// utils/soundEffects.ts

const SOUNDS = {
  mark: '/sounds/mark.mp3',      // 셀 마킹 소리
  call: '/sounds/call.mp3',      // 호출 소리
  bingo: '/sounds/bingo.mp3',    // 빙고 성공 소리
  win: '/sounds/win.mp3',        // 게임 승리 소리
};

class SoundManager {
  private audioContext: AudioContext;
  private buffers: Map<string, AudioBuffer>;

  constructor() {
    this.audioContext = new AudioContext();
    this.buffers = new Map();
  }

  async loadSound(name: keyof typeof SOUNDS): Promise<void> {
    const response = await fetch(SOUNDS[name]);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.buffers.set(name, audioBuffer);
  }

  play(name: keyof typeof SOUNDS, volume: number = 1.0): void {
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }
}

export const soundManager = new SoundManager();

// 초기화
export async function initializeSounds() {
  await Promise.all([
    soundManager.loadSound('mark'),
    soundManager.loadSound('call'),
    soundManager.loadSound('bingo'),
    soundManager.loadSound('win'),
  ]);
}

// 사용
export function playSoundEffect(name: keyof typeof SOUNDS) {
  const { soundEnabled } = useBingoStore.getState();
  if (!soundEnabled) return;

  soundManager.play(name);
}
```

---

## 12. 배포 및 최적화

### 12.1 번들 최적화

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'animations': ['framer-motion'],
          'state': ['zustand'],
        },
      },
    },
  },
});
```

### 12.2 PWA 설정

```javascript
// vite-plugin-pwa 설정
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: '빙고 게임',
    short_name: '빙고',
    description: '오프라인 레크리에이션 빙고 게임',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
});
```

---

## 13. 향후 확장 기능

### 13.1 멀티플레이어 (실시간 동기화)
- WebSocket 또는 Firebase Realtime Database
- 호스트가 호출한 아이템을 모든 플레이어에게 실시간 전송
- 빙고 성공 시 전체 참가자에게 알림

### 13.2 통계 및 리더보드
- 게임별 승률, 평균 빙고 달성 시간
- 플레이어 순위 (가장 빨리 빙고 완성)

### 13.3 커스텀 테마 저장
- 사용자가 만든 단어 리스트를 클라우드에 저장
- 커뮤니티 테마 공유 (예: "2025년 인기 영화", "IT 용어")

### 13.4 음성 인식
- Web Speech API로 호스트가 직접 말하면 자동 호출
- "다음 숫자는 7번입니다" → 자동으로 7 마킹

---

## 14. 참고 자료

- **알고리즘**: [Stack Overflow - Bingo Algorithm](https://stackoverflow.com/questions/19606840/algorithm-to-implement-the-bingo-game)
- **Fisher-Yates Shuffle**: [Wikipedia](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- **Framer Motion**: [공식 문서](https://www.framer.com/motion/)
- **Web Audio API**: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- **Zustand**: [GitHub](https://github.com/pmndrs/zustand)

---

## 15. 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 16. MCP 개발 도구

### 16.1 UI 컴포넌트 개발
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 16.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조
