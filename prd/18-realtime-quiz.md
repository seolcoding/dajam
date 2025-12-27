# Realtime Quiz - 실시간 퀴즈 쇼

> ✅ **통합 앱**: 다음 앱이 이 앱으로 통합됩니다.
> - `chosung-quiz` → 초성 퀴즈 모드 (한글 초성 맞추기)
> - 이해도 테스트 모드 (강연 후 학습 확인) 추가 예정
> - AI 퀴즈 생성 기능 추가 예정
> - 통합 계획: `docs/APP_CONSOLIDATION_PLAN.md` 참조

## 1. 개요

### 1.1 앱 설명
Realtime Quiz는 Kahoot 스타일의 실시간 멀티플레이어 퀴즈 게임입니다. 호스트가 퀴즈를 진행하고, 참가자들이 모바일로 실시간 참여하며, 속도와 정확도에 따른 점수로 리더보드가 실시간 업데이트됩니다.

### 1.2 타겟 사용자
- **교육자**: 수업 복습, 이해도 체크
- **기업 교육 담당자**: 교육 후 평가, 온보딩 퀴즈
- **이벤트 진행자**: 행사 퀴즈쇼, 경품 추첨
- **친구/가족**: 파티 게임, 지식 대결

### 1.3 핵심 가치
- **즉시 시작**: 회원가입 없이 6자리 코드로 참여
- **실시간 경쟁**: 리더보드가 문제마다 업데이트
- **게임화**: 속도 보너스, 연속 정답 보너스, 파워업
- **분석**: 문제별 정답률, 개인별 성적 리포트

### 1.4 사용 시나리오
1. **수업 마무리 (5분)**: 오늘 배운 내용 5문제 → 1등에게 작은 보상
2. **팀빌딩 퀴즈**: 회사/팀 관련 퀴즈 → 팀 결속력 강화
3. **파티 게임**: 일반 상식 퀴즈 → 친목 도모

### 1.5 참여 모드 원칙
> **호스트 = PC/프로젝터(큰 화면), 참가자 = 모바일**

| 역할 | 디바이스 | 화면 구성 |
|------|----------|-----------|
| **호스트** | PC/프로젝터 | 질문+선택지 표시, 카운트다운 타이머, 리더보드, 진행 컨트롤 |
| **참가자** | 모바일 (필수) | 6자리 코드 입력 → 4개 선택지 버튼 → 정답/오답 피드백 |

- 참가자 화면은 **모바일 세로 모드에 최적화**
- 선택지 버튼 4개는 **2x2 그리드**로 배치 (한 손 조작)
- 터치 영역 **최소 64px** (빠른 탭 필요)
- 질문은 호스트 화면에만 표시 (Kahoot 방식)
- 참가자는 **색상+모양**으로 답변 선택

---

## 2. 유사 서비스 분석

### 2.1 경쟁 서비스 비교

| 서비스 | 장점 | 단점 |
|--------|------|------|
| **Kahoot** | 브랜드 인지도, 게임화, 교육 특화 | 무료 티어 제한, 질문이 호스트 화면에만 |
| **Quizizz** | Self-paced 모드, 과제 기능 | 실시간 경쟁감 약함 |
| **Blooket** | 다양한 게임 모드 (Tower Defense 등) | 복잡한 규칙 |
| **Gimkit** | 경제 시스템, 업그레이드 | 유료 ($9.99/월) |

### 2.2 차별화 전략
1. **한국어 최적화**: 한글 질문 템플릿, 한국 문화 퀴즈
2. **무료 & 무제한**: 참가자 수/퀴즈 수 제한 없음
3. **live-voting 연동**: 기존 실시간 인프라 재사용
4. **간결한 UX**: 복잡한 게임 모드 없이 핵심에 집중

---

## 3. 기술 스택

### 3.1 프론트엔드
- **Next.js 15 App Router**
- **React 19 + TypeScript**
- **Tailwind CSS v3**
- **Zustand 5**: 게임 상태 관리
- **Framer Motion**: 리더보드 애니메이션
- **react-confetti**: 우승자 축하 효과

### 3.2 백엔드/실시간
- **Supabase Realtime**: Presence + Broadcast
- **Supabase Database**: 퀴즈, 세션, 점수 저장

### 3.3 라이브러리 설치
```bash
pnpm add @supabase/supabase-js nanoid framer-motion react-confetti
```

---

## 4. 핵심 기능

### 4.1 퀴즈 생성 (호스트)

#### 4.1.1 타입 정의
```typescript
// types/quiz.ts
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  createdAt: string;
  createdBy: string;
}

export interface QuizQuestion {
  id: string;
  text: string;              // 질문
  type: 'multiple' | 'truefalse';
  options: string[];         // 선택지 (4개 또는 2개)
  correctIndex: number;      // 정답 인덱스
  timeLimit: number;         // 초 (5, 10, 15, 20, 30)
  points: number;            // 기본 점수 (100, 200, 500, 1000)
  imageUrl?: string;         // 질문 이미지
}

export interface QuizSettings {
  showLeaderboardAfterEach: boolean;  // 문제마다 리더보드 표시
  randomizeQuestionOrder: boolean;    // 문제 순서 셔플
  randomizeOptionOrder: boolean;      // 선택지 순서 셔플
  speedBonus: boolean;                // 빠른 답변 보너스
  streakBonus: boolean;               // 연속 정답 보너스
}
```

#### 4.1.2 퀴즈 에디터 기능
- **질문 추가**: 객관식(4지선다) / O/X
- **시간 제한 설정**: 5초, 10초, 15초, 20초, 30초
- **점수 설정**: 100, 200, 500, 1000점
- **이미지 첨부**: 질문에 이미지 추가
- **미리보기**: 참가자 화면 미리보기
- **저장/불러오기**: 퀴즈 템플릿 저장

---

### 4.2 게임 세션

#### 4.2.1 세션 흐름
```
1. 호스트: 퀴즈 선택 → 세션 생성 → 대기 화면
2. 참가자: 코드 입력 → 닉네임 입력 → 대기 (리스트에 표시)
3. 호스트: "시작" 버튼 클릭
4. 모든 화면: 카운트다운 (3, 2, 1, GO!)
5. 질문 루프:
   - 질문 표시 (호스트 화면: 질문 + 선택지)
   - 타이머 시작
   - 참가자: 답변 선택
   - 타이머 종료 또는 전원 답변 완료
   - 정답 공개 + 점수 업데이트
   - 리더보드 표시 (설정 시)
   - 다음 질문
6. 게임 종료: 최종 순위 발표, Confetti
```

#### 4.2.2 점수 계산
```typescript
interface ScoreCalculation {
  basePoints: number;       // 문제 기본 점수
  speedBonus: number;       // 빠른 답변 보너스 (최대 50%)
  streakBonus: number;      // 연속 정답 보너스 (2연속: +10%, 3연속: +20%, ...)
  totalPoints: number;
}

function calculateScore(
  isCorrect: boolean,
  timeLeft: number,        // 남은 시간 (초)
  timeLimit: number,       // 제한 시간 (초)
  basePoints: number,
  currentStreak: number,
  settings: QuizSettings
): ScoreCalculation {
  if (!isCorrect) {
    return { basePoints: 0, speedBonus: 0, streakBonus: 0, totalPoints: 0 };
  }

  // 속도 보너스: 남은 시간 비율 × 50%
  const speedMultiplier = settings.speedBonus
    ? 1 + (timeLeft / timeLimit) * 0.5
    : 1;

  // 연속 정답 보너스: 연속 횟수 × 10% (최대 50%)
  const streakMultiplier = settings.streakBonus
    ? 1 + Math.min(currentStreak * 0.1, 0.5)
    : 1;

  const speedBonus = Math.round(basePoints * (speedMultiplier - 1));
  const streakBonus = Math.round(basePoints * (streakMultiplier - 1));
  const totalPoints = Math.round(basePoints * speedMultiplier * streakMultiplier);

  return { basePoints, speedBonus, streakBonus, totalPoints };
}
```

---

### 4.3 실시간 동기화

#### 4.3.1 Supabase 채널 이벤트
```typescript
// 호스트 → 참가자
type HostEvent =
  | { type: 'game_start' }
  | { type: 'question_show'; question: QuizQuestion; questionNumber: number }
  | { type: 'timer_sync'; timeLeft: number }
  | { type: 'question_end' }
  | { type: 'answer_reveal'; correctIndex: number }
  | { type: 'leaderboard_show'; leaderboard: LeaderboardEntry[] }
  | { type: 'game_end'; finalLeaderboard: LeaderboardEntry[] };

// 참가자 → 호스트
type PlayerEvent =
  | { type: 'answer_submit'; participantId: string; answerIndex: number; timeLeft: number }
  | { type: 'player_join'; participantId: string; nickname: string }
  | { type: 'player_leave'; participantId: string };

// 리더보드 엔트리
interface LeaderboardEntry {
  participantId: string;
  nickname: string;
  score: number;
  rank: number;
  correctCount: number;
  streak: number;
}
```

#### 4.3.2 실시간 훅
```typescript
// hooks/useQuizSession.ts
export function useQuizSession(sessionId: string, role: 'host' | 'player') {
  const channel = supabase.channel(`quiz:${sessionId}`);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Presence: 참가자 목록
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const players = Object.values(state).flat() as Participant[];
      setParticipants(players);
    });

    // Broadcast: 게임 이벤트
    channel.on('broadcast', { event: 'game_event' }, ({ payload }) => {
      handleGameEvent(payload as HostEvent | PlayerEvent);
    });

    channel.subscribe();

    return () => { channel.unsubscribe(); };
  }, [sessionId]);

  return { participants, leaderboard, currentQuestion, timeLeft, channel };
}
```

---

### 4.4 UI 디자인

#### 4.4.1 호스트 프레젠테이션 모드
```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 퀴즈쇼                    참가자: 32명      문제 3/10       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│        " 대한민국의 수도는? "                                    │
│                                                                 │
│   ┌────────────────┐  ┌────────────────┐                       │
│   │  🔴 서울       │  │  🔵 부산       │                       │
│   └────────────────┘  └────────────────┘                       │
│   ┌────────────────┐  ┌────────────────┐                       │
│   │  🟡 인천       │  │  🟢 대전       │                       │
│   └────────────────┘  └────────────────┘                       │
│                                                                 │
│   ═══════════════════════════════════  ⏱️ 8초                   │
│                                                                 │
│   📊 28명 답변 완료                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.4.2 참가자 모바일 화면
```
┌──────────────────────────────┐
│  퀴즈쇼          문제 3/10   │
├──────────────────────────────┤
│                              │
│  " 대한민국의 수도는? "       │
│                              │
│  ┌────────────────────────┐ │
│  │      🔴 서울           │ │
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │      🔵 부산           │ │
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │      🟡 인천           │ │
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │      🟢 대전           │ │
│  └────────────────────────┘ │
│                              │
│      ⏱️ 8초 남음             │
│                              │
└──────────────────────────────┘
```

#### 4.4.3 리더보드 화면
```
┌─────────────────────────────────────────────────────────────────┐
│                      🏆 리더보드                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🥇  김철수        2,450점  ████████████████████ +350          │
│                              ↑ 1위 유지                         │
│                                                                 │
│   🥈  박영희        2,100점  █████████████████ +280             │
│                              ↑ 2단계 상승                       │
│                                                                 │
│   🥉  이민수        1,980점  ████████████████ +0                │
│                              ↓ 1단계 하락                       │
│                                                                 │
│   4.  정수진        1,850점  ███████████████                    │
│   5.  최동훈        1,720점  ██████████████                     │
│   ...                                                           │
│                                                                 │
│                    [ 다음 문제 ]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 데이터 모델 (Supabase)

### 5.1 테이블 스키마
```sql
-- 퀴즈 템플릿
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  settings JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false
);

-- 게임 세션
CREATE TABLE quiz_sessions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT REFERENCES quizzes(id),
  host_id TEXT NOT NULL,
  status TEXT DEFAULT 'waiting',
  current_question_index INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 참가자 답변 및 점수
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES quiz_sessions(id),
  participant_id TEXT NOT NULL,
  question_index INTEGER NOT NULL,
  answer_index INTEGER,
  time_left NUMERIC,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, participant_id, question_index)
);

-- 최종 점수 (집계용)
CREATE TABLE quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES quiz_sessions(id),
  participant_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  total_score INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  final_rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, participant_id)
);
```

---

## 6. 컴포넌트 구조

```
src/app/realtime-quiz/
├── page.tsx                    # 랜딩 (호스트/참여 선택)
├── create/
│   └── page.tsx                # 퀴즈 생성/편집
├── host/
│   └── [sessionId]/
│       ├── page.tsx            # 호스트 대기/컨트롤
│       └── present/
│           └── page.tsx        # 프레젠테이션 모드
├── join/
│   └── page.tsx                # 참여 코드 입력
├── play/
│   └── [sessionId]/
│       └── page.tsx            # 참가자 게임 화면
├── components/
│   ├── QuizEditor.tsx          # 퀴즈 편집기
│   ├── QuestionCard.tsx        # 질문 표시
│   ├── AnswerButton.tsx        # 답변 버튼
│   ├── Leaderboard.tsx         # 리더보드
│   ├── Timer.tsx               # 타이머
│   ├── ScorePopup.tsx          # 점수 획득 팝업
│   ├── Countdown.tsx           # 3-2-1 카운트다운
│   └── WinnerCelebration.tsx   # 우승자 축하
├── store/
│   └── useQuizStore.ts         # Zustand 상태
├── hooks/
│   └── useQuizSession.ts       # 실시간 세션
└── types/
    └── index.ts                # 타입 정의
```

---

## 7. 퀴즈 템플릿

### 7.1 기본 제공 퀴즈
```typescript
export const defaultQuizzes = {
  koreanGeography: {
    title: "대한민국 지리 퀴즈",
    questions: [
      { text: "대한민국의 수도는?", options: ["서울", "부산", "인천", "대전"], correctIndex: 0 },
      { text: "가장 큰 섬은?", options: ["제주도", "거제도", "강화도", "울릉도"], correctIndex: 0 },
      // ...
    ],
  },
  generalKnowledge: {
    title: "일반 상식 퀴즈",
    questions: [
      { text: "물의 화학식은?", options: ["H2O", "CO2", "NaCl", "O2"], correctIndex: 0 },
      // ...
    ],
  },
  movieTrivia: {
    title: "영화 퀴즈",
    questions: [
      { text: "'기생충' 감독은?", options: ["봉준호", "박찬욱", "김기덕", "이창동"], correctIndex: 0 },
      // ...
    ],
  },
};
```

---

## 8. 구현 우선순위

### Phase 1: MVP (2주)
- [ ] 퀴즈 생성 UI (간단 버전)
- [ ] 세션 생성/참여
- [ ] 실시간 질문/답변
- [ ] 기본 점수 계산
- [ ] 리더보드

### Phase 2: 게임화 (1주)
- [ ] 속도 보너스
- [ ] 연속 정답 보너스
- [ ] 애니메이션 효과
- [ ] 우승자 축하 효과

### Phase 3: 고급 기능 (1주)
- [ ] 퀴즈 템플릿 저장/불러오기
- [ ] 이미지 질문
- [ ] 결과 리포트
- [ ] 팀 모드

---

## 9. 참고 자료

### 유사 서비스
- [Kahoot](https://kahoot.com/)
- [Quizizz](https://quizizz.com/)
- [Blooket](https://www.blooket.com/)
- [Gimkit](https://gimkit.com/)

### 기술 문서
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Framer Motion](https://www.framer.com/motion/)

---

**작성일**: 2024-12-23
**버전**: 1.0
