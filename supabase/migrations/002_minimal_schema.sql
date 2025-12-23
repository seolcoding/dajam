-- Supabase Minimal Schema for SeolCoding Apps
-- Created: 2024-12-22
-- Updated: 2024-12-22 (권한 체계 + 랜덤 닉네임 + 활동 기록)
-- Architecture: 3-Layer Progressive Enhancement
--
-- Layer 1: Core (profiles + nicknames + activity) - OAuth 필수
-- Layer 2: Sessions + Roles - 멀티유저 앱용 통합 세션
-- Layer 3: App-Specific - 필요시 점진적 추가

-- ============================================================
-- LAYER 1: CORE (Users & Nicknames)
-- ============================================================

-- App types enum (defined early for use in activity_logs and sessions)
CREATE TYPE public.app_type AS ENUM (
  'live-voting',
  'student-network',
  'group-order',
  'balance-game',
  'chosung-quiz',
  'ideal-worldcup',
  'bingo-game',
  'ladder-game',
  'team-divider',
  'salary-calculator',
  'rent-calculator',
  'gpa-calculator',
  'dutch-pay',
  'random-picker',
  'lunch-roulette',
  'id-validator'
);

-- Session role enum (defined early for consistency)
CREATE TYPE public.session_role AS ENUM (
  'host',        -- 방장: 모든 권한 (설정 변경, 강퇴, 종료)
  'moderator',   -- 부방장: 진행 권한 (다음 라운드, 결과 공개)
  'participant', -- 참여자: 투표, 선택 가능
  'spectator'    -- 관전자: 보기만 가능
);

-- ============================================================
-- 랜덤 닉네임 시스템 (형용사 + 동사 + 명사 = 375,000 조합)
-- 50 형용사 × 50 동사 × 150 명사 = 375,000
-- ============================================================

-- 형용사 (50개)
CREATE TABLE IF NOT EXISTS public.nickname_adjectives (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE
);

-- 동사 (50개) - 새로 추가
CREATE TABLE IF NOT EXISTS public.nickname_verbs (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE
);

-- 명사 (50개) - 동물, 로봇, 곤충, 물고기 등
CREATE TABLE IF NOT EXISTS public.nickname_nouns (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  category TEXT -- 분류용 (선택)
);

-- 형용사 50개
INSERT INTO public.nickname_adjectives (word) VALUES
  -- 감정/성격 (20)
  ('배고픈'), ('졸린'), ('신난'), ('용감한'), ('수줍은'),
  ('호기심많은'), ('느긋한'), ('열정적인'), ('차분한'), ('엉뚱한'),
  ('귀여운'), ('멋진'), ('똑똑한'), ('재빠른'), ('우아한'),
  ('다정한'), ('씩씩한'), ('명랑한'), ('소심한'), ('당당한'),
  -- 외형/상태 (15)
  ('반짝이는'), ('포근한'), ('작은'), ('거대한'), ('날렵한'),
  ('통통한'), ('늠름한'), ('깜찍한'), ('화려한'), ('소박한'),
  ('빛나는'), ('산뜻한'), ('풍성한'), ('단단한'), ('말랑한'),
  -- 분위기 (15)
  ('신비로운'), ('고요한'), ('활발한'), ('점잖은'), ('유쾌한'),
  ('진지한'), ('천진난만한'), ('낭만적인'), ('자유로운'), ('평화로운'),
  ('행복한'), ('몽환적인'), ('청량한'), ('따뜻한'), ('시원한')
ON CONFLICT (word) DO NOTHING;

-- 동사 50개 (현재진행형 느낌)
INSERT INTO public.nickname_verbs (word) VALUES
  -- 움직임 (15)
  ('달리는'), ('뛰어다니는'), ('날아가는'), ('헤엄치는'), ('기어가는'),
  ('걸어가는'), ('춤추는'), ('구르는'), ('점프하는'), ('미끄러지는'),
  ('돌진하는'), ('활주하는'), ('질주하는'), ('산책하는'), ('순찰하는'),
  -- 행동 (20)
  ('노래하는'), ('웃고있는'), ('잠자는'), ('꿈꾸는'), ('생각하는'),
  ('탐험하는'), ('발견하는'), ('만드는'), ('고치는'), ('그리는'),
  ('요리하는'), ('먹고있는'), ('놀고있는'), ('일하는'), ('공부하는'),
  ('여행하는'), ('모험하는'), ('수집하는'), ('관찰하는'), ('연구하는'),
  -- 상태/감정표현 (15)
  ('기다리는'), ('응원하는'), ('축하하는'), ('인사하는'), ('손흔드는'),
  ('윙크하는'), ('깜빡이는'), ('두근거리는'), ('설레는'), ('방긋웃는'),
  ('빙글도는'), ('반짝거리는'), ('속삭이는'), ('외치는'), ('노력하는')
ON CONFLICT (word) DO NOTHING;

-- 명사 150개 (동물만 - 저작권 없는 일반 명사)
-- 포유류(50) + 조류(30) + 해양(30) + 곤충(20) + 절지동물(4) + 연체동물(1) + 파충류/양서류(15) = 150
INSERT INTO public.nickname_nouns (word, category) VALUES
  -- 포유류 (50)
  ('너구리', '포유류'), ('고양이', '포유류'), ('강아지', '포유류'), ('토끼', '포유류'),
  ('여우', '포유류'), ('판다', '포유류'), ('코알라', '포유류'), ('수달', '포유류'),
  ('햄스터', '포유류'), ('다람쥐', '포유류'), ('알파카', '포유류'), ('미어캣', '포유류'),
  ('카피바라', '포유류'), ('비버', '포유류'), ('고슴도치', '포유류'), ('사슴', '포유류'),
  ('염소', '포유류'), ('양', '포유류'), ('돼지', '포유류'), ('소', '포유류'),
  ('곰', '포유류'), ('늑대', '포유류'), ('호랑이', '포유류'), ('사자', '포유류'),
  ('표범', '포유류'), ('치타', '포유류'), ('하마', '포유류'), ('코뿔소', '포유류'),
  ('기린', '포유류'), ('코끼리', '포유류'), ('원숭이', '포유류'), ('고릴라', '포유류'),
  ('침팬지', '포유류'), ('오랑우탄', '포유류'), ('나무늘보', '포유류'), ('청설모', '포유류'),
  ('족제비', '포유류'), ('오소리', '포유류'), ('담비', '포유류'), ('스컹크', '포유류'),
  ('아르마딜로', '포유류'), ('캥거루', '포유류'), ('왈라비', '포유류'), ('웜뱃', '포유류'),
  ('두더지', '포유류'), ('쥐', '포유류'), ('박쥐', '포유류'), ('고래', '포유류'),
  ('물소', '포유류'), ('들소', '포유류'),
  -- 조류 (30)
  ('펭귄', '조류'), ('부엉이', '조류'), ('참새', '조류'), ('독수리', '조류'),
  ('앵무새', '조류'), ('플라밍고', '조류'), ('공작새', '조류'), ('까치', '조류'),
  ('제비', '조류'), ('두루미', '조류'), ('백조', '조류'), ('오리', '조류'),
  ('거위', '조류'), ('닭', '조류'), ('비둘기', '조류'), ('딱따구리', '조류'),
  ('올빼미', '조류'), ('까마귀', '조류'), ('갈매기', '조류'), ('타조', '조류'),
  ('꿩', '조류'), ('앵두새', '조류'), ('뻐꾸기', '조류'), ('꾀꼬리', '조류'),
  ('황새', '조류'), ('백로', '조류'), ('왜가리', '조류'), ('물총새', '조류'),
  ('호반새', '조류'), ('찌르레기', '조류'),
  -- 해양생물 (30)
  ('돌고래', '해양'), ('상어', '해양'), ('해파리', '해양'), ('문어', '해양'),
  ('거북이', '해양'), ('오징어', '해양'), ('새우', '해양'), ('범고래', '해양'),
  ('가재', '해양'), ('게', '해양'), ('바다표범', '해양'), ('물개', '해양'),
  ('해마', '해양'), ('가오리', '해양'), ('참치', '해양'), ('연어', '해양'),
  ('광어', '해양'), ('복어', '해양'), ('조개', '해양'), ('소라', '해양'),
  ('고등어', '해양'), ('꽁치', '해양'), ('멸치', '해양'), ('정어리', '해양'),
  ('잉어', '해양'), ('붕어', '해양'), ('메기', '해양'), ('미꾸라지', '해양'),
  ('장어', '해양'), ('낙지', '해양'),
  -- 곤충 (20)
  ('나비', '곤충'), ('무당벌레', '곤충'), ('반딧불이', '곤충'), ('꿀벌', '곤충'),
  ('잠자리', '곤충'), ('사마귀', '곤충'), ('개미', '곤충'), ('메뚜기', '곤충'),
  ('귀뚜라미', '곤충'), ('매미', '곤충'), ('장수풍뎅이', '곤충'), ('사슴벌레', '곤충'),
  ('호랑나비', '곤충'), ('풍뎅이', '곤충'), ('나방', '곤충'), ('파리', '곤충'),
  ('모기', '곤충'), ('딱정벌레', '곤충'), ('하늘소', '곤충'), ('바구미', '곤충'),
  -- 절지동물 (4)
  ('거미', '절지동물'), ('전갈', '절지동물'), ('지네', '절지동물'), ('노래기', '절지동물'),
  -- 연체동물 (1)
  ('달팽이', '연체동물'),
  -- 파충류/양서류 (15)
  ('도마뱀', '파충류'), ('카멜레온', '파충류'), ('개구리', '양서류'), ('두꺼비', '양서류'),
  ('도롱뇽', '양서류'), ('악어', '파충류'), ('이구아나', '파충류'), ('거북', '파충류'),
  ('뱀', '파충류'), ('자라', '파충류'), ('맹꽁이', '양서류'), ('청개구리', '양서류'),
  ('살모사', '파충류'), ('구렁이', '파충류'), ('코브라', '파충류')
ON CONFLICT (word) DO NOTHING;

-- 유니크 랜덤 닉네임 생성 함수 (3단어 조합)
-- 예: "배고픈 달리는 너구리", "신난 춤추는 판다"
CREATE OR REPLACE FUNCTION public.generate_unique_nickname()
RETURNS TEXT AS $$
DECLARE
  adj TEXT;
  verb TEXT;
  noun TEXT;
  candidate TEXT;
  suffix INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  -- 랜덤 형용사 + 동사 + 명사 선택
  SELECT word INTO adj FROM public.nickname_adjectives ORDER BY random() LIMIT 1;
  SELECT word INTO verb FROM public.nickname_verbs ORDER BY random() LIMIT 1;
  SELECT word INTO noun FROM public.nickname_nouns ORDER BY random() LIMIT 1;

  -- NULL 방어: 테이블이 비어있을 경우 기본값 사용
  IF adj IS NULL THEN adj := '익명의'; END IF;
  IF verb IS NULL THEN verb := '숨어있는'; END IF;
  IF noun IS NULL THEN noun := '사용자'; END IF;

  candidate := adj || ' ' || verb || ' ' || noun;

  -- 유니크할 때까지 시도 (숫자 suffix 추가)
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE nickname = candidate) AND suffix < max_attempts LOOP
    suffix := suffix + 1;
    candidate := adj || ' ' || verb || ' ' || noun || suffix::TEXT;
  END LOOP;

  -- max_attempts 초과 시 UUID 기반 fallback
  IF suffix >= max_attempts THEN
    candidate := '사용자_' || substr(gen_random_uuid()::TEXT, 1, 8);
  END IF;

  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- User profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  email TEXT,
  provider TEXT CHECK (provider IN ('google', 'kakao', 'anonymous')),
  is_admin BOOLEAN DEFAULT FALSE NOT NULL, -- 전체 관리자
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-create profile on user signup (with random nickname fallback)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_nickname TEXT;
BEGIN
  -- OAuth에서 닉네임 가져오기, 없으면 랜덤 생성
  user_nickname := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'nickname',
    NEW.raw_user_meta_data->>'full_name',
    public.generate_unique_nickname()
  );

  -- 닉네임 중복 시 랜덤 생성
  IF EXISTS (SELECT 1 FROM public.profiles WHERE nickname = user_nickname) THEN
    user_nickname := public.generate_unique_nickname();
  END IF;

  INSERT INTO public.profiles (id, nickname, avatar_url, email, provider)
  VALUES (
    NEW.id,
    user_nickname,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'anonymous')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ACTIVITY LOG (개인 인터랙션 기록)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  app_type public.app_type NOT NULL, -- 어떤 앱에서 (ENUM으로 타입 안전성 보장)
  action_type TEXT NOT NULL, -- 'vote', 'create', 'join', 'complete', 'share' 등
  session_id UUID, -- 세션 관련 활동 시
  metadata JSONB DEFAULT '{}', -- 상세 정보 (점수, 결과 등)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_app ON public.activity_logs(app_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs(created_at DESC);

-- ============================================================
-- LAYER 2: SHARED SESSIONS (Multi-user Apps)
-- ============================================================

-- Generate 6-char session code (must be defined before sessions table)
-- Uses characters that avoid confusion (no 0/O, 1/I/L)
CREATE OR REPLACE FUNCTION public.generate_session_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT;
  i INTEGER;
  attempts INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;

    -- 유니크 체크 (sessions 테이블이 아직 없으면 바로 반환)
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE code = result) THEN
        RETURN result;
      END IF;
    EXCEPTION WHEN undefined_table THEN
      RETURN result; -- 테이블 없으면 그냥 반환
    END;

    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Cannot generate unique session code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Note: app_type and session_role ENUMs are defined in Layer 1

-- Unified sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE DEFAULT public.generate_session_code(), -- 6-char share code (auto-generated)
  app_type public.app_type NOT NULL,
  title TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  config JSONB DEFAULT '{}' NOT NULL, -- app-specific settings
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE NOT NULL, -- 공개/비공개
  max_participants INTEGER, -- NULL = 무제한
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Session participants with roles
CREATE TABLE IF NOT EXISTS public.session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  role public.session_role DEFAULT 'participant' NOT NULL,
  is_banned BOOLEAN DEFAULT FALSE NOT NULL, -- 강퇴 여부
  metadata JSONB DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(session_id, user_id) -- 한 세션에 한 번만 참여
);

-- 호스트가 세션 생성 시 자동으로 host role로 추가
CREATE OR REPLACE FUNCTION public.add_host_as_participant()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.host_id IS NOT NULL THEN
    INSERT INTO public.session_participants (session_id, user_id, display_name, role)
    SELECT NEW.id, NEW.host_id, p.nickname, 'host'::public.session_role
    FROM public.profiles p WHERE p.id = NEW.host_id
    ON CONFLICT (session_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_session_created
  AFTER INSERT ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.add_host_as_participant();

-- ============================================================
-- LAYER 3: APP-SPECIFIC INTERACTIONS
-- ============================================================

-- Votes (live-voting, balance-game, ideal-worldcup)
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.session_participants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  selection JSONB NOT NULL, -- flexible: number, array, object
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Orders (group-order)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.session_participants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  participant_name TEXT NOT NULL,
  items JSONB NOT NULL, -- [{name, price, quantity, options}]
  special_request TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Icebreaker Answers (student-network)
CREATE TABLE IF NOT EXISTS public.icebreaker_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.session_participants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Vote Aggregates (실시간 집계 최적화)
-- 투표마다 COUNT(*) 대신 이 테이블 조회
CREATE TABLE IF NOT EXISTS public.vote_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  option_key TEXT NOT NULL, -- 선택지 식별자
  vote_count INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(session_id, option_key)
);

-- 투표 시 자동 집계 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_vote_aggregate()
RETURNS TRIGGER AS $$
DECLARE
  option_val TEXT;
BEGIN
  -- selection에서 option_key 추출 (단순 값 또는 JSONB)
  IF jsonb_typeof(NEW.selection) = 'number' THEN
    option_val := (NEW.selection)::TEXT;
  ELSIF jsonb_typeof(NEW.selection) = 'string' THEN
    option_val := NEW.selection #>> '{}';
  ELSE
    option_val := NEW.selection::TEXT;
  END IF;

  INSERT INTO public.vote_aggregates (session_id, option_key, vote_count)
  VALUES (NEW.session_id, option_val, 1)
  ON CONFLICT (session_id, option_key) DO UPDATE SET
    vote_count = vote_aggregates.vote_count + 1,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_inserted
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_aggregate();

-- ============================================================
-- INDEXES
-- ============================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_code ON public.sessions(code);
CREATE INDEX IF NOT EXISTS idx_sessions_app_type ON public.sessions(app_type);
CREATE INDEX IF NOT EXISTS idx_sessions_host ON public.sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.sessions(is_active) WHERE is_active = TRUE;

-- Participants
CREATE INDEX IF NOT EXISTS idx_participants_session ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.session_participants(user_id);

-- Votes
CREATE INDEX IF NOT EXISTS idx_votes_session ON public.votes(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_created ON public.votes(created_at DESC);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_session ON public.orders(session_id);

-- Icebreaker
CREATE INDEX IF NOT EXISTS idx_icebreaker_session ON public.icebreaker_answers(session_id);

-- Vote Aggregates
CREATE INDEX IF NOT EXISTS idx_vote_aggregates_session ON public.vote_aggregates(session_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icebreaker_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_aggregates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS: Profiles
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles in same session"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT sp.user_id FROM public.session_participants sp
      WHERE sp.session_id IN (
        SELECT session_id FROM public.session_participants WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- RLS: Activity Logs (개인 기록)
-- ============================================================
CREATE POLICY "Users can view own activity"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- RLS: Sessions
-- ============================================================
CREATE POLICY "Anyone can view active public sessions"
  ON public.sessions FOR SELECT
  USING (is_active = TRUE AND is_public = TRUE);

CREATE POLICY "Hosts can view own sessions"
  ON public.sessions FOR SELECT
  USING (host_id = auth.uid());

CREATE POLICY "Participants can view their sessions"
  ON public.sessions FOR SELECT
  USING (
    id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id OR host_id IS NULL);

CREATE POLICY "Hosts can update their sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = host_id);

-- ============================================================
-- RLS: Participants (권한 기반)
-- ============================================================
CREATE POLICY "Anyone can view participants in their sessions"
  ON public.session_participants FOR SELECT
  USING (
    session_id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid())
    OR session_id IN (SELECT id FROM public.sessions WHERE is_public = TRUE)
  );

CREATE POLICY "Anyone can join public sessions"
  ON public.session_participants FOR INSERT
  WITH CHECK (
    -- 세션이 활성 상태인지 확인
    session_id IN (SELECT id FROM public.sessions WHERE is_active = TRUE)
    -- 이미 강퇴된 기록이 있는지 확인 (재참여 방지)
    AND NOT EXISTS (
      SELECT 1 FROM public.session_participants sp
      WHERE sp.session_id = session_participants.session_id
        AND sp.user_id = auth.uid()
        AND sp.is_banned = TRUE
    )
  );

CREATE POLICY "Users can leave sessions"
  ON public.session_participants FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Hosts can manage participants"
  ON public.session_participants FOR UPDATE
  USING (
    session_id IN (SELECT id FROM public.sessions WHERE host_id = auth.uid())
  );

CREATE POLICY "Hosts can remove participants"
  ON public.session_participants FOR DELETE
  USING (
    session_id IN (SELECT id FROM public.sessions WHERE host_id = auth.uid())
  );

-- ============================================================
-- RLS: Votes (권한 기반)
-- ============================================================
CREATE POLICY "Anyone can view votes in their sessions"
  ON public.votes FOR SELECT
  USING (
    session_id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Participants can vote"
  ON public.votes FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT session_id FROM public.session_participants
      WHERE user_id = auth.uid()
      AND role IN ('host', 'moderator', 'participant')
      AND NOT is_banned
    )
  );

-- ============================================================
-- RLS: Orders
-- ============================================================
CREATE POLICY "Anyone can view orders in their sessions"
  ON public.orders FOR SELECT
  USING (
    session_id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Participants can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT session_id FROM public.session_participants
      WHERE user_id = auth.uid()
      AND role IN ('host', 'moderator', 'participant')
    )
  );

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- RLS: Icebreaker
-- ============================================================
CREATE POLICY "Anyone can view icebreaker in their sessions"
  ON public.icebreaker_answers FOR SELECT
  USING (
    session_id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Participants can add answers"
  ON public.icebreaker_answers FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT session_id FROM public.session_participants
      WHERE user_id = auth.uid()
      AND role IN ('host', 'moderator', 'participant')
    )
  );

-- ============================================================
-- RLS: Vote Aggregates (실시간 집계)
-- ============================================================
CREATE POLICY "Anyone can view aggregates in their sessions"
  ON public.vote_aggregates FOR SELECT
  USING (
    session_id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid())
    OR session_id IN (SELECT id FROM public.sessions WHERE is_public = TRUE)
  );

-- INSERT/UPDATE는 트리거에서 SECURITY DEFINER로 처리되므로 정책 불필요

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime for interactive tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vote_aggregates; -- 실시간 집계
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.icebreaker_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.nickname_adjectives IS '랜덤 닉네임 생성용 형용사 목록';
COMMENT ON TABLE public.nickname_nouns IS '랜덤 닉네임 생성용 명사(동물) 목록';
COMMENT ON TABLE public.profiles IS 'OAuth/익명 사용자 프로필 (유니크 닉네임)';
COMMENT ON TABLE public.activity_logs IS '개인별 모든 앱 인터랙션 기록';
COMMENT ON TABLE public.sessions IS '통합 세션 관리 (QR/코드 참여)';
COMMENT ON TABLE public.session_participants IS '세션 참여자 및 권한 (host/moderator/participant/spectator)';
COMMENT ON TABLE public.votes IS '투표 기록 (live-voting, balance-game, ideal-worldcup)';
COMMENT ON TABLE public.vote_aggregates IS '실시간 투표 집계 (성능 최적화용)';
COMMENT ON TABLE public.orders IS '단체 주문 항목';
COMMENT ON TABLE public.icebreaker_answers IS 'Icebreaker Q&A (student-network)';
