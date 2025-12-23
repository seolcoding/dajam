-- Allow anonymous orders on public sessions
-- Created: 2024-12-22
-- Issue: Anonymous users cannot place orders because RLS requires auth.uid()

-- ============================================================
-- DROP AND RECREATE ORDERS INSERT POLICY
-- ============================================================

DROP POLICY IF EXISTS "orders_insert" ON public.orders;

-- 새 정책: 공개 세션에서는 익명 주문 허용
CREATE POLICY "orders_insert"
  ON public.orders FOR INSERT
  WITH CHECK (
    -- 조건 1: 인증된 사용자이고 세션 참여자인 경우
    (
      auth.uid() IS NOT NULL
      AND session_id IN (SELECT public.get_user_session_ids(auth.uid()))
      AND public.get_user_session_role(session_id, auth.uid()) IN ('host', 'moderator', 'participant')
    )
    OR
    -- 조건 2: 공개 세션에서는 익명 주문 허용 (user_id가 NULL)
    (
      public.is_session_public(session_id)
      AND user_id IS NULL
    )
  );

-- ============================================================
-- ALSO UPDATE ORDERS SELECT FOR PUBLIC SESSIONS
-- ============================================================

DROP POLICY IF EXISTS "orders_select" ON public.orders;

CREATE POLICY "orders_select"
  ON public.orders FOR SELECT
  USING (
    -- 인증된 사용자: 자신이 참여한 세션의 주문 조회
    session_id IN (SELECT public.get_user_session_ids(auth.uid()))
    OR
    -- 공개 세션: 누구나 조회 가능
    public.is_session_public(session_id)
  );

-- ============================================================
-- COMMENT
-- ============================================================

COMMENT ON POLICY "orders_insert" ON public.orders IS 'Allow authenticated participants OR anonymous users on public sessions';
