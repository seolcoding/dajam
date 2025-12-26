# PRD: Dajam V2 Data Architecture

> **Version**: 2.0
> **Last Updated**: 2024-12-25
> **Status**: Phase 1-3 Implemented
> **Author**: Development Team

---

## 1. Executive Summary

### 1.1 Problem Statement

기존 Dajam V1 데이터 모델의 한계:
- **경직된 스키마**: 새로운 앱 타입 추가 시 DB 마이그레이션 필요
- **분산된 인터랙션 데이터**: votes, orders, icebreaker_answers 등 테이블 분산
- **CRM 기능 부재**: 수강생 관리, 학습 이력 추적 불가
- **기관 관리 미지원**: 복지관, 평생학습관 등 조직 단위 관리 불가

### 1.2 Solution

**3-Layer Architecture** 도입:

| Layer | Purpose | Flexibility |
|-------|---------|-------------|
| **Core** | 조직/세션 관리 | RDB 고정 스키마 |
| **Content** | 인터랙션 요소 | JSONB 유연 스키마 |
| **CRM** | 수강생/이력 관리 | 확장 필드 |

### 1.3 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 새 앱 타입 추가 시간 | < 1일 | 마이그레이션 없이 TypeScript만 수정 |
| Realtime 구독 수 | 1개/세션 | element_responses 단일 구독 |
| CRM 데이터 활용률 | > 60% | 워크스페이스당 contacts 활용 |
| 출석 체크 정확도 | > 95% | QR/코드 인증 성공률 |

---

## 2. User Stories

### 2.1 강사/호스트

```
AS A 강사
I WANT TO 다양한 인터랙션 요소를 세션에 추가
SO THAT 수강생들의 참여를 유도할 수 있다

Acceptance Criteria:
- 투표, 퀴즈, 워드클라우드, 밸런스게임 등 18+ 종류 지원
- 드래그앤드롭으로 요소 순서 변경
- 실시간으로 요소 활성화/비활성화
- 응답 결과 즉시 확인
```

```
AS A 워크스페이스 관리자
I WANT TO 수강생 정보를 체계적으로 관리
SO THAT CRM 기능을 활용할 수 있다

Acceptance Criteria:
- 수강생 프로필 (이름, 연락처, 관심사, 접근성 설정)
- 수강 이력 및 출석 기록
- 인터랙션 참여 통계
- 태그 기반 분류 및 필터링
```

### 2.2 기관 관리자

```
AS A 기관 관리자 (복지관/평생학습관)
I WANT TO 소속 워크스페이스와 강사를 관리
SO THAT 조직 단위로 교육 현황을 파악할 수 있다

Acceptance Criteria:
- 기관 프로필 (명칭, 유형, 연락처)
- 다중 워크스페이스 관리
- 워크스페이스별 통계 대시보드
- 통합 출석/수강 이력 조회
```

### 2.3 수강생/참여자

```
AS A 수강생
I WANT TO 다양한 방식으로 강의에 참여
SO THAT 재미있고 효과적으로 학습할 수 있다

Acceptance Criteria:
- QR코드/6자리 코드로 간편 참여
- 투표, 퀴즈, 워드클라우드 등 참여
- 본인 응답 확인 및 결과 공유
- 접근성 옵션 (큰 글씨, 고대비 등)
```

---

## 3. Technical Specifications

### 3.1 Database Schema

#### 3.1.1 Core Layer

**institutions**
```sql
CREATE TABLE public.institutions (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    type institution_type,  -- welfare_center, lifelong_learning, etc.
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    plan_type TEXT DEFAULT 'free',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**workspaces**
```sql
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY,
    institution_id UUID REFERENCES institutions(id),
    owner_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    plan_type TEXT DEFAULT 'free',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**workspace_members**
```sql
CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id),
    user_id UUID REFERENCES profiles(id),
    role workspace_role,  -- owner, admin, instructor, assistant
    permissions JSONB DEFAULT '{}',
    invited_by UUID,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);
```

#### 3.1.2 Content Layer

**session_elements**
```sql
CREATE TABLE public.session_elements (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    element_type TEXT NOT NULL,  -- poll, quiz, word_cloud, ...
    title TEXT,
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    state JSONB NOT NULL DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**element_responses**
```sql
CREATE TABLE public.element_responses (
    id UUID PRIMARY KEY,
    element_id UUID REFERENCES session_elements(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id),  -- 비정규화
    participant_id UUID REFERENCES session_participants(id),
    user_id UUID REFERENCES auth.users(id),
    contact_id UUID REFERENCES contacts(id),
    anonymous_id TEXT,
    display_name TEXT,
    response_type TEXT NOT NULL,  -- vote, answer, reaction, ...
    data JSONB NOT NULL DEFAULT '{}',
    score INTEGER,
    is_correct BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.1.3 CRM Layer

**contacts (40+ fields)**
```sql
-- 기본 정보
name, phone, email, address, address_detail

-- 인구통계
gender, birth_year, age_group

-- 학습 선호도
interests[], preferred_topics[], skill_level

-- 접근성
device_info, accessibility_needs[], preferred_font_size

-- 연락 선호도
preferred_contact_method, preferred_contact_time

-- 통계
total_sessions, completed_courses, total_attendance_minutes
average_satisfaction, last_active_at, interaction_stats

-- CRM 상태
status, churn_risk_score, lifetime_value
```

### 3.2 Element Types

#### Supported Types (18+)

| Type | Korean | Description | Config Keys |
|------|--------|-------------|-------------|
| `poll` | 투표 | 단일/다중 선택 투표 | options, allowMultiple, showResults |
| `quiz` | 퀴즈 | 객관식/OX/단답 퀴즈 | questions, timeLimit, showCorrectAnswer |
| `word_cloud` | 워드클라우드 | 단어 수집 및 시각화 | maxWords, profanityFilter |
| `balance_game` | 밸런스게임 | 이것 vs 저것 선택 | questions, optionA, optionB |
| `ladder` | 사다리게임 | 사다리타기 결과 공개 | participants, results |
| `qna` | Q&A | 질문/답변 수집 | allowAnonymous, allowUpvote |
| `survey` | 설문조사 | 다중 문항 설문 | questions, required |
| `bingo` | 빙고 | 참여형 빙고 게임 | size, items |
| `ideal_worldcup` | 이상형월드컵 | 토너먼트 선택 | items, rounds |
| `team_divider` | 팀나누기 | 랜덤 팀 배정 | teamCount, method |
| `personality_test` | 성격테스트 | MBTI/유형 테스트 | questions, results |
| `this_or_that` | 이거저거 | 빠른 선택 게임 | pairs, timeLimit |
| `chosung_quiz` | 초성퀴즈 | 한글 초성 맞추기 | words, hints |
| `realtime_quiz` | 실시간퀴즈 | 빠른 정답자 확인 | questions, buzzIn |
| `human_bingo` | 휴먼빙고 | 네트워킹 빙고 | prompts, size |
| `reaction` | 리액션 | 실시간 이모지 반응 | emojis, duration |
| `ranking` | 순위투표 | 순위 매기기 | items, topN |
| `open_ended` | 주관식 | 자유 텍스트 응답 | maxLength, hint |

### 3.3 Realtime Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Realtime                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Channel: session:{sessionId}                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TABLE: element_responses                            │    │
│  │  EVENTS: INSERT, UPDATE                              │    │
│  │  FILTER: session_id=eq.{sessionId}                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Channel: elements:{sessionId}                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TABLE: session_elements                             │    │
│  │  EVENTS: UPDATE (state changes)                      │    │
│  │  FILTER: session_id=eq.{sessionId}                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. API Design

### 4.1 Element Management

```typescript
// 요소 생성
POST /api/sessions/{sessionId}/elements
Body: {
  element_type: 'poll',
  title: '오늘 강의 만족도',
  config: {
    options: [
      { id: '1', text: '매우 만족', color: '#22c55e' },
      { id: '2', text: '만족', color: '#84cc16' },
      { id: '3', text: '보통', color: '#eab308' }
    ],
    allowMultiple: false,
    showResults: true
  }
}

// 요소 상태 업데이트
PATCH /api/elements/{elementId}/state
Body: {
  isOpen: false,
  isRevealed: true
}

// 응답 제출
POST /api/elements/{elementId}/responses
Body: {
  response_type: 'vote',
  data: { selectedOption: '1' }
}
```

### 4.2 CRM APIs

```typescript
// 수강생 목록 (페이지네이션 + 필터)
GET /api/workspaces/{workspaceId}/contacts
Query: ?status=active&tags=VIP&page=1&limit=20

// 수강생 상세 + 이력
GET /api/contacts/{contactId}
Include: course_history, interaction_stats

// 수강생 일괄 업데이트
PATCH /api/workspaces/{workspaceId}/contacts/bulk
Body: {
  ids: ['...', '...'],
  update: { tags: { add: ['시니어'] } }
}
```

---

## 5. UI/UX Specifications

### 5.1 Host Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  세션: 스마트폰 기초 교육 (DEMO01)        [공유] [설정] [종료] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────┐  ┌─────────────────────────────────────┐ │
│  │  요소 목록     │  │                                     │ │
│  │  ───────────  │  │         현재 활성 요소               │ │
│  │  ☑ 출석체크   │  │                                     │ │
│  │  ○ 만족도 투표 │  │    [투표 결과 실시간 차트]           │ │
│  │  ○ 복습 퀴즈  │  │                                     │ │
│  │  ○ 워드클라우드│  │    참여자: 24/30                    │ │
│  │               │  │                                     │ │
│  │  [+ 요소 추가] │  │    [결과 공개] [초기화] [다음]       │ │
│  └───────────────┘  └─────────────────────────────────────┘ │
│                                                              │
│  참여자 목록: 김영희, 이철수, 박민수, 최지영...  (24명 접속 중)  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Participant View

```
┌─────────────────────────────────────────────────────────────┐
│  스마트폰 기초 교육                              [접근성 ⚙️]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                   오늘 강의 만족도는?                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ○ 매우 만족  ████████████████████ 45%              │    │
│  │  ○ 만족      ██████████████ 35%                     │    │
│  │  ○ 보통      ██████ 15%                             │    │
│  │  ○ 불만족    ██ 5%                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│               [제출 완료] ✓ 24명 참여                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Accessibility Options

| Option | Description | Implementation |
|--------|-------------|----------------|
| 큰 글씨 모드 | 기본 대비 150% 글꼴 크기 | `large_text_mode: true` |
| 고대비 모드 | 배경/텍스트 대비 강화 | `accessibility_mode: true` |
| 화면 읽기 호환 | ARIA 레이블 완전 지원 | Semantic HTML |
| 터치 영역 확대 | 버튼 44x44px 최소 보장 | Tailwind spacing |

---

## 6. Implementation Phases

### Phase 1: Core Layer (Completed)
- [x] institutions 테이블
- [x] workspaces 테이블
- [x] workspace_members 테이블
- [x] contacts 테이블
- [x] attendance 테이블
- [x] integrations 테이블
- [x] sessions 확장 (workspace_id, accessibility)

### Phase 2: Content Layer (Completed)
- [x] session_elements 테이블
- [x] element_responses 테이블
- [x] element_aggregates 테이블
- [x] Realtime 구독 설정
- [x] 집계 트리거

### Phase 3: CRM Layer (Completed)
- [x] contacts 확장 필드 (40+)
- [x] course_history 테이블
- [x] interaction_logs 테이블
- [x] 통계 업데이트 트리거

### Phase 4: Application Integration (Pending)
- [ ] Host Dashboard UI
- [ ] Element Editor Components
- [ ] Participant Response UI
- [ ] CRM Dashboard
- [ ] Reporting/Analytics

### Phase 5: Integrations (Pending)
- [ ] Google Sheets 연동
- [ ] Notion 연동
- [ ] Webhook 지원
- [ ] 카카오채널 연동

---

## 7. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| JSONB 쿼리 성능 | High | Medium | GIN 인덱스 + 집계 테이블 |
| Realtime 연결 부하 | High | Low | 세션당 단일 채널 구독 |
| CRM 데이터 프라이버시 | High | Medium | RLS 정책 + 동의 관리 |
| 마이그레이션 롤백 | Medium | Low | 기존 테이블 유지 + 점진적 전환 |

---

## 8. Appendix

### A. Enum Definitions

```sql
CREATE TYPE institution_type AS ENUM (
    'welfare_center',    -- 복지관
    'lifelong_learning', -- 평생학습관
    'senior_center',     -- 노인복지관
    'community_center',  -- 주민센터
    'library',           -- 도서관
    'corporation',       -- 기업
    'academy',           -- 학원
    'other'              -- 기타
);

CREATE TYPE workspace_role AS ENUM (
    'owner',      -- 소유자
    'admin',      -- 관리자
    'instructor', -- 강사
    'assistant'   -- 조교
);

CREATE TYPE attendance_method AS ENUM (
    'qr',      -- QR코드 스캔
    'code',    -- 6자리 코드 입력
    'kakao',   -- 카카오 인증
    'manual',  -- 수동 체크
    'auto'     -- 자동 (세션 참여 시)
);

CREATE TYPE gender_type AS ENUM (
    'male',
    'female',
    'other',
    'prefer_not_to_say'
);

CREATE TYPE age_group AS ENUM (
    'under_20', '20s', '30s', '40s',
    '50s', '60s', '70s', '80_plus'
);
```

### B. Related Documents

- [ARCHITECTURE_V2.md](../docs/ARCHITECTURE_V2.md)
- [V2_IMPLEMENTATION_TASKS.md](../docs/V2_IMPLEMENTATION_TASKS.md)
- [REALTIME_SESSION_SPEC.md](../docs/REALTIME_SESSION_SPEC.md)
