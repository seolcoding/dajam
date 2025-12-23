-- Fix ALL RLS infinite recursion issues
-- Created: 2024-12-22
-- Issue: Multiple policies reference session_participants causing recursion chain

-- ============================================================
-- STEP 1: CREATE ADDITIONAL HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================================

-- 세션이 공개 상태인지 확인 (RLS 우회)
CREATE OR REPLACE FUNCTION public.is_session_public(p_session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sessions
    WHERE id = p_session_id AND is_public = TRUE AND is_active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 세션의 호스트 ID 반환 (RLS 우회)
CREATE OR REPLACE FUNCTION public.get_session_host_id(p_session_id UUID)
RETURNS UUID AS $$
  SELECT host_id FROM public.sessions WHERE id = p_session_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 사용자가 호스트인 세션 ID 목록 (RLS 우회)
CREATE OR REPLACE FUNCTION public.get_hosted_session_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
  SELECT id FROM public.sessions WHERE host_id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 세션이 활성 상태인지 확인 (RLS 우회)
CREATE OR REPLACE FUNCTION public.is_session_active(p_session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sessions WHERE id = p_session_id AND is_active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 같은 세션에 있는 사용자 ID 목록 (RLS 우회)
CREATE OR REPLACE FUNCTION public.get_users_in_same_sessions(p_user_id UUID)
RETURNS SETOF UUID AS $$
  SELECT DISTINCT sp2.user_id
  FROM public.session_participants sp1
  JOIN public.session_participants sp2 ON sp1.session_id = sp2.session_id
  WHERE sp1.user_id = p_user_id AND sp2.user_id IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- STEP 2: DROP ALL PROBLEMATIC POLICIES
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other profiles in same session" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- sessions
DROP POLICY IF EXISTS "Anyone can view active public sessions" ON public.sessions;
DROP POLICY IF EXISTS "Hosts can view own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Participants can view their sessions" ON public.sessions;
DROP POLICY IF EXISTS "Authenticated users can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Hosts can update their sessions" ON public.sessions;
DROP POLICY IF EXISTS "Hosts can delete their sessions" ON public.sessions;

-- session_participants
DROP POLICY IF EXISTS "Anyone can view participants in their sessions" ON public.session_participants;
DROP POLICY IF EXISTS "Anyone can join public sessions" ON public.session_participants;
DROP POLICY IF EXISTS "Users can leave sessions" ON public.session_participants;
DROP POLICY IF EXISTS "Hosts can manage participants" ON public.session_participants;
DROP POLICY IF EXISTS "Hosts can remove participants" ON public.session_participants;

-- votes
DROP POLICY IF EXISTS "Anyone can view votes in their sessions" ON public.votes;
DROP POLICY IF EXISTS "Participants can vote" ON public.votes;

-- orders
DROP POLICY IF EXISTS "Anyone can view orders in their sessions" ON public.orders;
DROP POLICY IF EXISTS "Participants can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- icebreaker_answers
DROP POLICY IF EXISTS "Anyone can view icebreaker in their sessions" ON public.icebreaker_answers;
DROP POLICY IF EXISTS "Participants can add answers" ON public.icebreaker_answers;

-- vote_aggregates
DROP POLICY IF EXISTS "Anyone can view aggregates in their sessions" ON public.vote_aggregates;

-- ============================================================
-- STEP 3: RECREATE ALL POLICIES USING HELPER FUNCTIONS
-- ============================================================

-- ===================== PROFILES =====================

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_same_session"
  ON public.profiles FOR SELECT
  USING (id IN (SELECT public.get_users_in_same_sessions(auth.uid())));

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ===================== SESSIONS =====================

CREATE POLICY "sessions_select_public"
  ON public.sessions FOR SELECT
  USING (is_active = TRUE AND is_public = TRUE);

CREATE POLICY "sessions_select_host"
  ON public.sessions FOR SELECT
  USING (host_id = auth.uid());

CREATE POLICY "sessions_select_participant"
  ON public.sessions FOR SELECT
  USING (id IN (SELECT public.get_user_session_ids(auth.uid())));

CREATE POLICY "sessions_insert"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id OR host_id IS NULL);

CREATE POLICY "sessions_update_host"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "sessions_delete_host"
  ON public.sessions FOR DELETE
  USING (auth.uid() = host_id);

-- ===================== SESSION_PARTICIPANTS =====================

CREATE POLICY "participants_select"
  ON public.session_participants FOR SELECT
  USING (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    OR public.is_session_public(session_id)
  );

CREATE POLICY "participants_insert"
  ON public.session_participants FOR INSERT
  WITH CHECK (
    public.is_session_active(session_id)
    AND NOT public.is_user_banned_from_session(session_id, auth.uid())
  );

CREATE POLICY "participants_delete_self"
  ON public.session_participants FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "participants_update_host"
  ON public.session_participants FOR UPDATE
  USING (session_id IN (SELECT public.get_hosted_session_ids(auth.uid())));

CREATE POLICY "participants_delete_host"
  ON public.session_participants FOR DELETE
  USING (session_id IN (SELECT public.get_hosted_session_ids(auth.uid())));

-- ===================== VOTES =====================

CREATE POLICY "votes_select"
  ON public.votes FOR SELECT
  USING (session_id IN (SELECT public.get_user_session_ids(auth.uid())));

CREATE POLICY "votes_insert"
  ON public.votes FOR INSERT
  WITH CHECK (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    AND public.get_user_session_role(session_id, auth.uid()) IN ('host', 'moderator', 'participant')
    AND NOT public.is_user_banned_from_session(session_id, auth.uid())
  );

-- ===================== ORDERS =====================

CREATE POLICY "orders_select"
  ON public.orders FOR SELECT
  USING (session_id IN (SELECT public.get_user_session_ids(auth.uid())));

CREATE POLICY "orders_insert"
  ON public.orders FOR INSERT
  WITH CHECK (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    AND public.get_user_session_role(session_id, auth.uid()) IN ('host', 'moderator', 'participant')
  );

CREATE POLICY "orders_update_own"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- ===================== ICEBREAKER_ANSWERS =====================

CREATE POLICY "icebreaker_select"
  ON public.icebreaker_answers FOR SELECT
  USING (session_id IN (SELECT public.get_user_session_ids(auth.uid())));

CREATE POLICY "icebreaker_insert"
  ON public.icebreaker_answers FOR INSERT
  WITH CHECK (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    AND public.get_user_session_role(session_id, auth.uid()) IN ('host', 'moderator', 'participant')
  );

-- ===================== VOTE_AGGREGATES =====================

CREATE POLICY "vote_aggregates_select"
  ON public.vote_aggregates FOR SELECT
  USING (
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    OR public.is_session_public(session_id)
  );

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON FUNCTION public.is_session_public IS 'RLS bypass: Check if session is public and active';
COMMENT ON FUNCTION public.get_session_host_id IS 'RLS bypass: Get session host ID';
COMMENT ON FUNCTION public.get_hosted_session_ids IS 'RLS bypass: Get session IDs where user is host';
COMMENT ON FUNCTION public.is_session_active IS 'RLS bypass: Check if session is active';
COMMENT ON FUNCTION public.get_users_in_same_sessions IS 'RLS bypass: Get user IDs in same sessions';
