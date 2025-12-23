# Human Bingo - 사람 빙고 (네트워킹 게임)

## 1. 개요

### 1.1 앱 설명
Human Bingo는 참가자들이 특정 특성을 가진 사람을 찾아 서명(또는 체크)을 받아 빙고를 완성하는 네트워킹 아이스브레이킹 게임입니다. 기존 `bingo-game`을 확장하여 사람 찾기 + 대화 유도에 특화된 버전입니다.

### 1.2 타겟 사용자
- **네트워킹 이벤트 진행자**: 참가자들 간 자연스러운 대화 유도
- **교육자/강사**: 수업 첫날 학생들 서로 알아가기
- **팀 리더**: 신입 환영, 팀빌딩 활동
- **워크샵 진행자**: 참가자들 간 교류 활성화

### 1.3 핵심 가치
- **대화 유도**: 특성을 확인하려면 대화해야 함
- **네트워킹 촉진**: 많은 사람과 접촉하도록 설계
- **게임화**: 빙고 완성 경쟁으로 동기 부여
- **아이스브레이킹**: 부담 없이 대화 시작 가능

### 1.4 사용 시나리오
1. **컨퍼런스 네트워킹**: 100명 참가자 → 각자 빙고판 생성 → 돌아다니며 특성 가진 사람 찾기
2. **신입 OT**: 새 팀원들 → 기존 팀원 특성 찾기 → 자연스러운 인사
3. **수업 첫날**: 학생들 → 서로 특성 찾기 → 친해지기

### 1.5 참여 모드 원칙
> **호스트 = PC/프로젝터(큰 화면), 참가자 = 모바일 (돌아다니며 사용)**

| 역할 | 디바이스 | 화면 구성 |
|------|----------|-----------|
| **호스트** | PC/프로젝터 | 전체 참가자 진행 현황, 빙고 달성자 목록, 타이머 |
| **참가자** | 모바일 (필수) | 6자리 코드 입력 → 개인 빙고판 → 특성 체크 |

- 참가자 화면은 **모바일 세로 모드에 최적화**
- 빙고판은 **5x5 = 25칸**, 터치 영역 충분히 확보
- 특성 체크 방식: **QR 스캔** 또는 **상대방 코드 입력**
- 한 손으로 조작 가능 (돌아다니며 사용)
- 빙고 달성 시 **진동 + 축하 애니메이션**

---

## 2. 유사 서비스 분석

### 2.1 Human Bingo 특성

| 구분 | 전통 빙고 | Human Bingo |
|------|----------|-------------|
| 빙고 항목 | 숫자/단어 | 사람의 특성 |
| 체크 방식 | 호스트 호출 | 해당 사람 찾아서 확인 |
| 목적 | 게임 | 네트워킹 + 게임 |
| 진행 방식 | 앉아서 | 돌아다니며 |

### 2.2 차별화 전략
1. **디지털화**: 종이 빙고판 → 모바일 앱
2. **실시간 동기화**: 호스트가 전체 진행 상황 모니터링
3. **자동 빙고 판정**: 수동 확인 불필요
4. **결과 저장**: 누가 누구와 대화했는지 기록

---

## 3. 기술 스택

### 3.1 프론트엔드
- **Next.js 15 App Router**
- **React 19 + TypeScript**
- **Tailwind CSS v3**
- **Zustand 5**: 빙고판 상태 관리
- **Framer Motion**: 빙고 애니메이션

### 3.2 백엔드
- **Supabase Realtime**: 실시간 진행 상황 동기화
- **Supabase Database**: 세션/빙고판/체크 기록 저장

### 3.3 라이브러리 설치
```bash
pnpm add @supabase/supabase-js nanoid framer-motion react-confetti
```

---

## 4. 핵심 기능

### 4.1 특성 템플릿

#### 4.1.1 기본 특성 카테고리
```typescript
// data/traits.ts
export interface Trait {
  id: string;
  text: string;           // "해외여행 3회 이상"
  category: TraitCategory;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type TraitCategory =
  | 'travel'      // 여행
  | 'hobby'       // 취미
  | 'experience'  // 경험
  | 'personal'    // 개인 특성
  | 'work'        // 직장/학교
  | 'food'        // 음식
  | 'fun';        // 재미

export const TRAIT_TEMPLATES: Record<TraitCategory, Trait[]> = {
  travel: [
    { id: 't1', text: '해외여행 3개국 이상', category: 'travel', difficulty: 'medium' },
    { id: 't2', text: '비행기 타본 적 있음', category: 'travel', difficulty: 'easy' },
    { id: 't3', text: '혼자 여행 해본 적 있음', category: 'travel', difficulty: 'medium' },
    { id: 't4', text: '캠핑 좋아함', category: 'travel', difficulty: 'medium' },
  ],
  hobby: [
    { id: 'h1', text: '악기 연주 가능', category: 'hobby', difficulty: 'medium' },
    { id: 'h2', text: '운동을 주 3회 이상', category: 'hobby', difficulty: 'medium' },
    { id: 'h3', text: '최근 책 완독함', category: 'hobby', difficulty: 'easy' },
    { id: 'h4', text: '게임 좋아함', category: 'hobby', difficulty: 'easy' },
    { id: 'h5', text: '요리 잘함', category: 'hobby', difficulty: 'medium' },
  ],
  experience: [
    { id: 'e1', text: '대학 동아리 활동 경험', category: 'experience', difficulty: 'easy' },
    { id: 'e2', text: '알바 경험 3개 이상', category: 'experience', difficulty: 'medium' },
    { id: 'e3', text: '봉사활동 경험 있음', category: 'experience', difficulty: 'easy' },
    { id: 'e4', text: '창업 경험 있음', category: 'experience', difficulty: 'hard' },
  ],
  personal: [
    { id: 'p1', text: '쌍둥이 있음', category: 'personal', difficulty: 'hard' },
    { id: 'p2', text: '반려동물 키움', category: 'personal', difficulty: 'easy' },
    { id: 'p3', text: '안경 착용', category: 'personal', difficulty: 'easy' },
    { id: 'p4', text: '막내임', category: 'personal', difficulty: 'medium' },
    { id: 'p5', text: '외동임', category: 'personal', difficulty: 'medium' },
  ],
  work: [
    { id: 'w1', text: '재택근무 경험', category: 'work', difficulty: 'medium' },
    { id: 'w2', text: '이직 경험 있음', category: 'work', difficulty: 'medium' },
    { id: 'w3', text: '대학원 진학 경험', category: 'work', difficulty: 'hard' },
  ],
  food: [
    { id: 'f1', text: '매운 음식 잘 먹음', category: 'food', difficulty: 'easy' },
    { id: 'f2', text: '채식주의자', category: 'food', difficulty: 'hard' },
    { id: 'f3', text: '커피 하루 3잔 이상', category: 'food', difficulty: 'medium' },
  ],
  fun: [
    { id: 'fu1', text: '이름에 김/이/박 있음', category: 'fun', difficulty: 'easy' },
    { id: 'fu2', text: '올해 생일 지남', category: 'fun', difficulty: 'easy' },
    { id: 'fu3', text: '오늘 아침밥 먹음', category: 'fun', difficulty: 'easy' },
    { id: 'fu4', text: '운전면허 있음', category: 'fun', difficulty: 'easy' },
  ],
};
```

#### 4.1.2 난이도 밸런싱
```typescript
function generateBalancedBingoCard(
  gridSize: number,
  allTraits: Trait[]
): Trait[] {
  const totalCells = gridSize * gridSize;
  const centerFree = gridSize === 5;
  const neededCount = centerFree ? totalCells - 1 : totalCells;

  // 난이도별 비율: easy 40%, medium 40%, hard 20%
  const easyCount = Math.floor(neededCount * 0.4);
  const mediumCount = Math.floor(neededCount * 0.4);
  const hardCount = neededCount - easyCount - mediumCount;

  const easyTraits = shuffleArray(allTraits.filter(t => t.difficulty === 'easy')).slice(0, easyCount);
  const mediumTraits = shuffleArray(allTraits.filter(t => t.difficulty === 'medium')).slice(0, mediumCount);
  const hardTraits = shuffleArray(allTraits.filter(t => t.difficulty === 'hard')).slice(0, hardCount);

  const selected = [...easyTraits, ...mediumTraits, ...hardTraits];
  return shuffleArray(selected);
}
```

---

### 4.2 게임 진행

#### 4.2.1 세션 구조
```typescript
// types/human-bingo.ts
export interface HumanBingoSession {
  id: string;           // 6자리 코드
  hostId: string;
  title: string;        // "신입 환영 빙고"
  gridSize: 3 | 4 | 5;
  traits: Trait[];      // 사용할 특성 목록
  settings: SessionSettings;
  status: 'waiting' | 'playing' | 'ended';
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface SessionSettings {
  timeLimit?: number;         // 제한 시간 (분)
  winCondition: WinCondition;
  allowSelfCheck: boolean;    // 자기 자신 체크 허용
  showOthersProgress: boolean; // 다른 사람 진행상황 표시
}

export type WinCondition =
  | 'single-line'    // 1줄 완성
  | 'two-lines'      // 2줄 완성
  | 'three-lines'    // 3줄 완성
  | 'full-house';    // 전체 완성
```

#### 4.2.2 참가자 빙고판
```typescript
export interface ParticipantCard {
  participantId: string;
  sessionId: string;
  nickname: string;
  card: BingoCell[][];      // 2D 빙고판
  completedLines: number;
  checkedCount: number;
  rank?: number;            // 빙고 달성 순위
  bingoAt?: string;         // 빙고 달성 시간
}

export interface BingoCell {
  trait: Trait;
  isChecked: boolean;
  checkedBy?: string;       // 체크해준 사람 닉네임
  checkedAt?: string;
}
```

---

### 4.3 체크 방식

#### 4.3.1 QR 코드 스캔 방식
```typescript
// 각 참가자는 자신의 QR 코드를 가짐
// A가 B의 QR을 스캔하면 → B의 특성 목록 표시 → A가 해당하는 특성 선택

async function handleQRScan(scannedParticipantId: string) {
  // 스캔된 사람의 특성 자기 신고 목록 가져오기
  const theirTraits = await getParticipantTraits(scannedParticipantId);

  // 내 빙고판에서 매칭되는 셀 찾기
  const matchingCells = myCard.filter(cell =>
    theirTraits.includes(cell.trait.id) && !cell.isChecked
  );

  // 체크 가능한 셀 표시
  showCheckableTraits(matchingCells, scannedParticipantId);
}
```

#### 4.3.2 수동 체크 방식
```typescript
// 대화 후 상대방 닉네임 입력하여 체크
async function manualCheck(cellIndex: number, otherPersonNickname: string) {
  // 셀 체크
  await supabase.from('bingo_checks').insert({
    session_id: sessionId,
    participant_id: myId,
    cell_index: cellIndex,
    checked_by_nickname: otherPersonNickname,
    checked_at: new Date().toISOString(),
  });

  // 빙고 체크
  const newLines = checkBingo(myCard);
  if (newLines > 0) {
    await announceWinner(myId, newLines);
  }
}
```

#### 4.3.3 자기 신고 방식
```typescript
// 참가자가 자신에게 해당하는 특성을 미리 체크
// 다른 사람이 이 정보를 기반으로 빙고판 체크

interface SelfDeclaredTraits {
  participantId: string;
  traitIds: string[];      // 자신에게 해당하는 특성 ID 목록
}

async function declareSelfTraits(traitIds: string[]) {
  await supabase.from('self_declared_traits').upsert({
    session_id: sessionId,
    participant_id: myId,
    trait_ids: traitIds,
  });
}
```

---

### 4.4 실시간 동기화

#### 4.4.1 Supabase 채널 이벤트
```typescript
type HumanBingoEvent =
  | { type: 'game_start' }
  | { type: 'player_join'; participant: Participant }
  | { type: 'player_check'; participantId: string; cellIndex: number }
  | { type: 'bingo_achieved'; participantId: string; lineCount: number; rank: number }
  | { type: 'game_end'; leaderboard: LeaderboardEntry[] };

// hooks/useHumanBingoSession.ts
export function useHumanBingoSession(sessionId: string) {
  const channel = supabase.channel(`human-bingo:${sessionId}`);

  useEffect(() => {
    channel.on('broadcast', { event: 'game_event' }, ({ payload }) => {
      handleGameEvent(payload as HumanBingoEvent);
    });

    channel.subscribe();

    return () => { channel.unsubscribe(); };
  }, [sessionId]);

  return { channel };
}
```

#### 4.4.2 리더보드
```typescript
interface LeaderboardEntry {
  participantId: string;
  nickname: string;
  lineCount: number;       // 완성한 빙고 줄 수
  checkedCount: number;    // 체크한 셀 수
  bingoAt?: string;        // 빙고 달성 시간
  rank: number;
}

function updateLeaderboard(participants: ParticipantCard[]): LeaderboardEntry[] {
  return participants
    .map(p => ({
      participantId: p.participantId,
      nickname: p.nickname,
      lineCount: p.completedLines,
      checkedCount: p.checkedCount,
      bingoAt: p.bingoAt,
      rank: 0,
    }))
    .sort((a, b) => {
      // 1순위: 빙고 줄 수
      if (b.lineCount !== a.lineCount) return b.lineCount - a.lineCount;
      // 2순위: 빙고 달성 시간 (빠른 순)
      if (a.bingoAt && b.bingoAt) return new Date(a.bingoAt).getTime() - new Date(b.bingoAt).getTime();
      // 3순위: 체크 수
      return b.checkedCount - a.checkedCount;
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}
```

---

## 5. UI 디자인

### 5.1 참가자 빙고판 (모바일)

```
┌──────────────────────────────────┐
│  🎯 Human Bingo        ABC123   │
├──────────────────────────────────┤
│  ⏱️ 남은 시간: 12:34             │
│  ✅ 체크: 8/25  🎉 빙고: 1줄     │
├──────────────────────────────────┤
│  ┌─────┬─────┬─────┬─────┬─────┐│
│  │ ✅  │     │ ✅  │     │ ✅  ││
│  │해외 │악기 │반려 │막내 │매운 ││
│  │여행 │연주 │동물 │  임 │음식 ││
│  ├─────┼─────┼─────┼─────┼─────┤│
│  │     │ ✅  │     │ ✅  │     ││
│  │혼자 │운동 │책   │게임 │요리 ││
│  │여행 │주3회│완독 │좋아 │잘함 ││
│  ├─────┼─────┼─────┼─────┼─────┤│
│  │     │     │FREE │     │     ││
│  │캠핑 │동아 │ 🌟  │봉사 │쌍둥 ││
│  │좋아 │리   │     │활동 │이   ││
│  ├─────┼─────┼─────┼─────┼─────┤│
│  │ ✅  │     │     │     │ ✅  ││
│  │안경 │외동 │재택 │이직 │커피 ││
│  │착용 │  임 │근무 │경험 │3잔+ ││
│  ├─────┼─────┼─────┼─────┼─────┤│
│  │     │     │     │     │     ││
│  │채식 │이름 │아침 │운전 │대학 ││
│  │주의 │김이 │밥   │면허 │원   ││
│  └─────┴─────┴─────┴─────┴─────┘│
│                                  │
│  [ 📱 QR 스캔 ]  [ ✍️ 수동 체크 ] │
│                                  │
└──────────────────────────────────┘
```

### 5.2 호스트 대시보드

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Human Bingo 관리              세션: ABC123                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📊 진행 상황                     🏆 리더보드                    │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │ 참가자: 45명                │ │ 1. 김철수  3줄 (12:34)     ││
│  │ 평균 체크: 12.3개          │ │ 2. 박영희  2줄 (12:45)     ││
│  │ 빙고 달성: 8명              │ │ 3. 이민수  2줄 (12:52)     ││
│  └─────────────────────────────┘ │ 4. 정수진  1줄              ││
│                                  │ 5. 최동훈  1줄              ││
│  ⏱️ 남은 시간: 08:42             │ ...                          ││
│                                  └─────────────────────────────┘│
│                                                                 │
│  [ 게임 종료 ]  [ 시간 연장 ]  [ 결과 발표 ]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 체크 모달 (상대방 찾았을 때)

```
┌──────────────────────────────────┐
│           ✅ 체크하기            │
├──────────────────────────────────┤
│                                  │
│  " 해외여행 3개국 이상 "          │
│                                  │
│  이 특성을 가진 분을 찾았나요?    │
│                                  │
│  ┌────────────────────────────┐ │
│  │ 상대방 닉네임:              │ │
│  │ [ 박영희            ]      │ │
│  └────────────────────────────┘ │
│                                  │
│    [ 취소 ]     [ 체크 완료 ]    │
│                                  │
└──────────────────────────────────┘
```

---

## 6. 데이터 모델 (Supabase)

### 6.1 테이블 스키마
```sql
-- 세션
CREATE TABLE human_bingo_sessions (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  title TEXT NOT NULL,
  grid_size INTEGER DEFAULT 5,
  traits JSONB NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- 참가자 빙고판
CREATE TABLE human_bingo_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES human_bingo_sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  card JSONB NOT NULL,          -- 빙고판 데이터
  completed_lines INTEGER DEFAULT 0,
  checked_count INTEGER DEFAULT 0,
  bingo_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, participant_id)
);

-- 체크 기록
CREATE TABLE human_bingo_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES human_bingo_sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,  -- 체크한 사람
  cell_index INTEGER NOT NULL,   -- 빙고판 셀 인덱스
  checked_by_nickname TEXT NOT NULL,  -- 특성 가진 사람 닉네임
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 자기 신고 특성
CREATE TABLE human_bingo_self_traits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES human_bingo_sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  trait_ids JSONB NOT NULL,      -- 자신에게 해당하는 특성 ID 배열
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, participant_id)
);
```

---

## 7. 컴포넌트 구조

```
src/app/human-bingo/
├── page.tsx                    # 랜딩 (호스트/참여 선택)
├── host/
│   ├── page.tsx                # 세션 생성
│   └── [sessionId]/
│       ├── page.tsx            # 호스트 대시보드
│       └── present/
│           └── page.tsx        # 프레젠테이션 모드
├── join/
│   └── page.tsx                # 참여 코드 입력
├── play/
│   └── [sessionId]/
│       ├── page.tsx            # 자기 신고 + 빙고판
│       └── qr/
│           └── page.tsx        # 내 QR 코드 표시
├── components/
│   ├── BingoCard.tsx           # 빙고판 그리드
│   ├── BingoCell.tsx           # 개별 셀
│   ├── TraitSelector.tsx       # 특성 선택기 (호스트)
│   ├── SelfDeclaration.tsx     # 자기 신고 UI
│   ├── CheckModal.tsx          # 체크 모달
│   ├── QRScanner.tsx           # QR 스캐너
│   ├── QRDisplay.tsx           # QR 코드 표시
│   ├── Leaderboard.tsx         # 리더보드
│   └── BingoAnimation.tsx      # 빙고 애니메이션
├── data/
│   └── traits.ts               # 특성 템플릿
├── store/
│   └── useBingoStore.ts        # Zustand 상태
├── hooks/
│   └── useHumanBingoSession.ts # 실시간 세션
└── types/
    └── index.ts                # 타입 정의
```

---

## 8. bingo-game과의 통합

### 8.1 공유 가능한 부분
- **빙고 판정 알고리즘**: 가로/세로/대각선 체크
- **셔플 알고리즘**: Fisher-Yates
- **빙고 애니메이션**: Framer Motion
- **그리드 컴포넌트**: 3x3, 4x4, 5x5 레이아웃

### 8.2 분리되는 부분
- **항목 타입**: 숫자/단어 → 특성(Trait)
- **체크 방식**: 호스트 호출 → 참가자 간 확인
- **추가 기능**: 자기 신고, QR 스캔, 닉네임 입력

### 8.3 리팩토링 가능성
```typescript
// 공통 빙고 코어 모듈
// @/lib/bingo-core.ts
export { checkBingo, fisherYatesShuffle, BingoGrid, BingoCell };

// Human Bingo 확장
// @/app/human-bingo/lib/human-bingo.ts
import { checkBingo, fisherYatesShuffle } from '@/lib/bingo-core';
// Human Bingo 특화 로직 추가
```

---

## 9. 구현 우선순위

### Phase 1: MVP (1주)
- [ ] 세션 생성 + 특성 선택
- [ ] 참가자 빙고판 생성
- [ ] 수동 체크 기능
- [ ] 빙고 판정

### Phase 2: 네트워킹 기능 (1주)
- [ ] 자기 신고 기능
- [ ] QR 코드 스캔 체크
- [ ] 실시간 리더보드
- [ ] 타이머

### Phase 3: 고급 기능 (3일)
- [ ] 빙고 애니메이션
- [ ] 결과 발표 화면
- [ ] 통계 (누가 누구와 가장 많이 대화했는지)

---

## 10. 참고 자료

### Human Bingo 자료
- [Human Bingo Generator](https://bingobaker.com/human-bingo)
- [Icebreaker Bingo Templates](https://www.signupgenius.com/groups/bingo-icebreaker-ideas.cfm)

### 기술 문서
- [QR Scanner Libraries](https://www.npmjs.com/package/@yudiel/react-qr-scanner)
- [Framer Motion](https://www.framer.com/motion/)

---

**작성일**: 2024-12-23
**버전**: 1.0
