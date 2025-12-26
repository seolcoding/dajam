-- ============================================================================
-- Fix user stats RPC function to match actual schema
-- - sessions.user_id → sessions.host_id
-- - participant_count → COUNT from session_participants
-- ============================================================================

-- Drop and recreate function
DROP FUNCTION IF EXISTS get_user_stats(UUID, TEXT);

-- 사용자 통계 조회 RPC 함수 (수정됨)
CREATE OR REPLACE FUNCTION get_user_stats(
  p_user_id UUID,
  p_period TEXT DEFAULT 'month'
)
RETURNS user_stats_result AS $$
DECLARE
  result user_stats_result;
  period_start TIMESTAMPTZ;
BEGIN
  -- 기간 시작일 계산
  period_start := get_period_start_date(p_period);

  -- 총 세션 수 (기간 내, host_id 기준)
  SELECT COUNT(*)::INTEGER INTO result.total_sessions
  FROM sessions
  WHERE host_id = p_user_id
    AND created_at >= period_start;

  -- 총 참여자 수 (기간 내, session_participants에서 COUNT)
  SELECT COALESCE(COUNT(sp.id), 0)::INTEGER INTO result.total_participants
  FROM session_participants sp
  INNER JOIN sessions s ON sp.session_id = s.id
  WHERE s.host_id = p_user_id
    AND s.created_at >= period_start;

  -- 활성 세션 수
  SELECT COUNT(*)::INTEGER INTO result.active_sessions
  FROM sessions
  WHERE host_id = p_user_id
    AND is_active = TRUE;

  -- 앱별 세션 수
  SELECT COALESCE(
    jsonb_object_agg(app_type, session_count),
    '{}'::JSONB
  ) INTO result.by_app_type
  FROM (
    SELECT app_type::TEXT, COUNT(*)::INTEGER as session_count
    FROM sessions
    WHERE host_id = p_user_id
      AND created_at >= period_start
    GROUP BY app_type
  ) AS app_stats;

  -- 일별/월별 세션 수
  IF p_period = 'year' THEN
    -- 연간: 월별 그룹화
    SELECT COALESCE(
      jsonb_agg(jsonb_build_object('date', date_key, 'count', session_count) ORDER BY date_key),
      '[]'::JSONB
    ) INTO result.by_date
    FROM (
      SELECT TO_CHAR(created_at, 'YYYY-MM') as date_key, COUNT(*)::INTEGER as session_count
      FROM sessions
      WHERE host_id = p_user_id
        AND created_at >= period_start
      GROUP BY date_key
    ) AS monthly_stats;
  ELSE
    -- 주간/월간: 일별 그룹화
    SELECT COALESCE(
      jsonb_agg(jsonb_build_object('date', date_key, 'count', session_count) ORDER BY date_key),
      '[]'::JSONB
    ) INTO result.by_date
    FROM (
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date_key, COUNT(*)::INTEGER as session_count
      FROM sessions
      WHERE host_id = p_user_id
        AND created_at >= period_start
      GROUP BY date_key
    ) AS daily_stats;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION get_user_stats(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION get_user_stats IS '사용자 통계 조회 - 대시보드 UsageStats 컴포넌트용 (수정됨: host_id 사용)';
