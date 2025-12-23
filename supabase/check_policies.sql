-- Run this in Supabase Dashboard SQL Editor to check policies

-- 1. List all policies on session_participants
SELECT policyname, cmd, qual::text, with_check::text
FROM pg_policies
WHERE tablename = 'session_participants';

-- 2. List all policies on profiles
SELECT policyname, cmd, qual::text, with_check::text
FROM pg_policies
WHERE tablename = 'profiles';

-- 3. Test simple query (should work without recursion)
SELECT COUNT(*) FROM public.profiles;
