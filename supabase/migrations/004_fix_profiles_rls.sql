-- Fix RLS infinite recursion in profiles
-- Created: 2024-12-22
-- Issue: profiles SELECT policy references session_participants which causes recursion

-- ============================================================
-- DROP EXISTING PROBLEMATIC POLICY
-- ============================================================

DROP POLICY IF EXISTS "Users can view other profiles in same session" ON public.profiles;

-- ============================================================
-- RECREATE POLICY USING HELPER FUNCTION
-- ============================================================

-- profiles: SELECT (같은 세션 참여자 프로필 조회)
CREATE POLICY "Users can view other profiles in same session"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT sp.user_id
      FROM public.session_participants sp
      WHERE sp.session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    )
  );
