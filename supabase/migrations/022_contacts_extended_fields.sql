-- ============================================================
-- DAJAM Phase 2.1: Contacts Extended Fields
-- Migration: 022_contacts_extended_fields.sql
-- Created: 2024-12-25
--
-- CRM을 위한 수강생 프로필 확장
-- ============================================================

-- 성별 ENUM
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- 연령대 ENUM (정확한 나이 대신 범위)
CREATE TYPE public.age_group AS ENUM (
    'under_20',    -- 20세 미만
    '20s',         -- 20대
    '30s',         -- 30대
    '40s',         -- 40대
    '50s',         -- 50대
    '60s',         -- 60대
    '70s',         -- 70대
    '80_plus'      -- 80세 이상
);

-- ============================================================
-- CONTACTS 테이블 확장
-- ============================================================

-- 기본 프로필 정보
ALTER TABLE public.contacts
    ADD COLUMN IF NOT EXISTS gender public.gender_type,
    ADD COLUMN IF NOT EXISTS birth_year INTEGER,  -- 출생연도 (나이 계산용)
    ADD COLUMN IF NOT EXISTS age_group public.age_group,
    ADD COLUMN IF NOT EXISTS address TEXT,  -- 주소 (시/구 단위)
    ADD COLUMN IF NOT EXISTS address_detail JSONB DEFAULT '{}';  -- {city, district, full}

-- 관심사 및 선호도
ALTER TABLE public.contacts
    ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',  -- 관심 분야 태그
    ADD COLUMN IF NOT EXISTS preferred_topics TEXT[] DEFAULT '{}',  -- 선호 강의 주제
    ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'beginner'
        CHECK (skill_level IN ('beginner', 'intermediate', 'advanced'));

-- 수강 이력 통계
ALTER TABLE public.contacts
    ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,  -- 총 참여 세션 수
    ADD COLUMN IF NOT EXISTS completed_courses INTEGER DEFAULT 0,  -- 완료한 코스 수
    ADD COLUMN IF NOT EXISTS total_attendance_minutes INTEGER DEFAULT 0,  -- 총 출석 시간(분)
    ADD COLUMN IF NOT EXISTS average_satisfaction NUMERIC(3,2),  -- 평균 만족도 (1-5)
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;  -- 마지막 활동 시간

-- 인터랙션 통계
ALTER TABLE public.contacts
    ADD COLUMN IF NOT EXISTS interaction_stats JSONB DEFAULT '{
        "polls_participated": 0,
        "quizzes_completed": 0,
        "questions_asked": 0,
        "reactions_sent": 0,
        "words_submitted": 0
    }';

-- 기기/접근성 정보
ALTER TABLE public.contacts
    ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}',  -- {os, browser, screen_size}
    ADD COLUMN IF NOT EXISTS accessibility_needs TEXT[] DEFAULT '{}',  -- 접근성 요구사항
    ADD COLUMN IF NOT EXISTS preferred_font_size TEXT DEFAULT 'normal'
        CHECK (preferred_font_size IN ('normal', 'large', 'x-large'));

-- 연락 선호도
ALTER TABLE public.contacts
    ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'kakao'
        CHECK (preferred_contact_method IN ('phone', 'sms', 'email', 'kakao')),
    ADD COLUMN IF NOT EXISTS preferred_contact_time TEXT;  -- 예: '오전', '오후', '저녁'

-- CRM 상태
ALTER TABLE public.contacts
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'churned', 'vip')),
    ADD COLUMN IF NOT EXISTS churn_risk_score INTEGER DEFAULT 0,  -- 이탈 위험도 (0-100)
    ADD COLUMN IF NOT EXISTS lifetime_value INTEGER DEFAULT 0;  -- 고객 생애 가치

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_contacts_gender ON public.contacts(gender);
CREATE INDEX IF NOT EXISTS idx_contacts_age_group ON public.contacts(age_group);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_skill_level ON public.contacts(skill_level);
CREATE INDEX IF NOT EXISTS idx_contacts_interests ON public.contacts USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_contacts_last_active ON public.contacts(last_active_at DESC);

-- ============================================================
-- COURSE HISTORY (수강 이력) - 별도 테이블
-- ============================================================

CREATE TABLE IF NOT EXISTS public.course_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,

    -- 코스/세션 정보
    course_name TEXT NOT NULL,
    course_type TEXT,  -- '정규과정', '특강', '워크샵' 등
    instructor_name TEXT,

    -- 수강 기간
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- 성과
    attendance_rate NUMERIC(5,2),  -- 출석률 (%)
    completion_status TEXT DEFAULT 'in_progress'
        CHECK (completion_status IN ('in_progress', 'completed', 'dropped', 'pending')),
    final_score INTEGER,  -- 최종 점수 (있는 경우)
    certificate_issued BOOLEAN DEFAULT FALSE,

    -- 피드백
    satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
    feedback_text TEXT,

    -- 메타
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_history_contact ON public.course_history(contact_id);
CREATE INDEX idx_course_history_session ON public.course_history(session_id);
CREATE INDEX idx_course_history_dates ON public.course_history(started_at, completed_at);

-- RLS
ALTER TABLE public.course_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_history_select"
    ON public.course_history FOR SELECT
    USING (
        contact_id IN (
            SELECT c.id FROM public.contacts c
            JOIN public.workspace_members wm ON wm.workspace_id = c.workspace_id
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "course_history_manage"
    ON public.course_history FOR ALL
    USING (
        contact_id IN (
            SELECT c.id FROM public.contacts c
            JOIN public.workspace_members wm ON wm.workspace_id = c.workspace_id
            WHERE wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin', 'instructor')
        )
    );

-- ============================================================
-- INTERACTION LOGS (인터랙션 기록) - 세부 로그
-- ============================================================

CREATE TABLE IF NOT EXISTS public.interaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    element_id UUID REFERENCES public.session_elements(id) ON DELETE SET NULL,

    -- 인터랙션 정보
    interaction_type TEXT NOT NULL,  -- 'poll_vote', 'quiz_answer', 'question_ask', 'reaction', etc.
    interaction_data JSONB DEFAULT '{}',

    -- 결과
    is_correct BOOLEAN,  -- 퀴즈인 경우
    points_earned INTEGER DEFAULT 0,

    -- 디바이스 정보
    device_type TEXT,  -- 'mobile', 'tablet', 'desktop'

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interaction_logs_contact ON public.interaction_logs(contact_id);
CREATE INDEX idx_interaction_logs_session ON public.interaction_logs(session_id);
CREATE INDEX idx_interaction_logs_type ON public.interaction_logs(interaction_type);
CREATE INDEX idx_interaction_logs_created ON public.interaction_logs(created_at DESC);

-- RLS
ALTER TABLE public.interaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interaction_logs_select"
    ON public.interaction_logs FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM public.sessions WHERE host_id = auth.uid()
        )
        OR
        contact_id IN (
            SELECT c.id FROM public.contacts c
            JOIN public.workspace_members wm ON wm.workspace_id = c.workspace_id
            WHERE wm.user_id = auth.uid()
        )
    );

-- Insert는 시스템에서 자동
CREATE POLICY "interaction_logs_insert"
    ON public.interaction_logs FOR INSERT
    WITH CHECK (TRUE);  -- 세션 참여자는 누구나 로그 생성 가능

-- ============================================================
-- 통계 업데이트 함수
-- ============================================================

-- 연락처 통계 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_contact_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- interaction_logs에 새 로그가 추가되면 contact의 통계 업데이트
    IF NEW.contact_id IS NOT NULL THEN
        UPDATE public.contacts
        SET
            last_active_at = NOW(),
            interaction_stats = jsonb_set(
                COALESCE(interaction_stats, '{}'::jsonb),
                ARRAY[NEW.interaction_type || 's_count'],
                to_jsonb(COALESCE((interaction_stats->>NEW.interaction_type || 's_count')::int, 0) + 1)
            )
        WHERE id = NEW.contact_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_interaction_logged
    AFTER INSERT ON public.interaction_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contact_stats();

-- ============================================================
-- Realtime 설정
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.interaction_logs;

COMMENT ON TABLE public.contacts IS '수강생/연락처 CRM - 확장된 프로필 및 통계 포함';
COMMENT ON TABLE public.course_history IS '수강 이력 - 코스/세션별 참여 기록';
COMMENT ON TABLE public.interaction_logs IS '인터랙션 로그 - 세부 활동 기록';
