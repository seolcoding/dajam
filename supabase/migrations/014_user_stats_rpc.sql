-- ============================================================================
-- 사용자 통계 RPC 함수
-- 대시보드 UsageStats 컴포넌트에서 사용
-- ============================================================================

-- 반환 타입 정의
DROP TYPE IF EXISTS user_stats_result CASCADE;
CREATE TYPE user_stats_result AS (
  total_sessions INTEGER,
  total_participants INTEGER,
  active_sessions INTEGER,
  by_app_type JSONB,
  by_date JSONB
);

-- 기간에 따른 시작일 계산 함수
CREATE OR REPLACE FUNCTION get_period_start_date(p_period TEXT)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN CASE p_period
    WHEN 'week' THEN NOW() - INTERVAL '7 days'
    WHEN 'month' THEN NOW() - INTERVAL '30 days'
    WHEN 'year' THEN NOW() - INTERVAL '365 days'
    ELSE NOW() - INTERVAL '30 days'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 사용자 통계 조회 RPC 함수
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

  -- 총 세션 수 (기간 내)
  SELECT COUNT(*)::INTEGER INTO result.total_sessions
  FROM sessions
  WHERE user_id = p_user_id
    AND created_at >= period_start;

  -- 총 참여자 수 (기간 내)
  SELECT COALESCE(SUM(participant_count), 0)::INTEGER INTO result.total_participants
  FROM sessions
  WHERE user_id = p_user_id
    AND created_at >= period_start;

  -- 활성 세션 수
  SELECT COUNT(*)::INTEGER INTO result.active_sessions
  FROM sessions
  WHERE user_id = p_user_id
    AND status = 'active';

  -- 앱별 세션 수
  SELECT COALESCE(
    jsonb_object_agg(app_type, session_count),
    '{}'::JSONB
  ) INTO result.by_app_type
  FROM (
    SELECT app_type, COUNT(*)::INTEGER as session_count
    FROM sessions
    WHERE user_id = p_user_id
      AND created_at >= period_start
    GROUP BY app_type
  ) AS app_stats;

  -- 일별 세션 수 (period에 따라 다르게 그룹화)
  IF p_period = 'year' THEN
    -- 연간: 월별 그룹화
    SELECT COALESCE(
      jsonb_agg(jsonb_build_object('date', date_key, 'count', session_count) ORDER BY date_key),
      '[]'::JSONB
    ) INTO result.by_date
    FROM (
      SELECT TO_CHAR(created_at, 'YYYY-MM') as date_key, COUNT(*)::INTEGER as session_count
      FROM sessions
      WHERE user_id = p_user_id
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
      WHERE user_id = p_user_id
        AND created_at >= period_start
      GROUP BY date_key
    ) AS daily_stats;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION get_user_stats(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_period_start_date(TEXT) TO authenticated;

-- 코멘트 추가
COMMENT ON FUNCTION get_user_stats IS '사용자 통계 조회 - 대시보드 UsageStats 컴포넌트용';
COMMENT ON TYPE user_stats_result IS '사용자 통계 반환 타입';
