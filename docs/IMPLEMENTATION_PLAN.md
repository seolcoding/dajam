# 구현 계획서: Core 앱 MVP

> 작성일: 2024-12-22
> 원칙: 검증된 라이브러리/프로젝트 활용, 밑바닥 구현 최소화

---

## 1. 레퍼런스 프로젝트 분석

### 1.1 Live Voting 레퍼런스

| 프로젝트 | 스택 | 특징 | 활용도 |
|---------|------|------|--------|
| [SupaPoll](https://github.com/hookdeck/supapoll) | Next.js + Supabase + Twilio | SMS 투표, 실시간 | ⭐⭐⭐ 핵심 참고 |
| [next-supabase-vote](https://github.com/Chensokheng/next-supabase-vote) | Next.js + Supabase | 단순 웹 투표 | ⭐⭐ 구조 참고 |

**SupaPoll 스키마 vs 우리 스키마:**
```
SupaPoll                    →  우리 스키마
─────────────────────────────────────────────
vote (poll 메타)            →  sessions + config JSONB
vote_options (선택지)       →  sessions.config.options[]
vote_log (투표 기록)        →  votes
profile                     →  profiles
comments                    →  (불필요, 제외)
```

**결론**: 우리 스키마로 충분히 커버 가능. SupaPoll의 **UI/UX 패턴과 Realtime 구독 방식**만 참고.

### 1.2 실시간 협업 레퍼런스

| 솔루션 | 비용 | 장점 | 단점 |
|--------|------|------|------|
| **Supabase Realtime** | 무료 (이미 사용중) | 스키마 통합, RLS 적용 | - |
| [PartyKit](https://www.partykit.io/) | 무료 | 커스텀 백엔드, offline-first | 별도 서버 필요 |
| [Liveblocks](https://liveblocks.io/) | 유료 | 프리빌트 컴포넌트 | 비용, 벤더 락인 |

**결론**: **Supabase Realtime 그대로 사용** (추가 의존성 없음)

### 1.3 Group Order 레퍼런스

기존 오픈소스들은 "배달앱" 형태로, 우리의 "단체 주문 취합" 유스케이스와 다름.

**결론**: Supabase Realtime + 우리 `orders` 테이블로 직접 구현 (단, UI 컴포넌트는 shadcn/ui 활용)

---

## 2. 선택된 솔루션 스택

```
┌─────────────────────────────────────────────────────────────┐
│                    Core 앱 기술 스택                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Frontend  │  │   Backend   │  │   Real-time         │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────────────┤ │
│  │ Next.js 15  │  │ Supabase    │  │ Supabase Realtime   │ │
│  │ shadcn/ui   │  │ PostgreSQL  │  │ (이미 설정됨)       │ │
│  │ Zustand     │  │ RLS         │  │                     │ │
│  │ Recharts    │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  참고 프로젝트: SupaPoll (UI/Realtime 패턴)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 앱별 구현 계획

### 3.1 Live Voting (1순위)

#### 핵심 기능 (MVP)
- [x] 세션 생성 (6자리 코드)
- [x] QR 코드 참여
- [ ] 단일 선택 투표
- [ ] 실시간 결과 업데이트
- [ ] 결과 시각화 (차트)

#### 참고할 SupaPoll 패턴

```typescript
// 1. Realtime 구독 (SupaPoll 패턴 적용)
// lib/supabase/realtime.ts
export function subscribeToVotes(sessionId: string, callback: (votes: Vote[]) => void) {
  return supabase
    .channel(`votes:${sessionId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'votes',
      filter: `session_id=eq.${sessionId}`
    }, (payload) => {
      // 최신 투표 데이터 fetch
      fetchVotes(sessionId).then(callback);
    })
    .subscribe();
}

// 2. Optimistic Update (UX 향상)
// 투표 버튼 클릭 → 즉시 UI 업데이트 → 서버 확인 → 롤백/확정
```

#### 디렉토리 구조
```
src/app/live-voting/
├── page.tsx                    # 서버 컴포넌트 (메타데이터)
├── LiveVotingApp.tsx           # 메인 클라이언트 컴포넌트
├── components/
│   ├── CreatePollForm.tsx      # 투표 생성 폼
│   ├── JoinSession.tsx         # 코드/QR 참여
│   ├── VotingInterface.tsx     # 투표 UI
│   ├── ResultsChart.tsx        # 결과 차트 (Recharts)
│   └── ShareButton.tsx         # 공유 버튼
├── hooks/
│   ├── useSession.ts           # 세션 상태 관리
│   ├── useVotes.ts             # 투표 데이터 + Realtime
│   └── useVoteAggregates.ts    # 집계 데이터 구독
├── lib/
│   ├── actions.ts              # Server Actions
│   └── realtime.ts             # Supabase Realtime 헬퍼
└── types/
    └── index.ts                # 타입 정의
```

---

### 3.2 Group Order (2순위)

#### 핵심 기능 (MVP)
- [ ] 세션 생성 (식당명, 메뉴 설정)
- [ ] 참여자 주문 입력
- [ ] 실시간 주문 목록
- [ ] 총액/인당 금액 계산
- [ ] 결과 공유

#### 구현 전략
```typescript
// orders 테이블 실시간 구독
supabase
  .channel(`orders:${sessionId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders',
    filter: `session_id=eq.${sessionId}`
  }, handleOrderChange)
  .subscribe();
```

#### 디렉토리 구조
```
src/app/group-order/
├── page.tsx
├── GroupOrderApp.tsx
├── components/
│   ├── CreateSessionForm.tsx   # 세션 생성
│   ├── MenuManager.tsx         # 메뉴 관리 (fixed mode)
│   ├── OrderForm.tsx           # 주문 입력
│   ├── OrderList.tsx           # 실시간 주문 목록
│   ├── OrderSummary.tsx        # 총액/인당 계산
│   └── ShareResult.tsx         # 결과 공유
├── hooks/
│   ├── useOrderSession.ts
│   └── useOrders.ts
└── types/
    └── index.ts
```

---

### 3.3 Bingo Game (3순위 - Phase 1: localStorage)

#### Phase 1: 오프라인 버전
- localStorage로 게임 상태 관리
- 호스트가 화면 공유하며 진행
- DB 연동 없음

#### Phase 2: 온라인 버전 (추후)
- 게임 세션 DB 저장
- 참여자별 빙고 카드 동기화

---

## 4. 공통 컴포넌트 활용

### 4.1 shadcn/ui 기반 (이미 설치됨)
```typescript
// 활용할 컴포넌트
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RadioGroup } from "@/components/ui/radio-group";
import { Tabs } from "@/components/ui/tabs";
```

### 4.2 공통 훅 생성
```typescript
// src/hooks/useSupabaseSession.ts
// 세션 참여/생성 로직 통합

// src/hooks/useRealtimeSubscription.ts
// Realtime 구독 래퍼

// src/hooks/useActivityLog.ts
// 활동 기록 (docs/ARCHITECTURE_REVIEW.md 참고)
```

---

## 5. 구현 순서

### Week 1: 기반 작업
1. [ ] Supabase 클라이언트 설정 확인
2. [ ] 공통 훅 생성 (useSupabaseSession, useRealtimeSubscription)
3. [ ] 타입 정의 (database.types.ts 생성)

### Week 2: Live Voting MVP
1. [ ] 세션 생성/참여 UI
2. [ ] 투표 인터페이스
3. [ ] Realtime 구독 연동
4. [ ] 결과 차트 (Recharts)

### Week 3: Group Order MVP
1. [ ] 세션 생성 UI
2. [ ] 주문 입력 폼
3. [ ] 실시간 주문 목록
4. [ ] 정산 계산

### Week 4: 테스트 & 배포
1. [ ] E2E 테스트 작성
2. [ ] Vercel 배포 확인
3. [ ] 버그 수정

---

## 6. 참고 자료

- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)
- [SupaPoll GitHub](https://github.com/hookdeck/supapoll)
- [next-supabase-vote GitHub](https://github.com/Chensokheng/next-supabase-vote)

---

*이 계획은 "검증된 라이브러리 활용, 밑바닥 구현 최소화" 원칙에 따라 작성되었습니다.*
