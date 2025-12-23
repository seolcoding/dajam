# Migration Guide: Adding @mini-apps/db to Your App

This guide shows how to integrate the `@mini-apps/db` package into an existing mini-app.

## Step 1: Add Dependency

Edit your app's `package.json`:

```json
{
  "name": "your-app-name",
  "dependencies": {
    "@mini-apps/db": "workspace:*",
    // ... other dependencies
  }
}
```

Then run:

```bash
pnpm install
```

## Step 2: Create Environment Variables

Create a `.env` file in your app directory:

```env
# Get these from https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Add `.env` to your `.gitignore`:

```
.env
.env.local
```

## Step 3: Update Vite Config (if needed)

If you need to customize environment variable handling, update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Environment variables are automatically loaded
  // No additional config needed for VITE_* variables
});
```

## Step 4: Create Supabase Schema

### Option A: Using Supabase Dashboard

1. Go to https://app.supabase.com/
2. Create a new project (or select existing)
3. Go to SQL Editor
4. Create your tables:

```sql
-- Example: Votes table for live-voting app
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
```

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI globally
npm install -g supabase

# Initialize Supabase (creates supabase/ directory)
supabase init

# Create migration
supabase migration new create_votes_table

# Edit the migration file in supabase/migrations/
# Then push to remote
supabase db push
```

## Step 5: Generate TypeScript Types

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login
supabase login

# Generate types from your project
supabase gen types typescript \
  --project-id your-project-id \
  > /Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps/packages/db/src/types.ts
```

Or get your project ID from the dashboard and run:

```bash
cd /Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps/packages/db
pnpm exec supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types.ts

# Rebuild the package
cd ../..
pnpm --filter @mini-apps/db build
```

## Step 6: Use in Your App

### Basic Example: Fetching Data

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@mini-apps/db';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('your_table')
        .select('*');

      if (error) {
        console.error('Error:', error);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Realtime Example: Live Updates

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@mini-apps/db';

function LiveComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Initial fetch
    async function fetchInitial() {
      const { data } = await supabase
        .from('your_table')
        .select('*');
      setData(data || []);
    }

    fetchInitial();

    // Subscribe to changes
    const channel = supabase
      .channel('realtime-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'your_table'
      }, (payload) => {
        console.log('Change received!', payload);

        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item =>
            item.id === payload.new.id ? payload.new : item
          ));
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    // Cleanup
    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{JSON.stringify(item)}</div>
      ))}
    </div>
  );
}
```

## Migration Examples

### Example 1: live-voting App

**Before** (localStorage):
```typescript
const [votes, setVotes] = useState(() => {
  const saved = localStorage.getItem('votes');
  return saved ? JSON.parse(saved) : [];
});
```

**After** (Supabase):
```typescript
const [votes, setVotes] = useState([]);

useEffect(() => {
  // Fetch initial votes
  async function loadVotes() {
    const { data } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false });
    setVotes(data || []);
  }

  loadVotes();

  // Subscribe to realtime updates
  const channel = supabase
    .channel('votes-realtime')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'votes'
    }, (payload) => {
      if (payload.eventType === 'INSERT') {
        setVotes(prev => [payload.new, ...prev]);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
}, []);

// Add new vote
async function addVote(option: string) {
  const { error } = await supabase
    .from('votes')
    .insert({ option });

  if (error) console.error('Error:', error);
}
```

### Example 2: chosung-quiz App

**Schema**:
```sql
CREATE TABLE quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT,
  score INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_results_score ON quiz_results(score DESC);
```

**Usage**:
```typescript
// Save result
async function saveQuizResult(name: string, score: number) {
  const { error } = await supabase
    .from('quiz_results')
    .insert({ user_name: name, score });

  if (error) console.error('Error:', error);
}

// Get leaderboard
async function getLeaderboard() {
  const { data } = await supabase
    .from('quiz_results')
    .select('*')
    .order('score', { ascending: false })
    .limit(10);

  return data || [];
}
```

## Troubleshooting

### Environment Variables Not Found

Error: `Supabase credentials not found`

Solution:
- Ensure `.env` file exists in your app directory
- Variables must start with `VITE_`
- Restart dev server after creating `.env`

### Type Errors

Error: `Property 'X' does not exist on type 'Database'`

Solution:
- Run type generation: `supabase gen types typescript`
- Rebuild db package: `pnpm --filter @mini-apps/db build`
- Restart your app dev server

### CORS Errors

Error: `CORS policy: No 'Access-Control-Allow-Origin'`

Solution:
1. Go to Supabase Dashboard
2. Settings → API
3. Add your development URL to allowed origins
4. For localhost: `http://localhost:5173`

### Realtime Not Working

Solution:
1. Check table has realtime enabled:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE your_table;
   ```
2. Verify RLS policies allow subscriptions
3. Check browser console for connection errors

## Best Practices

### 1. Error Handling

```typescript
async function fetchData() {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error:', error.message);
    // Show user-friendly error
    toast.error('Failed to load data');
    return [];
  }
}
```

### 2. Loading States

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function load() {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('table').select('*');
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);
```

### 3. Custom Hooks

```typescript
// hooks/useSupabaseQuery.ts
import { useState, useEffect } from 'react';
import { supabase } from '@mini-apps/db';

export function useSupabaseQuery<T>(
  table: string,
  query?: (q: any) => any
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        let q = supabase.from(table).select('*');
        if (query) q = query(q);

        const { data, error } = await q;
        if (error) throw error;

        setData(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [table]);

  return { data, loading, error };
}

// Usage
function MyComponent() {
  const { data, loading, error } = useSupabaseQuery('votes');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data.length} votes</div>;
}
```

## Next Steps

1. Read the full [Supabase Documentation](https://supabase.com/docs)
2. Explore [authentication features](https://supabase.com/docs/guides/auth)
3. Learn about [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
4. Check out [realtime features](https://supabase.com/docs/guides/realtime)
