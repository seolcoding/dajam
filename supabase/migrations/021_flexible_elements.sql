-- ============================================================
-- DAJAM Phase 2: Flexible Session Elements & Responses
-- Migration: 021_flexible_elements.sql
-- Created: 2024-12-25
--
-- 설계 원칙:
-- 1. Session은 코어 (RDB 고정)
-- 2. Session 내 콘텐츠/인터랙션은 JSONB로 유연하게
-- 3. 새 앱 타입 추가 시 DB 마이그레이션 불필요
-- 4. Realtime 구독은 element_responses 하나로 통합
-- ============================================================

-- ============================================================
-- SESSION_ELEMENTS: 세션에 속한 콘텐츠/인터랙션 요소
-- ============================================================
-- 예: 퀴즈, 투표, 워드클라우드, 사다리게임, Q&A, 밸런스게임 등
-- element_type은 TEXT로 유연하게 (ENUM 사용 안함 - 확장성)

CREATE TABLE IF NOT EXISTS public.session_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,

    -- 요소 타입 (확장 가능 - ENUM 아님)
    -- 예: 'poll', 'quiz', 'word_cloud', 'balance_game', 'ladder',
    --     'qna', 'survey', 'bingo', 'ideal_worldcup', 'team_divider', etc.
    element_type TEXT NOT NULL,

    -- 제목/라벨 (UI 표시용)
    title TEXT,
    description TEXT,

    -- 타입별 설정 (스키마는 TypeScript에서 관리)
    -- 예: { options: [...], allowMultiple: true, timeLimit: 30 }
    config JSONB NOT NULL DEFAULT '{}',

    -- 실시간 상태 (진행 중인 상태 저장)
    -- 예: { currentQuestion: 2, isRevealed: false, winners: [...] }
    state JSONB NOT NULL DEFAULT '{}',

    -- 순서 및 활성화
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT FALSE,  -- 현재 진행 중인 요소
    is_visible BOOLEAN DEFAULT TRUE,  -- 참여자에게 표시 여부

    -- 시간 제한 (optional)
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,

    -- 메타
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_session_elements_session ON public.session_elements(session_id);
CREATE INDEX idx_session_elements_type ON public.session_elements(element_type);
CREATE INDEX idx_session_elements_active ON public.session_elements(session_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_session_elements_order ON public.session_elements(session_id, order_index);

-- GIN 인덱스 for JSONB queries
CREATE INDEX idx_session_elements_config ON public.session_elements USING GIN (config);
CREATE INDEX idx_session_elements_state ON public.session_elements USING GIN (state);

COMMENT ON TABLE public.session_elements IS '세션 내 콘텐츠/인터랙션 요소 (퀴즈, 투표, 게임 등) - JSONB로 유연한 스키마';
COMMENT ON COLUMN public.session_elements.element_type IS '요소 타입 (poll, quiz, word_cloud, balance_game, ladder, qna, survey, bingo 등)';
COMMENT ON COLUMN public.session_elements.config IS '타입별 설정 (TypeScript 타입으로 스키마 관리)';
COMMENT ON COLUMN public.session_elements.state IS '실시간 상태 (현재 진행 상황, 결과 등)';

-- ============================================================
-- ELEMENT_RESPONSES: 참여자 응답/인터랙션
-- ============================================================
-- 모든 종류의 참여자 인터랙션을 하나의 테이블로 통합
-- Realtime 구독 대상

CREATE TABLE IF NOT EXISTS public.element_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID NOT NULL REFERENCES public.session_elements(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,  -- 비정규화 (쿼리 최적화)

    -- 응답자
    participant_id UUID REFERENCES public.session_participants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,

    -- 익명 응답자 식별 (비로그인)
    anonymous_id TEXT,  -- 브라우저 fingerprint 또는 임시 ID
    display_name TEXT,  -- 표시 이름

    -- 응답 타입 (확장 가능)
    -- 예: 'vote', 'answer', 'reaction', 'submission', 'choice', 'text', 'ranking'
    response_type TEXT NOT NULL,

    -- 응답 데이터 (스키마는 TypeScript에서 관리)
    -- 예: { selectedOption: 'A', text: '답변 내용', ranking: [1,3,2] }
    data JSONB NOT NULL DEFAULT '{}',

    -- 점수/결과 (게임류에서 사용)
    score INTEGER,
    is_correct BOOLEAN,

    -- 메타
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_element_responses_element ON public.element_responses(element_id);
CREATE INDEX idx_element_responses_session ON public.element_responses(session_id);
CREATE INDEX idx_element_responses_participant ON public.element_responses(participant_id);
CREATE INDEX idx_element_responses_user ON public.element_responses(user_id);
CREATE INDEX idx_element_responses_type ON public.element_responses(response_type);
CREATE INDEX idx_element_responses_created ON public.element_responses(created_at DESC);

-- 복합 인덱스: 요소별 응답 조회 최적화
CREATE INDEX idx_element_responses_element_created ON public.element_responses(element_id, created_at DESC);

-- GIN 인덱스 for JSONB queries
CREATE INDEX idx_element_responses_data ON public.element_responses USING GIN (data);

-- 중복 투표 방지 (optional - element_type에 따라 다르게 적용)
-- 특정 요소에 대해 한 사람당 하나의 응답만 허용할 경우
CREATE UNIQUE INDEX idx_element_responses_unique_vote
    ON public.element_responses(element_id, COALESCE(participant_id::text, anonymous_id))
    WHERE response_type = 'vote';

COMMENT ON TABLE public.element_responses IS '참여자 응답/인터랙션 통합 테이블 - Realtime 구독 대상';
COMMENT ON COLUMN public.element_responses.response_type IS '응답 타입 (vote, answer, reaction, submission 등)';
COMMENT ON COLUMN public.element_responses.data IS '응답 데이터 (TypeScript 타입으로 스키마 관리)';

-- ============================================================
-- ELEMENT_AGGREGATES: 집계 데이터 (선택적 최적화)
-- ============================================================
-- 실시간 집계가 필요한 경우 사용 (투표 결과, 워드클라우드 등)
-- 트리거로 자동 업데이트

CREATE TABLE IF NOT EXISTS public.element_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID NOT NULL REFERENCES public.session_elements(id) ON DELETE CASCADE,

    -- 집계 키 (옵션명, 단어 등)
    aggregate_key TEXT NOT NULL,

    -- 집계 값
    count INTEGER DEFAULT 0,
    sum_value NUMERIC,  -- 점수 합계 등

    -- 추가 메타데이터
    metadata JSONB DEFAULT '{}',

    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(element_id, aggregate_key)
);

CREATE INDEX idx_element_aggregates_element ON public.element_aggregates(element_id);

COMMENT ON TABLE public.element_aggregates IS '요소별 집계 데이터 (투표 결과, 워드 빈도 등)';

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE public.session_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.element_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.element_aggregates ENABLE ROW LEVEL SECURITY;

-- session_elements: 세션 참여자 또는 호스트가 조회 가능
CREATE POLICY "elements_select_public"
    ON public.session_elements FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM public.sessions WHERE is_public = TRUE
        )
        OR
        session_id IN (
            SELECT session_id FROM public.session_participants
            WHERE user_id = auth.uid()
        )
        OR
        session_id IN (
            SELECT id FROM public.sessions WHERE host_id = auth.uid()
        )
    );

-- session_elements: 호스트만 생성/수정/삭제
CREATE POLICY "elements_manage_host"
    ON public.session_elements FOR ALL
    USING (
        session_id IN (
            SELECT id FROM public.sessions WHERE host_id = auth.uid()
        )
    );

-- element_responses: 누구나 자신의 응답 생성 가능 (public 세션)
CREATE POLICY "responses_insert_participant"
    ON public.element_responses FOR INSERT
    WITH CHECK (
        session_id IN (
            SELECT id FROM public.sessions WHERE is_public = TRUE
        )
        OR
        session_id IN (
            SELECT session_id FROM public.session_participants
            WHERE user_id = auth.uid()
        )
    );

-- element_responses: 세션 참여자 또는 호스트가 조회 가능
CREATE POLICY "responses_select"
    ON public.element_responses FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM public.sessions WHERE is_public = TRUE
        )
        OR
        session_id IN (
            SELECT session_id FROM public.session_participants
            WHERE user_id = auth.uid()
        )
        OR
        session_id IN (
            SELECT id FROM public.sessions WHERE host_id = auth.uid()
        )
    );

-- element_responses: 자신의 응답만 수정 가능
CREATE POLICY "responses_update_own"
    ON public.element_responses FOR UPDATE
    USING (
        user_id = auth.uid()
        OR participant_id IN (
            SELECT id FROM public.session_participants WHERE user_id = auth.uid()
        )
    );

-- element_responses: 호스트는 모든 응답 삭제 가능
CREATE POLICY "responses_delete_host"
    ON public.element_responses FOR DELETE
    USING (
        session_id IN (
            SELECT id FROM public.sessions WHERE host_id = auth.uid()
        )
    );

-- element_aggregates: 조회는 세션 참여자/호스트
CREATE POLICY "aggregates_select"
    ON public.element_aggregates FOR SELECT
    USING (
        element_id IN (
            SELECT se.id FROM public.session_elements se
            JOIN public.sessions s ON s.id = se.session_id
            WHERE s.is_public = TRUE OR s.host_id = auth.uid()
        )
    );

-- element_aggregates: 시스템만 수정 (트리거)
CREATE POLICY "aggregates_manage_system"
    ON public.element_aggregates FOR ALL
    USING (FALSE)  -- 직접 수정 불가
    WITH CHECK (FALSE);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- updated_at 자동 갱신
CREATE TRIGGER update_session_elements_updated_at
    BEFORE UPDATE ON public.session_elements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_element_responses_updated_at
    BEFORE UPDATE ON public.element_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- AGGREGATE UPDATE FUNCTION
-- ============================================================
-- 응답이 추가될 때 집계 자동 업데이트

CREATE OR REPLACE FUNCTION public.update_element_aggregate()
RETURNS TRIGGER AS $$
DECLARE
    v_key TEXT;
BEGIN
    -- response_type이 'vote'인 경우에만 집계
    IF NEW.response_type = 'vote' AND NEW.data ? 'selectedOption' THEN
        v_key := NEW.data->>'selectedOption';

        INSERT INTO public.element_aggregates (element_id, aggregate_key, count)
        VALUES (NEW.element_id, v_key, 1)
        ON CONFLICT (element_id, aggregate_key)
        DO UPDATE SET
            count = element_aggregates.count + 1,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_element_response_inserted
    AFTER INSERT ON public.element_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_element_aggregate();

-- ============================================================
-- REALTIME 설정
-- ============================================================
-- element_responses 테이블에 대한 Realtime 활성화

ALTER PUBLICATION supabase_realtime ADD TABLE public.session_elements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.element_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.element_aggregates;

-- ============================================================
-- 기존 테이블과의 호환성 뷰 (선택적)
-- ============================================================
-- 기존 votes 테이블 사용 코드와의 호환성을 위한 뷰
-- 점진적 마이그레이션 시 사용

-- CREATE VIEW public.votes_compat AS
-- SELECT
--     er.id,
--     er.session_id,
--     er.participant_id,
--     er.user_id,
--     er.data AS selection,
--     er.created_at
-- FROM public.element_responses er
-- WHERE er.response_type = 'vote';

COMMENT ON TABLE public.session_elements IS
'세션 콘텐츠/인터랙션 통합 테이블.
element_type 예시: poll, quiz, word_cloud, balance_game, ladder, qna, survey, bingo, ideal_worldcup, team_divider, personality_test, this_or_that, chosung_quiz, realtime_quiz, human_bingo
config/state 스키마는 TypeScript에서 관리';
