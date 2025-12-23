# Supabase Database Schema for Mini Apps

## Overview

This directory contains the Supabase database schema and seed data for 5 mini-apps that require persistent data storage:

1. **Chosung Quiz** (초성 퀴즈) - Quiz questions, game sessions, and scoring
2. **Ideal Worldcup** (이상형 월드컵) - Tournaments, candidates, and voting results
3. **Balance Game** (밸런스 게임) - Questions and vote statistics
4. **Live Voting** (실시간 투표) - Real-time polls with room codes
5. **Student Network** (학생 네트워크) - User profiles, rooms, and networking

## Architecture Decision

### Why Supabase?

- **PostgreSQL-based**: Robust, scalable relational database
- **Real-time subscriptions**: Built-in WebSocket support for live updates
- **Row Level Security (RLS)**: Fine-grained access control
- **Authentication**: Integrated auth with social login (Google, Kakao)
- **Edge Functions**: Serverless API endpoints
- **Free tier**: Generous limits for MVP

### Migration from localStorage

Current Phase (localStorage) → Target Phase (Supabase):

| Feature | localStorage | Supabase |
|---------|-------------|----------|
| Data persistence | Browser only | Cloud database |
| Multi-device | ❌ | ✅ |
| Real-time sync | BroadcastChannel | Realtime subscriptions |
| User management | None | Supabase Auth |
| Data analytics | Limited | SQL queries |
| Scalability | Per-device | Unlimited |

## Database Schema

### 1. Chosung Quiz (초성 퀴즈)

**Tables:**
- `chosung_questions` - Quiz questions with hints
- `chosung_sessions` - Game sessions
- `chosung_answers` - Individual answers within sessions

**Key Features:**
- Category-based questions (movie, food, proverb, kpop, celebrity, drama, custom)
- Difficulty levels (easy, normal, hard)
- Hint system (3 levels)
- Score tracking per session

**ERD:**
```
chosung_questions (1) ─────< (N) chosung_answers
                                    │
                                    ├─────< (N) chosung_sessions
```

### 2. Ideal Worldcup (이상형 월드컵)

**Tables:**
- `worldcup_tournaments` - Tournament definitions
- `worldcup_candidates` - Items/candidates in tournaments
- `worldcup_results` - Completed game results
- `worldcup_candidate_stats` - Aggregated statistics

**Key Features:**
- Configurable rounds (4, 8, 16, 32)
- Public/private tournaments
- Winner/runner-up tracking
- Automated statistics updates (triggers)

**ERD:**
```
worldcup_tournaments (1) ─────< (N) worldcup_candidates (1) ─────< (N) worldcup_candidate_stats
                        │                                  │
                        └─────< (N) worldcup_results ──────┘
```

### 3. Balance Game (밸런스 게임)

**Tables:**
- `balance_questions` - This-or-that questions
- `balance_votes` - User votes
- `balance_question_stats` - Vote statistics

**Key Features:**
- Category-based questions (general, food, travel, values, romance, work)
- Optional images for options
- Real-time vote counting (triggers)
- Public/private questions

**ERD:**
```
balance_questions (1) ─────< (N) balance_votes
                     │
                     └─────< (1) balance_question_stats
```

### 4. Live Voting (실시간 투표)

**Tables:**
- `live_polls` - Poll definitions with room codes
- `live_poll_votes` - Submitted votes
- `live_poll_stats` - Real-time aggregated statistics

**Key Features:**
- Room code system (6-digit unique codes)
- Poll types: single, multiple, ranking
- Anonymous voting support
- Expiration timestamps
- Real-time stat updates (triggers)

**ERD:**
```
live_polls (1) ─────< (N) live_poll_votes
           │
           └─────< (1) live_poll_stats
```

### 5. Student Network (학생 네트워크)

**Tables:**
- `student_profiles` - User profiles (name, field, interests)
- `student_rooms` - Virtual classrooms
- `student_room_members` - Room membership
- `student_icebreaker_answers` - Q&A within rooms

**Key Features:**
- No education level collection (privacy-focused)
- Interest tag-based matching
- Room code system
- Icebreaker question system
- Many-to-many room membership

**ERD:**
```
student_profiles (N) ───< student_room_members >─── (N) student_rooms
       │                                                      │
       └─────< (N) student_icebreaker_answers ───────────────┘
```

## Row Level Security (RLS) Policies

All tables have RLS enabled with the following principles:

### Public Read, Authenticated Write
- **Chosung Questions**: Anyone can read built-in questions, only creators can modify custom questions
- **Worldcup Tournaments**: Public tournaments viewable by all
- **Balance Questions**: Public questions viewable by all

### User-Owned Data
- **Sessions/Results**: Users can only view their own game history
- **Profiles**: Users can only edit their own profile
- **Rooms**: Room creators have admin privileges

### Anonymous Support
- **Live Voting**: Polls can allow anonymous votes if `allow_anonymous = TRUE`
- **Game Results**: Anonymous users can submit results without auth

### Room-Based Access
- **Student Network**: Users can only view profiles of people in their rooms
- **Icebreaker Answers**: Only visible to room members

## Database Triggers

### Automatic Timestamp Updates
All tables with `updated_at` column:
```sql
CREATE TRIGGER update_[table]_updated_at
    BEFORE UPDATE ON [table]
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Statistics Auto-Update

**Balance Game:**
```sql
CREATE TRIGGER update_balance_stats_on_vote
    AFTER INSERT ON balance_votes
    FOR EACH ROW EXECUTE FUNCTION update_balance_stats();
```

**Worldcup:**
```sql
CREATE TRIGGER update_worldcup_stats_on_result
    AFTER INSERT ON worldcup_results
    FOR EACH ROW EXECUTE FUNCTION update_worldcup_stats();
```

**Live Voting:**
```sql
CREATE TRIGGER update_live_poll_stats_on_vote
    AFTER INSERT ON live_poll_votes
    FOR EACH ROW EXECUTE FUNCTION update_live_poll_stats();
```

## Setup Instructions

### 1. Create Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to existing project (or create new one)
supabase link --project-ref your-project-ref
```

### 2. Run Migrations

```bash
# Run the initial schema migration
supabase db push

# Or manually in Supabase Dashboard SQL Editor:
# Copy contents of migrations/001_initial_schema.sql and execute
```

### 3. Seed Data

```bash
# Run seed data
supabase db seed

# Or manually in SQL Editor:
# Copy contents of seed.sql and execute
```

### 4. Verify Installation

```sql
-- Check table counts
SELECT 'chosung_questions' AS table_name, COUNT(*) AS count FROM chosung_questions
UNION ALL
SELECT 'worldcup_candidates', COUNT(*) FROM worldcup_candidates
UNION ALL
SELECT 'balance_questions', COUNT(*) FROM balance_questions;

-- Expected output:
-- chosung_questions: 38
-- worldcup_candidates: 16
-- balance_questions: 26
```

## Environment Variables

Add to your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Database connection string for migrations
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

## TypeScript Types

Generate TypeScript types from database:

```bash
# Install Supabase CLI
npm install -g supabase

# Generate types
supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts
```

Example usage:

```typescript
import { Database } from '@/types/supabase';

type ChosungQuestion = Database['public']['Tables']['chosung_questions']['Row'];
type WorldcupTournament = Database['public']['Tables']['worldcup_tournaments']['Row'];
```

## Drizzle ORM Integration (Optional)

For type-safe database queries, integrate with Drizzle ORM:

```bash
# Install Drizzle
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# Pull schema from Supabase
pnpm drizzle-kit pull:pg --out=./drizzle --connectionString="$DATABASE_URL"
```

## Real-time Subscriptions

Enable real-time updates for specific tables:

```typescript
// Live voting real-time updates
const channel = supabase
  .channel('live-poll-votes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'live_poll_votes',
      filter: `poll_id=eq.${pollId}`
    },
    (payload) => {
      console.log('New vote:', payload.new);
      // Update UI
    }
  )
  .subscribe();
```

## Performance Optimization

### Indexes

All foreign keys have indexes:
```sql
CREATE INDEX idx_chosung_answers_session ON chosung_answers(session_id);
CREATE INDEX idx_worldcup_candidates_tournament ON worldcup_candidates(tournament_id);
CREATE INDEX idx_balance_votes_question ON balance_votes(question_id);
CREATE INDEX idx_live_poll_votes_poll ON live_poll_votes(poll_id);
CREATE INDEX idx_student_room_members_room ON student_room_members(room_id);
```

### Aggregated Views

Statistics tables are updated via triggers to avoid expensive real-time calculations:
- `worldcup_candidate_stats`
- `balance_question_stats`
- `live_poll_stats`

## Security Considerations

### RLS Policies
- ✅ All tables have RLS enabled
- ✅ Anonymous users can participate in games
- ✅ Users can only modify their own data
- ✅ Room-based access control for student network

### Data Privacy
- ❌ No email collection required (optional)
- ❌ No education level data collected
- ✅ Anonymous participation supported
- ✅ Data deletion via CASCADE constraints

### API Security
- Use `anon` key for client-side requests
- Use `service_role` key only in server-side functions
- Never expose `service_role` key in client code

## Backup & Restore

### Automated Backups
Supabase Pro plan includes:
- Daily automated backups (retained 7 days)
- Point-in-time recovery

### Manual Backup
```bash
# Export data
supabase db dump -f backup.sql

# Restore
psql -h db.your-project.supabase.co -U postgres -d postgres -f backup.sql
```

## Migration Checklist

When migrating from localStorage to Supabase:

- [ ] Create Supabase project
- [ ] Run schema migration (`001_initial_schema.sql`)
- [ ] Run seed data (`seed.sql`)
- [ ] Configure environment variables
- [ ] Generate TypeScript types
- [ ] Update app code to use Supabase client
- [ ] Test RLS policies
- [ ] Enable real-time subscriptions
- [ ] Configure authentication (Google, Kakao)
- [ ] Set up Edge Functions (if needed)
- [ ] Configure CORS for production domain

## API Examples

### Chosung Quiz

```typescript
// Fetch questions by category
const { data: questions } = await supabase
  .from('chosung_questions')
  .select('*')
  .eq('category', 'movie')
  .eq('difficulty', 'easy')
  .limit(10);

// Create game session
const { data: session } = await supabase
  .from('chosung_sessions')
  .insert({
    category: 'movie',
    difficulty: 'easy',
    question_count: 10
  })
  .select()
  .single();

// Submit answer
const { data: answer } = await supabase
  .from('chosung_answers')
  .insert({
    session_id: session.id,
    question_id: question.id,
    user_answer: '어벤져스',
    is_correct: true,
    score: 100
  });
```

### Ideal Worldcup

```typescript
// Get tournament with candidates
const { data: tournament } = await supabase
  .from('worldcup_tournaments')
  .select(`
    *,
    candidates:worldcup_candidates(*)
  `)
  .eq('id', tournamentId)
  .single();

// Submit result
const { data: result } = await supabase
  .from('worldcup_results')
  .insert({
    tournament_id: tournamentId,
    winner_id: winnerId,
    runner_up_id: runnerUpId
  });

// Get candidate stats
const { data: stats } = await supabase
  .from('worldcup_candidate_stats')
  .select('*')
  .eq('tournament_id', tournamentId)
  .order('win_count', { ascending: false });
```

### Balance Game

```typescript
// Get question with stats
const { data: question } = await supabase
  .from('balance_questions')
  .select(`
    *,
    stats:balance_question_stats(*)
  `)
  .eq('id', questionId)
  .single();

// Submit vote
const { data: vote } = await supabase
  .from('balance_votes')
  .insert({
    question_id: questionId,
    choice: 'A'
  });
```

### Live Voting

```typescript
// Create poll
const { data: poll } = await supabase
  .from('live_polls')
  .insert({
    room_code: generateRoomCode(), // e.g., 'ABC123'
    title: '오늘 점심 메뉴는?',
    poll_type: 'single',
    options: ['김치찌개', '된장찌개', '불고기', '돈가스']
  })
  .select()
  .single();

// Vote
const { data: vote } = await supabase
  .from('live_poll_votes')
  .insert({
    poll_id: pollId,
    selection: 0 // Index of selected option
  });

// Real-time updates
supabase
  .channel(`poll:${pollId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'live_poll_votes',
    filter: `poll_id=eq.${pollId}`
  }, (payload) => {
    // Update UI with new vote
  })
  .subscribe();
```

### Student Network

```typescript
// Create profile
const { data: profile } = await supabase
  .from('student_profiles')
  .insert({
    name: '홍길동',
    tagline: '웹 개발에 열정이 있는 주니어 개발자',
    field: '프론트엔드 개발',
    interests: ['React', 'TypeScript', 'Next.js']
  })
  .select()
  .single();

// Create room
const { data: room } = await supabase
  .from('student_rooms')
  .insert({
    room_code: generateRoomCode(),
    name: 'React 부트캠프 2기',
    created_by: profileId
  })
  .select()
  .single();

// Join room
const { data: membership } = await supabase
  .from('student_room_members')
  .insert({
    room_id: roomId,
    profile_id: profileId
  });

// Get room members
const { data: members } = await supabase
  .from('student_room_members')
  .select(`
    profile:student_profiles(*)
  `)
  .eq('room_id', roomId);
```

## Troubleshooting

### RLS Policy Issues

If queries return empty results, check RLS policies:

```sql
-- Disable RLS temporarily (ONLY for debugging)
ALTER TABLE chosung_questions DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE chosung_questions ENABLE ROW LEVEL SECURITY;
```

### Trigger Not Firing

Check trigger exists:

```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%balance_stats%';
```

Re-create if needed:

```sql
DROP TRIGGER IF EXISTS update_balance_stats_on_vote ON balance_votes;
CREATE TRIGGER update_balance_stats_on_vote
    AFTER INSERT ON balance_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_balance_stats();
```

### Index Performance

Analyze query performance:

```sql
EXPLAIN ANALYZE
SELECT * FROM balance_votes WHERE question_id = 'some-uuid';
```

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Drizzle ORM](https://orm.drizzle.team/)

## License

This schema is part of the seolcoding.com mini-apps project.
