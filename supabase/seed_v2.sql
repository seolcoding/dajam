-- ============================================================
-- DAJAM V2 Seed Data
-- 더미 데이터 삽입
-- ============================================================

-- 1. 기관 (Institutions)
INSERT INTO public.institutions (id, name, type, description, phone, email, address, plan_type)
VALUES
    ('11111111-1111-1111-1111-111111111111', '서울시 강남구 평생학습관', 'lifelong_learning', '강남구민을 위한 평생교육 프로그램 운영', '02-1234-5678', 'gangnam-edu@seoul.go.kr', '서울시 강남구 테헤란로 123', 'pro'),
    ('22222222-2222-2222-2222-222222222222', '행복한 노인복지관', 'senior_center', '시니어 디지털 교육 전문', '02-9876-5432', 'happy-senior@welfare.org', '서울시 서초구 서초대로 456', 'basic'),
    ('33333333-3333-3333-3333-333333333333', '테크스타트업 주식회사', 'corporation', '임직원 교육 및 워크샵', '02-5555-1234', 'hr@techstartup.co.kr', '서울시 성동구 성수이로 789', 'enterprise')
ON CONFLICT DO NOTHING;

-- 2. 워크스페이스 (Workspaces) - 기관 소속 또는 개인
INSERT INTO public.workspaces (id, institution_id, owner_id, name, slug, description, plan_type)
SELECT
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    p.id,
    '김강사의 디지털 교실',
    'kim-digital',
    '스마트폰 활용 및 디지털 리터러시 강의',
    'pro'
FROM public.profiles p
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.workspaces (id, institution_id, owner_id, name, slug, description, plan_type)
SELECT
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    p.id,
    '시니어 스마트폰 교실',
    'senior-smartphone',
    '어르신을 위한 스마트폰 기초 교육',
    'basic'
FROM public.profiles p
LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. 연락처/수강생 (Contacts)
INSERT INTO public.contacts (id, workspace_id, name, phone, email, source, tags, marketing_consent, sessions_attended)
SELECT
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444444',
    names.name,
    names.phone,
    names.email,
    'manual',
    names.tags,
    '{"sms": true, "email": true, "kakao": false}'::jsonb,
    floor(random() * 10)::int
FROM (VALUES
    ('김영희', '010-1234-5678', 'yhkim@email.com', ARRAY['VIP', '재수강']),
    ('이철수', '010-2345-6789', 'cslee@email.com', ARRAY['신규']),
    ('박민수', '010-3456-7890', 'mspark@email.com', ARRAY['시니어', 'VIP']),
    ('최지영', '010-4567-8901', 'jychoi@email.com', ARRAY['시니어']),
    ('정하나', '010-5678-9012', 'hnjung@email.com', ARRAY['신규', '추천'])
) AS names(name, phone, email, tags)
WHERE EXISTS (SELECT 1 FROM public.workspaces WHERE id = '44444444-4444-4444-4444-444444444444')
ON CONFLICT DO NOTHING;

-- 4. 세션 요소 (Session Elements) - 기존 세션에 요소 추가
-- 먼저 활성 세션이 있는지 확인하고 추가
DO $$
DECLARE
    v_session_id UUID;
BEGIN
    -- 가장 최근 세션 찾기
    SELECT id INTO v_session_id FROM public.sessions ORDER BY created_at DESC LIMIT 1;

    IF v_session_id IS NOT NULL THEN
        -- Poll 요소 추가
        INSERT INTO public.session_elements (session_id, element_type, title, config, state, order_index, is_active)
        VALUES (
            v_session_id,
            'poll',
            '오늘 강의 만족도는?',
            '{
                "options": [
                    {"id": "1", "text": "매우 만족", "color": "#22c55e"},
                    {"id": "2", "text": "만족", "color": "#84cc16"},
                    {"id": "3", "text": "보통", "color": "#eab308"},
                    {"id": "4", "text": "불만족", "color": "#f97316"},
                    {"id": "5", "text": "매우 불만족", "color": "#ef4444"}
                ],
                "allowMultiple": false,
                "showResults": true,
                "anonymousVoting": true
            }'::jsonb,
            '{"isOpen": true, "totalVotes": 0}'::jsonb,
            0,
            true
        );

        -- Quiz 요소 추가
        INSERT INTO public.session_elements (session_id, element_type, title, config, state, order_index)
        VALUES (
            v_session_id,
            'quiz',
            '스마트폰 기초 퀴즈',
            '{
                "questions": [
                    {
                        "id": "q1",
                        "text": "스마트폰에서 사진을 찍으려면 어떤 앱을 사용하나요?",
                        "type": "multiple_choice",
                        "options": ["카메라", "갤러리", "설정", "전화"],
                        "correctAnswer": 0,
                        "points": 10
                    },
                    {
                        "id": "q2",
                        "text": "와이파이는 인터넷 연결 방식이다",
                        "type": "true_false",
                        "correctAnswer": true,
                        "points": 10
                    }
                ],
                "shuffleQuestions": false,
                "showCorrectAnswer": true
            }'::jsonb,
            '{"currentQuestionIndex": 0, "isRevealed": false, "scores": {}}'::jsonb,
            1
        );

        -- Word Cloud 요소 추가
        INSERT INTO public.session_elements (session_id, element_type, title, config, state, order_index)
        VALUES (
            v_session_id,
            'word_cloud',
            '오늘 배운 내용 중 기억나는 단어는?',
            '{
                "maxWords": 3,
                "minLength": 2,
                "maxLength": 20,
                "allowDuplicates": false,
                "profanityFilter": true
            }'::jsonb,
            '{"words": []}'::jsonb,
            2
        );

        -- Balance Game 요소 추가
        INSERT INTO public.session_elements (session_id, element_type, title, config, state, order_index)
        VALUES (
            v_session_id,
            'balance_game',
            '이것 vs 저것',
            '{
                "questions": [
                    {
                        "id": "b1",
                        "optionA": {"text": "카카오톡", "image": null},
                        "optionB": {"text": "문자메시지", "image": null}
                    },
                    {
                        "id": "b2",
                        "optionA": {"text": "유튜브", "image": null},
                        "optionB": {"text": "TV", "image": null}
                    }
                ]
            }'::jsonb,
            '{"currentQuestionIndex": 0}'::jsonb,
            3
        );

        RAISE NOTICE 'Session elements created for session: %', v_session_id;
    ELSE
        RAISE NOTICE 'No sessions found. Creating a demo session first.';

        -- 데모 세션 생성
        INSERT INTO public.sessions (id, code, app_type, title, is_active, is_public, max_participants)
        VALUES (
            gen_random_uuid(),
            'DEMO01',
            'audience-engage',
            '데모 프레젠테이션',
            true,
            true,
            50
        )
        RETURNING id INTO v_session_id;

        -- 그리고 요소 추가
        INSERT INTO public.session_elements (session_id, element_type, title, config, state, order_index, is_active)
        VALUES (
            v_session_id,
            'poll',
            '오늘 강의 기대되시나요?',
            '{
                "options": [
                    {"id": "1", "text": "매우 기대됨", "color": "#22c55e"},
                    {"id": "2", "text": "기대됨", "color": "#84cc16"},
                    {"id": "3", "text": "보통", "color": "#eab308"}
                ],
                "allowMultiple": false,
                "showResults": true,
                "anonymousVoting": true
            }'::jsonb,
            '{"isOpen": true, "totalVotes": 0}'::jsonb,
            0,
            true
        );

        RAISE NOTICE 'Demo session created: %', v_session_id;
    END IF;
END $$;

-- 5. 샘플 응답 (Element Responses) - 요소에 대한 응답
DO $$
DECLARE
    v_element_id UUID;
    v_session_id UUID;
BEGIN
    -- Poll 요소 찾기
    SELECT se.id, se.session_id INTO v_element_id, v_session_id
    FROM public.session_elements se
    WHERE se.element_type = 'poll'
    LIMIT 1;

    IF v_element_id IS NOT NULL THEN
        -- 더미 응답 추가
        INSERT INTO public.element_responses (element_id, session_id, response_type, anonymous_id, display_name, data)
        VALUES
            (v_element_id, v_session_id, 'vote', 'anon-001', '익명1', '{"selectedOption": "1"}'::jsonb),
            (v_element_id, v_session_id, 'vote', 'anon-002', '익명2', '{"selectedOption": "1"}'::jsonb),
            (v_element_id, v_session_id, 'vote', 'anon-003', '익명3', '{"selectedOption": "2"}'::jsonb),
            (v_element_id, v_session_id, 'vote', 'anon-004', '익명4', '{"selectedOption": "2"}'::jsonb),
            (v_element_id, v_session_id, 'vote', 'anon-005', '익명5', '{"selectedOption": "3"}'::jsonb);

        -- 집계 업데이트
        INSERT INTO public.element_aggregates (element_id, aggregate_key, count)
        VALUES
            (v_element_id, '1', 2),
            (v_element_id, '2', 2),
            (v_element_id, '3', 1)
        ON CONFLICT (element_id, aggregate_key)
        DO UPDATE SET count = EXCLUDED.count;

        RAISE NOTICE 'Sample responses added for poll: %', v_element_id;
    END IF;
END $$;

-- 완료 메시지
DO $$ BEGIN RAISE NOTICE 'V2 Seed data insertion complete!'; END $$;
