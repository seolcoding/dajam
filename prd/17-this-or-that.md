# This or That - 실시간 그룹 투표 게임

## 1. 개요

### 1.1 앱 설명
This or That은 소규모 그룹에서 실시간으로 A/B 선택 투표를 진행하는 아이스브레이킹 앱입니다. 호스트가 질문을 제시하면 참가자들이 모바일로 투표하고, 결과가 실시간으로 큰 화면에 표시됩니다. 기존 `balance-game`의 실시간 멀티플레이어 확장 버전입니다.

### 1.2 타겟 사용자
- 강의/워크샵 진행자: 수업 시작 전 아이스브레이킹
- 팀 리더: 팀빌딩 활동, 회의 전 분위기 조성
- 이벤트 MC: 청중 참여 유도
- 친구/가족 모임: 가벼운 대화 소재

### 1.3 핵심 가치
- **즉시 참여**: 6자리 코드로 회원가입 없이 참여
- **실시간 반응**: Supabase Realtime으로 즉각적인 투표 반영
- **시각적 피드백**: 투표 결과 실시간 차트 + 애니메이션
- **호스트 컨트롤**: 질문 흐름을 호스트가 완전히 제어

### 1.4 사용 시나리오
1. **강의 시작 5분**: "아침형 vs 저녁형?" → 학생들 빠르게 투표 → 분위기 환기
2. **팀미팅 전**: "오늘 점심 한식 vs 양식?" → 실제 의사결정에 활용
3. **파티 게임**: "평생 치킨 vs 피자만?" → 결과 공유하며 대화

### 1.5 참여 모드 원칙
> **호스트 = PC/태블릿(큰 화면), 참가자 = 모바일**

| 역할 | 디바이스 | 화면 구성 |
|------|----------|-----------|
| **호스트** | PC/태블릿/프로젝터 | 질문 표시, 실시간 투표 결과, 참가자 수, 진행 컨트롤 |
| **참가자** | 모바일 (필수) | 6자리 코드 입력 → A/B 투표 버튼 → 결과 확인 |

- 참가자 화면은 **모바일 세로 모드에 최적화**
- 터치 영역은 **최소 48px** (모바일 접근성)
- 투표 버튼은 화면의 **50% 이상** 차지 (한 손 조작)
- 결과 화면에서 스크롤 최소화

---

## 2. 유사 서비스 분석

### 2.1 경쟁 서비스

| 서비스 | 장점 | 단점 |
|--------|------|------|
| **Mentimeter** | 다양한 질문 유형, 기업용 기능 | 무료 티어 제한, 복잡한 UI |
| **Slido** | Zoom/Teams 통합, Q&A 기능 | 유료 ($80+), 설정 복잡 |
| **AhaSlides** | 무료 티어 관대, 커스텀 테마 | 한글 지원 미흡 |
| **Kahoot** | 게임화, 리더보드 | A/B 투표보다 퀴즈 특화 |

### 2.2 차별화 전략
1. **한국어 UX 최적화**: Pretendard 폰트, 한국어 질문 템플릿
2. **무료 & 무제한**: 참가자 수 제한 없음, 광고 없음
3. **balance-game 연동**: 기존 질문 템플릿 재사용
4. **Supabase Realtime**: 서버리스, 즉각적인 동기화

---

## 3. 기술 스택

### 3.1 프론트엔드
- **Next.js 15 App Router**: 기존 프로젝트와 통합
- **React 19 + TypeScript**: 타입 안정성
- **Tailwind CSS v3**: 반응형 스타일링
- **Zustand 5**: 상태 관리
- **Framer Motion**: 투표 애니메이션
- **Recharts**: 실시간 차트

### 3.2 백엔드/실시간
- **Supabase Realtime**: Presence + Broadcast
- **Supabase Database**: 세션/투표 저장
- **nanoid**: 6자리 참여 코드 생성

### 3.3 라이브러리 설치
```bash
pnpm add @supabase/supabase-js nanoid framer-motion recharts
```

---

## 4. 핵심 기능

### 4.1 호스트 모드

#### 4.1.1 세션 생성
```typescript
// types/this-or-that.ts
export interface Session {
  id: string;           // nanoid(6)
  hostId: string;       // 호스트 고유 ID
  title: string;        // 세션 제목
  currentQuestionIndex: number;
  questions: Question[];
  status: 'waiting' | 'voting' | 'result' | 'ended';
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;         // "더 중요한 것은?"
  optionA: string;      // "돈"
  optionB: string;      // "사랑"
  imageA?: string;      // 선택지 A 이미지
  imageB?: string;      // 선택지 B 이미지
  timeLimit?: number;   // 투표 제한 시간 (초)
}

export interface Vote {
  odId: string;         // 참여자 ID
  questionId: string;
  choice: 'A' | 'B';
  timestamp: string;
}
```

#### 4.1.2 호스트 UI 기능
- **질문 추가/편집**: 직접 입력 또는 템플릿 선택
- **질문 순서 변경**: 드래그앤드롭
- **세션 시작**: 대기 화면 → 첫 질문
- **투표 시작/종료**: 수동 제어
- **다음 질문**: 결과 확인 후 진행
- **세션 종료**: 전체 통계 요약

#### 4.1.3 프레젠테이션 모드
```typescript
// 전체 화면, 큰 글씨, 차트 중심
interface PresentationView {
  mode: 'waiting' | 'voting' | 'result';
  qrCode: string;        // 참여 URL QR
  joinCode: string;      // 6자리 코드
  currentQuestion: Question;
  voteCount: { A: number; B: number };
  participantCount: number;
}
```

---

### 4.2 참여자 모드

#### 4.2.1 참여 플로우
```
1. QR 스캔 또는 URL 직접 입력
2. 6자리 코드 입력
3. 닉네임 입력 (선택)
4. 대기 화면 (호스트가 시작할 때까지)
5. 질문 표시 → A 또는 B 선택
6. 다음 질문 대기 또는 결과 화면
```

#### 4.2.2 투표 UI
```typescript
// 모바일 최적화 UI
// 화면 좌우로 크게 A/B 버튼 표시
// 선택 시 햅틱 피드백 (진동)
// 제한 시간 타이머 표시

export function VoteScreen({ question, onVote }: VoteScreenProps) {
  return (
    <div className="h-screen grid grid-cols-2">
      <button
        onClick={() => onVote('A')}
        className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white text-2xl font-bold"
      >
        {question.optionA}
      </button>
      <button
        onClick={() => onVote('B')}
        className="bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white text-2xl font-bold"
      >
        {question.optionB}
      </button>
    </div>
  );
}
```

---

### 4.3 실시간 동기화 (Supabase Realtime)

#### 4.3.1 채널 구조
```typescript
// hooks/useRealtimeSession.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useRealtimeSession(sessionId: string) {
  const channel = supabase.channel(`session:${sessionId}`);

  // Presence: 참여자 목록
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    // 참여자 수 업데이트
  });

  // Broadcast: 호스트 → 참여자
  channel.on('broadcast', { event: 'question' }, ({ payload }) => {
    // 새 질문 표시
  });

  channel.on('broadcast', { event: 'vote_result' }, ({ payload }) => {
    // 투표 결과 업데이트
  });

  // 참여자 입장
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ participantId, nickname });
    }
  });

  return { channel, supabase };
}
```

#### 4.3.2 투표 로직
```typescript
// 참여자가 투표
async function submitVote(choice: 'A' | 'B') {
  // 1. DB에 저장
  await supabase.from('votes').insert({
    session_id: sessionId,
    question_id: currentQuestion.id,
    participant_id: participantId,
    choice,
  });

  // 2. Broadcast로 실시간 알림
  channel.send({
    type: 'broadcast',
    event: 'new_vote',
    payload: { choice },
  });
}

// 호스트가 투표 결과 집계
channel.on('broadcast', { event: 'new_vote' }, ({ payload }) => {
  setVoteCounts(prev => ({
    ...prev,
    [payload.choice]: prev[payload.choice] + 1,
  }));
});
```

---

### 4.4 질문 템플릿

#### 4.4.1 기본 템플릿 (balance-game 연동)
```typescript
// data/templates.ts
export const thisOrThatTemplates = {
  icebreaker: [
    { text: "나는...", optionA: "아침형 인간", optionB: "저녁형 인간" },
    { text: "휴가를 간다면?", optionA: "바다", optionB: "산" },
    { text: "더 좋아하는 것은?", optionA: "여름", optionB: "겨울" },
    { text: "주말에 선호하는 것은?", optionA: "집콕", optionB: "외출" },
  ],
  food: [
    { text: "평생 하나만?", optionA: "치킨", optionB: "피자" },
    { text: "오늘 점심은?", optionA: "한식", optionB: "양식" },
  ],
  values: [
    { text: "더 중요한 것은?", optionA: "돈", optionB: "사랑" },
    { text: "회사 선택 기준?", optionA: "높은 연봉", optionB: "워라밸" },
  ],
  fun: [
    { text: "능력을 고른다면?", optionA: "투명인간", optionB: "순간이동" },
    { text: "평생 사용한다면?", optionA: "Netflix", optionB: "YouTube" },
  ],
};
```

---

## 5. 데이터 모델 (Supabase)

### 5.1 테이블 스키마
```sql
-- 세션 테이블
CREATE TABLE this_or_that_sessions (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  current_question_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 투표 테이블
CREATE TABLE this_or_that_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES this_or_that_sessions(id),
  question_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('A', 'B')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_id, participant_id)
);

-- Row Level Security
ALTER TABLE this_or_that_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE this_or_that_votes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read sessions" ON this_or_that_sessions
  FOR SELECT USING (true);

-- 호스트만 업데이트 가능
CREATE POLICY "Host can update session" ON this_or_that_sessions
  FOR UPDATE USING (host_id = auth.uid());

-- 모든 사용자가 투표 가능
CREATE POLICY "Anyone can vote" ON this_or_that_votes
  FOR INSERT WITH CHECK (true);
```

---

## 6. 컴포넌트 구조

```
src/app/this-or-that/
├── page.tsx                    # 랜딩 (호스트/참여 선택)
├── host/
│   ├── page.tsx                # 세션 생성
│   ├── [sessionId]/
│   │   ├── page.tsx            # 호스트 컨트롤
│   │   └── present/
│   │       └── page.tsx        # 프레젠테이션 모드
├── join/
│   └── page.tsx                # 참여 코드 입력
├── play/
│   └── [sessionId]/
│       └── page.tsx            # 참여자 투표 화면
├── components/
│   ├── QuestionEditor.tsx      # 질문 편집기
│   ├── TemplateSelector.tsx    # 템플릿 선택
│   ├── VoteScreen.tsx          # 투표 화면
│   ├── ResultChart.tsx         # 결과 차트
│   ├── ParticipantCounter.tsx  # 참여자 수
│   ├── QRCodeDisplay.tsx       # QR 코드
│   └── TimerBar.tsx            # 투표 타이머
├── store/
│   └── useSessionStore.ts      # Zustand 상태
├── hooks/
│   └── useRealtimeSession.ts   # Supabase Realtime
├── lib/
│   └── supabase.ts             # Supabase 클라이언트
└── types/
    └── index.ts                # 타입 정의
```

---

## 7. UI/UX 설계

### 7.1 호스트 프레젠테이션 모드

```
┌─────────────────────────────────────────────────────────────┐
│  QR코드 + 참여코드                                           │
│  ┌────────┐  code.seolcoding.com/ABC123                     │
│  │ QR     │  참여자: 24명                                    │
│  └────────┘                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│           " 더 중요한 것은? "                                 │
│                                                              │
│   ┌──────────────────┐   ┌──────────────────┐               │
│   │                  │   │                  │               │
│   │      💰 돈       │   │     ❤️ 사랑      │               │
│   │                  │   │                  │               │
│   │     45%          │   │      55%         │               │
│   │    (11표)        │   │     (13표)       │               │
│   │                  │   │                  │               │
│   └──────────────────┘   └──────────────────┘               │
│                                                              │
│   ═══════════════════════════════════════════               │
│          투표 진행 중... (15초 남음)                          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│   [다음 질문]  [투표 종료]  [세션 종료]                        │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 참여자 모바일 화면

```
┌──────────────────────────────┐
│  This or That      ABC123   │
├──────────────────────────────┤
│                              │
│   " 더 중요한 것은? "         │
│                              │
│  ┌────────┐  ┌────────┐     │
│  │        │  │        │     │
│  │   💰   │  │   ❤️   │     │
│  │        │  │        │     │
│  │   돈   │  │  사랑  │     │
│  │        │  │        │     │
│  └────────┘  └────────┘     │
│                              │
│     ⏱️ 12초 남음             │
│                              │
└──────────────────────────────┘
```

---

## 8. balance-game과의 통합

### 8.1 공유 가능한 부분
- **질문 템플릿**: `data/templates.ts` 공유
- **타입 정의**: `Question` 인터페이스 공유
- **차트 컴포넌트**: `ResultChart.tsx` 재사용
- **색상 팔레트**: 파란색(A) vs 분홍색(B)

### 8.2 분리되는 부분
- **라우트**: `/this-or-that/*` (새로운 앱)
- **상태 관리**: 실시간 세션용 별도 스토어
- **DB 테이블**: Supabase 전용 테이블

### 8.3 마이그레이션 경로
- 향후 balance-game에도 실시간 모드 추가 가능
- 공통 컴포넌트는 `@/components/shared/`로 이동

---

## 9. 구현 우선순위

### Phase 1: MVP (1주)
- [ ] Supabase 테이블 생성
- [ ] 세션 생성 (호스트)
- [ ] 6자리 코드 참여 (참가자)
- [ ] 실시간 투표 (Broadcast)
- [ ] 기본 결과 차트

### Phase 2: 호스트 기능 (1주)
- [ ] 질문 편집기
- [ ] 템플릿 선택
- [ ] 프레젠테이션 모드
- [ ] 투표 타이머

### Phase 3: 고급 기능 (1주)
- [ ] 이미지 선택지
- [ ] 결과 공유 (이미지 생성)
- [ ] 세션 통계 요약
- [ ] PWA 지원

---

## 10. 참고 자료

### 유사 서비스
- [Mentimeter](https://www.mentimeter.com/) - 실시간 투표/발표
- [Slido](https://www.slido.com/) - Q&A + 폴링
- [AhaSlides](https://ahaslides.com/) - 무료 대안

### 기술 문서
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Presence](https://supabase.com/docs/guides/realtime/presence)
- [Framer Motion](https://www.framer.com/motion/)

---

**작성일**: 2024-12-23
**버전**: 1.0
