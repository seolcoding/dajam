-- 새로운 앱 타입 추가
ALTER TYPE public.app_type ADD VALUE IF NOT EXISTS 'audience-engage';
ALTER TYPE public.app_type ADD VALUE IF NOT EXISTS 'realtime-quiz';
ALTER TYPE public.app_type ADD VALUE IF NOT EXISTS 'this-or-that';
ALTER TYPE public.app_type ADD VALUE IF NOT EXISTS 'word-cloud';
ALTER TYPE public.app_type ADD VALUE IF NOT EXISTS 'personality-test';
ALTER TYPE public.app_type ADD VALUE IF NOT EXISTS 'human-bingo';
