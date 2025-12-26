# Dajam V2 Architecture Specification

> **Last Updated**: 2024-12-25
> **Status**: Implemented (Phase 1-3 Complete)
> **Migrations**: 020, 021, 022

---

## Executive Summary

Dajam V2 introduces a **3-Layer Architecture** designed for scalability and flexibility:

| Layer | Purpose | Schema Type | Examples |
|-------|---------|-------------|----------|
| **Core** | Organization & Session Management | RDB Fixed | institutions, workspaces, sessions, attendance |
| **Content** | Interactive Elements | JSONB Flexible | session_elements, element_responses |
| **CRM** | Contact Management | Extended Fields | contacts (40+ fields), course_history, interaction_logs |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              LAYER 1: CORE (RDB Fixed)                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐            │
│  │   INSTITUTIONS   │────▶│    WORKSPACES    │◀────│  WORKSPACE_MEMBERS│            │
│  │   (기관)          │     │   (워크스페이스)   │     │   (팀원)          │            │
│  │                  │     │                  │     │                  │            │
│  │  • welfare_center│     │  • owner_id      │     │  • owner         │            │
│  │  • lifelong_learn│     │  • plan_type     │     │  • admin         │            │
│  │  • senior_center │     │  • settings      │     │  • instructor    │            │
│  │  • corporation   │     │                  │     │  • assistant     │            │
│  └──────────────────┘     └────────┬─────────┘     └──────────────────┘            │
│                                    │                                                │
│                    ┌───────────────┼───────────────┐                               │
│                    ▼               ▼               ▼                               │
│           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                     │
│           │   SESSIONS   │  │   CONTACTS   │  │ INTEGRATIONS │                     │
│           │   (세션)      │  │   (수강생)    │  │   (연동)      │                     │
│           │              │  │              │  │              │                     │
│           │  • 6자리 코드 │  │  • CRM 필드   │  │  • Google    │                     │
│           │  • app_type  │  │  • 40+ 속성   │  │  • Notion    │                     │
│           │  • realtime  │  │  • 통계       │  │  • Webhook   │                     │
│           └──────┬───────┘  └──────────────┘  └──────────────┘                     │
│                  │                                                                  │
│                  ▼                                                                  │
│           ┌──────────────┐                                                         │
│           │  ATTENDANCE  │                                                         │
│           │   (출석)      │                                                         │
│           │              │                                                         │
│           │  • QR/Code   │                                                         │
│           │  • 카카오인증 │                                                         │
│           │  • 위치정보   │                                                         │
│           └──────────────┘                                                         │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         LAYER 2: CONTENT (JSONB Flexible)                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐     │
│  │                        SESSION_ELEMENTS                                    │     │
│  │                    (세션 콘텐츠/인터랙션 요소)                                 │     │
│  │                                                                            │     │
│  │  element_type (TEXT):                                                      │     │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │     │
│  │  │ poll │ quiz │ word_cloud │ balance_game │ ladder │ qna │ survey │   │  │     │
│  │  │ bingo │ ideal_worldcup │ team_divider │ personality_test │         │  │     │
│  │  │ this_or_that │ chosung_quiz │ realtime_quiz │ human_bingo │ ...    │  │     │
│  │  └─────────────────────────────────────────────────────────────────────┘  │     │
│  │                                                                            │     │
│  │  config (JSONB): 타입별 설정                                                │     │
│  │  ├─ Poll: { options, allowMultiple, showResults, anonymousVoting }        │     │
│  │  ├─ Quiz: { questions, shuffleQuestions, showCorrectAnswer }              │     │
│  │  ├─ WordCloud: { maxWords, minLength, profanityFilter }                   │     │
│  │  └─ ... (TypeScript에서 스키마 관리)                                         │     │
│  │                                                                            │     │
│  │  state (JSONB): 실시간 상태                                                 │     │
│  │  ├─ Poll: { isOpen, totalVotes, results }                                 │     │
│  │  ├─ Quiz: { currentQuestionIndex, isRevealed, scores }                    │     │
│  │  └─ WordCloud: { words: [{text, count}] }                                 │     │
│  │                                                                            │     │
│  └───────────────────────────────────────────────────────────────────────────┘     │
│                                    │                                                │
│                    ┌───────────────┼───────────────┐                               │
│                    ▼               ▼               ▼                               │
│           ┌──────────────┐  ┌──────────────────────┐                               │
│           │  ELEMENT_    │  │  ELEMENT_AGGREGATES  │                               │
│           │  RESPONSES   │  │  (집계 데이터)         │                               │
│           │  (참여자 응답) │  │                      │                               │
│           │              │  │  • 투표 결과 캐시      │                               │
│           │  • Realtime  │  │  • 워드클라우드 빈도   │                               │
│           │  • 구독 대상  │  │  • 트리거 자동 업데이트│                               │
│           └──────────────┘  └──────────────────────┘                               │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          LAYER 3: CRM (Extended Fields)                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────┐      │
│  │                    CONTACTS (확장된 수강생 프로필)                          │      │
│  │                                                                           │      │
│  │  기본 정보        │ 인구통계       │ 학습 선호도      │ 통계               │      │
│  │  ─────────────   │ ────────────  │ ─────────────── │ ────────────────   │      │
│  │  • name          │ • gender      │ • interests[]   │ • total_sessions   │      │
│  │  • phone         │ • birth_year  │ • preferred_    │ • completed_courses│      │
│  │  • email         │ • age_group   │   topics[]      │ • total_attendance │      │
│  │  • address       │ • address     │ • skill_level   │ • avg_satisfaction │      │
│  │                  │               │                 │ • interaction_stats│      │
│  │                  │               │                 │                    │      │
│  │  접근성           │ 연락 선호도    │ CRM 상태        │                    │      │
│  │  ─────────────   │ ────────────  │ ────────────── │                    │      │
│  │  • device_info   │ • preferred_  │ • status        │                    │      │
│  │  • accessibility │   contact_    │ • churn_risk    │                    │      │
│  │    _needs[]      │   method      │ • lifetime_value│                    │      │
│  │  • preferred_    │ • preferred_  │                 │                    │      │
│  │    font_size     │   contact_time│                 │                    │      │
│  └──────────────────────────────────────────────────────────────────────────┘      │
│                                    │                                                │
│                    ┌───────────────┴───────────────┐                               │
│                    ▼                               ▼                               │
│           ┌──────────────┐              ┌──────────────┐                           │
│           │ COURSE_      │              │ INTERACTION_ │                           │
│           │ HISTORY      │              │ LOGS         │                           │
│           │ (수강 이력)   │              │ (인터랙션 기록)│                           │
│           │              │              │              │                           │
│           │ • course_name│              │ • interaction│                           │
│           │ • completion │              │   _type      │                           │
│           │ • attendance │              │ • is_correct │                           │
│           │ • feedback   │              │ • points     │                           │
│           └──────────────┘              └──────────────┘                           │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Migration Files

| Migration | Purpose | Status |
|-----------|---------|--------|
| `020_core_v2_institutions_workspaces.sql` | Core layer - institutions, workspaces, contacts, attendance, integrations | ✅ Applied |
| `021_flexible_elements.sql` | Content layer - session_elements, element_responses, element_aggregates | ✅ Applied |
| `022_contacts_extended_fields.sql` | CRM layer - extended contact fields, course_history, interaction_logs | ✅ Applied |

### Key Design Decisions

#### 1. JSONB for Content Layer

```sql
-- element_type은 TEXT (ENUM 아님) - 새 타입 추가 시 마이그레이션 불필요
element_type TEXT NOT NULL,  -- 'poll', 'quiz', 'word_cloud', ...

-- config/state는 JSONB - 타입별 스키마는 TypeScript에서 관리
config JSONB NOT NULL DEFAULT '{}',
state JSONB NOT NULL DEFAULT '{}',
```

**이점**:
- 새 앱 타입 추가 시 DB 마이그레이션 불필요
- 타입 안정성은 TypeScript에서 보장
- 유연한 쿼리 (GIN 인덱스 활용)

#### 2. Realtime Subscription Strategy

```sql
-- 모든 인터랙션을 단일 테이블로 통합
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_elements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.element_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.element_aggregates;
```

**구독 패턴**:
```typescript
// 세션의 모든 인터랙션을 하나의 구독으로 처리
supabase
  .channel(`session:${sessionId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'element_responses',
    filter: `session_id=eq.${sessionId}`
  }, handleResponse)
  .subscribe();
```

#### 3. RLS Policy Strategy

```sql
-- 워크스페이스 기반 접근 제어
CREATE POLICY "workspace_access"
ON public.contacts FOR ALL
USING (
    workspace_id IN (
        SELECT workspace_id FROM public.workspace_members
        WHERE user_id = auth.uid()
    )
);

-- 퍼블릭 세션 + 워크스페이스 멤버 복합 접근
CREATE POLICY "elements_select_public"
ON public.session_elements FOR SELECT
USING (
    session_id IN (SELECT id FROM public.sessions WHERE is_public = TRUE)
    OR session_id IN (SELECT id FROM public.sessions WHERE host_id = auth.uid())
);
```

---

## TypeScript Type System

### Element Type Definitions

```typescript
// 지원되는 element_type (18개+)
export type ElementType =
  | 'poll'              // 투표
  | 'quiz'              // 퀴즈
  | 'word_cloud'        // 워드클라우드
  | 'balance_game'      // 밸런스게임
  | 'ladder'            // 사다리게임
  | 'qna'               // Q&A
  | 'survey'            // 설문조사
  | 'bingo'             // 빙고
  | 'ideal_worldcup'    // 이상형월드컵
  | 'team_divider'      // 팀 나누기
  | 'personality_test'  // 성격테스트
  | 'this_or_that'      // 이거저거
  | 'chosung_quiz'      // 초성퀴즈
  | 'realtime_quiz'     // 실시간퀴즈
  | 'human_bingo'       // 휴먼빙고
  | 'reaction'          // 실시간 리액션
  | 'ranking'           // 순위투표
  | 'open_ended';       // 주관식 응답

// 각 타입별 Config 인터페이스
export interface PollConfig {
  options: Array<{ id: string; text: string; color?: string }>;
  allowMultiple: boolean;
  showResults: boolean;
  anonymousVoting: boolean;
}

export interface QuizConfig {
  questions: Array<{
    id: string;
    text: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    options?: string[];
    correctAnswer: string | number;
    points: number;
    timeLimit?: number;
  }>;
  shuffleQuestions: boolean;
  showCorrectAnswer: boolean;
}
```

### Config/State Type Guard Pattern

```typescript
// 타입 가드 예시
function isPollConfig(config: Json): config is PollConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'options' in config &&
    Array.isArray((config as PollConfig).options)
  );
}

// 사용 예시
const element = await supabase
  .from('session_elements')
  .select('*')
  .eq('id', elementId)
  .single();

if (element.element_type === 'poll' && isPollConfig(element.config)) {
  // TypeScript가 config를 PollConfig로 인식
  element.config.options.forEach(opt => console.log(opt.text));
}
```

---

## Data Flow

### 1. Session Creation Flow

```
Host → Create Session → Create Elements → Publish Session
                           │
                           ▼
              ┌──────────────────────────────┐
              │     session_elements         │
              │  ┌────────────────────────┐  │
              │  │ poll: 만족도 조사       │  │
              │  │ quiz: 복습 퀴즈         │  │
              │  │ word_cloud: 오늘의 키워드│  │
              │  └────────────────────────┘  │
              └──────────────────────────────┘
```

### 2. Participant Response Flow

```
Participant → Join Session → Submit Response → Realtime Update
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
           ┌──────────────┐              ┌──────────────┐
           │ element_     │  ──Trigger── │ element_     │
           │ responses    │              │ aggregates   │
           └──────────────┘              └──────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
                           ┌──────────────┐
                           │  Realtime    │
                           │  Broadcast   │
                           └──────────────┘
```

### 3. CRM Data Flow

```
Participant joins session
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                    Auto-capture Flow                       │
│                                                           │
│  1. session_participants 생성                              │
│                    │                                       │
│  2. contacts 자동 생성/업데이트 (워크스페이스 세션인 경우)    │
│                    │                                       │
│  3. interaction_logs 트리거 (인터랙션 시)                   │
│                    │                                       │
│  4. contacts.interaction_stats 자동 업데이트               │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Integration Patterns

### 1. Google Sheets Export

```typescript
interface GoogleSheetsIntegration {
  integration_type: 'google_sheets';
  config: {
    spreadsheet_id: string;
    sheet_name: string;
    columns_mapping: Record<string, string>;
    auto_sync: boolean;
    sync_interval_minutes?: number;
  };
}
```

### 2. Webhook Notifications

```typescript
interface WebhookIntegration {
  integration_type: 'webhook';
  config: {
    url: string;
    events: ('session.started' | 'session.ended' | 'response.submitted')[];
    headers?: Record<string, string>;
    secret?: string;
  };
}
```

---

## Performance Considerations

### Indexing Strategy

```sql
-- JSONB 쿼리 최적화
CREATE INDEX idx_session_elements_config ON public.session_elements USING GIN (config);
CREATE INDEX idx_session_elements_state ON public.session_elements USING GIN (state);
CREATE INDEX idx_element_responses_data ON public.element_responses USING GIN (data);

-- 자주 사용되는 쿼리 패턴
CREATE INDEX idx_element_responses_element_created ON public.element_responses(element_id, created_at DESC);
CREATE INDEX idx_contacts_last_active ON public.contacts(last_active_at DESC);
```

### Caching Strategy

1. **Element Aggregates**: 트리거로 실시간 집계 유지
2. **Contact Stats**: 배치 업데이트 (interaction_logs 트리거)
3. **Session State**: Supabase Realtime + 클라이언트 Zustand

---

## Security Model

### RLS Policy Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `session_elements` | Public session OR Host | Host only | Host only | Host only |
| `element_responses` | Public session OR Participant | Any participant | Own response | Host only |
| `contacts` | Workspace members | Workspace admin+ | Workspace admin+ | Workspace admin+ |
| `attendance` | Session host OR Workspace | System | Session host | Session host |

### Data Privacy

- `contacts.marketing_consent`: 명시적 동의 관리
- `contacts.interaction_stats`: 익명화된 통계만 저장
- `attendance.location`: 옵트인 방식

---

## Migration Path

### From V1 to V2

```sql
-- 기존 votes 테이블 → element_responses 마이그레이션 (필요시)
INSERT INTO element_responses (
    element_id, session_id, participant_id, response_type, data
)
SELECT
    (SELECT id FROM session_elements WHERE session_id = v.session_id AND element_type = 'poll' LIMIT 1),
    v.session_id,
    v.participant_id,
    'vote',
    v.selection
FROM votes v;
```

### Rollback Strategy

- 각 마이그레이션에 DROP 스크립트 준비
- 기존 테이블 (votes, orders 등) 유지
- 점진적 전환 (호환성 뷰 사용 가능)

---

## Related Documents

- [DATA_MODEL_V2.md](./DATA_MODEL_V2.md) - 초기 설계 문서
- [REALTIME_SESSION_SPEC.md](./REALTIME_SESSION_SPEC.md) - 실시간 세션 스펙
- [V2_IMPLEMENTATION_TASKS.md](./V2_IMPLEMENTATION_TASKS.md) - 구현 태스크
