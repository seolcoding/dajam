# Claper Architecture Analysis

> Detailed analysis of the Claper GitHub repository for implementing real-time interactive presentation features in Next.js + Supabase

**Repository**: https://github.com/ClaperCo/Claper
**Tech Stack**: Elixir, Phoenix LiveView, PostgreSQL
**Analysis Date**: 2025-12-23

---

## 1. PDF/PPT Processing Logic

### Current Findings

**❌ No Ghostscript/LibreOffice Integration Found**

After extensive code search, Claper **does not** use Ghostscript or LibreOffice for PDF/PPT conversion. Instead:

### Actual Implementation

```elixir
# lib/claper/presentations.ex
def get_slide_urls(hash, length) do
  base_url =
    case Application.get_env(:claper, :storage_provider) do
      "local" -> ""
      "s3" -> Application.get_env(:claper, :s3_base_url)
    end

  for i <- 1..length do
    "#{base_url}/uploads/#{hash}/#{i}.jpg"
  end
end
```

**Key Insights:**
- Slides are **pre-converted to JPG images** (numbered 1.jpg, 2.jpg, etc.)
- Files are stored either **locally** (`/uploads/{hash}/{index}.jpg`) or on **S3** (`{base_url}/presentations/{hash}/{index}.jpg`)
- The `hash` field acts as a unique identifier for the presentation
- The `length` field stores the total number of slides
- The `status` field tracks processing state ("processing" → "done")

### Presentation File Schema

```elixir
# Database migration: 20220226210445_create_presentation_files.exs
create table(:presentation_files) do
  add :hash, :string       # Unique file identifier
  add :length, :integer    # Number of slides
  add :status, :string, default: "processing"
  add :event_id, references(:events, on_delete: :delete_all)
  timestamps()
end

create unique_index(:presentation_files, [:hash])
```

### What This Means for Next.js Implementation

**Option 1: Client-Side Conversion (Browser)**
```typescript
// Using pdf.js (Mozilla's PDF library)
import * as pdfjsLib from 'pdfjs-dist';

async function convertPdfToImages(pdfFile: File) {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

  const images: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    const viewport = page.getViewport({ scale: 2.0 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
    images.push(canvas.toDataURL('image/jpeg', 0.9));
  }

  return images;
}
```

**Option 2: Server-Side with Supabase Edge Functions**
```typescript
// supabase/functions/convert-pdf/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { pdfUrl } = await req.json();

  // Use pdf-lib or similar Deno-compatible library
  // Convert each page to image
  // Upload images to Supabase Storage
  // Return array of image URLs

  return new Response(JSON.stringify({ images }));
});
```

**Option 3: External Service (Recommended)**
- Use **Cloudinary** or **imgproxy** for PDF → image conversion
- Upload PDF to Supabase Storage → trigger Edge Function → call conversion API → save images back
- Most reliable but adds cost

---

## 2. Real-Time Architecture

### Phoenix LiveView Implementation

Claper uses **Phoenix LiveView** (server-rendered real-time updates) instead of Phoenix Channels. This is similar to how Supabase Realtime works.

### Core Real-Time Components

#### A. Event LiveView (`lib/claper_web/live/event_live/show.ex`)

```elixir
defmodule ClaperWeb.EventLive.Show do
  use ClaperWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      # Subscribe to event updates
      Claper.Events.Event.subscribe(event.uuid)

      # Subscribe to presentation changes
      Claper.Presentations.subscribe(event.presentation_file.id)

      # Track presence for attendee count
      Phoenix.PubSub.subscribe(Claper.PubSub, "event:#{event.uuid}")
    end

    {:ok, assign(socket, ...)}
  end

  # Handle real-time updates
  @impl true
  def handle_info({:presentation_state_updated, state}, socket) do
    {:noreply, assign(socket, presentation_state: state)}
  end

  def handle_info({:poll_updated, poll}, socket) do
    # Update poll in real-time
    {:noreply, update_poll(socket, poll)}
  end
end
```

#### B. PubSub Broadcasting

```elixir
# lib/claper/presentations.ex
defp broadcast({:ok, state}, event) do
  Phoenix.PubSub.broadcast(
    Claper.PubSub,
    "event:#{state.event_id}",
    {event, state}
  )
  {:ok, state}
end

# Usage
def update_presentation_state(state, attrs) do
  state
  |> PresentationState.changeset(attrs)
  |> Repo.update()
  |> broadcast(:presentation_state_updated)
end
```

### Next.js + Supabase Equivalent

#### Using Supabase Realtime

```typescript
// lib/realtime/presentation-sync.ts
import { createClient } from '@/lib/supabase/client';

export function subscribeToPresentationUpdates(
  eventId: string,
  callbacks: {
    onSlideChange?: (slide: number) => void;
    onPollUpdate?: (poll: Poll) => void;
    onNewMessage?: (message: Message) => void;
    onAttendeeJoin?: (count: number) => void;
  }
) {
  const supabase = createClient();

  // Subscribe to presentation state changes
  const stateChannel = supabase
    .channel(`presentation:${eventId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'presentation_states',
        filter: `event_id=eq.${eventId}`
      },
      (payload) => {
        if (payload.new.current_slide !== payload.old.current_slide) {
          callbacks.onSlideChange?.(payload.new.current_slide);
        }
      }
    )
    .subscribe();

  // Subscribe to poll updates
  const pollChannel = supabase
    .channel(`polls:${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'poll_votes',
        filter: `event_id=eq.${eventId}`
      },
      (payload) => {
        callbacks.onPollUpdate?.(payload.new);
      }
    )
    .subscribe();

  // Subscribe to presence for attendee tracking
  const presenceChannel = supabase
    .channel(`presence:${eventId}`)
    .on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      const count = Object.keys(state).length;
      callbacks.onAttendeeJoin?.(count);
    })
    .subscribe();

  return () => {
    stateChannel.unsubscribe();
    pollChannel.unsubscribe();
    presenceChannel.unsubscribe();
  };
}
```

#### React Hook Usage

```typescript
// hooks/use-presentation-sync.ts
export function usePresentationSync(eventId: string) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [attendeeCount, setAttendeeCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToPresentationUpdates(eventId, {
      onSlideChange: setCurrentSlide,
      onAttendeeJoin: setAttendeeCount,
      onPollUpdate: (poll) => {
        // Update poll results in real-time
        queryClient.setQueryData(['poll', poll.id], poll);
      },
    });

    return unsubscribe;
  }, [eventId]);

  return { currentSlide, attendeeCount };
}
```

---

## 3. Data Models

### Complete Database Schema

#### Events Table

```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,  -- 5-10 char join code
  started_at TIMESTAMP,
  expired_at TIMESTAMP,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  presentation_file_id BIGINT REFERENCES presentation_files(id),
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_events_code ON events(code);
CREATE INDEX idx_events_uuid ON events(uuid);
```

#### Presentation Files Table

```sql
CREATE TABLE presentation_files (
  id BIGSERIAL PRIMARY KEY,
  hash VARCHAR(255) UNIQUE NOT NULL,  -- File hash/identifier
  length INTEGER,                      -- Number of slides
  status VARCHAR(50) DEFAULT 'processing',
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

#### Presentation States Table

```sql
CREATE TABLE presentation_states (
  id BIGSERIAL PRIMARY KEY,
  current_slide INTEGER DEFAULT 1,
  chat_enabled BOOLEAN DEFAULT TRUE,
  anonymous_chat_enabled BOOLEAN DEFAULT TRUE,
  message_reaction_enabled BOOLEAN DEFAULT TRUE,
  show_attendee_count BOOLEAN DEFAULT TRUE,
  pinned BOOLEAN DEFAULT FALSE,
  presentation_file_id BIGINT UNIQUE REFERENCES presentation_files(id),
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

#### Polls Table

```sql
CREATE TABLE polls (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  position INTEGER DEFAULT 0,        -- Slide number
  enabled BOOLEAN DEFAULT TRUE,
  multiple BOOLEAN DEFAULT FALSE,    -- Allow multiple choices
  show_results BOOLEAN DEFAULT TRUE,
  presentation_file_id BIGINT REFERENCES presentation_files(id) ON DELETE SET NULL,
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

#### Poll Options Table

```sql
CREATE TABLE poll_opts (
  id BIGSERIAL PRIMARY KEY,
  content VARCHAR(255) NOT NULL,
  vote_count INTEGER DEFAULT 0,
  poll_id BIGINT REFERENCES polls(id) ON DELETE CASCADE,
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

#### Poll Votes Table

```sql
CREATE TABLE poll_votes (
  id BIGSERIAL PRIMARY KEY,
  attendee_identifier VARCHAR(255),  -- Anonymous voter ID
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  poll_id BIGINT REFERENCES polls(id) ON DELETE CASCADE,
  poll_opt_id BIGINT REFERENCES poll_opts(id) ON DELETE CASCADE,
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Prevent duplicate votes (unless multiple choice enabled)
CREATE UNIQUE INDEX idx_unique_vote
  ON poll_votes(poll_id, COALESCE(user_id, 0), COALESCE(attendee_identifier, ''));
```

#### Posts (Q&A) Table

```sql
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  body TEXT NOT NULL,
  name VARCHAR(255),                 -- Display name
  attendee_identifier VARCHAR(255),  -- Anonymous ID
  like_count INTEGER DEFAULT 0,      -- 👍 reactions
  love_count INTEGER DEFAULT 0,      -- ❤️ reactions
  lol_count INTEGER DEFAULT 0,       -- 😂 reactions
  position INTEGER DEFAULT 0,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_posts_attendee ON posts(attendee_identifier);
CREATE INDEX idx_posts_user ON posts(user_id);
```

#### Forms Table

```sql
CREATE TABLE forms (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  fields JSONB NOT NULL,  -- Array of form field configs
  position INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  presentation_file_id BIGINT REFERENCES presentation_files(id),
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

#### Form Submits Table

```sql
CREATE TABLE form_submits (
  id BIGSERIAL PRIMARY KEY,
  response JSONB NOT NULL,  -- Form responses
  attendee_identifier VARCHAR(255),
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  form_id BIGINT REFERENCES forms(id) ON DELETE CASCADE,
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

#### Quizzes Table (New in v2)

```sql
CREATE TABLE quizzes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  questions JSONB NOT NULL,  -- Array of quiz questions
  position INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  allow_anonymous BOOLEAN DEFAULT TRUE,
  presentation_file_id BIGINT REFERENCES presentation_files(id),
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

---

## 4. Interaction Types

### Supported Features

#### 1. **Live Polling** ✅

**Features:**
- Single or multiple choice
- Real-time vote counting
- Show/hide results toggle
- Position linked to specific slides

**Implementation Example:**
```typescript
// Create poll
const { data: poll } = await supabase
  .from('polls')
  .insert({
    title: 'What is your favorite feature?',
    position: 5,  // Show on slide 5
    multiple: false,
    show_results: true,
    presentation_file_id: presentationId,
  })
  .select()
  .single();

// Add options
await supabase.from('poll_opts').insert([
  { content: 'Real-time sync', poll_id: poll.id },
  { content: 'Q&A feature', poll_id: poll.id },
  { content: 'Anonymous participation', poll_id: poll.id },
]);

// Cast vote
await supabase.from('poll_votes').insert({
  poll_id: pollId,
  poll_opt_id: optionId,
  attendee_identifier: anonymousId,
});

// Get results
const { data: results } = await supabase
  .from('poll_opts')
  .select('content, vote_count')
  .eq('poll_id', pollId)
  .order('id');
```

#### 2. **Q&A / Posts** ✅

**Features:**
- Text message submission
- Three reaction types (like, love, lol)
- Pinning important questions
- Anonymous or authenticated posting

**Implementation:**
```typescript
// Submit question
await supabase.from('posts').insert({
  body: question,
  name: displayName,
  attendee_identifier: anonymousId,
  event_id: eventId,
});

// Add reaction
await supabase.rpc('increment_reaction', {
  post_id: postId,
  reaction_type: 'like',  // or 'love', 'lol'
});
```

#### 3. **Forms** ✅

**Features:**
- Custom field definitions (stored as JSONB)
- Response tracking
- Slide-specific positioning

**Schema:**
```typescript
interface FormField {
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  required: boolean;
  options?: string[];  // For select/radio/checkbox
}

// Create form
await supabase.from('forms').insert({
  title: 'Feedback Form',
  fields: [
    { type: 'text', label: 'Name', required: true },
    { type: 'textarea', label: 'Comments', required: false },
    { type: 'select', label: 'Rating', options: ['1', '2', '3', '4', '5'] }
  ],
  position: 10,
  presentation_file_id: presentationId,
});
```

#### 4. **Quizzes** ✅

**Features:**
- Multiple questions per quiz
- Scoring system
- Time limits
- Anonymous participation option

#### 5. **Reactions** ✅

**Features:**
- Real-time emoji reactions
- Counter updates
- Message-specific reactions

#### 6. **Embeds** ✅

**Features:**
- YouTube, Vimeo, custom iframe
- Provider-specific handling
- Positioned on specific slides

```sql
CREATE TABLE embeds (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,  -- URL or embed code
  provider VARCHAR(50),   -- 'youtube', 'vimeo', 'custom'
  position INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  presentation_file_id BIGINT REFERENCES presentation_files(id),
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

---

## 5. Session Management

### Presenter vs. Attendee Flow

#### Event Creation Flow

```elixir
# 1. User creates event
def create_event(attrs) do
  %Event{}
  |> Event.create_changeset(attrs)
  |> Repo.insert()
end

# Generates:
# - UUID for unique identification
# - 5-10 character join code (normalized, alphanumeric)
# - Sets user_id as organizer
# - Sets expiration (default 48 hours)
```

**Next.js Implementation:**
```typescript
// app/api/events/create/route.ts
export async function POST(req: Request) {
  const { name, userId } = await req.json();

  const joinCode = generateJoinCode(); // Generate 6-char code

  const { data: event } = await supabase
    .from('events')
    .insert({
      name,
      code: joinCode,
      user_id: userId,
      expired_at: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    })
    .select()
    .single();

  return Response.json({ event, joinCode });
}

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
```

#### Attendee Join Flow

```typescript
// 1. Attendee enters join code
async function joinEvent(joinCode: string) {
  const { data: event } = await supabase
    .from('events')
    .select('*, presentation_file:presentation_files(*)')
    .eq('code', joinCode.toLowerCase())
    .single();

  if (!event) throw new Error('Event not found');
  if (new Date(event.expired_at) < new Date()) {
    throw new Error('Event has expired');
  }

  return event;
}

// 2. Generate anonymous identifier (if not logged in)
function getAttendeeIdentifier(): string {
  let id = localStorage.getItem('attendee_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('attendee_id', id);
  }
  return id;
}

// 3. Join presence channel
const presenceChannel = supabase
  .channel(`presence:${event.id}`)
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    updateAttendeeCount(Object.keys(state).length);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: user?.id,
        attendee_id: getAttendeeIdentifier(),
        online_at: new Date().toISOString(),
      });
    }
  });
```

#### Presenter Authentication

```elixir
# lib/claper_web/live/event_live/show.ex
def mount(_params, _session, socket) do
  event = Events.get_event!(event_id)
  user = socket.assigns.current_user

  is_presenter = event.user_id == user.id

  {:ok, assign(socket, is_presenter: is_presenter)}
end
```

**Next.js Implementation:**
```typescript
// Check if current user is presenter
const { data: event } = await supabase
  .from('events')
  .select('user_id')
  .eq('id', eventId)
  .single();

const isPresenter = event.user_id === session.user.id;
```

### Presence Tracking

**Claper uses Phoenix Presence** - we can replicate with Supabase Realtime Presence:

```typescript
// Track audience in real-time
const presenceChannel = supabase
  .channel(`event:${eventId}:presence`, {
    config: {
      presence: {
        key: attendeeId,
      },
    },
  });

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    const attendeeCount = Object.keys(state).length;

    // Update peak if necessary
    if (attendeeCount > currentPeak) {
      supabase
        .from('events')
        .update({ audience_peak: attendeeCount })
        .eq('id', eventId);
    }
  })
  .subscribe();
```

---

## 6. Key Code Patterns for Adaptation

### Pattern 1: Real-Time State Broadcasting

**Claper (Phoenix):**
```elixir
defp broadcast({:ok, state}, event) do
  Phoenix.PubSub.broadcast(
    Claper.PubSub,
    "presentation:#{state.id}",
    {event, state}
  )
  {:ok, state}
end
```

**Next.js + Supabase:**
```typescript
async function updatePresentationState(
  presentationId: number,
  updates: Partial<PresentationState>
) {
  const { data } = await supabase
    .from('presentation_states')
    .update(updates)
    .eq('id', presentationId)
    .select()
    .single();

  // Supabase automatically broadcasts via postgres_changes subscription
  // No manual broadcast needed!

  return data;
}
```

### Pattern 2: Slide Synchronization

**Claper:**
```elixir
def handle_event("slide_change", %{"position" => position}, socket) do
  {:ok, state} = Presentations.update_presentation_state(
    socket.assigns.presentation_state,
    %{current_slide: position}
  )
  {:noreply, assign(socket, presentation_state: state)}
end
```

**Next.js:**
```typescript
// Presenter changes slide
async function changeSlide(presentationId: number, slideNumber: number) {
  await supabase
    .from('presentation_states')
    .update({ current_slide: slideNumber })
    .eq('id', presentationId);
}

// All attendees receive update automatically via subscription
supabase
  .channel(`presentation:${presentationId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'presentation_states',
    },
    (payload) => {
      setCurrentSlide(payload.new.current_slide);
    }
  )
  .subscribe();
```

### Pattern 3: Poll Vote Aggregation

**Claper:**
```elixir
def vote(poll_id, opt_id, attendee_identifier) do
  with {:ok, vote} <- create_vote(%{
    poll_id: poll_id,
    poll_opt_id: opt_id,
    attendee_identifier: attendee_identifier
  }) do
    # Increment vote count
    increment_vote_count(opt_id)
    broadcast_poll_update(poll_id)
    {:ok, vote}
  end
end
```

**Next.js:**
```typescript
// Use Postgres function for atomic increment
await supabase.rpc('cast_poll_vote', {
  p_poll_id: pollId,
  p_opt_id: optionId,
  p_attendee_id: attendeeId,
});

-- SQL function:
CREATE OR REPLACE FUNCTION cast_poll_vote(
  p_poll_id BIGINT,
  p_opt_id BIGINT,
  p_attendee_id VARCHAR
)
RETURNS void AS $$
BEGIN
  -- Insert vote (will fail if duplicate due to unique constraint)
  INSERT INTO poll_votes (poll_id, poll_opt_id, attendee_identifier)
  VALUES (p_poll_id, p_opt_id, p_attendee_id);

  -- Increment vote count atomically
  UPDATE poll_opts
  SET vote_count = vote_count + 1
  WHERE id = p_opt_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. Recommended Next.js Architecture

### Suggested File Structure

```
src/
├── app/
│   ├── (presenter)/
│   │   ├── events/
│   │   │   ├── [eventId]/
│   │   │   │   ├── page.tsx           # Presenter view
│   │   │   │   ├── slides/page.tsx    # Slide editor
│   │   │   │   └── polls/page.tsx     # Poll management
│   │   │   └── new/page.tsx           # Create event
│   │   └── layout.tsx
│   ├── (attendee)/
│   │   └── join/
│   │       └── [code]/page.tsx        # Attendee join/view
│   └── api/
│       ├── upload/route.ts            # PDF upload
│       ├── convert/route.ts           # Trigger conversion
│       └── events/
│           └── [eventId]/route.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── realtime/
│   │   ├── presentation-sync.ts       # Slide sync logic
│   │   ├── poll-sync.ts               # Poll updates
│   │   ├── presence.ts                # Attendee tracking
│   │   └── subscriptions.ts           # Centralized subscriptions
│   └── pdf/
│       ├── client-converter.ts        # Browser-based conversion
│       └── edge-converter.ts          # Edge function converter
├── components/
│   ├── presenter/
│   │   ├── SlideNavigator.tsx
│   │   ├── PollCreator.tsx
│   │   ├── QADashboard.tsx
│   │   └── AttendeeCounter.tsx
│   ├── attendee/
│   │   ├── SlideViewer.tsx
│   │   ├── PollVoter.tsx
│   │   ├── QASubmitter.tsx
│   │   └── ReactionBar.tsx
│   └── shared/
│       ├── PollResults.tsx
│       └── ChatMessages.tsx
└── types/
    ├── database.ts                     # Supabase generated types
    └── realtime.ts                     # Realtime event types
```

### Database Setup (Supabase)

```sql
-- Run these migrations in Supabase SQL Editor

-- 1. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE presentation_states;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_opts;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- 2. Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 3. Policies for public read access (with join code)
CREATE POLICY "Anyone can read events with valid code"
  ON events FOR SELECT
  USING (true);  -- Filter by code in application

CREATE POLICY "Presenters can update their events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read polls"
  ON polls FOR SELECT
  USING (true);

CREATE POLICY "Anyone can vote"
  ON poll_votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can post questions"
  ON posts FOR INSERT
  WITH CHECK (true);

-- 4. Indexes for performance
CREATE INDEX idx_events_code ON events(code);
CREATE INDEX idx_presentation_states_event ON presentation_states(presentation_file_id);
CREATE INDEX idx_polls_presentation ON polls(presentation_file_id);
CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_posts_event ON posts(event_id);
```

---

## 8. Critical Differences: Phoenix LiveView vs. Next.js

| Feature | Phoenix LiveView | Next.js + Supabase |
|---------|------------------|---------------------|
| **Real-time** | Server-rendered over WebSocket | Client-side with Realtime subscriptions |
| **State Management** | Server-side socket assigns | Client-side React state + query cache |
| **Broadcasting** | Manual PubSub.broadcast() | Automatic via postgres_changes |
| **Presence** | Phoenix.Presence module | Supabase Realtime Presence |
| **Forms** | LiveView change events | React controlled components |
| **File Upload** | Phoenix.LiveView.Uploads | Client upload → Supabase Storage |
| **Latency** | Higher (server round-trip) | Lower (optimistic updates) |

---

## 9. Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- [ ] Set up Supabase project with schema
- [ ] Implement authentication (presenter/attendee)
- [ ] Create event creation flow with join codes
- [ ] Build basic slide viewer component

### Phase 2: PDF Processing (Week 2)
- [ ] Implement client-side PDF → JPG conversion
- [ ] Set up Supabase Storage buckets
- [ ] Build upload UI with progress tracking
- [ ] Create thumbnail generation

### Phase 3: Real-Time Features (Week 2-3)
- [ ] Implement presentation state sync
- [ ] Build slide navigation (presenter controls)
- [ ] Add presence tracking (attendee count)
- [ ] Create real-time slide viewer (attendee)

### Phase 4: Interactive Features (Week 3-4)
- [ ] Build poll creation UI (presenter)
- [ ] Implement poll voting (attendee)
- [ ] Add real-time poll results
- [ ] Create Q&A posting system
- [ ] Add reaction system (👍❤️😂)

### Phase 5: Polish & Testing (Week 4)
- [ ] Add form builder
- [ ] Implement quiz feature
- [ ] Performance optimization
- [ ] E2E testing with Playwright
- [ ] Mobile responsiveness

---

## 10. Key Takeaways

### What Claper Does Well
✅ **Clean separation of concerns** - Presentations, Events, Polls are separate contexts
✅ **Real-time architecture** - Every interaction broadcasts to all participants
✅ **Anonymous participation** - No signup required for attendees
✅ **Flexible positioning** - Polls/forms/embeds tied to specific slides
✅ **Simple join flow** - Just a 6-character code

### What to Improve in Next.js Version
🎯 **Better file processing** - Add proper PDF/PPTX conversion (Claper outsources this)
🎯 **Offline support** - Use Service Workers for cached slides
🎯 **Better mobile UX** - Claper is desktop-first, make it mobile-first
🎯 **Richer interactions** - Add drawing, annotations, laser pointer
🎯 **Analytics** - Track engagement metrics beyond just attendee count

### Claper's Missing Features (Opportunities)
❌ No actual PDF/PPT conversion code (must be external service)
❌ No slide editing/reordering after upload
❌ No presenter notes or timer
❌ Limited analytics/reporting
❌ No breakout rooms or small groups

---

## 11. Sample Implementation: Poll Feature

### Complete Poll Flow (Next.js + Supabase)

#### 1. Create Poll (Presenter)

```typescript
// components/presenter/PollCreator.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function PollCreator({ presentationId, slideNumber }: Props) {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multiple, setMultiple] = useState(false);

  async function handleCreate() {
    const supabase = createClient();

    // 1. Create poll
    const { data: poll } = await supabase
      .from('polls')
      .insert({
        title,
        position: slideNumber,
        multiple,
        presentation_file_id: presentationId,
        enabled: true,
      })
      .select()
      .single();

    // 2. Create options
    const optionsData = options
      .filter(o => o.trim())
      .map(content => ({
        content,
        poll_id: poll.id,
      }));

    await supabase.from('poll_opts').insert(optionsData);

    // 3. Real-time broadcast happens automatically!
  }

  return (
    <form onSubmit={handleCreate}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Poll question..."
      />

      {options.map((opt, i) => (
        <input
          key={i}
          value={opt}
          onChange={e => {
            const newOpts = [...options];
            newOpts[i] = e.target.value;
            setOptions(newOpts);
          }}
          placeholder={`Option ${i + 1}`}
        />
      ))}

      <button onClick={() => setOptions([...options, ''])}>
        Add Option
      </button>

      <label>
        <input
          type="checkbox"
          checked={multiple}
          onChange={e => setMultiple(e.target.checked)}
        />
        Allow multiple selections
      </label>

      <button type="submit">Create Poll</button>
    </form>
  );
}
```

#### 2. Vote on Poll (Attendee)

```typescript
// components/attendee/PollVoter.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePollResults } from '@/hooks/use-poll-results';

export function PollVoter({ pollId }: Props) {
  const { poll, options, refetch } = usePollResults(pollId);
  const [selected, setSelected] = useState<number[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  async function handleVote() {
    const supabase = createClient();
    const attendeeId = getAttendeeIdentifier();

    // Insert votes using RPC for atomic operation
    for (const optId of selected) {
      await supabase.rpc('cast_poll_vote', {
        p_poll_id: pollId,
        p_opt_id: optId,
        p_attendee_id: attendeeId,
      });
    }

    setHasVoted(true);
    refetch(); // Refresh results
  }

  if (hasVoted || !poll?.show_results) {
    return <PollResults pollId={pollId} />;
  }

  return (
    <div>
      <h3>{poll.title}</h3>

      {options.map(option => (
        <label key={option.id}>
          <input
            type={poll.multiple ? 'checkbox' : 'radio'}
            checked={selected.includes(option.id)}
            onChange={() => {
              if (poll.multiple) {
                setSelected(prev =>
                  prev.includes(option.id)
                    ? prev.filter(id => id !== option.id)
                    : [...prev, option.id]
                );
              } else {
                setSelected([option.id]);
              }
            }}
          />
          {option.content}
        </label>
      ))}

      <button onClick={handleVote} disabled={selected.length === 0}>
        Submit Vote
      </button>
    </div>
  );
}
```

#### 3. Real-Time Results

```typescript
// hooks/use-poll-results.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePollResults(pollId: number) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    async function fetchData() {
      const { data: pollData } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      const { data: optionsData } = await supabase
        .from('poll_opts')
        .select('*')
        .eq('poll_id', pollId)
        .order('id');

      setPoll(pollData);
      setOptions(optionsData);
    }

    fetchData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`poll:${pollId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'poll_opts',
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          setOptions(prev =>
            prev.map(opt =>
              opt.id === payload.new.id ? payload.new : opt
            )
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [pollId]);

  const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);

  return {
    poll,
    options: options.map(opt => ({
      ...opt,
      percentage: totalVotes > 0 ? (opt.vote_count / totalVotes) * 100 : 0,
    })),
    totalVotes,
    refetch: () => fetchData(),
  };
}
```

#### 4. Display Results

```typescript
// components/shared/PollResults.tsx
import { usePollResults } from '@/hooks/use-poll-results';

export function PollResults({ pollId }: { pollId: number }) {
  const { poll, options, totalVotes } = usePollResults(pollId);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">{poll?.title}</h3>
      <p className="text-sm text-gray-500">{totalVotes} votes</p>

      <div className="space-y-2">
        {options.map(option => (
          <div key={option.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{option.content}</span>
              <span className="font-semibold">
                {option.vote_count} ({option.percentage.toFixed(1)}%)
              </span>
            </div>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Conclusion

Claper provides an excellent blueprint for building real-time interactive presentation apps, but relies on external services for PDF processing. The Phoenix LiveView patterns translate well to Next.js + Supabase Realtime, with Supabase actually simplifying some aspects (automatic broadcasting, built-in presence).

**Key advantages of Next.js + Supabase approach:**
- Better client-side performance (optimistic updates)
- Simpler deployment (no Elixir server needed)
- More JavaScript ecosystem libraries
- Better TypeScript support
- Easier to add mobile app later (React Native + same Supabase backend)

**Recommended tech stack:**
- **Frontend**: Next.js 15 + React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Real-time**: Supabase Realtime + Presence
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **PDF Conversion**: pdf.js (client-side) or Cloudinary (server-side)
- **State**: React Query + Zustand
- **Testing**: Playwright (you already have this!)

This architecture will give you all of Claper's features with better performance and easier maintenance! 🚀
