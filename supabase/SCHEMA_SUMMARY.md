# Supabase Database Schema Summary

## Quick Reference

### Database Statistics

| App | Tables | Seed Data |
|-----|--------|-----------|
| Chosung Quiz | 3 | 38 questions |
| Ideal Worldcup | 4 | 1 tournament, 16 candidates |
| Balance Game | 3 | 26 questions |
| Live Voting | 3 | 0 (user-generated) |
| Student Network | 4 | 0 (user-generated) |
| **TOTAL** | **17 tables** | **80 rows** |

## Table Overview

### 1. Chosung Quiz (초성 퀴즈)

```
chosung_questions (38 rows)
├── id: UUID (PK)
├── word: TEXT (정답 단어)
├── chosung: TEXT (초성)
├── category: ENUM (movie, food, proverb, kpop, celebrity, drama, custom)
├── difficulty: ENUM (easy, normal, hard)
├── hint_1, hint_2, hint_3: TEXT
└── created_by: UUID (NULL = built-in)

chosung_sessions (0 rows)
├── id: UUID (PK)
├── user_id: UUID (NULL = anonymous)
├── category: TEXT
├── difficulty: TEXT
├── score: INTEGER
└── completed_at: TIMESTAMPTZ

chosung_answers (0 rows)
├── id: UUID (PK)
├── session_id: UUID (FK → chosung_sessions)
├── question_id: UUID (FK → chosung_questions)
├── user_answer: TEXT
├── is_correct: BOOLEAN
└── hints_used: INTEGER
```

**Categories**: movie (10), food (8), proverb (3), kpop (6), celebrity (5), drama (6)

### 2. Ideal Worldcup (이상형 월드컵)

```
worldcup_tournaments (1 row)
├── id: UUID (PK)
├── title: TEXT
├── description: TEXT
├── total_rounds: INTEGER (4, 8, 16, 32)
└── is_public: BOOLEAN

worldcup_candidates (16 rows)
├── id: UUID (PK)
├── tournament_id: UUID (FK → worldcup_tournaments)
├── name: TEXT
├── image_url: TEXT
└── display_order: INTEGER

worldcup_results (0 rows)
├── id: UUID (PK)
├── tournament_id: UUID (FK → worldcup_tournaments)
├── winner_id: UUID (FK → worldcup_candidates)
├── runner_up_id: UUID (FK → worldcup_candidates)
└── semi_final_ids: UUID[]

worldcup_candidate_stats (16 rows - auto-created)
├── candidate_id: UUID (PK, FK → worldcup_candidates)
├── win_count: INTEGER
├── runner_up_count: INTEGER
├── total_plays: INTEGER
└── updated_at: TIMESTAMPTZ (auto-updated)
```

**Sample Tournament**: "한국 음식 월드컵" (16 candidates)

### 3. Balance Game (밸런스 게임)

```
balance_questions (26 rows)
├── id: UUID (PK)
├── title: TEXT
├── category: ENUM (general, food, travel, values, romance, work)
├── option_a: TEXT
├── option_b: TEXT
├── image_a_url, image_b_url: TEXT
└── is_public: BOOLEAN

balance_votes (0 rows)
├── id: UUID (PK)
├── question_id: UUID (FK → balance_questions)
├── user_id: UUID (NULL = anonymous)
├── choice: ENUM ('A', 'B')
└── voted_at: TIMESTAMPTZ

balance_question_stats (26 rows - auto-created)
├── question_id: UUID (PK, FK → balance_questions)
├── votes_a: INTEGER
├── votes_b: INTEGER
├── total_votes: INTEGER
└── updated_at: TIMESTAMPTZ (auto-updated)
```

**Categories**: general (5), food (5), travel (5), values (5), romance (3), work (3)

### 4. Live Voting (실시간 투표)

```
live_polls (0 rows)
├── id: UUID (PK)
├── room_code: TEXT UNIQUE (6-digit, e.g., 'ABC123')
├── title: TEXT
├── poll_type: ENUM (single, multiple, ranking)
├── options: TEXT[] (array of option strings)
├── is_active: BOOLEAN
├── allow_anonymous: BOOLEAN
└── expires_at: TIMESTAMPTZ

live_poll_votes (0 rows)
├── id: UUID (PK)
├── poll_id: UUID (FK → live_polls)
├── user_id: UUID (NULL = anonymous)
├── selection: JSONB (single: int, multiple: [int], ranking: [int])
└── voted_at: TIMESTAMPTZ

live_poll_stats (0 rows - auto-created)
├── poll_id: UUID (PK, FK → live_polls)
├── option_counts: JSONB {"0": 10, "1": 5, "2": 8}
├── total_votes: INTEGER
└── updated_at: TIMESTAMPTZ (auto-updated)
```

**Poll Types**:
- `single`: User selects one option (selection = integer index)
- `multiple`: User selects multiple options (selection = array of indices)
- `ranking`: User ranks options (selection = array of indices in order)

### 5. Student Network (학생 네트워크)

```
student_profiles (0 rows)
├── id: UUID (PK)
├── user_id: UUID (NULL = anonymous)
├── name: TEXT
├── tagline: TEXT (한줄 소개)
├── field: TEXT (전공/분야)
├── interests: TEXT[] (최대 5개 태그)
├── email, github_url, linkedin_url, website_url: TEXT
└── avatar_url: TEXT

student_rooms (0 rows)
├── id: UUID (PK)
├── room_code: TEXT UNIQUE (6-character, e.g., 'ABC123')
├── name: TEXT
├── created_by: UUID (FK → student_profiles)
└── is_active: BOOLEAN

student_room_members (0 rows)
├── id: UUID (PK)
├── room_id: UUID (FK → student_rooms)
├── profile_id: UUID (FK → student_profiles)
└── UNIQUE(room_id, profile_id)

student_icebreaker_answers (0 rows)
├── id: UUID (PK)
├── room_id: UUID (FK → student_rooms)
├── profile_id: UUID (FK → student_profiles)
├── question: TEXT
├── answer: TEXT
└── created_at: TIMESTAMPTZ
```

**Key Features**:
- No education level data collected (privacy-focused)
- Interest-based matching (5 tags max)
- Room code system for classrooms
- Icebreaker Q&A for networking

## Key Database Features

### 1. Automatic Timestamp Updates

All tables with `updated_at` column have triggers:

```sql
CREATE TRIGGER update_[table]_updated_at
    BEFORE UPDATE ON [table]
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Applied to:
- `chosung_questions`
- `worldcup_tournaments`
- `balance_questions`
- `live_polls`
- `student_profiles`
- `student_rooms`

### 2. Statistics Auto-Update (Triggers)

**Balance Game:**
```sql
ON INSERT INTO balance_votes
→ UPDATE balance_question_stats (votes_a, votes_b, total_votes)
```

**Worldcup:**
```sql
ON INSERT INTO worldcup_results
→ UPDATE worldcup_candidate_stats (win_count, runner_up_count, total_plays)
```

**Live Voting:**
```sql
ON INSERT INTO live_poll_votes
→ UPDATE live_poll_stats (option_counts JSONB, total_votes)
```

### 3. Row Level Security (RLS)

All 17 tables have RLS enabled with policies:

| Policy Type | Description | Example |
|-------------|-------------|---------|
| Public Read | Anyone can view public data | Built-in quiz questions |
| User-Owned | Users can only modify their own data | User profiles, sessions |
| Anonymous | Anonymous users can participate | Game votes, anonymous polls |
| Room-Based | Access restricted to room members | Student network profiles |

### 4. Indexes for Performance

All foreign keys have indexes:

```sql
-- Chosung Quiz
CREATE INDEX idx_chosung_questions_category ON chosung_questions(category);
CREATE INDEX idx_chosung_questions_difficulty ON chosung_questions(difficulty);
CREATE INDEX idx_chosung_answers_session ON chosung_answers(session_id);

-- Worldcup
CREATE INDEX idx_worldcup_candidates_tournament ON worldcup_candidates(tournament_id);
CREATE INDEX idx_worldcup_results_tournament ON worldcup_results(tournament_id);

-- Balance Game
CREATE INDEX idx_balance_questions_category ON balance_questions(category);
CREATE INDEX idx_balance_votes_question ON balance_votes(question_id);

-- Live Voting
CREATE INDEX idx_live_polls_room_code ON live_polls(room_code);
CREATE INDEX idx_live_poll_votes_poll ON live_poll_votes(poll_id);

-- Student Network
CREATE INDEX idx_student_rooms_code ON student_rooms(room_code);
CREATE INDEX idx_student_room_members_room ON student_room_members(room_id);
CREATE INDEX idx_student_room_members_profile ON student_room_members(profile_id);
```

## Data Relationships

### Chosung Quiz
```
chosung_questions (1) ───< (N) chosung_answers
                                    │
                                    └───< (N) chosung_sessions
```

### Ideal Worldcup
```
worldcup_tournaments (1) ───< (N) worldcup_candidates
                        │                  │
                        │                  ├───< (1) worldcup_candidate_stats
                        │                  │
                        └───< (N) worldcup_results
```

### Balance Game
```
balance_questions (1) ───< (N) balance_votes
                     │
                     └───< (1) balance_question_stats
```

### Live Voting
```
live_polls (1) ───< (N) live_poll_votes
           │
           └───< (1) live_poll_stats
```

### Student Network
```
student_profiles (N) ───< student_room_members >─── (N) student_rooms
       │                                                      │
       └─────< (N) student_icebreaker_answers ───────────────┘
```

## Security Best Practices

### ✅ Implemented

- [x] All tables have RLS enabled
- [x] Anonymous user support where appropriate
- [x] User-owned data protection
- [x] Room-based access control
- [x] No sensitive data collection (education level excluded)
- [x] Optional personal info (email, social links)
- [x] CASCADE deletes for data cleanup

### ❌ Not Implemented (Client Responsibility)

- [ ] Rate limiting (implement in app layer)
- [ ] Input sanitization (validate in app)
- [ ] CAPTCHA for anonymous voting (optional)
- [ ] IP-based duplicate vote prevention (optional)

## Migration Path: localStorage → Supabase

### Phase 1: Current (localStorage)

```javascript
// localStorage-based
localStorage.setItem('chosung_sessions', JSON.stringify(sessions));
```

### Phase 2: Target (Supabase)

```typescript
// Supabase-based
const { data: session } = await supabase
  .from('chosung_sessions')
  .insert({ category: 'movie', difficulty: 'easy' })
  .select()
  .single();
```

### Migration Steps

1. ✅ Design schema (DONE)
2. ✅ Create migrations (DONE)
3. ✅ Add seed data (DONE)
4. ⏳ Update app code to use Supabase client
5. ⏳ Enable real-time subscriptions
6. ⏳ Configure authentication
7. ⏳ Test RLS policies
8. ⏳ Deploy to production

## Quick Start

### 1. Setup Supabase

```bash
# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Seed data
supabase db seed
```

### 2. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Generate TypeScript Types

```bash
supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts
```

### 4. Use in App

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch quiz questions
const { data: questions } = await supabase
  .from('chosung_questions')
  .select('*')
  .eq('category', 'movie')
  .limit(10);
```

## Performance Metrics

### Expected Query Performance

| Query Type | Expected Time |
|------------|---------------|
| Single row by PK | < 1ms |
| Indexed FK lookup | < 5ms |
| Category filter | < 10ms |
| Stats aggregation | < 20ms (cached in stats tables) |
| Room member list | < 50ms (with JOIN) |

### Optimization Techniques

1. **Aggregated Stats Tables**: Pre-computed vote counts, stats
2. **Triggers**: Auto-update stats on INSERT
3. **Indexes**: All FKs, categories, room codes
4. **JSONB**: Flexible data storage for poll options, vote selections
5. **Array Types**: Efficient storage for interests, semi-final IDs

## Real-time Features

### Enabled Tables

```typescript
// Live voting updates
supabase
  .channel(`poll:${pollId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'live_poll_votes',
    filter: `poll_id=eq.${pollId}`
  }, (payload) => {
    console.log('New vote:', payload.new);
  })
  .subscribe();

// Student network room updates
supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'student_room_members',
    filter: `room_id=eq.${roomId}`
  }, (payload) => {
    console.log('Member joined/left:', payload);
  })
  .subscribe();
```

## File Structure

```
supabase/
├── migrations/
│   └── 001_initial_schema.sql    # Database schema (17 tables)
├── seed.sql                       # Sample data (80 rows)
├── README.md                      # Detailed documentation
└── SCHEMA_SUMMARY.md             # This file (quick reference)
```

## Next Steps

1. **Deploy Schema**: Run migrations in Supabase dashboard
2. **Test RLS**: Verify policies with test users
3. **Generate Types**: Create TypeScript types
4. **Update Apps**: Integrate Supabase client
5. **Enable Realtime**: Configure subscriptions
6. **Add Auth**: Configure Google/Kakao OAuth
7. **Monitor**: Set up analytics and alerts

## Support

- Full documentation: `supabase/README.md`
- Schema file: `supabase/migrations/001_initial_schema.sql`
- Seed data: `supabase/seed.sql`
- Supabase Docs: https://supabase.com/docs
- PRD Documents: `prd/*.md`
