# @mini-apps/db

Supabase client package for the mini-apps monorepo.

## Installation

This package is part of the mini-apps workspace. Add it to your app's dependencies:

```json
{
  "dependencies": {
    "@mini-apps/db": "workspace:*"
  }
}
```

## Setup

### 1. Environment Variables

Create a `.env` file in your app directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

## Usage

### Basic Query

```typescript
import { supabase } from "@mini-apps/db";

// Select data
const { data, error } = await supabase
  .from('users')
  .select('*');

if (error) {
  console.error('Error:', error);
} else {
  console.log('Users:', data);
}
```

### Insert Data

```typescript
import { supabase } from "@mini-apps/db";

const { data, error } = await supabase
  .from('users')
  .insert([
    { email: 'user@example.com', name: 'John Doe' }
  ])
  .select();
```

### Update Data

```typescript
import { supabase } from "@mini-apps/db";

const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane Doe' })
  .eq('id', userId)
  .select();
```

### Delete Data

```typescript
import { supabase } from "@mini-apps/db";

const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);
```

### Realtime Subscriptions

```typescript
import { supabase } from "@mini-apps/db";

const channel = supabase
  .channel('room1')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();

// Cleanup
channel.unsubscribe();
```

## Type Safety

### Generate Types from Supabase Schema

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Generate types
supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/db/src/types.ts
```

### Using Generated Types

```typescript
import { supabase, type Database } from "@mini-apps/db";

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

const { data, error } = await supabase
  .from('users')
  .select('*')
  .returns<User[]>();
```

## Authentication

### Sign Up

```typescript
import { supabase } from "@mini-apps/db";

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign In

```typescript
import { supabase } from "@mini-apps/db";

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Social Login (Google, Kakao, etc.)

```typescript
import { supabase } from "@mini-apps/db";

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin
  }
});
```

### Get Current User

```typescript
import { supabase } from "@mini-apps/db";

const { data: { user } } = await supabase.auth.getUser();
```

### Sign Out

```typescript
import { supabase } from "@mini-apps/db";

const { error } = await supabase.auth.signOut();
```

## Development

```bash
# Build the package
pnpm --filter @mini-apps/db build

# Watch mode
pnpm --filter @mini-apps/db dev

# Type check
pnpm --filter @mini-apps/db typecheck
```

## Resources

- [Supabase JavaScript Client Documentation](https://supabase.com/docs/reference/javascript)
- [Supabase Authentication Guide](https://supabase.com/docs/guides/auth)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
