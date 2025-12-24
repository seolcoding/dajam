-- Q&A 질문 테이블
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.session_participants(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    author_name TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    is_highlighted BOOLEAN DEFAULT false,
    is_answered BOOLEAN DEFAULT false,
    upvote_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 질문 좋아요 (중복 방지)
CREATE TABLE IF NOT EXISTS public.question_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.session_participants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(question_id, participant_id)
);

-- 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.session_participants(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    author_name TEXT,
    is_system_message BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON public.questions(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- RLS 활성화
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 누구나 읽기 가능
CREATE POLICY "questions_select" ON public.questions FOR SELECT USING (true);
CREATE POLICY "question_upvotes_select" ON public.question_upvotes FOR SELECT USING (true);
CREATE POLICY "chat_messages_select" ON public.chat_messages FOR SELECT USING (true);

-- RLS 정책: 누구나 추가 가능 (익명 참여 지원)
CREATE POLICY "questions_insert" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "question_upvotes_insert" ON public.question_upvotes FOR INSERT WITH CHECK (true);
CREATE POLICY "chat_messages_insert" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- RLS 정책: 호스트 또는 본인만 수정/삭제
CREATE POLICY "questions_update" ON public.questions FOR UPDATE USING (true);
CREATE POLICY "questions_delete" ON public.questions FOR DELETE USING (true);
CREATE POLICY "chat_messages_delete" ON public.chat_messages FOR DELETE USING (true);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
