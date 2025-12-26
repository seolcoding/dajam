-- ============================================================================
-- 통계 테스트용 시드 데이터
-- UsageStats 컴포넌트 테스트 및 UI 확인용
-- ============================================================================

-- 테스트용 사용자 ID (실제 로그인한 사용자 ID로 대체 필요)
-- 이 스크립트는 개발 환경에서만 사용
DO $$
DECLARE
  v_test_user_id UUID;
  v_session_id UUID;
  v_i INTEGER;
  v_app_types TEXT[] := ARRAY['live-voting', 'balance-game', 'chosung-quiz', 'ideal-worldcup', 'bingo-game', 'group-order'];
  v_app_type TEXT;
  v_days_ago INTEGER;
  v_participant_count INTEGER;
BEGIN
  -- 테스트 사용자 조회 (첫 번째 프로필 사용)
  SELECT id INTO v_test_user_id FROM public.profiles LIMIT 1;

  IF v_test_user_id IS NULL THEN
    RAISE NOTICE 'No profiles found. Skipping seed data.';
    RETURN;
  END IF;

  RAISE NOTICE 'Creating seed data for user: %', v_test_user_id;

  -- 기존 테스트 세션 삭제 (title이 '[TEST]'로 시작하는 것)
  DELETE FROM public.sessions WHERE title LIKE '[TEST]%' AND host_id = v_test_user_id;

  -- 지난 30일간 다양한 세션 생성
  FOR v_i IN 1..25 LOOP
    -- 랜덤 앱 타입 선택
    v_app_type := v_app_types[1 + floor(random() * array_length(v_app_types, 1))::INTEGER];

    -- 랜덤 일수 (0-29일 전)
    v_days_ago := floor(random() * 30)::INTEGER;

    -- 랜덤 참여자 수 (3-20명)
    v_participant_count := 3 + floor(random() * 18)::INTEGER;

    -- 세션 생성
    INSERT INTO public.sessions (
      app_type,
      title,
      host_id,
      config,
      is_active,
      is_public,
      created_at,
      updated_at
    ) VALUES (
      v_app_type::public.app_type,
      '[TEST] ' || v_app_type || ' 세션 #' || v_i,
      v_test_user_id,
      jsonb_build_object('test', true, 'seed', true),
      CASE WHEN v_i <= 2 THEN TRUE ELSE FALSE END, -- 2개만 활성
      TRUE,
      NOW() - (v_days_ago || ' days')::INTERVAL,
      NOW() - (v_days_ago || ' days')::INTERVAL
    )
    RETURNING id INTO v_session_id;

    -- 각 세션에 참여자 추가
    FOR v_j IN 1..v_participant_count LOOP
      INSERT INTO public.session_participants (
        session_id,
        user_id,
        display_name,
        role,
        joined_at
      ) VALUES (
        v_session_id,
        NULL, -- 익명 참여자
        '참여자 ' || v_j,
        'participant',
        NOW() - (v_days_ago || ' days')::INTERVAL
      );
    END LOOP;

    RAISE NOTICE 'Created session: % with % participants', v_session_id, v_participant_count;
  END LOOP;

  -- 요약 출력
  RAISE NOTICE '=== Seed Data Summary ===';
  RAISE NOTICE 'Total sessions created: 25';
  RAISE NOTICE 'Active sessions: 2';
  RAISE NOTICE 'User ID: %', v_test_user_id;
END $$;

-- 생성된 데이터 확인용 쿼리
-- SELECT
--   app_type,
--   COUNT(*) as session_count,
--   SUM((SELECT COUNT(*) FROM session_participants sp WHERE sp.session_id = s.id)) as total_participants
-- FROM sessions s
-- WHERE title LIKE '[TEST]%'
-- GROUP BY app_type;
