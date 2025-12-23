-- Allow anonymous voting on public sessions
-- Created: 2024-12-22
-- Issue: Anonymous users cannot vote because RLS requires auth.uid()

-- ============================================================
-- DROP AND RECREATE VOTES INSERT POLICY
-- ============================================================

DROP POLICY IF EXISTS "votes_insert" ON public.votes;

-- 새 정책: 공개 세션에서는 익명 투표 허용
CREATE POLICY "votes_insert"
  ON public.votes FOR INSERT
  WITH CHECK (
    -- 조건 1: 인증된 사용자이고 세션 참여자인 경우
    (
      auth.uid() IS NOT NULL
      AND session_id IN (SELECT public.get_user_session_ids(auth.uid()))
      AND public.get_user_session_role(session_id, auth.uid()) IN ('host', 'moderator', 'participant')
      AND NOT public.is_user_banned_from_session(session_id, auth.uid())
    )
    OR
    -- 조건 2: 공개 세션에서는 익명 투표 허용 (user_id가 NULL)
    (
      public.is_session_public(session_id)
      AND user_id IS NULL
    )
  );

-- ============================================================
-- ALSO UPDATE VOTES SELECT FOR PUBLIC SESSIONS
-- ============================================================

DROP POLICY IF EXISTS "votes_select" ON public.votes;

CREATE POLICY "votes_select"
  ON public.votes FOR SELECT
  USING (
    -- 인증된 사용자: 자신이 참여한 세션의 투표 조회
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    OR
    -- 공개 세션: 누구나 조회 가능
    public.is_session_public(session_id)
  );

-- ============================================================
-- UPDATE VOTE_AGGREGATES SELECT FOR PUBLIC SESSIONS (already exists but ensure it works)
-- ============================================================

DROP POLICY IF EXISTS "vote_aggregates_select" ON public.vote_aggregates;

CREATE POLICY "vote_aggregates_select"
  ON public.vote_aggregates FOR SELECT
  USING (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    OR public.is_session_public(session_id)
  );

-- ============================================================
-- SESSIONS: Allow anyone to view active public sessions (no auth required)
-- ============================================================

DROP POLICY IF EXISTS "sessions_select_public" ON public.sessions;

CREATE POLICY "sessions_select_public"
  ON public.sessions FOR SELECT
  USING (is_active = TRUE AND is_public = TRUE);

-- No auth.uid() check needed for public sessions

-- ============================================================
-- COMMENT
-- ============================================================

COMMENT ON POLICY "votes_insert" ON public.votes IS 'Allow authenticated participants OR anonymous users on public sessions';
