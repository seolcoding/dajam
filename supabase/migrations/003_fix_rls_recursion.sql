-- Fix RLS infinite recursion in session_participants
-- Created: 2024-12-22
-- Issue: session_participants SELECT/INSERT policies reference themselves

-- ============================================================
-- HELPER FUNCTIONS (SECURITY DEFINER to bypass RLS)
-- ============================================================

-- 사용자가 참여 중인 세션 ID 목록 반환 (RLS 우회)
CREATE OR REPLACE FUNCTION public.get_user_session_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
  SELECT session_id FROM public.session_participants WHERE user_id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 사용자가 특정 세션에서 강퇴되었는지 확인 (RLS 우회)
CREATE OR REPLACE FUNCTION public.is_user_banned_from_session(p_session_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.session_participants
    WHERE session_id = p_session_id
      AND user_id = p_user_id
      AND is_banned = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 사용자의 세션 내 역할 확인 (RLS 우회)
CREATE OR REPLACE FUNCTION public.get_user_session_role(p_session_id UUID, p_user_id UUID)
RETURNS public.session_role AS $$
  SELECT role FROM public.session_participants
  WHERE session_id = p_session_id AND user_id = p_user_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- DROP EXISTING PROBLEMATIC POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view participants in their sessions" ON public.session_participants;
DROP POLICY IF EXISTS "Anyone can join public sessions" ON public.session_participants;
DROP POLICY IF EXISTS "Anyone can view votes in their sessions" ON public.votes;
DROP POLICY IF EXISTS "Participants can vote" ON public.votes;
DROP POLICY IF EXISTS "Anyone can view orders in their sessions" ON public.orders;
DROP POLICY IF EXISTS "Participants can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view icebreaker in their sessions" ON public.icebreaker_answers;
DROP POLICY IF EXISTS "Participants can add answers" ON public.icebreaker_answers;
DROP POLICY IF EXISTS "Anyone can view aggregates in their sessions" ON public.vote_aggregates;

-- ============================================================
-- RECREATE POLICIES USING HELPER FUNCTIONS
-- ============================================================

-- session_participants: SELECT
CREATE POLICY "Anyone can view participants in their sessions"
  ON public.session_participants FOR SELECT
  USING (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    OR session_id IN (SELECT id FROM public.sessions WHERE is_public = TRUE)
  );

-- session_participants: INSERT
CREATE POLICY "Anyone can join public sessions"
  ON public.session_participants FOR INSERT
  WITH CHECK (
    -- 세션이 활성 상태인지 확인
    session_id IN (SELECT id FROM public.sessions WHERE is_active = TRUE)
    -- 이미 강퇴된 기록이 있는지 확인 (헬퍼 함수 사용)
    AND NOT public.is_user_banned_from_session(session_id, auth.uid())
  );

-- votes: SELECT
CREATE POLICY "Anyone can view votes in their sessions"
  ON public.votes FOR SELECT
  USING (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
  );

-- votes: INSERT
CREATE POLICY "Participants can vote"
  ON public.votes FOR INSERT
  WITH CHECK (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    AND public.get_user_session_role(session_id, auth.uid()) IN ('host', 'moderator', 'participant')
    AND NOT public.is_user_banned_from_session(session_id, auth.uid())
  );

-- orders: SELECT
CREATE POLICY "Anyone can view orders in their sessions"
  ON public.orders FOR SELECT
  USING (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
  );

-- orders: INSERT
CREATE POLICY "Participants can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    AND public.get_user_session_role(session_id, auth.uid()) IN ('host', 'moderator', 'participant')
  );

-- icebreaker_answers: SELECT
CREATE POLICY "Anyone can view icebreaker in their sessions"
  ON public.icebreaker_answers FOR SELECT
  USING (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
  );

-- icebreaker_answers: INSERT
CREATE POLICY "Participants can add answers"
  ON public.icebreaker_answers FOR INSERT
  WITH CHECK (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    AND public.get_user_session_role(session_id, auth.uid()) IN ('host', 'moderator', 'participant')
  );

-- vote_aggregates: SELECT
CREATE POLICY "Anyone can view aggregates in their sessions"
  ON public.vote_aggregates FOR SELECT
  USING (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    OR session_id IN (SELECT id FROM public.sessions WHERE is_public = TRUE)
  );

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON FUNCTION public.get_user_session_ids IS 'RLS 우회용: 사용자 참여 세션 ID 목록';
COMMENT ON FUNCTION public.is_user_banned_from_session IS 'RLS 우회용: 강퇴 여부 확인';
COMMENT ON FUNCTION public.get_user_session_role IS 'RLS 우회용: 세션 내 역할 확인';
