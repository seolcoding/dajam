# Realtime Session Specification

## 개요

소규모 세션(5~50명)에서 참여자들의 응답을 **실시간으로 수집하고 통합**하는 기능

---

## 프리빌트 라이브러리 비교

### 1. PartyKit (Cloudflare) - 추천

> [PartyKit](https://www.partykit.io/) - Cloudflare에 인수됨 (2024.04)

```bash
npm install partykit partysocket
```

**특징**
- Edge 기반 Durable Objects (전세계 저지연)
- WebSocket 기본 지원
- Y.js, Automerge 등 CRDT 통합
- Vercel, Netlify 등과 호환

**가격**
- 무료: Cloudflare Free 플랜 (Durable Objects 포함)
- 유료: $5/월 (Workers Paid) + 사용량

**예시 코드**
```typescript
// server.ts (PartyKit Server)
import type { PartyKitServer } from "partykit/server";

export default {
  onConnect(conn, room) {
    conn.send(JSON.stringify({ type: "welcome", roomId: room.id }));
  },
  onMessage(message, conn, room) {
    // 모든 참여자에게 브로드캐스트
    room.broadcast(message);
  },
} satisfies PartyKitServer;

// client.tsx
import PartySocket from "partysocket";

const socket = new PartySocket({
  host: "your-project.partykit.dev",
  room: "session-ABC123",
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  // 응답 처리
});
```

---

### 2. Liveblocks

> [Liveblocks](https://liveblocks.io/) - 협업 인프라 전문

```bash
npm install @liveblocks/client @liveblocks/react
```

**특징**
- React Hooks 기본 제공
- Presence (커서, 타이핑 표시)
- Storage (실시간 동기화 상태)
- Comments, Notifications 내장

**가격**
- Free: 100 MAU
- Starter: $25/월 (1,000 MAU)
- Pro: $99/월 (10,000 MAU)

**예시 코드**
```typescript
// liveblocks.config.ts
import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({ publicApiKey: "pk_..." });

export const { RoomProvider, useOthers, useBroadcastEvent, useEventListener } =
  createRoomContext(client);

// VotingRoom.tsx
function VotingRoom({ sessionCode }: { sessionCode: string }) {
  const others = useOthers();
  const broadcast = useBroadcastEvent();

  // 투표 브로드캐스트
  const submitVote = (optionId: string) => {
    broadcast({ type: "vote", optionId });
  };

  // 투표 수신
  useEventListener(({ event }) => {
    if (event.type === "vote") {
      // 집계 업데이트
    }
  });

  return <div>참여자: {others.length}명</div>;
}
```

---

### 3. Supabase Realtime

> [Supabase Realtime](https://supabase.com/docs/guides/realtime) - 통합 백엔드

```bash
npm install @supabase/supabase-js
```

**특징**
- PostgreSQL 기반 (DB + Auth + Realtime 통합)
- Broadcast, Presence, DB Changes
- Row Level Security (RLS)

**가격**
- Free: 200 동시 연결, 2GB DB
- Pro: $25/월 (500 연결, 8GB DB)
- 메시지당 과금

**예시 코드**
```typescript
// supabase/client.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// useRealtimeSession.ts
function useRealtimeSession(sessionCode: string) {
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`session:${sessionCode}`)
      .on("broadcast", { event: "response" }, ({ payload }) => {
        setResponses((prev) => [...prev, payload]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode]);

  const submitResponse = (answer: Answer) => {
    supabase.channel(`session:${sessionCode}`).send({
      type: "broadcast",
      event: "response",
      payload: answer,
    });
  };

  return { responses, submitResponse };
}
```

---

### 4. Socket.IO (Self-hosted)

> [Socket.IO](https://socket.io/) - 전통적인 WebSocket 라이브러리

```bash
npm install socket.io socket.io-client
```

**특징**
- 자체 서버 필요 (Node.js)
- Fallback (Long Polling)
- Room/Namespace 지원

**가격**
- 무료 (인프라 비용만)

**단점**
- 서버 관리 필요
- 스케일링 복잡

---

### 라이브러리 비교표

| 항목 | PartyKit | Liveblocks | Supabase | Socket.IO |
|------|----------|------------|----------|-----------|
| **난이도** | 중 | 하 | 중 | 상 |
| **무료 한도** | 넉넉함 | 100 MAU | 200 연결 | 무제한 |
| **React 통합** | 수동 | 내장 | 수동 | 수동 |
| **DB 통합** | ❌ | ❌ | ✅ | ❌ |
| **인증 통합** | ❌ | ✅ | ✅ | ❌ |
| **Edge 배포** | ✅ | ✅ | ❌ | ❌ |
| **Vercel 호환** | ✅ | ✅ | ✅ | ⚠️ |

---

### 추천 조합

**소규모 (5~50명) 세션용:**

```
┌─────────────────────────────────────────────────────────┐
│                    Option A: 경량                       │
│                                                         │
│   Next.js (Vercel) + PartyKit (Cloudflare)             │
│                                                         │
│   • 실시간: PartyKit WebSocket                          │
│   • 저장: 불필요 (세션 종료 시 휘발)                     │
│   • 비용: $0 ~ $5/월                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Option B: 통합 (추천)                   │
│                                                         │
│   Next.js (Vercel) + Supabase                          │
│                                                         │
│   • 실시간: Supabase Realtime                           │
│   • 저장: Supabase PostgreSQL                           │
│   • 인증: Supabase Auth (선택)                          │
│   • 비용: $0 (Free) ~ $25/월 (Pro)                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Option C: 프리미엄                      │
│                                                         │
│   Next.js (Vercel) + Liveblocks                        │
│                                                         │
│   • 실시간: Liveblocks Broadcast                        │
│   • Presence: 내장 (커서, 타이핑)                       │
│   • 비용: $25/월 (1,000 MAU)                            │
└─────────────────────────────────────────────────────────┘
```

### 적용 대상 앱

| 앱 | 용도 | 세션 유형 |
|----|------|----------|
| **live-voting** | 실시간 투표 | 호스트 1 + 참여자 N |
| **balance-game** | 밸런스 게임 결과 통계 | 호스트 1 + 참여자 N |
| **bingo-game** | 빙고 게임 동기화 | 호스트 1 + 참여자 N |
| **group-order** | 단체 주문 취합 | 호스트 1 + 참여자 N |
| **ideal-worldcup** | 이상형 월드컵 통계 | 참여자 N (P2P) |

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Participants                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ User 1  │  │ User 2  │  │ User 3  │  │ User 4  │  │  ...    │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │            │            │            │            │             │
│       └────────────┴────────────┼────────────┴────────────┘             │
│                                 │                                        │
│                                 ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     WebSocket Connection                          │   │
│  │                   (Supabase Realtime)                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                 │                                        │
└─────────────────────────────────┼────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Supabase Backend                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │    Sessions    │  │   Responses    │  │   Realtime     │            │
│  │    (Table)     │  │    (Table)     │  │   Broadcast    │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              Host View                                   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    실시간 결과 대시보드                            │   │
│  │  • 참여자 수 표시                                                 │   │
│  │  • 실시간 응답 집계                                               │   │
│  │  • 차트/그래프 업데이트                                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 데이터 모델

### 1. Sessions (세션)

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,        -- 참여 코드 (예: ABC123)
  app_type VARCHAR(50) NOT NULL,          -- 앱 종류
  host_id VARCHAR(100) NOT NULL,          -- 호스트 식별자
  config JSONB DEFAULT '{}',              -- 앱별 설정
  status VARCHAR(20) DEFAULT 'waiting',   -- waiting, active, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- 인덱스
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_sessions_status ON sessions(status);
```

### 2. Participants (참여자)

```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  nickname VARCHAR(50) NOT NULL,
  device_id VARCHAR(100),                 -- 익명 식별자
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 인덱스
CREATE INDEX idx_participants_session ON participants(session_id);
```

### 3. Responses (응답)

```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  question_id VARCHAR(100),               -- 질문/항목 식별자
  answer JSONB NOT NULL,                  -- 유연한 응답 데이터
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_responses_session ON responses(session_id);
CREATE INDEX idx_responses_question ON responses(session_id, question_id);
```

---

## 앱별 데이터 구조

### live-voting (실시간 투표)

```typescript
// Session Config
interface VotingSessionConfig {
  title: string;
  options: { id: string; label: string }[];
  allowMultiple: boolean;
  showResultsLive: boolean;
}

// Response Answer
interface VotingAnswer {
  selectedOptions: string[];  // option ids
}

// Aggregated Result
interface VotingResult {
  totalVotes: number;
  options: {
    id: string;
    label: string;
    count: number;
    percentage: number;
  }[];
}
```

### balance-game (밸런스 게임)

```typescript
// Session Config
interface BalanceSessionConfig {
  questions: {
    id: string;
    optionA: string;
    optionB: string;
  }[];
}

// Response Answer
interface BalanceAnswer {
  questionId: string;
  choice: 'A' | 'B';
}

// Aggregated Result
interface BalanceResult {
  questionId: string;
  optionA: { count: number; percentage: number };
  optionB: { count: number; percentage: number };
  total: number;
}
```

### group-order (단체 주문)

```typescript
// Session Config
interface OrderSessionConfig {
  storeName: string;
  menu: {
    id: string;
    name: string;
    price: number;
    options?: { id: string; name: string; price: number }[];
  }[];
  deadline?: string;
}

// Response Answer
interface OrderAnswer {
  items: {
    menuId: string;
    quantity: number;
    options?: string[];
    memo?: string;
  }[];
}

// Aggregated Result
interface OrderResult {
  totalAmount: number;
  itemSummary: {
    menuId: string;
    name: string;
    totalQuantity: number;
    totalPrice: number;
  }[];
  participantOrders: {
    nickname: string;
    items: OrderAnswer['items'];
    amount: number;
  }[];
}
```

### bingo-game (빙고 게임)

```typescript
// Session Config
interface BingoSessionConfig {
  gridSize: 3 | 4 | 5;
  items: string[];
  winCondition: number;  // 몇 줄 빙고?
}

// Response Answer (실시간 상태)
interface BingoAnswer {
  markedItems: string[];
  bingoLines: number;
}

// Aggregated Result
interface BingoResult {
  rankings: {
    rank: number;
    nickname: string;
    bingoLines: number;
    completedAt?: string;
  }[];
  itemPopularity: {
    item: string;
    markedCount: number;
  }[];
}
```

---

## API 설계

### REST API (Next.js API Routes)

```typescript
// POST /api/sessions - 세션 생성
interface CreateSessionRequest {
  appType: 'voting' | 'balance' | 'order' | 'bingo';
  config: SessionConfig;
}

interface CreateSessionResponse {
  sessionId: string;
  code: string;        // 6자리 참여 코드
  hostToken: string;   // 호스트 인증 토큰
}

// GET /api/sessions/[code] - 세션 조회
interface GetSessionResponse {
  sessionId: string;
  appType: string;
  config: SessionConfig;
  status: 'waiting' | 'active' | 'closed';
  participantCount: number;
}

// POST /api/sessions/[code]/join - 참여
interface JoinSessionRequest {
  nickname: string;
  deviceId?: string;
}

interface JoinSessionResponse {
  participantId: string;
  sessionConfig: SessionConfig;
}

// POST /api/sessions/[code]/respond - 응답 제출
interface SubmitResponseRequest {
  participantId: string;
  questionId?: string;
  answer: Answer;
}

// GET /api/sessions/[code]/results - 결과 조회
interface GetResultsResponse {
  aggregated: AggregatedResult;
  participantCount: number;
  responseCount: number;
}
```

### Realtime (Supabase Channels)

```typescript
// 채널 구조
const channel = supabase.channel(`session:${sessionCode}`);

// 이벤트 타입
type RealtimeEvent =
  | { type: 'participant_joined'; participant: Participant }
  | { type: 'participant_left'; participantId: string }
  | { type: 'response_submitted'; response: Response }
  | { type: 'results_updated'; results: AggregatedResult }
  | { type: 'session_status_changed'; status: SessionStatus }
  | { type: 'host_action'; action: HostAction };

// 호스트 액션
type HostAction =
  | { action: 'start' }
  | { action: 'next_question'; questionId: string }
  | { action: 'reveal_results' }
  | { action: 'close' };
```

---

## 클라이언트 구현

### 세션 관리 Hook

```typescript
// hooks/useSession.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseSessionOptions {
  sessionCode: string;
  role: 'host' | 'participant';
  participantId?: string;
}

export function useSession({ sessionCode, role, participantId }: UseSessionOptions) {
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [results, setResults] = useState<AggregatedResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // 세션 정보 로드
    fetchSession();

    // Realtime 구독
    const channel = supabase
      .channel(`session:${sessionCode}`)
      .on('broadcast', { event: 'participant_joined' }, ({ payload }) => {
        setParticipants(prev => [...prev, payload.participant]);
      })
      .on('broadcast', { event: 'response_submitted' }, ({ payload }) => {
        // 결과 업데이트 트리거
        fetchResults();
      })
      .on('broadcast', { event: 'results_updated' }, ({ payload }) => {
        setResults(payload.results);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode]);

  // 응답 제출
  const submitResponse = async (answer: Answer, questionId?: string) => {
    const response = await fetch(`/api/sessions/${sessionCode}/respond`, {
      method: 'POST',
      body: JSON.stringify({ participantId, questionId, answer }),
    });
    return response.json();
  };

  // 호스트 액션
  const hostAction = async (action: HostAction) => {
    if (role !== 'host') return;

    await supabase
      .channel(`session:${sessionCode}`)
      .send({
        type: 'broadcast',
        event: 'host_action',
        payload: action,
      });
  };

  return {
    session,
    participants,
    results,
    isConnected,
    participantCount: participants.length,
    submitResponse,
    hostAction,
  };
}
```

### 결과 집계 Hook

```typescript
// hooks/useAggregation.ts
'use client';

import { useMemo } from 'react';

// 투표 집계
export function useVotingAggregation(responses: VotingResponse[]) {
  return useMemo(() => {
    const counts: Record<string, number> = {};

    responses.forEach(r => {
      r.answer.selectedOptions.forEach(optionId => {
        counts[optionId] = (counts[optionId] || 0) + 1;
      });
    });

    const total = responses.length;

    return Object.entries(counts).map(([id, count]) => ({
      id,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }, [responses]);
}

// 밸런스 게임 집계
export function useBalanceAggregation(
  responses: BalanceResponse[],
  questionId: string
) {
  return useMemo(() => {
    const filtered = responses.filter(r => r.answer.questionId === questionId);
    const countA = filtered.filter(r => r.answer.choice === 'A').length;
    const countB = filtered.filter(r => r.answer.choice === 'B').length;
    const total = countA + countB;

    return {
      optionA: {
        count: countA,
        percentage: total > 0 ? Math.round((countA / total) * 100) : 0,
      },
      optionB: {
        count: countB,
        percentage: total > 0 ? Math.round((countB / total) * 100) : 0,
      },
      total,
    };
  }, [responses, questionId]);
}

// 주문 집계
export function useOrderAggregation(responses: OrderResponse[], menu: MenuItem[]) {
  return useMemo(() => {
    const itemCounts: Record<string, { quantity: number; price: number }> = {};
    let totalAmount = 0;

    responses.forEach(r => {
      r.answer.items.forEach(item => {
        const menuItem = menu.find(m => m.id === item.menuId);
        if (!menuItem) return;

        const itemTotal = menuItem.price * item.quantity;
        totalAmount += itemTotal;

        if (!itemCounts[item.menuId]) {
          itemCounts[item.menuId] = { quantity: 0, price: 0 };
        }
        itemCounts[item.menuId].quantity += item.quantity;
        itemCounts[item.menuId].price += itemTotal;
      });
    });

    return {
      totalAmount,
      itemSummary: Object.entries(itemCounts).map(([menuId, data]) => ({
        menuId,
        name: menu.find(m => m.id === menuId)?.name || '',
        ...data,
      })),
    };
  }, [responses, menu]);
}
```

---

## UI 컴포넌트

### 호스트 대시보드

```tsx
// components/session/HostDashboard.tsx
'use client';

import { useSession } from '@/hooks/useSession';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, CheckCircle } from 'lucide-react';

interface HostDashboardProps {
  sessionCode: string;
  hostToken: string;
}

export function HostDashboard({ sessionCode, hostToken }: HostDashboardProps) {
  const {
    session,
    participants,
    results,
    isConnected,
    participantCount,
    hostAction,
  } = useSession({ sessionCode, role: 'host' });

  return (
    <div className="space-y-6">
      {/* 상태 바 */}
      <div className="flex items-center gap-4">
        <Badge variant={isConnected ? 'success' : 'destructive'}>
          {isConnected ? '연결됨' : '연결 끊김'}
        </Badge>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{participantCount}명 참여 중</span>
        </div>
      </div>

      {/* 참여 코드 */}
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">참여 코드</p>
        <p className="text-4xl font-mono font-bold tracking-wider">
          {sessionCode}
        </p>
        <p className="text-sm mt-2">
          또는 <code>apps.seolcoding.com/join/{sessionCode}</code>
        </p>
      </Card>

      {/* 실시간 결과 */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">실시간 결과</h3>
        <ResultsChart results={results} />
      </Card>

      {/* 호스트 컨트롤 */}
      <div className="flex gap-2">
        <Button onClick={() => hostAction({ action: 'start' })}>
          시작하기
        </Button>
        <Button onClick={() => hostAction({ action: 'reveal_results' })}>
          결과 공개
        </Button>
        <Button variant="destructive" onClick={() => hostAction({ action: 'close' })}>
          종료
        </Button>
      </div>
    </div>
  );
}
```

### 참여자 뷰

```tsx
// components/session/ParticipantView.tsx
'use client';

import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ParticipantViewProps {
  sessionCode: string;
  participantId: string;
}

export function ParticipantView({ sessionCode, participantId }: ParticipantViewProps) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { session, submitResponse, isConnected } = useSession({
    sessionCode,
    role: 'participant',
    participantId,
  });

  const handleSubmit = async (answer: Answer) => {
    await submitResponse(answer);
    setHasSubmitted(true);
  };

  if (!session) {
    return <div>세션 로딩 중...</div>;
  }

  if (hasSubmitted) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
        <h2 className="text-xl font-bold mt-4">응답 완료!</h2>
        <p className="text-muted-foreground mt-2">
          호스트가 결과를 공개하면 확인할 수 있습니다.
        </p>
      </Card>
    );
  }

  // 앱 타입에 따른 응답 UI 렌더링
  return (
    <div>
      {session.appType === 'voting' && (
        <VotingForm config={session.config} onSubmit={handleSubmit} />
      )}
      {session.appType === 'balance' && (
        <BalanceForm config={session.config} onSubmit={handleSubmit} />
      )}
      {/* ... 다른 앱 타입들 */}
    </div>
  );
}
```

### 세션 참여 페이지

```tsx
// app/join/[code]/page.tsx
import { Metadata } from 'next';
import { JoinSession } from './JoinSession';

interface Props {
  params: { code: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `세션 참여 - ${params.code}`,
    description: '세션에 참여하여 투표/응답해주세요',
  };
}

export default function JoinPage({ params }: Props) {
  return <JoinSession code={params.code} />;
}
```

```tsx
// app/join/[code]/JoinSession.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function JoinSession({ code }: { code: string }) {
  const [nickname, setNickname] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setIsJoining(true);

    const response = await fetch(`/api/sessions/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });

    const { participantId, sessionConfig } = await response.json();

    // 앱 타입에 따라 리다이렉트
    router.push(`/${sessionConfig.appType}?session=${code}&pid=${participantId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">세션 참여</h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">참여 코드</label>
            <Input value={code} disabled className="font-mono text-lg" />
          </div>

          <div>
            <label className="text-sm font-medium">닉네임</label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
            />
          </div>

          <Button
            onClick={handleJoin}
            disabled={!nickname.trim() || isJoining}
            className="w-full"
          >
            {isJoining ? '참여 중...' : '참여하기'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

---

## 흐름도

### 세션 생성 → 참여 → 결과

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            HOST FLOW                                      │
└──────────────────────────────────────────────────────────────────────────┘

[호스트]                    [서버]                      [참여자들]
    │                          │                            │
    │  1. 세션 생성 요청        │                            │
    │ ─────────────────────▶  │                            │
    │                          │                            │
    │  2. 세션코드 반환         │                            │
    │    (예: ABC123)          │                            │
    │ ◀─────────────────────  │                            │
    │                          │                            │
    │  3. 코드 공유 (QR/구두)   │                            │
    │ ─────────────────────────────────────────────────▶   │
    │                          │                            │
    │                          │  4. 참여 요청 (닉네임)      │
    │                          │ ◀─────────────────────────│
    │                          │                            │
    │  5. 참여자 알림           │  6. 세션 정보 반환          │
    │ ◀─────────────────────  │ ─────────────────────────▶│
    │                          │                            │
    │  7. "시작" 액션           │                            │
    │ ─────────────────────▶  │                            │
    │                          │  8. 시작 브로드캐스트       │
    │                          │ ─────────────────────────▶│
    │                          │                            │
    │                          │  9. 응답 제출              │
    │                          │ ◀─────────────────────────│
    │                          │                            │
    │  10. 실시간 결과 업데이트  │                            │
    │ ◀─────────────────────  │                            │
    │                          │                            │
    │  11. "결과 공개" 액션     │                            │
    │ ─────────────────────▶  │                            │
    │                          │  12. 결과 브로드캐스트      │
    │                          │ ─────────────────────────▶│
    │                          │                            │
    ▼                          ▼                            ▼
```

---

## 보안 고려사항

| 항목 | 대응 방안 |
|------|----------|
| **세션 하이재킹** | 호스트 토큰 검증, 세션 만료 시간 |
| **중복 참여** | deviceId 기반 중복 체크 (선택적) |
| **악성 입력** | 입력값 sanitize, 길이 제한 |
| **DoS** | Rate limiting, 세션당 참여자 수 제한 |
| **데이터 유출** | 세션 종료 후 데이터 자동 삭제 |

```typescript
// middleware.ts - Rate Limiting 예시
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
}
```

---

## 요약: 서버 vs 클라이언트 역할

| 기능 | Server | Client |
|------|:------:|:------:|
| 세션 생성/관리 | ✅ Supabase | - |
| 참여자 인증 | ✅ API Route | - |
| 응답 저장 | ✅ Supabase | - |
| 실시간 브로드캐스트 | ✅ Supabase Realtime | - |
| WebSocket 연결 | - | ✅ |
| UI 렌더링 | - | ✅ |
| 로컬 상태관리 | - | ✅ Zustand |
| 결과 집계 계산 | ✅ (또는 Client) | ✅ |
| 차트 렌더링 | - | ✅ Recharts |
