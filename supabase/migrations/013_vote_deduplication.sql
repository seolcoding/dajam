-- Vote deduplication for live-voting
-- Created: 2024-12-25
-- Issue: Users can submit multiple votes in the same session
-- Solution: Add unique constraint to prevent duplicate votes

-- ============================================================
-- ADD UNIQUE CONSTRAINT FOR VOTE DEDUPLICATION
-- ============================================================

-- For authenticated users: one vote per session per user
-- For anonymous users: we rely on participant_id (if available) or client-side check

-- Note: NULLS NOT DISTINCT requires PostgreSQL 15+
-- This ensures (session_id, user_id) = (abc, NULL) is treated as unique
-- Without NULLS NOT DISTINCT, multiple (abc, NULL) rows would be allowed

-- Create unique index for authenticated users
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_session_user_unique
  ON public.votes (session_id, user_id)
  WHERE user_id IS NOT NULL;

-- Create unique index for anonymous users with participant_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_session_participant_unique
  ON public.votes (session_id, participant_id)
  WHERE participant_id IS NOT NULL AND user_id IS NULL;

-- ============================================================
-- ADD FUNCTION TO CHECK IF USER HAS VOTED
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_user_voted(p_session_id UUID, p_user_id UUID DEFAULT NULL, p_participant_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check by user_id if authenticated
  IF p_user_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.votes
      WHERE session_id = p_session_id AND user_id = p_user_id
    );
  END IF;

  -- Check by participant_id if anonymous
  IF p_participant_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.votes
      WHERE session_id = p_session_id AND participant_id = p_participant_id
    );
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ADD SESSION STATE COLUMN
-- ============================================================

-- Add poll state to sessions config for live-voting
-- config.status: 'active' | 'closed' | 'results_locked'
-- This is already stored in JSONB config, no schema change needed

-- ============================================================
-- COMMENT
-- ============================================================

COMMENT ON INDEX idx_votes_session_user_unique IS 'Prevent authenticated users from voting multiple times per session';
COMMENT ON INDEX idx_votes_session_participant_unique IS 'Prevent anonymous participants from voting multiple times per session';
COMMENT ON FUNCTION public.has_user_voted IS 'Check if a user or participant has already voted in a session';
