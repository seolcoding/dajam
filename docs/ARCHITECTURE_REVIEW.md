# SeolCoding Apps 아키텍처 비판적 검토

> 작성일: 2024-12-22
> 목적: PRD와 스키마 간 일관성 검증 및 통합 개발 가능성 평가

---

## 1. 핵심 발견사항 요약

### 결론: 현재 스키마는 과도하게 설계됨 (Over-engineered)

| 분류 | 앱 수 | Supabase 필요 | 현재 스키마 지원 |
|------|-------|---------------|------------------|
| 🔥 Core (실시간 멀티유저) | 3 | **필수** | 부분 지원 |
| ⚡ High (공유 기능) | 3 | Phase 2 | 불필요 (localStorage 설계) |
| 📊 Medium (오프라인) | 3 | 불필요 | 불필요 |
| 🔧 Utility (개인 도구) | 7 | 불필요 | 불필요 |

**16개 앱 중 3개만 실제 DB 필요 (18.75%)**

---

## 2. 앱별 상세 분석

### 🔥 Core Tier (DB 필수)

#### 2.1 live-voting
| 항목 | PRD 요구사항 | 현재 스키마 | 상태 |
|------|-------------|-------------|------|
| polls 저장 | `sessions.config` | JSONB 활용 | ✅ |
| votes 기록 | `votes` 테이블 | 지원 | ✅ |
| 실시간 집계 | `vote_aggregates` | 지원 | ✅ |
| 익명 투표 | 별도 로직 필요 | 미지원 | ⚠️ |

**결론**: 대부분 지원됨. 익명 투표 시 `user_id` nullable 처리 필요.

#### 2.2 group-order
| 항목 | PRD 요구사항 | 현재 스키마 | 상태 |
|------|-------------|-------------|------|
| 세션 관리 | `sessions` | 지원 | ✅ |
| 주문 기록 | `orders` | 지원 | ✅ |
| 메뉴 정보 | `sessions.config` | JSONB 활용 | ✅ |
| 실시간 동기화 | Realtime 구독 | 지원 | ✅ |

**결론**: 완전 지원됨.

#### 2.3 bingo-game
| 항목 | PRD 요구사항 | 현재 스키마 | 상태 |
|------|-------------|-------------|------|
| 게임 세션 | `sessions` | 지원 | ✅ |
| 호출 기록 (calls) | 없음 | **미지원** | ❌ |
| 빙고 카드 상태 | 없음 | **미지원** | ❌ |
| 빙고 확인 | 없음 | **미지원** | ❌ |

**결론**: Phase 1은 localStorage로 가능하나, 멀티플레이어 시 추가 테이블 필요:
```sql
-- 필요한 추가 테이블
bingo_games (session_id, called_items[], current_caller, phase)
bingo_cards (game_id, participant_id, card_data[], marked_cells[])
```

---

### ⚡ High Tier (PRD: localStorage 설계)

#### 2.4 balance-game
| PRD 명세 | 현재 스키마 |
|---------|-------------|
| **"Phase 1: offline-first with localStorage only"** | `votes` 테이블에 포함 |
| 커스텀 질문 저장 | **미지원** (테이블 없음) |
| 글로벌 통계 | Phase 2에서 DB 필요 |

**갈등 발견**: PRD는 Phase 1에서 DB 불필요하다고 명시했으나, 스키마에 이미 포함됨.

**권장 조치**: Phase 1에서는 localStorage 사용, Phase 2에서 DB 마이그레이션.

#### 2.5 ideal-worldcup
| PRD 명세 | 현재 스키마 |
|---------|-------------|
| **"로컬 퍼스트: 모든 데이터를 브라우저에 저장 (서버 불필요)"** | `app_type` ENUM에 포함 |
| 토너먼트 저장 | **미지원** (의도적) |
| 결과 공유 | 이미지 생성 방식 (서버 불필요) |

**갈등 발견**: 명시적으로 "서버 불필요"라고 했으나 스키마 ENUM에 포함됨.

**권장 조치**: ENUM에서 제거하거나, 향후 확장용으로 유지 (현재 사용 안함).

#### 2.6 student-network
| PRD 명세 | 현재 스키마 |
|---------|-------------|
| **"All data is client-side with localStorage persistence. No backend database required"** | `icebreaker_answers` 테이블 존재 |
| 프라이버시 우선 | **서버에 저장하는 설계와 충돌** |

**심각한 갈등 발견**: PRD는 "프라이버시 우선, 서버 전송 없음"이라고 명시했으나, 스키마는 서버에 저장하는 테이블 포함.

**권장 조치**:
1. PRD 방침 유지 → `icebreaker_answers` 테이블 제거
2. 또는 PRD 수정 → 사용자 동의 하에 선택적 서버 저장

---

### 📊 Medium Tier (DB 불필요)

| 앱 | PRD 저장 방식 | DB 필요성 |
|---|-------------|----------|
| chosung-quiz | localStorage + static JSON | ❌ |
| ladder-game | localStorage (선택) | ❌ |
| team-divider | localStorage (선택) | ❌ |

**결론**: 이 3개 앱은 DB 불필요. 현재 스키마가 이들을 지원할 필요 없음.

---

### 🔧 Utility Tier (기능 DB 불필요, 활동 기록은 저장)

| 앱 | 기능 저장 | 활동 기록 | 비고 |
|---|---------|----------|------|
| salary-calculator | 무상태 | `activity_logs` | 계산 이력 추적 |
| rent-calculator | 무상태 | `activity_logs` | 계산 이력 추적 |
| gpa-calculator | IndexedDB | `activity_logs` | 학점 저장 이력 |
| dutch-pay | localStorage | `activity_logs` | 정산 기록 |
| random-picker | localStorage | `activity_logs` | 결과 기록 |
| lunch-roulette | 무상태 | `activity_logs` | 선택 이력 |
| id-validator | 무상태 | ❌ 불필요 | 프라이버시 우선 |

**결론**: 기능 자체는 DB 불필요하나, **개인별 활동 기록은 `activity_logs` 테이블 활용**.

#### 활동 기록 스키마 활용

기존 `activity_logs` 테이블이 이 용도로 이미 설계됨:

```sql
activity_logs (
  id UUID,
  user_id UUID,           -- 로그인 사용자만
  app_type app_type,      -- 'salary-calculator', 'dutch-pay' 등
  action_type TEXT,       -- 'calculate', 'save', 'share', 'export'
  session_id UUID,        -- 선택적 (멀티유저 앱 연동 시)
  metadata JSONB,         -- 계산 결과, 입력값 요약 등
  created_at TIMESTAMPTZ
)
```

**활동 기록 예시**:
```json
// salary-calculator 계산 기록
{
  "app_type": "salary-calculator",
  "action_type": "calculate",
  "metadata": {
    "annual_salary": 50000000,
    "result_monthly": 3456000,
    "dependents": 1
  }
}

// dutch-pay 정산 기록
{
  "app_type": "dutch-pay",
  "action_type": "complete",
  "metadata": {
    "total_amount": 89000,
    "participant_count": 4,
    "per_person": 22250
  }
}
```

---

## 3. 스키마 vs PRD 불일치 목록

### 3.1 심각 (Critical)

| 문제 | 영향 | 해결 방안 |
|------|------|----------|
| student-network: PRD는 "서버 전송 없음" 명시, 스키마에는 테이블 존재 | 프라이버시 설계 위반 | PRD 수정 또는 테이블 제거 |
| bingo-game: 멀티플레이어 지원 테이블 없음 | 핵심 기능 구현 불가 | `bingo_games`, `bingo_cards` 추가 |

### 3.2 중간 (Medium)

| 문제 | 영향 | 해결 방안 |
|------|------|----------|
| balance-game: 커스텀 질문 테이블 없음 | Phase 2 기능 지연 | 필요시 `balance_questions` 추가 |
| live-voting: 익명 투표 로직 미비 | 익명 사용자 처리 불명확 | `user_id` nullable 확인 |

### 3.3 낮음 (Low)

| 문제 | 영향 | 해결 방안 |
|------|------|----------|
| app_type ENUM에 DB 불필요 앱들 포함 | 불필요한 복잡성 | 유지 가능 (확장성) |

---

## 4. 통합 개발 가능성 평가

### 4.1 현재 상태로 개발 가능한 앱

| 앱 | 즉시 개발 가능 | 추가 작업 필요 |
|----|---------------|----------------|
| live-voting | ✅ | 익명 투표 로직만 추가 |
| group-order | ✅ | 없음 |
| 모든 Utility 앱 | ✅ | DB 불필요 |
| ladder-game | ✅ | DB 불필요 |
| team-divider | ✅ | DB 불필요 |
| random-picker | ✅ | DB 불필요 |

### 4.2 추가 설계 필요한 앱

| 앱 | 필요 작업 |
|----|----------|
| bingo-game | 게임 상태 테이블 설계 |
| student-network | PRD vs 스키마 방향 결정 |
| balance-game | Phase 2 마이그레이션 계획 |

---

## 5. 권장 아키텍처 (간소화)

### 5.1 Tier 기반 저장소 전략

```
┌───────────────────────────────────────────────────────────────────────┐
│                         저장소 아키텍처 (수정)                          │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Supabase (activity_logs)                     │ │
│  │           로그인 사용자의 모든 앱 활동 기록 저장                  │ │
│  └────────────────────────────┬────────────────────────────────────┘ │
│                               │                                       │
│  ┌────────────┬───────────────┼───────────────┬────────────────────┐ │
│  │            │               │               │                    │ │
│  ▼            ▼               ▼               ▼                    │ │
│  ┌──────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │ │
│  │ Supabase │ │ localStorage │ │  Stateless  │ │  id-validator   │  │ │
│  │ (Full)   │ │ / IndexedDB │ │ (계산만)    │ │ (기록 안함)     │  │ │
│  └────┬─────┘ └──────┬──────┘ └──────┬──────┘ └─────────────────┘  │ │
│       │              │               │                              │ │
│  ┌────┴────┐  ┌──────┴──────┐  ┌─────┴──────┐                      │ │
│  │live-vote│  │balance-game │  │salary-calc │                      │ │
│  │grp-order│  │ideal-world  │  │rent-calc   │                      │ │
│  │bingo*   │  │student-net  │  │lunch-roul  │                      │ │
│  └─────────┘  │chosung-quiz │  └────────────┘                      │ │
│               │ladder-game  │                                       │ │
│               │team-divider │                                       │ │
│               │random-picker│                                       │ │
│               │dutch-pay    │                                       │ │
│               │gpa-calc     │                                       │ │
│               └─────────────┘                                       │ │
│                                                                       │
│  * bingo-game: Phase 1 localStorage, Phase 2 Supabase Full          │
│  * 모든 앱 (id-validator 제외): 로그인 시 activity_logs에 기록       │
└───────────────────────────────────────────────────────────────────────┘
```

### 5.2 스키마 간소화 제안

현재 스키마 (698줄) → 권장 스키마 (~400줄)

**제거 가능 요소:**
1. 불필요한 RLS 정책 간소화 (재귀 문제 이미 해결됨)

**유지할 요소:**
1. profiles + 랜덤 닉네임 시스템 (✅ 우수한 설계)
2. sessions + session_participants (✅ 핵심)
3. votes + vote_aggregates (✅ live-voting)
4. orders (✅ group-order)
5. activity_logs (✅ 모든 앱의 개인 활동 기록)
6. app_type ENUM 전체 유지 (activity_logs에서 활용)

---

## 6. 개발 우선순위 권장안

### Phase 1: 즉시 개발 가능
1. **live-voting** - 스키마 완전 지원
2. **group-order** - 스키마 완전 지원
3. **모든 Utility 앱** - DB 불필요, 순수 프론트엔드

### Phase 2: 마이그레이션 시점
1. **bingo-game** - localStorage MVP 후 DB 확장
2. **balance-game** - localStorage MVP 후 커스텀 질문 DB

### Phase 3: 방향 결정 필요
1. **student-network** - PRD 재검토 필요

---

## 7. 최종 평가

### 7.1 현재 설계 점수 (수정)

| 항목 | 점수 | 코멘트 |
|------|------|--------|
| 확장성 | 8/10 | 3-Layer 아키텍처 우수 |
| 적합성 | 7/10 | activity_logs로 전체 앱 활동 추적 가능 |
| 일관성 | 5/10 | student-network PRD 불일치만 해결 필요 |
| 복잡도 | 6/10 | RLS 재귀 문제 해결됨 |
| 실용성 | 8/10 | 대부분 앱 바로 개발 가능 |

### 7.2 핵심 결론 (수정)

1. **적절한 설계**: 3개 Core 앱은 Full DB, 나머지는 activity_logs로 활동 기록
2. **PRD 불일치**: student-network PRD만 방향 결정 필요
3. **즉시 개발 가능**: 모든 앱 (bingo-game 멀티플레이어 제외)
4. **권장 접근법**:
   - Core 앱: Supabase Full 활용
   - Utility 앱: localStorage + activity_logs 조합
   - 로그인 사용자만 활동 기록 저장 (비로그인은 localStorage만)

### 7.3 다음 단계

1. [ ] student-network PRD 방향 결정 (서버 저장 vs 로컬 전용)
2. [ ] bingo-game 테이블 추가 (멀티플레이어 필요시)
3. [ ] live-voting MVP 개발 착수
4. [ ] group-order MVP 개발 착수

---

## 8. 구현 가이드라인

### 8.1 활동 기록 (activity_logs) 사용법

#### 8.1.1 공통 훅 설계

```typescript
// src/hooks/useActivityLog.ts
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import type { AppType } from '@/types/database';

interface LogActivityParams {
  appType: AppType;
  actionType: 'calculate' | 'save' | 'share' | 'export' | 'complete' | 'vote' | 'join';
  metadata?: Record<string, unknown>;
  sessionId?: string;
}

export function useActivityLog() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const logActivity = async ({ appType, actionType, metadata, sessionId }: LogActivityParams) => {
    // 비로그인 사용자는 기록하지 않음
    if (!user) return;

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      app_type: appType,
      action_type: actionType,
      session_id: sessionId,
      metadata: metadata ?? {},
    });
  };

  return { logActivity };
}
```

#### 8.1.2 앱별 적용 예시

```typescript
// salary-calculator 사용 예
const { logActivity } = useActivityLog();

const handleCalculate = async () => {
  const result = calculateNetSalary(input);
  setResult(result);

  // 계산 완료 시 기록
  await logActivity({
    appType: 'salary-calculator',
    actionType: 'calculate',
    metadata: {
      annual_salary: input.annualSalary,
      result_monthly: result.monthlyNet,
      dependents: input.dependents,
    },
  });
};
```

```typescript
// dutch-pay 정산 완료 시
await logActivity({
  appType: 'dutch-pay',
  actionType: 'complete',
  metadata: {
    total_amount: settlement.total,
    participant_count: settlement.participants.length,
    per_person: settlement.perPerson,
  },
});
```

### 8.2 저장소 전략 선택 기준

```
┌──────────────────────────────────────────────────────────────┐
│                    저장소 선택 플로우차트                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   실시간 멀티유저 필요? ──Yes──▶ Supabase Full (sessions)   │
│          │                                                   │
│         No                                                   │
│          │                                                   │
│          ▼                                                   │
│   데이터 영속성 필요? ───Yes──▶ localStorage/IndexedDB      │
│          │                       + activity_logs (선택)      │
│         No                                                   │
│          │                                                   │
│          ▼                                                   │
│   개인 기록 추적? ───Yes──▶ activity_logs만 사용            │
│          │                                                   │
│         No                                                   │
│          │                                                   │
│          ▼                                                   │
│   완전 무상태 (stateless)                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 8.3 action_type 표준화

| action_type | 용도 | 사용 앱 |
|-------------|------|--------|
| `calculate` | 계산 완료 | salary, rent, gpa |
| `save` | 데이터 저장 | gpa, team-divider |
| `share` | 결과 공유 | 모든 앱 |
| `export` | 파일 내보내기 | gpa (CSV), team-divider (PDF) |
| `complete` | 작업 완료 | dutch-pay, random-picker |
| `vote` | 투표 참여 | live-voting, balance-game |
| `join` | 세션 참여 | group-order, bingo-game |
| `create` | 세션/항목 생성 | live-voting, group-order |

### 8.4 민감 정보 처리

```typescript
// ❌ 잘못된 예: 민감 정보 저장
await logActivity({
  appType: 'salary-calculator',
  metadata: {
    bank_account: '1234-5678-9012', // 절대 저장 금지
    real_name: '홍길동',              // 저장 금지
  },
});

// ✅ 올바른 예: 통계 정보만 저장
await logActivity({
  appType: 'salary-calculator',
  metadata: {
    salary_range: '40M-50M',  // 범위로 익명화
    result_type: 'standard',
  },
});
```

### 8.5 id-validator 예외 처리

id-validator는 프라이버시 최우선 앱이므로 **어떤 기록도 저장하지 않음**:

```typescript
// id-validator에서는 useActivityLog 사용 금지
// 검증 결과, 입력값 모두 기록하지 않음
// 이유: 주민등록번호 등 민감 정보 취급 앱
```

---

*이 문서는 비판적 검토를 통해 작성되었으며, 현실적인 개발 가능성을 기준으로 평가했습니다.*
