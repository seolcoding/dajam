-- ============================================================
-- DAJAM Core V2: Institutions, Workspaces, Contacts
-- Migration: 020_core_v2_institutions_workspaces.sql
-- Created: 2024-12-25
--
-- 핵심 원칙:
-- 1. Session은 항상 독립적으로 존재 가능 (코어)
-- 2. Institution/Workspace는 OPTIONAL wrapper
-- 3. 시니어 친화적 모바일 UX 지원
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

-- 기관 타입
CREATE TYPE public.institution_type AS ENUM (
    'welfare_center',      -- 복지관
    'lifelong_learning',   -- 평생학습원
    'senior_center',       -- 노인복지관
    'community_center',    -- 주민센터
    'library',             -- 도서관
    'corporation',         -- 기업
    'academy',             -- 학원
    'other'                -- 기타
);

-- 워크스페이스 역할
CREATE TYPE public.workspace_role AS ENUM (
    'owner',       -- 소유자 (모든 권한)
    'admin',       -- 관리자 (멤버 관리, 설정)
    'instructor',  -- 강사 (세션 생성, 클래스 운영)
    'assistant'    -- 조교 (세션 진행 보조)
);

-- 출석 체크 방법
CREATE TYPE public.attendance_method AS ENUM (
    'qr',          -- QR 스캔
    'code',        -- 6자리 코드 입력
    'kakao',       -- 카카오 인증
    'manual',      -- 수동 체크
    'auto'         -- 자동 (세션 참여 시)
);

-- ============================================================
-- INSTITUTIONS (기관) - OPTIONAL, 구독 단위
-- ============================================================

CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 기본 정보
    name TEXT NOT NULL,
    type public.institution_type DEFAULT 'other',
    description TEXT,

    -- 연락처
    phone TEXT,
    email TEXT,
    address TEXT,

    -- 브랜딩
    logo_url TEXT,
    primary_color TEXT,  -- hex color

    -- 구독/결제
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')),
    subscription_id UUID,  -- 추후 subscriptions 테이블 연동 시 FK 추가

    -- 설정
    settings JSONB DEFAULT '{
        "require_kakao_login": false,
        "default_session_duration": 60,
        "max_participants_per_session": 50
    }',

    -- 메타
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.institutions IS '교육 기관 (복지관, 평생학습원 등) - 구독 및 결제 단위';

-- ============================================================
-- WORKSPACES (작업공간) - OPTIONAL, 팀 협업
-- ============================================================

CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 소속 (optional)
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,

    -- 기본 정보
    name TEXT NOT NULL,
    slug TEXT UNIQUE,  -- URL 슬러그 (optional)
    description TEXT,

    -- 소유자 (필수 - 개인 강사도 가능)
    owner_id UUID NOT NULL REFERENCES public.profiles(id),

    -- 브랜딩 (기관 없을 때 개인 브랜딩)
    logo_url TEXT,

    -- 설정
    settings JSONB DEFAULT '{
        "allow_anonymous_join": true,
        "default_session_public": true
    }',

    -- 플랜 (기관 없을 때 개인 플랜)
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),

    -- 메타
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.workspaces IS '작업공간 - 팀 협업 또는 개인 강사 공간';

-- ============================================================
-- WORKSPACE MEMBERS (팀원)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    role public.workspace_role NOT NULL DEFAULT 'instructor',

    -- 세부 권한
    permissions JSONB DEFAULT '{
        "can_create_session": true,
        "can_manage_contacts": false,
        "can_view_analytics": true,
        "can_invite_members": false
    }',

    -- 초대 정보
    invited_by UUID REFERENCES public.profiles(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(workspace_id, user_id)
);

COMMENT ON TABLE public.workspace_members IS '워크스페이스 팀원 및 역할';

-- ============================================================
-- CONTACTS (수강생 CRM)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 소속 (최소 하나는 필요)
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,

    -- 가입 사용자 연결 (optional)
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- 기본 정보
    name TEXT NOT NULL,
    phone TEXT,           -- 카카오/SMS 발송용
    email TEXT,

    -- 시니어 특화 정보
    birth_year INTEGER,   -- 연령대 파악용
    accessibility_needs JSONB DEFAULT '{}',  -- 접근성 필요사항

    -- 소스 추적
    source TEXT DEFAULT 'session',  -- 'session', 'import', 'manual', 'signup'
    source_session_id UUID,

    -- 마케팅 동의 (KISA 규정 준수)
    marketing_sms_consent BOOLEAN DEFAULT FALSE,
    marketing_email_consent BOOLEAN DEFAULT FALSE,
    marketing_kakao_consent BOOLEAN DEFAULT FALSE,
    marketing_consent_at TIMESTAMPTZ,

    -- 분류
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    notes TEXT,

    -- 통계
    sessions_attended INTEGER DEFAULT 0,
    last_session_at TIMESTAMPTZ,
    total_attendance_minutes INTEGER DEFAULT 0,

    -- 메타
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 제약조건: workspace 또는 institution 중 하나는 있어야 함
    CONSTRAINT contacts_has_owner CHECK (
        workspace_id IS NOT NULL OR institution_id IS NOT NULL
    )
);

COMMENT ON TABLE public.contacts IS '수강생 CRM - 마케팅 및 관리용';

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_contacts_workspace ON public.contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contacts_institution ON public.contacts(institution_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_user ON public.contacts(user_id) WHERE user_id IS NOT NULL;

-- ============================================================
-- SESSIONS 테이블 확장 (기존 테이블에 컬럼 추가)
-- ============================================================

-- 기관/워크스페이스 연결 컬럼 추가
ALTER TABLE public.sessions
    ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS class_id UUID;  -- classes 테이블은 Phase 2에서 생성

-- 시니어 특화 설정 컬럼 추가
ALTER TABLE public.sessions
    ADD COLUMN IF NOT EXISTS accessibility_mode BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS large_text_mode BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.sessions.accessibility_mode IS '접근성 모드 (큰 버튼, 고대비)';
COMMENT ON COLUMN public.sessions.large_text_mode IS '큰 글씨 모드';

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sessions_institution ON public.sessions(institution_id) WHERE institution_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_workspace ON public.sessions(workspace_id) WHERE workspace_id IS NOT NULL;

-- ============================================================
-- SESSION PARTICIPANTS 확장
-- ============================================================

-- Contact 연결 컬럼 추가
ALTER TABLE public.session_participants
    ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_participants_contact ON public.session_participants(contact_id) WHERE contact_id IS NOT NULL;

-- ============================================================
-- ATTENDANCE (출석)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 세션 연결
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,

    -- 참여자 연결 (둘 중 하나는 있어야 함)
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    participant_id UUID REFERENCES public.session_participants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- 체크인 정보
    check_in_method public.attendance_method NOT NULL DEFAULT 'auto',
    check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_at TIMESTAMPTZ,

    -- 인증 (본인 확인)
    verified BOOLEAN DEFAULT FALSE,
    verified_method TEXT,  -- 'kakao', 'phone', 'manual'
    verified_at TIMESTAMPTZ,

    -- QR 코드 정보
    qr_code_id TEXT,  -- 스캔한 QR 코드 ID

    -- 위치 정보 (optional, 오프라인 출석용)
    location JSONB,  -- {lat, lng, accuracy, address}

    -- 디바이스 정보 (통계/분석용)
    device_info JSONB DEFAULT '{}',  -- {type, os, browser}

    -- 메타
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 한 세션에 한 번만 출석
    UNIQUE(session_id, contact_id),

    -- 참여자 또는 연락처 중 하나는 있어야 함
    CONSTRAINT attendance_has_identity CHECK (
        contact_id IS NOT NULL OR participant_id IS NOT NULL OR user_id IS NOT NULL
    )
);

COMMENT ON TABLE public.attendance IS 'QR 출석 체크 기록';

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_attendance_session ON public.attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_contact ON public.attendance(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON public.attendance(check_in_at DESC);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Institutions RLS
CREATE POLICY "institution_select_public"
    ON public.institutions FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "institution_manage_owner"
    ON public.institutions FOR ALL
    USING (
        id IN (
            SELECT w.institution_id FROM public.workspaces w
            WHERE w.owner_id = auth.uid()
        )
    );

-- Workspaces RLS
CREATE POLICY "workspace_select_member"
    ON public.workspaces FOR SELECT
    USING (
        owner_id = auth.uid()
        OR id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    );

CREATE POLICY "workspace_insert_authenticated"
    ON public.workspaces FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workspace_update_owner"
    ON public.workspaces FOR UPDATE
    USING (owner_id = auth.uid());

-- Workspace Members RLS
CREATE POLICY "workspace_members_select"
    ON public.workspace_members FOR SELECT
    USING (
        workspace_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "workspace_members_manage"
    ON public.workspace_members FOR ALL
    USING (
        workspace_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        )
        OR workspace_id IN (
            SELECT workspace_id FROM public.workspace_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Contacts RLS
CREATE POLICY "contacts_select_workspace_member"
    ON public.contacts FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
        OR institution_id IN (
            SELECT institution_id FROM public.workspaces w
            JOIN public.workspace_members wm ON wm.workspace_id = w.id
            WHERE wm.user_id = auth.uid()
        )
        OR user_id = auth.uid()  -- 본인 연락처
    );

CREATE POLICY "contacts_insert_workspace_member"
    ON public.contacts FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "contacts_update_workspace_member"
    ON public.contacts FOR UPDATE
    USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members
            WHERE user_id = auth.uid()
        )
    );

-- Attendance RLS
CREATE POLICY "attendance_select_session"
    ON public.attendance FOR SELECT
    USING (
        -- 세션 호스트
        session_id IN (SELECT id FROM public.sessions WHERE host_id = auth.uid())
        -- 워크스페이스 멤버
        OR session_id IN (
            SELECT s.id FROM public.sessions s
            JOIN public.workspace_members wm ON wm.workspace_id = s.workspace_id
            WHERE wm.user_id = auth.uid()
        )
        -- 본인 출석 기록
        OR user_id = auth.uid()
    );

CREATE POLICY "attendance_insert"
    ON public.attendance FOR INSERT
    WITH CHECK (TRUE);  -- 누구나 출석 가능 (세션 참여 조건은 앱에서 체크)

CREATE POLICY "attendance_update_host"
    ON public.attendance FOR UPDATE
    USING (
        session_id IN (SELECT id FROM public.sessions WHERE host_id = auth.uid())
    );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Updated_at 트리거
CREATE TRIGGER update_institutions_updated_at
    BEFORE UPDATE ON public.institutions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 워크스페이스 생성 시 owner를 자동으로 member로 추가
CREATE OR REPLACE FUNCTION public.add_workspace_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.workspace_members (workspace_id, user_id, role, permissions)
    VALUES (
        NEW.id,
        NEW.owner_id,
        'owner',
        '{"can_create_session": true, "can_manage_contacts": true, "can_view_analytics": true, "can_invite_members": true}'::jsonb
    )
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workspace_created
    AFTER INSERT ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.add_workspace_owner_as_member();

-- 출석 시 contact 통계 업데이트
CREATE OR REPLACE FUNCTION public.update_contact_attendance_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.contact_id IS NOT NULL THEN
        UPDATE public.contacts
        SET
            sessions_attended = sessions_attended + 1,
            last_session_at = NEW.check_in_at
        WHERE id = NEW.contact_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_attendance_created
    AFTER INSERT ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION public.update_contact_attendance_stats();

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

-- ============================================================
-- INTEGRATIONS (외부 서비스 연동)
-- ============================================================

-- 외부 서비스 연동 타입
CREATE TYPE public.integration_type AS ENUM (
    'google_sheets',   -- 구글 시트 (출석, 설문 결과)
    'google_forms',    -- 구글 폼 (설문 import)
    'notion',          -- 노션 (DB 동기화)
    'slack',           -- 슬랙 (알림)
    'kakao_channel',   -- 카카오 채널 (알림톡)
    'webhook'          -- 커스텀 웹훅
);

CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 소속
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,

    -- 연동 정보
    type public.integration_type NOT NULL,
    name TEXT NOT NULL,  -- 사용자가 지정한 이름

    -- 연결 설정
    config JSONB NOT NULL DEFAULT '{}',
    -- Google: {spreadsheet_id, sheet_name, credentials_encrypted}
    -- Webhook: {url, secret, events[]}
    -- Kakao: {channel_id, api_key_encrypted}

    -- OAuth 토큰 (Google 등)
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,

    -- 동기화 설정
    sync_enabled BOOLEAN DEFAULT TRUE,
    sync_frequency TEXT DEFAULT 'realtime',  -- 'realtime', 'hourly', 'daily'
    last_sync_at TIMESTAMPTZ,
    last_sync_status TEXT,  -- 'success', 'error'
    last_sync_error TEXT,

    -- 메타
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT integrations_has_owner CHECK (
        workspace_id IS NOT NULL OR institution_id IS NOT NULL
    )
);

COMMENT ON TABLE public.integrations IS '외부 서비스 연동 설정 (Google Sheets, Forms, Notion 등)';

-- Integration Logs (동기화 로그)
CREATE TABLE IF NOT EXISTS public.integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,

    -- 동기화 정보
    action TEXT NOT NULL,  -- 'sync', 'export', 'import', 'webhook_send'
    direction TEXT NOT NULL,  -- 'outbound', 'inbound'

    -- 데이터 참조
    session_id UUID REFERENCES public.sessions(id),
    record_count INTEGER,

    -- 결과
    status TEXT NOT NULL,  -- 'success', 'partial', 'error'
    error_message TEXT,
    response_data JSONB,

    -- 메타
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integration_logs_integration ON public.integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created ON public.integration_logs(created_at DESC);

-- RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations_select_member"
    ON public.integrations FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "integrations_manage_admin"
    ON public.integrations FOR ALL
    USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "integration_logs_select"
    ON public.integration_logs FOR SELECT
    USING (
        integration_id IN (
            SELECT i.id FROM public.integrations i
            JOIN public.workspace_members wm ON wm.workspace_id = i.workspace_id
            WHERE wm.user_id = auth.uid()
        )
    );

-- Trigger
CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON public.integrations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- 세션 QR 코드 생성 (출석용)
CREATE OR REPLACE FUNCTION public.generate_attendance_qr_code(p_session_id UUID)
RETURNS TEXT AS $$
DECLARE
    code TEXT;
BEGIN
    -- 세션 코드 + 타임스탬프 기반 유니크 코드
    SELECT
        s.code || '-' || to_char(NOW(), 'YYYYMMDDHH24MI')
    INTO code
    FROM public.sessions s
    WHERE s.id = p_session_id;

    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 연락처 자동 생성/연결 (세션 참여 시)
CREATE OR REPLACE FUNCTION public.link_or_create_contact(
    p_session_id UUID,
    p_participant_id UUID,
    p_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_workspace_id UUID;
    v_contact_id UUID;
BEGIN
    -- 세션의 워크스페이스 찾기
    SELECT workspace_id INTO v_workspace_id
    FROM public.sessions
    WHERE id = p_session_id;

    IF v_workspace_id IS NULL THEN
        RETURN NULL;  -- 워크스페이스 없으면 연락처 생성 안함
    END IF;

    -- 기존 연락처 찾기 (phone 또는 user_id로)
    IF p_phone IS NOT NULL THEN
        SELECT id INTO v_contact_id
        FROM public.contacts
        WHERE workspace_id = v_workspace_id AND phone = p_phone;
    ELSIF p_user_id IS NOT NULL THEN
        SELECT id INTO v_contact_id
        FROM public.contacts
        WHERE workspace_id = v_workspace_id AND user_id = p_user_id;
    END IF;

    -- 없으면 생성
    IF v_contact_id IS NULL THEN
        INSERT INTO public.contacts (workspace_id, name, phone, user_id, source, source_session_id)
        VALUES (v_workspace_id, p_name, p_phone, p_user_id, 'session', p_session_id)
        RETURNING id INTO v_contact_id;
    END IF;

    -- participant에 contact_id 연결
    UPDATE public.session_participants
    SET contact_id = v_contact_id
    WHERE id = p_participant_id;

    RETURN v_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON COLUMN public.contacts.marketing_sms_consent IS 'SMS 마케팅 수신 동의 (KISA 규정)';
COMMENT ON COLUMN public.contacts.marketing_kakao_consent IS '카카오 알림톡 수신 동의';
COMMENT ON COLUMN public.contacts.accessibility_needs IS '접근성 필요사항 (시력, 청력 등)';
COMMENT ON COLUMN public.attendance.verified IS 'QR 외 추가 본인 인증 완료 여부';
COMMENT ON COLUMN public.sessions.accessibility_mode IS '시니어 친화 UI 모드';
