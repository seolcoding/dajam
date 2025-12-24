-- Allow anonymous participants on public sessions
-- Created: 2024-12-23
-- Issue: Anonymous users cannot join sessions because RLS requires auth.uid()

-- ============================================================
-- DROP AND RECREATE SESSION_PARTICIPANTS INSERT POLICY
-- ============================================================

DROP POLICY IF EXISTS "Anyone can join public sessions" ON public.session_participants;

-- New policy: Allow anonymous users to join public/active sessions
CREATE POLICY "Anyone can join public sessions"
  ON public.session_participants FOR INSERT
  WITH CHECK (
    -- Condition 1: Authenticated user joining an active session (not banned)
    (
      auth.uid() IS NOT NULL
      AND session_id IN (SELECT id FROM public.sessions WHERE is_active = TRUE)
      AND NOT public.is_user_banned_from_session(session_id, auth.uid())
    )
    OR
    -- Condition 2: Anonymous user (user_id IS NULL) joining a public active session
    (
      user_id IS NULL
      AND session_id IN (SELECT id FROM public.sessions WHERE is_active = TRUE AND is_public = TRUE)
    )
  );

-- ============================================================
-- UPDATE SESSION_PARTICIPANTS SELECT FOR PUBLIC SESSIONS
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view participants in their sessions" ON public.session_participants;

CREATE POLICY "Anyone can view participants in their sessions"
  ON public.session_participants FOR SELECT
  USING (
    -- Authenticated user: can view participants in their sessions
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    OR
    -- Public sessions: anyone can view participants
    session_id IN (SELECT id FROM public.sessions WHERE is_public = TRUE)
  );

-- ============================================================
-- COMMENT
-- ============================================================

COMMENT ON POLICY "Anyone can join public sessions" ON public.session_participants IS 'Allow authenticated users OR anonymous users (user_id IS NULL) to join active public sessions';
