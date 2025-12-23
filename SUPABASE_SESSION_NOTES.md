# Supabase Integration Session Notes

**Date**: 2024-12-22
**Migrated From**: seolcoding.com/agents/mini-apps/

## What Was Created

### 1. Database Schema (`supabase/`)

```
supabase/
├── migrations/
│   └── 001_initial_schema.sql    # 17 tables, RLS, triggers
├── seed.sql                       # 80 rows sample data
├── README.md                      # Full documentation
└── SCHEMA_SUMMARY.md             # Quick reference
```

**5 Apps with DB Support:**
- **Chosung Quiz** (3 tables): questions, sessions, answers
- **Ideal Worldcup** (4 tables): tournaments, candidates, results, stats
- **Balance Game** (3 tables): questions, votes, stats
- **Live Voting** (3 tables): polls, votes, stats (with room codes)
- **Student Network** (4 tables): profiles, rooms, members, icebreakers

### 2. Supabase Client Package (`packages/db/`)

```
packages/db/
├── src/
│   ├── index.ts              # Supabase client
│   └── types.ts              # Database types placeholder
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── QUICKSTART.md
├── EXAMPLE.md
├── MIGRATION.md
└── CHANGELOG.md
```

## Supabase Project Credentials

> ⚠️ **SECURITY**: API 키는 `.env.local` 파일에만 저장하세요. 절대 커밋하지 마세요!

**Project Reference ID**: `hwgsqzdpqmfoyxiymjsp`

### Environment Variables (.env.local)

```env
# Supabase Dashboard에서 복사: Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://hwgsqzdpqmfoyxiymjsp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Server-side only (optional)
# SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Next Steps

### 1. Apply Database Schema

```bash
# Login to Supabase CLI
supabase login

# Link to project
supabase link --project-ref hwgsqzdpqmfoyxiymjsp

# Push schema to database
supabase db push

# Optional: Seed sample data
supabase db seed
```

### 2. Generate TypeScript Types

```bash
supabase gen types typescript --project-id hwgsqzdpqmfoyxiymjsp > packages/db/src/types.ts
```

### 3. Update packages/db for Next.js

The current `packages/db` uses Vite env vars (`import.meta.env`).
For Next.js, update `src/index.ts`:

```typescript
// Change from:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// To:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

### 4. Install Dependencies

```bash
pnpm add @supabase/supabase-js
pnpm add -D supabase
```

### 5. Configure Auth Providers (Supabase Dashboard)

1. Go to https://supabase.com/dashboard/project/hwgsqzdpqmfoyxiymjsp/auth/providers
2. Enable Google OAuth
3. Enable Kakao OAuth
4. Set redirect URLs to `https://apps.seolcoding.com/auth/callback`

## Pending Work

- [ ] Auth package (@mini-apps/auth) - was in progress, needs completion
- [ ] Update packages/db for Next.js environment variables
- [ ] Apply schema to Supabase project
- [ ] Configure OAuth providers
- [ ] Generate TypeScript types from schema
