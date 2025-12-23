-- Supabase Seed Data for Mini Apps
-- Created: 2024-12-22

-- ============================================================
-- 1. CHOSUNG QUIZ - Sample Questions
-- ============================================================

INSERT INTO chosung_questions (word, chosung, category, difficulty, hint_1, hint_2, hint_3) VALUES
-- Movies (Easy)
('어벤져스', 'ㅇㅂㅈㅅ', 'movie', 'easy', '마블', '슈퍼히어로', '아이언맨, 캡틴 아메리카'),
('타이타닉', 'ㅌㅇㅌㄴ', 'movie', 'easy', '배', '침몰', '레오나르도 디카프리오'),
('겨울왕국', 'ㄱㅇㅇㄱ', 'movie', 'easy', '디즈니', '눈', '렛잇고'),
('기생충', 'ㄱㅅㅊ', 'movie', 'normal', '봉준호', '아카데미', '반지하'),
('명량', 'ㅁㄹ', 'movie', 'normal', '이순신', '바다', '거북선'),

-- Movies (Normal)
('쇼생크탈출', 'ㅅㅅㅌㅊ', 'movie', 'normal', '감옥', '무죄', '팀 로빈스'),
('인터스텔라', 'ㅇㅌㅅㅌㄹ', 'movie', 'normal', '우주', '블랙홀', '크리스토퍼 놀란'),
('그래비티', 'ㄱㄹㅂㅌ', 'movie', 'normal', '우주', '산드라 블록', '무중력'),

-- Movies (Hard)
('포레스트검프', 'ㅍㄹㅅㅌㄱㅍ', 'movie', 'hard', '톰 행크스', '달리기', '초콜릿'),
('인셉션', 'ㅇㅅㅅ', 'movie', 'hard', '꿈', '레오나르도 디카프리오', '팽이'),

-- Food (Easy)
('김치찌개', 'ㄱㅊㅉㄱ', 'food', 'easy', '한국음식', '빨간색', '돼지고기'),
('불고기', 'ㅂㄱㄱ', 'food', 'easy', '한국음식', '달달한', '고기'),
('피자', 'ㅍㅈ', 'food', 'easy', '이탈리아', '치즈', '도우'),
('치킨', 'ㅊㅋ', 'food', 'easy', '프라이드', '양념', '맥주'),
('떡볶이', 'ㄸㅂㅇ', 'food', 'easy', '길거리음식', '빨간색', '매운맛'),

-- Food (Normal)
('파스타', 'ㅍㅅㅌ', 'food', 'normal', '이탈리아', '면', '소스'),
('햄버거', 'ㅎㅂㄱ', 'food', 'normal', '패티', '빵', '패스트푸드'),
('돈가스', 'ㄷㄱㅅ', 'food', 'normal', '일본', '튀김', '돼지고기'),

-- Proverbs (Easy)
('티끌모아태산', 'ㅌㄲㅁㅇㅌㅅ', 'proverb', 'easy', '작은것', '모으기', '산'),
('백지장도맞들면낫다', 'ㅂㅈㅈㄷㅁㄷㅁㄴㄷ', 'proverb', 'easy', '협력', '둘이서', '종이'),
('소문난잔치에먹을것없다', 'ㅅㅁㄴㅈㅊㅇㅁㄱㄱㅇㄷ', 'proverb', 'normal', '기대', '실망', '잔치'),

-- K-pop (Easy)
('방탄소년단', 'ㅂㅌㅅㄴㄷ', 'kpop', 'easy', 'BTS', '아이돌', '7명'),
('블랙핑크', 'ㅂㄹㅍㅋ', 'kpop', 'easy', '걸그룹', '4명', 'DDU-DU DDU-DU'),
('엑소', 'ㅇㅅ', 'kpop', 'easy', '남자아이돌', 'SM', '으르렁'),

-- K-pop (Normal)
('트와이스', 'ㅌㅇㅇㅅ', 'kpop', 'normal', '걸그룹', 'JYP', 'TWICE'),
('세븐틴', 'ㅅㅂㅌ', 'kpop', 'normal', '보이그룹', '13명', '자체제작'),
('아이유', 'ㅇㅇㅇ', 'kpop', 'normal', '솔로', '국민여동생', '좋은날'),

-- Celebrity (Easy)
('유재석', 'ㅇㅈㅅ', 'celebrity', 'easy', '개그맨', '무한도전', '국민MC'),
('송강호', 'ㅅㄱㅎ', 'celebrity', 'easy', '배우', '기생충', '변호인'),
('전지현', 'ㅈㅈㅎ', 'celebrity', 'easy', '배우', '전설의고향', '별그대'),

-- Celebrity (Normal)
('박보검', 'ㅂㅂㄱ', 'celebrity', 'normal', '배우', '구르미', '청춘'),
('아이유', 'ㅇㅇㅇ', 'celebrity', 'normal', '가수', '국민여동생', '좋은날'),

-- Drama (Easy)
('별에서온그대', 'ㅂㅇㅅㅇㄱㄷ', 'drama', 'easy', '외계인', '김수현', '전지현'),
('도깨비', 'ㄷㄲㅂ', 'drama', 'easy', '공유', '김고은', '메밀꽃'),
('태양의후예', 'ㅌㅇㅇㅎㅇ', 'drama', 'easy', '송중기', '송혜교', '군인'),

-- Drama (Normal)
('스카이캐슬', 'ㅅㅋㅇㅋㅅ', 'drama', 'normal', '입시', '강준상', '엄마들'),
('이태원클라쓰', 'ㅇㅌㅇㅋㄹㅆ', 'drama', 'normal', '박서준', '술집', '복수');

-- ============================================================
-- 2. IDEAL WORLDCUP - Sample Tournament
-- ============================================================

-- Sample Tournament: Korean Food Worldcup
INSERT INTO worldcup_tournaments (id, title, description, total_rounds, is_public)
VALUES
    ('00000000-0000-0000-0000-000000000001', '한국 음식 월드컵', '가장 좋아하는 한국 음식을 선택하세요!', 16, true);

-- Sample Candidates
INSERT INTO worldcup_candidates (tournament_id, name, display_order) VALUES
    ('00000000-0000-0000-0000-000000000001', '김치찌개', 1),
    ('00000000-0000-0000-0000-000000000001', '불고기', 2),
    ('00000000-0000-0000-0000-000000000001', '떡볶이', 3),
    ('00000000-0000-0000-0000-000000000001', '삼겹살', 4),
    ('00000000-0000-0000-0000-000000000001', '치킨', 5),
    ('00000000-0000-0000-0000-000000000001', '짜장면', 6),
    ('00000000-0000-0000-0000-000000000001', '짬뽕', 7),
    ('00000000-0000-0000-0000-000000000001', '라면', 8),
    ('00000000-0000-0000-0000-000000000001', '김밥', 9),
    ('00000000-0000-0000-0000-000000000001', '돈가스', 10),
    ('00000000-0000-0000-0000-000000000001', '갈비', 11),
    ('00000000-0000-0000-0000-000000000001', '냉면', 12),
    ('00000000-0000-0000-0000-000000000001', '비빔밥', 13),
    ('00000000-0000-0000-0000-000000000001', '순대', 14),
    ('00000000-0000-0000-0000-000000000001', '족발', 15),
    ('00000000-0000-0000-0000-000000000001', '피자', 16);

-- Initialize stats for candidates (all zeros initially)
INSERT INTO worldcup_candidate_stats (candidate_id, tournament_id)
SELECT id, tournament_id FROM worldcup_candidates WHERE tournament_id = '00000000-0000-0000-0000-000000000001';

-- ============================================================
-- 3. BALANCE GAME - Sample Questions
-- ============================================================

INSERT INTO balance_questions (title, category, option_a, option_b, is_public) VALUES
-- General
('평생 여름 vs 평생 겨울', 'general', '평생 여름', '평생 겨울'),
('과거로 가기 vs 미래로 가기', 'general', '과거로 가기', '미래로 가기'),
('투명인간 vs 하늘을 나는 능력', 'general', '투명인간', '하늘을 나는 능력'),
('시간 정지 vs 마음 읽기', 'general', '시간 정지', '마음 읽기'),
('돈 많은 삶 vs 시간 많은 삶', 'general', '돈 많은 삶', '시간 많은 삶'),

-- Food
('평생 한식만 vs 평생 양식만', 'food', '평생 한식만', '평생 양식만'),
('치킨 vs 피자', 'food', '치킨', '피자'),
('짜장면 vs 짬뽕', 'food', '짜장면', '짬뽕'),
('커피 vs 차', 'food', '커피', '차'),
('달콤한 맛 vs 짭짤한 맛', 'food', '달콤한 맛', '짭짤한 맛'),

-- Travel
('국내여행 vs 해외여행', 'travel', '국내여행', '해외여행'),
('바다 vs 산', 'travel', '바다', '산'),
('혼자 여행 vs 단체 여행', 'travel', '혼자 여행', '단체 여행'),
('계획적인 여행 vs 즉흥적인 여행', 'travel', '계획적인 여행', '즉흥적인 여행'),
('도시 여행 vs 자연 여행', 'travel', '도시 여행', '자연 여행'),

-- Values
('건강한 가난 vs 병든 부자', 'values', '건강한 가난', '병든 부자'),
('사랑받는 삶 vs 존경받는 삶', 'values', '사랑받는 삶', '존경받는 삶'),
('좋아하는 일 vs 잘하는 일', 'values', '좋아하는 일', '잘하는 일'),
('명예 vs 돈', 'values', '명예', '돈'),
('자유 vs 안정', 'values', '자유', '안정'),

-- Romance
('첫사랑과 재회 vs 운명적인 만남', 'romance', '첫사랑과 재회', '운명적인 만남'),
('다정한 사람 vs 재미있는 사람', 'romance', '다정한 사람', '재미있는 사람'),
('평범한 연애 vs 드라마틱한 연애', 'romance', '평범한 연애', '드라마틱한 연애'),

-- Work
('높은 연봉, 스트레스 많음 vs 적은 연봉, 워라밸', 'work', '높은 연봉, 스트레스', '적은 연봉, 워라밸'),
('대기업 vs 스타트업', 'work', '대기업', '스타트업'),
('재택근무 vs 사무실 출근', 'work', '재택근무', '사무실 출근');

-- Initialize stats for all questions
INSERT INTO balance_question_stats (question_id)
SELECT id FROM balance_questions;

-- ============================================================
-- 4. LIVE VOTING - No seed data needed
-- ============================================================
-- Live polls are created dynamically by users

-- ============================================================
-- 5. STUDENT NETWORK - No seed data needed
-- ============================================================
-- Student profiles and rooms are created by users

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Count inserted data
DO $$
DECLARE
    chosung_count INTEGER;
    worldcup_count INTEGER;
    balance_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO chosung_count FROM chosung_questions;
    SELECT COUNT(*) INTO worldcup_count FROM worldcup_candidates;
    SELECT COUNT(*) INTO balance_count FROM balance_questions;

    RAISE NOTICE 'Seed data inserted successfully:';
    RAISE NOTICE '  - Chosung questions: %', chosung_count;
    RAISE NOTICE '  - Worldcup candidates: %', worldcup_count;
    RAISE NOTICE '  - Balance questions: %', balance_count;
END $$;
