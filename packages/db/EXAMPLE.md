# Example Usage

## Basic Setup

### 1. Add dependency to your app

In your app's `package.json`:

```json
{
  "dependencies": {
    "@mini-apps/db": "workspace:*"
  }
}
```

### 2. Create `.env` file

Create `.env` in your app directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Import and use

```typescript
import { supabase } from "@mini-apps/db";

// Example: Fetch users
const { data: users, error } = await supabase
  .from('users')
  .select('*');

if (error) {
  console.error('Error fetching users:', error);
} else {
  console.log('Users:', users);
}
```

## React Example with Hooks

### Custom Hook for Data Fetching

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@mini-apps/db';

function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return { users, loading, error };
}

// Usage in component
function UserList() {
  const { users, loading, error } = useUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Realtime Example

### Live Voting App

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@mini-apps/db';

function LiveVoting() {
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    // Initial fetch
    async function fetchVotes() {
      const { data } = await supabase
        .from('votes')
        .select('*');
      setVotes(data || []);
    }

    fetchVotes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('votes-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setVotes(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setVotes(prev => prev.map(v =>
            v.id === payload.new.id ? payload.new : v
          ));
        } else if (payload.eventType === 'DELETE') {
          setVotes(prev => prev.filter(v => v.id !== payload.old.id));
        }
      })
      .subscribe();

    // Cleanup
    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function addVote(option: string) {
    const { error } = await supabase
      .from('votes')
      .insert({ option, user_id: 'anonymous' });

    if (error) console.error('Error voting:', error);
  }

  return (
    <div>
      <h2>Live Voting</h2>
      <button onClick={() => addVote('A')}>Vote A</button>
      <button onClick={() => addVote('B')}>Vote B</button>
      <div>
        {votes.map(vote => (
          <div key={vote.id}>{vote.option}</div>
        ))}
      </div>
    </div>
  );
}
```

## Authentication Example

### Login/Signup Component

```typescript
import { useState } from 'react';
import { supabase } from '@mini-apps/db';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Signup error:', error);
    } else {
      console.log('Signed up:', data);
    }
  }

  async function handleSignIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
    } else {
      console.log('Logged in:', data);
    }
  }

  async function handleGoogleLogin() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  }

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
    </div>
  );
}
```

## Type-Safe Queries

### With Generated Types

```typescript
import { supabase, type Database } from '@mini-apps/db';

// Type definitions
type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];

// Type-safe insert
async function createUser(userData: UserInsert) {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();

  return { data: data as User | null, error };
}

// Type-safe query
async function getUser(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error:', error);
    return null;
  }

  return data as User;
}
```

## Zustand Integration

### Global State with Supabase

```typescript
import { create } from 'zustand';
import { supabase } from '@mini-apps/db';

interface UserStore {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      set({ user: data.user });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  checkAuth: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    set({ user, loading: false });
  },
}));

// Usage in component
function App() {
  const { user, loading, checkAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  return user ? <Dashboard /> : <Login />;
}
```
