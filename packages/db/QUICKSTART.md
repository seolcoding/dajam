# Quick Start Guide

Get up and running with `@mini-apps/db` in 5 minutes.

## 1. Add to Your App (30 seconds)

```bash
cd apps/your-app
```

Add to `package.json`:
```json
{
  "dependencies": {
    "@mini-apps/db": "workspace:*"
  }
}
```

```bash
pnpm install
```

## 2. Configure Environment (1 minute)

Create `.env` in your app directory:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Get credentials from:
- https://app.supabase.com/
- Your Project → Settings → API
- Copy "Project URL" and "anon public" key

## 3. Create a Table (2 minutes)

Go to https://app.supabase.com/ → SQL Editor:

```sql
-- Example: Simple votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
```

## 4. Use in Your App (1 minute)

```typescript
import { supabase } from "@mini-apps/db";

// Fetch data
const { data, error } = await supabase
  .from('votes')
  .select('*');

// Insert data
await supabase
  .from('votes')
  .insert({ option: 'A' });
```

## Common Patterns

### React Component with Data

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@mini-apps/db';

function VoteList() {
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    supabase
      .from('votes')
      .select('*')
      .then(({ data }) => setVotes(data || []));
  }, []);

  return (
    <ul>
      {votes.map(vote => (
        <li key={vote.id}>{vote.option}</li>
      ))}
    </ul>
  );
}
```

### Realtime Updates

```typescript
useEffect(() => {
  const channel = supabase
    .channel('my-channel')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'votes'
    }, (payload) => {
      setVotes(prev => [...prev, payload.new]);
    })
    .subscribe();

  return () => channel.unsubscribe();
}, []);
```

### Insert with Button

```typescript
async function handleVote(option: string) {
  const { error } = await supabase
    .from('votes')
    .insert({ option });

  if (error) {
    console.error('Error:', error);
    alert('Failed to vote');
  }
}

<button onClick={() => handleVote('A')}>Vote A</button>
```

## Troubleshooting

**Environment variables not working?**
- Restart dev server after creating `.env`
- Variables must start with `VITE_`

**CORS errors?**
- Add `http://localhost:5173` to Supabase → Settings → API → URL Configuration

**Type errors?**
- Generate types: `supabase gen types typescript --project-id YOUR_ID > packages/db/src/types.ts`
- Rebuild: `pnpm --filter @mini-apps/db build`

## Next Steps

- Full guide: `README.md`
- Examples: `EXAMPLE.md`
- Migration: `MIGRATION.md`
- Docs: https://supabase.com/docs

## Complete Example App

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@mini-apps/db';

export default function App() {
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    async function load() {
      const { data } = await supabase
        .from('votes')
        .select('*')
        .order('created_at', { ascending: false });

      setVotes(data || []);
      setLoading(false);
    }

    load();

    // Subscribe to new votes
    const channel = supabase
      .channel('votes-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'votes'
      }, (payload) => {
        setVotes(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, []);

  async function vote(option: string) {
    const { error } = await supabase
      .from('votes')
      .insert({ option });

    if (error) alert('Error: ' + error.message);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Quick Vote</h1>

      <div className="space-x-2 mb-8">
        <button
          onClick={() => vote('A')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Vote A
        </button>
        <button
          onClick={() => vote('B')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Vote B
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">
          Results ({votes.length} votes)
        </h2>
        <div className="space-y-2">
          {votes.map(vote => (
            <div key={vote.id} className="p-2 bg-gray-100 rounded">
              {vote.option} - {new Date(vote.created_at).toLocaleString()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

Save this as `src/App.tsx`, and you have a working realtime voting app!
