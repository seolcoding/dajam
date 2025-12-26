# Dajam Data Model V2 - Education/Event Management Platform

## 현재 스키마 분석 (AS-IS)

### Layer 1: Core
- `profiles` - OAuth 사용자 프로필
- `nickname_*` - 랜덤 닉네임 시스템
- `activity_logs` - 개인 활동 기록

### Layer 2: Sessions
- `sessions` - 통합 세션 (6자리 코드)
- `session_participants` - 세션 참여자 및 역할

### Layer 3: App-Specific
- `votes`, `vote_aggregates` - 투표
- `orders` - 단체 주문
- `icebreaker_answers` - 아이스브레이커
- `questions`, `question_upvotes` - Q&A
- `chat_messages` - 채팅
- `subscriptions`, `payment_history` - 결제

---

## 확장 데이터 모델 (TO-BE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WORKSPACE (조직/작업공간)                           │
│  강사/운영자가 클래스와 수강생을 관리하는 단위                                   │
│  ├─ owner_id (소유자)                                                       │
│  ├─ members[] (팀원: 강사, 운영자, 조교)                                      │
│  ├─ classes[] (반복 수업 그룹들)                                             │
│  ├─ contacts[] (CRM - 모든 수강생 DB)                                        │
│  └─ settings (브랜딩, 결제 설정)                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   CLASS (클래스)   │     │  CONTACTS (CRM)   │     │ WORKSPACE_MEMBERS │
│   반복 수업 그룹    │     │   수강생 데이터베이스  │     │   팀원 관리         │
│  ├─ name          │     │  ├─ name, phone   │     │  ├─ user_id        │
│  ├─ schedule      │     │  ├─ email         │     │  ├─ role           │
│  ├─ enrolled[]    │     │  ├─ source        │     │  └─ permissions    │
│  └─ sessions[]    │     │  └─ marketing_ok  │     │                     │
└───────────────────┘     └───────────────────┘     └───────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SESSION (세션) ← 핵심 단위                           │
│  ├─ workspace_id (optional - 워크스페이스 소속 시)                            │
│  ├─ class_id (optional - 클래스 소속 시)                                     │
│  ├─ host_id (진행자)                                                        │
│  │                                                                          │
│  ├─ 📊 INTERACTIONS (조합 가능한 모듈들)                                     │
│  │   ├─ slides (Google/Canva/PDF)                                          │
│  │   ├─ poll / vote                                                        │
│  │   ├─ quiz                                                               │
│  │   ├─ q&a                                                                │
│  │   ├─ word-cloud                                                         │
│  │   ├─ this-or-that                                                       │
│  │   └─ reactions                                                          │
│  │                                                                          │
│  ├─ timeline[] (순서 + 동시 활성화)                                          │
│  ├─ settings (chat/qa/reactions 활성화)                                     │
│  └─ state (현재 슬라이드, 발표 중 여부)                                        │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ├─────────────────┬─────────────────┬─────────────────┐
          ▼                 ▼                 ▼                 ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  ATTENDANCE   │   │    SURVEY     │   │  PARTICIPANTS │   │  INTERACTIONS │
│   출석 체크    │   │   만족도 조사   │   │   참여자       │   │   인터랙션     │
│  ├─ qr_code   │   │  ├─ template  │   │  ├─ contact_id │   │  ├─ votes     │
│  ├─ scan_time │   │  ├─ questions │   │  ├─ display    │   │  ├─ questions │
│  ├─ verified  │   │  └─ responses │   │  └─ role       │   │  ├─ chat      │
│  └─ location  │   │               │   │                │   │  └─ reactions │
└───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘
```

---

## 새 테이블 정의

### 1. Workspaces (워크스페이스)
```sql
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE, -- URL용 슬러그 (optional)
    owner_id UUID NOT NULL REFERENCES public.profiles(id),
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Workspace Members (팀원)
```sql
CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'instructor', 'assistant')),
    permissions JSONB DEFAULT '{}', -- 세부 권한
    invited_by UUID REFERENCES public.profiles(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);
```

### 3. Classes (반복 수업 그룹)
```sql
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    schedule JSONB, -- 반복 일정 정보
    enrollment_type TEXT DEFAULT 'open' CHECK (enrollment_type IN ('open', 'invite', 'approval')),
    max_students INTEGER,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Contacts (CRM - 수강생 DB)
```sql
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id), -- 가입한 사용자 연결 (optional)

    -- 기본 정보
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,

    -- 소스 추적
    source TEXT, -- 'session', 'import', 'manual', 'signup'
    source_session_id UUID REFERENCES public.sessions(id),

    -- 마케팅 동의
    marketing_consent BOOLEAN DEFAULT FALSE,
    marketing_consent_at TIMESTAMPTZ,

    -- 태그/분류
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',

    -- 통계
    sessions_attended INTEGER DEFAULT 0,
    last_session_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(workspace_id, email)
);
```

### 5. Class Enrollments (수강 등록)
```sql
CREATE TABLE public.class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'waitlist')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(class_id, contact_id)
);
```

### 6. Sessions 확장 (기존 테이블 수정)
```sql
ALTER TABLE public.sessions
    ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id),
    ADD COLUMN class_id UUID REFERENCES public.classes(id);
```

### 7. Session Participants 확장 (기존 테이블 수정)
```sql
ALTER TABLE public.session_participants
    ADD COLUMN contact_id UUID REFERENCES public.contacts(id);
```

### 8. Attendance (출석 체크)
```sql
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id),
    participant_id UUID REFERENCES public.session_participants(id),

    -- 체크인 정보
    check_in_method TEXT CHECK (check_in_method IN ('qr', 'code', 'manual', 'auto')),
    check_in_at TIMESTAMPTZ DEFAULT NOW(),
    check_out_at TIMESTAMPTZ,

    -- 인증
    verified BOOLEAN DEFAULT FALSE,
    verified_by TEXT, -- 'phone', 'kakao', 'manual'

    -- 위치 (optional)
    location JSONB, -- {lat, lng, accuracy}

    -- 메타데이터
    device_info JSONB,

    UNIQUE(session_id, contact_id)
);
```

### 9. Survey Templates (설문 템플릿)
```sql
CREATE TABLE public.survey_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL, -- [{id, type, text, options, required}]
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10. Surveys (설문 인스턴스)
```sql
CREATE TABLE public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.survey_templates(id),
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    questions JSONB NOT NULL, -- 템플릿에서 복사 또는 커스텀

    -- 배포 설정
    distribution_type TEXT CHECK (distribution_type IN ('session', 'link', 'sms', 'email')),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,

    -- 통계
    response_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 11. Survey Responses (설문 응답)
```sql
CREATE TABLE public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id),
    participant_id UUID REFERENCES public.session_participants(id),

    answers JSONB NOT NULL, -- {question_id: answer}

    -- 메타
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

---

## 마이그레이션 계획

### Phase 1: 코어 인프라 (우선순위: 높음)
1. `workspaces` 테이블 생성
2. `workspace_members` 테이블 생성
3. `contacts` 테이블 생성
4. `sessions` 테이블에 `workspace_id`, `class_id` 컬럼 추가

### Phase 2: 클래스 시스템
1. `classes` 테이블 생성
2. `class_enrollments` 테이블 생성
3. 수강생 일괄 관리 기능

### Phase 3: 출석 & 설문
1. `attendance` 테이블 생성
2. `survey_templates` 테이블 생성
3. `surveys` 테이블 생성
4. `survey_responses` 테이블 생성

### Phase 4: CRM 확장
1. 마케팅 캠페인 테이블
2. 메시지 발송 로그
3. 분석 대시보드 뷰

---

## RLS 정책 가이드

### Workspace 기반 접근 제어
```sql
-- 워크스페이스 멤버만 접근
CREATE POLICY "workspace_members_only"
ON public.contacts FOR ALL
USING (
    workspace_id IN (
        SELECT workspace_id FROM public.workspace_members
        WHERE user_id = auth.uid()
    )
);
```

### Session + Workspace 복합 접근
```sql
-- 세션 참여자 또는 워크스페이스 멤버
CREATE POLICY "session_or_workspace_access"
ON public.attendance FOR SELECT
USING (
    session_id IN (
        SELECT session_id FROM public.session_participants WHERE user_id = auth.uid()
    )
    OR session_id IN (
        SELECT s.id FROM public.sessions s
        JOIN public.workspace_members wm ON wm.workspace_id = s.workspace_id
        WHERE wm.user_id = auth.uid()
    )
);
```

---

## TypeScript 타입 확장

```typescript
// 새 타입 추가
export type WorkspaceRole = 'owner' | 'admin' | 'instructor' | 'assistant';
export type EnrollmentStatus = 'enrolled' | 'completed' | 'dropped' | 'waitlist';
export type AttendanceMethod = 'qr' | 'code' | 'manual' | 'auto';
export type SurveyDistribution = 'session' | 'link' | 'sms' | 'email';

export interface Workspace {
    id: string;
    name: string;
    slug: string | null;
    owner_id: string;
    logo_url: string | null;
    settings: Json;
    plan_type: 'free' | 'pro' | 'enterprise';
    created_at: string;
    updated_at: string;
}

export interface Contact {
    id: string;
    workspace_id: string;
    user_id: string | null;
    name: string;
    phone: string | null;
    email: string | null;
    source: string | null;
    marketing_consent: boolean;
    tags: string[];
    sessions_attended: number;
    last_session_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Attendance {
    id: string;
    session_id: string;
    contact_id: string | null;
    participant_id: string | null;
    check_in_method: AttendanceMethod;
    check_in_at: string;
    check_out_at: string | null;
    verified: boolean;
    verified_by: string | null;
}
```

---

## 구현 우선순위

| 순위 | 기능 | 테이블 | 예상 공수 |
|-----|------|-------|----------|
| 1 | 워크스페이스 | workspaces, workspace_members | 1일 |
| 2 | 세션-워크스페이스 연동 | sessions ALTER | 0.5일 |
| 3 | 수강생 CRM | contacts | 1일 |
| 4 | 클래스 시스템 | classes, class_enrollments | 1일 |
| 5 | QR 출석 | attendance | 1일 |
| 6 | 만족도 조사 | survey_* | 2일 |

**총 예상 공수: 6.5일**
