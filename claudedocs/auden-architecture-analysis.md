# Auden Architecture Analysis

**Repository**: https://github.com/dtinth/auden

## Overview

Auden is an open-source, hackable audience engagement software supporting live quizzes and voting systems. It uses React, TypeScript, Firebase Realtime Database, and a library called `fiery` for reactive data binding with React Hooks.

---

## 1. Scene Architecture

### Core Concept

Everything is organized into **"scenes"** - each representing a type of interaction (quiz, voting, freestyle). Each scene has exactly **three components**:

1. **Audience** - Mobile UI for participants
2. **Presentation** - Large screen display
3. **Backstage** - Admin/host controls

### Scene Interface

```typescript
// src/core/model/index.ts
export interface IScene {
  name: string
  presentationComponent?: ComponentType<{}>
  audienceComponent?: ComponentType<{}>
  backstageComponent?: ComponentType<{}>
}
```

### Scene Implementation Example (Quiz)

```typescript
// src/scenes/quiz/index.tsx
import { IScene } from '../../core/model'
import { QuizBackstage } from './QuizBackstage'
import { QuizPresentation } from './QuizPresentation'
import { QuizAudience } from './QuizAudience'

export const scene: IScene = {
  name: 'quiz',
  backstageComponent: QuizBackstage,
  presentationComponent: QuizPresentation,
  audienceComponent: QuizAudience
}
```

### File Structure per Scene

```
src/scenes/quiz/
├── index.tsx                   # Scene registration
├── types.ts                    # TypeScript interfaces
├── QuizAudience.tsx           # Audience view (mobile)
├── QuizPresentation.tsx       # Presentation view (display)
├── QuizBackstage.tsx          # Backstage view (admin)
├── useLeaderboardData.tsx     # Shared hook
└── example.toml               # Data format example
```

---

## 2. Three-View Pattern Implementation

### A. Audience View (`QuizAudience.tsx`)

**Purpose**: Mobile UI for participants to submit answers

**Key Features**:
- Reads current question from Firebase
- Submits answers to user-specific private path
- Shows wait states between questions
- Uses grid layout for answer choices (A, B, C, D)

```typescript
export function QuizAudience() {
  const context = useSceneContext()

  // Read current question (public-read)
  const currentQuestionState = useFirebaseDatabase(
    context.dataRef
      .child('main')
      .child('state')
      .child('public-read')
      .child('currentQuestion')
  )

  const userState = useFirebaseAuth()
  const me = userState.unstable_read()!
  const currentQuestion = currentQuestionState.unstable_read()
  const currentQuestionId = currentQuestion && currentQuestion.questionId

  if (currentQuestionId) {
    // Write answer to private path
    const answerRef = context.dataRef
      .child('answers')
      .child(currentQuestionId)
      .child('private')
      .child(me.uid)

    return (
      <Grid rows={['xsmall', 'xsmall']} columns={['1/2', '1/2']} gap="small">
        {(currentQuestion.answerChoices || []).map((answerId: string, i: number) => (
          <ActionButton
            primary
            color={`neutral-${i + 1}`}
            key={answerId}
            label={<Text size="large">{String.fromCharCode(65 + i)}</Text>}
            onClick={async () => {
              await answerRef.set({
                answerId: answerId,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
              })
            }}
          />
        ))}
      </Grid>
    )
  }

  return <Text size="xlarge">Wait for a question!</Text>
}
```

### B. Presentation View (`QuizPresentation.tsx`)

**Purpose**: Large screen display showing questions and results

**Key Features**:
- Reads questions from secret path (admin only)
- Reads current question state from public path
- Shows leaderboard when `showLeaderboard` is true
- Visual answer reveal with opacity/grayscale for incorrect answers

```typescript
export function QuizPresentation() {
  const context = useSceneContext()

  const questionsState = useFirebaseDatabase(
    context.dataRef.child('main').child('questions').child('secret')
  )

  const currentQuestionState = useFirebaseDatabase(
    context.dataRef
      .child('main')
      .child('state')
      .child('public-read')
      .child('currentQuestion')
  )

  const showLeaderboardState = useFirebaseDatabase(
    context.dataRef
      .child('main')
      .child('state')
      .child('public-read')
      .child('showLeaderboard')
  )

  if (showLeaderboardState.unstable_read()) {
    return <QuizLeaderboardPresentation />
  }

  const questions = questionsState.unstable_read()
  const currentQuestion = currentQuestionState.unstable_read()
  const currentQuestionId = currentQuestion && currentQuestion.questionId
  const question = questions && currentQuestionId && questions[currentQuestionId]

  if (question) {
    return (
      <QuizQuestionPresentation
        question={question}
        answerRevealed={currentQuestion.answerRevealed}
      />
    )
  }

  return <Text size="xlarge">No active question...</Text>
}
```

### C. Backstage View (`QuizBackstage.tsx`)

**Purpose**: Admin controls for managing the quiz

**Key Features**:
- Question list with activate/grade buttons
- Real-time answer count and correct answer tracking
- Leaderboard management
- Question import functionality

```typescript
export function QuizBackstage() {
  const context = useSceneContext()
  return (
    <Box gap="medium">
      <Panel title="Questions">
        <QuizQuestionList />
      </Panel>
      <Panel title="Leaderboard">
        <QuizLeaderboard />
      </Panel>
      <Panel title="Import questions">
        <QuizImporter
          import={async (data) => {
            await context.dataRef
              .child('main')
              .child('questions')
              .child('secret')
              .set(data)
          }}
        />
      </Panel>
    </Box>
  )
}

async function activateQuestion(
  sceneRef: firebase.database.Reference,
  entry: { key: string; val: any }
) {
  await Promise.all([
    sceneRef
      .child('main')
      .child('state')
      .child('public-read')
      .child('released')
      .child(entry.key)
      .set({
        startedAt: firebase.database.ServerValue.TIMESTAMP,
        expiresIn: ((entry.val && entry.val.timeLimit) || 30) * 1000,
      }),
    sceneRef
      .child('main')
      .child('state')
      .child('public-read')
      .child('currentQuestion')
      .set({
        questionId: entry.key,
        answerChoices: Object.keys(entry.val.answers),
        startedAt: firebase.database.ServerValue.TIMESTAMP,
        expiresIn: ((entry.val && entry.val.timeLimit) || 30) * 1000,
      }),
    sceneRef
      .child('main')
      .child('state')
      .child('public-read')
      .child('showLeaderboard')
      .set(false),
  ])
}
```

---

## 3. Firebase Realtime Logic

### Data Structure Pattern

**Key Principle**: `Namespace → Name → Access Pattern`

This allows using the same Firebase security rules across all scene types.

```
/screenData/{screenId}/data/
  ├── {namespace}/          # e.g., "main", "answers"
      └── {name}/           # e.g., "state", "questions", "votes"
          ├── public-read/  # Anyone can read, only admin can write
          ├── personal/     # Anyone can read, users write to own slot
          ├── private/      # Users can only read/write own slot
          ├── events/       # Anyone can read, users can append events
          ├── inbox/        # Users can read data assigned to them
          └── secret/       # Only admin can access
```

### Access Patterns

#### 1. `public-read` - Shared State

Anyone can read, only admins can write.

**Examples**:
- `main/state/public-read/currentQuestion` - Current active question
- `main/state/public-read/showLeaderboard` - Toggle leaderboard display
- `main/settings/public-read/enabled` - Voting enabled flag

```typescript
// Read current question (all users)
const currentQuestionState = useFirebaseDatabase(
  context.dataRef
    .child('main')
    .child('state')
    .child('public-read')
    .child('currentQuestion')
)

// Write to public-read (admin only)
await sceneRef
  .child('main')
  .child('state')
  .child('public-read')
  .child('showLeaderboard')
  .set(true)
```

#### 2. `private` - User-specific Data

Each user can only read/write their own slot.

**Examples**:
- `answers/{questionId}/private/{uid}` - User's quiz answer
- `main/votes/private/{uid}` - User's voting choices

```typescript
// User writes to their own private slot
const answerRef = context.dataRef
  .child('answers')
  .child(currentQuestionId)
  .child('private')
  .child(me.uid)

await answerRef.set({
  answerId: answerId,
  timestamp: firebase.database.ServerValue.TIMESTAMP,
})
```

#### 3. `secret` - Admin-only Data

Only admins can read and write.

**Examples**:
- `main/questions/secret` - Question bank with correct answers

```typescript
// Admin reads secret data
const questionsState = useFirebaseDatabase(
  context.dataRef.child('main').child('questions').child('secret')
)
```

#### 4. `personal` - Public Read, Personal Write

Anyone can read, but each user writes to their own slot.

**Example**: Poll responses where everyone can see all votes

```typescript
// main/poll/personal/{uid}/selectedOption
```

#### 5. `events` - Append-only Event Stream

Anyone can read, users can publish events (append-only).

**Example**: Chat messages

```typescript
// main/chatMessages/events/{eventId}
```

#### 6. `inbox` - Server-to-User Messages

Users can read data assigned to them by the server/admin.

**Example**: Role assignments

```typescript
// main/role/inbox/{uid}
```

### Firebase Security Rules (Bolt)

```
path /screenData {
  path /{screenId} {
    path /data {
      path /{namespace} {
        path /{name} {
          path /public-read {
            read() { true }
          }
          path /private {
            path /{uid} {
              read() { isCurrentUser(uid) }
              write() { isCurrentUser(uid) }
            }
          }
          path /personal {
            read() { true }
            path /{uid} {
              write() { isCurrentUser(uid) }
            }
          }
          path /events {
            read() { true }
            path /{eventId} is Event {
              write() { createOnly(this) }
            }
          }
          path /secret {
            // Only admin can access (default deny)
          }
          path /inbox {
            path /{uid} {
              read() { isCurrentUser(uid) }
            }
          }
        }
      }
    }
  }
}
```

---

## 4. Data Flow Patterns

### Quiz Flow Example

```
┌──────────────┐
│   BACKSTAGE  │ (Admin activates question)
└──────┬───────┘
       │
       │ Writes to:
       │ • main/state/public-read/currentQuestion
       │   { questionId, answerChoices, startedAt, expiresIn }
       │
       ▼
┌──────────────┐
│  PRESENTATION│ (Displays question)
│   + AUDIENCE │ (Shows answer buttons)
└──────┬───────┘
       │
       │ User clicks answer
       │
       │ Writes to:
       │ • answers/{questionId}/private/{uid}
       │   { answerId, timestamp }
       │
       ▼
┌──────────────┐
│   BACKSTAGE  │ (Sees answer count update)
└──────┬───────┘
       │
       │ Admin clicks "grade"
       │
       │ Reads from:
       │ • answers/{questionId}/private/* (all answers)
       │ • main/questions/secret/{questionId} (correct answer)
       │
       │ Writes to:
       │ • main/state/public-read/score/{uid}/{questionId}
       │ • main/state/public-read/showLeaderboard = true
       │
       ▼
┌──────────────┐
│ PRESENTATION │ (Switches to leaderboard view)
└──────────────┘
```

### Voting Flow Example

```
┌──────────────┐
│   BACKSTAGE  │ (Admin sets up poll)
└──────┬───────┘
       │
       │ Writes to:
       │ • main/options/public-read/{optionId} = "Option Text"
       │ • main/settings/public-read/enabled = true
       │ • main/settings/public-read/maxVotes = 3
       │
       ▼
┌──────────────┐
│   AUDIENCE   │ (Users vote)
└──────┬───────┘
       │
       │ Writes to:
       │ • main/votes/private/{uid}/{optionId} = true/false
       │
       ▼
┌──────────────┐
│   BACKSTAGE  │ (Sees live vote counts)
└──────┬───────┘
       │
       │ Reads from:
       │ • main/votes/private/* (all users' votes)
       │
       │ Calculates results in UI
       │
       │ Admin toggles "Show Results"
       │
       │ Writes to:
       │ • main/settings/public-read/showResults = true
       │
       ▼
┌──────────────┐
│ PRESENTATION │ (Displays voting results)
└──────────────┘
```

---

## 5. React Component Structure

### Key Hooks and Patterns

#### A. `useFirebaseDatabase` (from `fiery`)

The core hook for real-time Firebase data binding with React Suspense.

```typescript
import { useFirebaseDatabase } from 'fiery'

const dataState = useFirebaseDatabase(firebaseRef)
const data = dataState.unstable_read() // Suspends if not loaded
```

**Key Characteristics**:
- Automatically subscribes to Firebase ref
- Returns suspendable state
- Auto-unsubscribes on unmount
- Re-renders component when data changes

#### B. `useSceneContext` - Scene Data Access

Provides access to the scene's Firebase data reference.

```typescript
// src/core/app/SceneContext.tsx
export const SceneContext = createContext<ISceneContext | null>(null)

export function useSceneContext() {
  const sceneContext = useContext(SceneContext)
  if (!sceneContext) throw new Error('No scene context passed T_T')
  return sceneContext
}

export interface ISceneContext {
  dataRef: firebase.database.Reference
}

// Usage in components:
const context = useSceneContext()
const ref = context.dataRef.child('main').child('state')
```

#### C. Scene Context Provider

```typescript
// src/core/app/SceneContext.tsx
export function CurrentSceneContextConnector(props: {
  renderScene: (scene: IScene) => ReactNode
  renderFallback: () => ReactNode
}) {
  const config = useConfig()
  const params = useParams<{ forceScreenId?: string }>()

  return (
    <CurrentScreenConnector>
      {(currentScreenId) => {
        const screenId = params.forceScreenId || currentScreenId
        if (!screenId) return props.renderFallback()

        return (
          <ScreenInfoConnector screenId={screenId}>
            {(info) => {
              if (!info || !info.scene) return props.renderFallback()

              const sceneName = info.scene
              const scene = config.scenes.filter((s) => s.name === sceneName)[0]

              const sceneContext = {
                dataRef: firebase
                  .database()
                  .ref('/screenData')
                  .child(screenId)
                  .child('data'),
              }

              return (
                <SceneContext.Provider value={sceneContext}>
                  <ErrorBoundary>{props.renderScene(scene)}</ErrorBoundary>
                </SceneContext.Provider>
              )
            }}
          </ScreenInfoConnector>
        )
      }}
    </CurrentScreenConnector>
  )
}
```

#### D. Connector Pattern for Data Fetching

```typescript
// Generic connector type
export type ConnectorType<TProps, TArgs extends any[]> = (
  props: TProps & { children: (...args: TArgs) => React.ReactNode }
) => JSX.Element

// Example: Firebase Data Connector
export const FirebaseDataConnector: ConnectorType<
  { path: string[]; baseRef?: firebase.database.Reference },
  [FirebaseData]
> = (props) => {
  const dataRef = useMemo(() => {
    return props.path.reduce(
      (node, next) => node.child(next),
      props.baseRef || firebase.database().ref()
    )
  }, [props.baseRef, props.path])

  const data = useFirebaseDatabase(dataRef)
  const value = data.unstable_read()

  const firebaseData: FirebaseData = useMemo(() => ({ value, ref: dataRef }), [
    value,
    dataRef,
  ])

  return <>{props.children(firebaseData)}</>
}

// Usage:
<FirebaseDataConnector path={['main', 'state', 'public-read', 'enabled']}>
  {(data) => <div>{data.value ? 'Enabled' : 'Disabled'}</div>}
</FirebaseDataConnector>
```

#### E. `react-lambda` Pattern

Uses `λ` for inline component creation (though now deprecated in favor of standard hooks).

```typescript
import λ from 'react-lambda'

// Inline component creation
{λ(() => {
  const ref = sceneContext.dataRef.child('settings')
  const state = useFirebaseDatabase(ref)
  const value = state.unstable_read()
  return <div>{value}</div>
})}
```

#### F. Action Components with Loading States

```typescript
// ActionButton - Button with async operation handling
<ActionButton
  label="activate"
  description="activate question"
  onClick={async () => {
    await activateQuestion(context.dataRef, entry)
  }}
  successMessage="Question activated!"
/>

// ActionCheckbox - Checkbox with async operations
<ActionCheckbox
  checked={enabled}
  toggle
  label="Enabled"
  description="toggle voting"
  onChange={async () => {
    await enabledRef.set(!enabled)
  }}
/>
```

### Routing Structure

```typescript
// src/core/app/index.tsx
function Main(props: { user: firebase.User }) {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={AudienceRoot} />
        <Route exact path="/audience/:forceScreenId" component={AudienceRoot} />
        <Route exact path="/display" component={DisplayRoot} />
        <Route exact path="/display/:forceScreenId" component={DisplayRoot} />
        <Route
          exact
          path="/admin"
          render={(props) => <AdminRoot history={props.history} />}
        />
        <Route
          exact
          path="/admin/screens/:screenId"
          render={(props) => (
            <AdminRoot
              history={props.history}
              screenId={props.match.params.screenId}
            />
          )}
        />
      </Switch>
    </HashRouter>
  )
}
```

**Routes**:
- `/` - Audience view (uses current active screen)
- `/audience/:screenId` - Audience view for specific screen
- `/display` - Presentation view (uses current active screen)
- `/display/:screenId` - Presentation view for specific screen
- `/admin` - Admin panel (screen list)
- `/admin/screens/:screenId` - Admin controls for specific screen

### Root Components

#### Audience Root

```typescript
// src/core/app/AudienceRoot.tsx
export function AudienceRoot() {
  useEffect(() => {
    // Presence tracking
    const uid = firebase.auth().currentUser?.uid
    if (!uid) return
    const ref = firebase.database().ref('presence').child(uid).child(sessionId)
    ref.set(firebase.database.ServerValue.TIMESTAMP)
    ref.onDisconnect().set(null)
  })

  return (
    <CurrentSceneContextConnector
      renderFallback={() => <AudienceFallbackView />}
      renderScene={(scene) => {
        const AudienceComponent = scene.audienceComponent
        if (!AudienceComponent) return <AudienceFallbackView />
        return <AudienceComponent />
      }}
    />
  )
}
```

#### Display Root

```typescript
// src/core/app/DisplayRoot.tsx
export function DisplayRoot() {
  return (
    <CurrentSceneContextConnector
      renderFallback={() => <DisplayFallbackView />}
      renderScene={(scene) => {
        const PresentationComponent = scene.presentationComponent
        if (!PresentationComponent) {
          return <div>No presentation component registered.</div>
        }
        return (
          <Backdrop>
            <PresentationComponent />
          </Backdrop>
        )
      }}
    />
  )
}
```

#### Admin Root

```typescript
// src/core/app/AdminRoot.tsx
export function AdminRoot(props: {
  sceneName?: string
  screenId?: string
  history: History
}) {
  const screenId = props.screenId

  return (
    <Box direction="row" gap="medium" pad="small">
      <Box width="16rem">
        <AdminNavigation />
      </Box>
      <Box flex>
        {screenId ? (
          <ScreenBackstage key={screenId} screenId={screenId} />
        ) : (
          <AdminGlobalSettings />
        )}
      </Box>
      <Box width="24rem">
        <AdminPreviewer screenId={screenId} />
      </Box>
    </Box>
  )
}

export function ScreenBackstage(props: { screenId: string }) {
  const config = useConfig()
  const screenId = props.screenId

  const dataRef = firebase
    .database()
    .ref('/screenData')
    .child(screenId)
    .child('info')
    .child('scene')

  const dataState = useFirebaseDatabase(dataRef)
  const sceneType = dataState.unstable_read()

  const scene = config.scenes.find((s) => s.name === sceneType)
  const BackstageComponent = scene.backstageComponent || FallbackBackstage

  const sceneContext = {
    dataRef: firebase
      .database()
      .ref('/screenData')
      .child(screenId)
      .child('data'),
  }

  return (
    <SceneContext.Provider value={sceneContext}>
      <BackstageComponent />
    </SceneContext.Provider>
  )
}
```

---

## 6. Key Patterns for Next.js + Supabase Adaptation

### Pattern 1: Three-View Scene Structure

**Auden**:
```typescript
export const scene: IScene = {
  name: 'quiz',
  backstageComponent: QuizBackstage,
  presentationComponent: QuizPresentation,
  audienceComponent: QuizAudience
}
```

**Next.js Adaptation**:
```typescript
// app/realtime-quiz/page.tsx
export default function QuizPage() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') // 'audience' | 'presentation' | 'backstage'

  return (
    <>
      {view === 'backstage' && <QuizBackstage />}
      {view === 'presentation' && <QuizPresentation />}
      {(!view || view === 'audience') && <QuizAudience />}
    </>
  )
}
```

### Pattern 2: Supabase Realtime Subscription

**Auden** (Firebase):
```typescript
const currentQuestionState = useFirebaseDatabase(
  context.dataRef.child('main').child('state').child('public-read').child('currentQuestion')
)
const currentQuestion = currentQuestionState.unstable_read()
```

**Supabase Adaptation**:
```typescript
function useRealtimeQuizState(roomId: string) {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`quiz:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_state',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setCurrentQuestion(payload.new)
        }
      )
      .subscribe()

    // Initial fetch
    supabase
      .from('quiz_state')
      .select('*')
      .eq('room_id', roomId)
      .single()
      .then(({ data }) => setCurrentQuestion(data))

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  return currentQuestion
}
```

### Pattern 3: Access Control via RLS

**Auden** (Firebase Rules):
```
path /private {
  path /{uid} {
    read() { isCurrentUser(uid) }
    write() { isCurrentUser(uid) }
  }
}
```

**Supabase RLS Policies**:
```sql
-- Public read (like public-read)
CREATE POLICY "Anyone can read quiz state"
  ON quiz_state FOR SELECT
  USING (true);

-- Private user data (like private)
CREATE POLICY "Users can read own answers"
  ON quiz_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON quiz_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin only (like secret)
CREATE POLICY "Only room owner can read questions"
  ON quiz_questions FOR SELECT
  USING (auth.uid() = room_owner_id);
```

### Pattern 4: Namespace → Name → Access Pattern

**Database Schema**:
```sql
-- Instead of deeply nested Firebase paths, use tables with columns

-- Public state (equivalent to main/state/public-read)
CREATE TABLE quiz_state (
  id uuid PRIMARY KEY,
  room_id text NOT NULL,
  current_question_id text,
  show_leaderboard boolean DEFAULT false,
  started_at timestamptz,
  expires_in integer
);

-- Private user answers (equivalent to answers/{qid}/private/{uid})
CREATE TABLE quiz_answers (
  id uuid PRIMARY KEY,
  room_id text NOT NULL,
  question_id text NOT NULL,
  user_id uuid NOT NULL,
  answer_id text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  UNIQUE(room_id, question_id, user_id)
);

-- Secret questions (equivalent to main/questions/secret)
CREATE TABLE quiz_questions (
  id uuid PRIMARY KEY,
  room_id text NOT NULL,
  question_id text NOT NULL,
  text text NOT NULL,
  answers jsonb NOT NULL,
  correct_answer text NOT NULL,
  room_owner_id uuid NOT NULL
);
```

### Pattern 5: Connector Pattern with Zustand

**Auden** (React Context + Fiery):
```typescript
const context = useSceneContext()
const ref = context.dataRef.child('main').child('state')
const state = useFirebaseDatabase(ref)
const data = state.unstable_read()
```

**Next.js + Zustand Adaptation**:
```typescript
// store/useQuizStore.ts
interface QuizStore {
  roomId: string | null
  currentQuestion: Question | null
  answers: Answer[]
  leaderboard: LeaderboardEntry[]

  // Actions
  setRoomId: (id: string) => void
  subscribeToRoom: (id: string) => void
  submitAnswer: (answerId: string) => Promise<void>
  activateQuestion: (questionId: string) => Promise<void>
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  roomId: null,
  currentQuestion: null,
  answers: [],
  leaderboard: [],

  setRoomId: (id) => set({ roomId: id }),

  subscribeToRoom: async (roomId) => {
    const supabase = createClient()

    // Subscribe to state changes
    supabase
      .channel(`quiz:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz_state',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        set({ currentQuestion: payload.new })
      })
      .subscribe()
  },

  submitAnswer: async (answerId) => {
    const { roomId, currentQuestion } = get()
    const supabase = createClient()

    await supabase.from('quiz_answers').insert({
      room_id: roomId,
      question_id: currentQuestion.id,
      answer_id: answerId,
      user_id: (await supabase.auth.getUser()).data.user.id
    })
  }
}))
```

### Pattern 6: Multi-tenant Screen Management

**Auden's Screen System**:
```
/currentScreen → "screen-abc123"
/screenList → ["screen-abc123", "screen-def456"]
/screenData/{screenId}/
  ├── info/
  │   ├── scene: "quiz"
  │   └── title: "Quiz Room 1"
  └── data/ (scene-specific data)
```

**Supabase Adaptation**:
```sql
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL, -- 6-character join code
  scene_type text NOT NULL,  -- 'quiz' | 'vote' | 'this-or-that'
  title text NOT NULL,
  owner_id uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  display_name text,
  joined_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Use room.code for joining instead of screenId
-- View becomes part of client-side routing: /quiz?code=ABC123&view=backstage
```

---

## 7. Technology Stack

### Auden Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Firebase Realtime Database** - Real-time data sync
- **fiery** - React hooks for Firebase with Suspense
- **react-lambda** - Inline component creation
- **Grommet** - UI component library
- **react-router-dom** - Client-side routing
- **Vite** - Build tool

### Recommended Adaptation Stack
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Supabase Realtime** - Real-time data sync
- **Zustand** - Client state management
- **React Hooks** - Standard hooks (no special library needed)
- **shadcn/ui** - UI components (already in use)
- **Tailwind CSS** - Styling (already in use)

---

## 8. Key Takeaways for Implementation

### 1. Scene-Based Architecture
- Each interactive app is a "scene" with 3 views
- Views share the same data source but render differently
- Use URL params to switch between views: `?view=audience|presentation|backstage`

### 2. Data Access Patterns
Implement these 6 access patterns using Supabase RLS:
- `public-read` → RLS policy allowing SELECT to everyone
- `private` → RLS using `auth.uid() = user_id`
- `secret` → RLS using `auth.uid() = room_owner_id`
- `personal` → RLS allowing SELECT to all, INSERT with uid check
- `events` → Append-only with created_at timestamp
- `inbox` → RLS filtering by recipient_id

### 3. Real-time Synchronization
- Use Supabase Realtime channels per room: `quiz:${roomId}`
- Subscribe to `postgres_changes` for table updates
- Combine with Zustand for optimistic updates
- Clean up subscriptions on component unmount

### 4. Grading/Scoring Logic
- Auden does client-side grading in backstage component
- Reads all private answers, checks against secret correct answer
- Calculates points based on order (100 points, decreasing)
- Writes to public-read score table

**Adaptation**: Use Supabase Edge Function for secure grading
```typescript
// supabase/functions/grade-question/index.ts
Deno.serve(async (req) => {
  const { roomId, questionId } = await req.json()

  // Fetch all answers (ordered by timestamp)
  const { data: answers } = await supabase
    .from('quiz_answers')
    .select('*')
    .eq('room_id', roomId)
    .eq('question_id', questionId)
    .order('timestamp', { ascending: true })

  // Fetch correct answer
  const { data: question } = await supabase
    .from('quiz_questions')
    .select('correct_answer')
    .eq('id', questionId)
    .single()

  // Calculate points
  let reward = 100
  const scores = answers.map(answer => {
    if (answer.answer_id === question.correct_answer) {
      const points = reward
      if (reward > 50) reward--
      return { user_id: answer.user_id, points }
    }
    return { user_id: answer.user_id, points: 0 }
  })

  // Write scores
  await supabase.from('quiz_scores').upsert(scores)

  return new Response(JSON.stringify({ success: true }))
})
```

### 5. Presence Tracking
Auden uses Firebase presence with onDisconnect handlers.

**Supabase Adaptation**:
```typescript
// Use Supabase Realtime presence
const channel = supabase.channel(`room:${roomId}`, {
  config: {
    presence: {
      key: userId,
    },
  },
})

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', Object.keys(state))
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: userId,
        display_name: displayName,
        online_at: new Date().toISOString()
      })
    }
  })
```

### 6. Admin Preview in Backstage
Auden embeds iframes showing audience and presentation views.

**Adaptation**:
```typescript
// QuizBackstage.tsx
<div className="grid grid-cols-2 gap-4">
  <div className="aspect-video">
    <iframe
      src={`/realtime-quiz?code=${roomCode}&view=presentation`}
      className="w-full h-full border-0"
      title="Presentation Preview"
    />
  </div>
  <div className="aspect-[9/16]">
    <iframe
      src={`/realtime-quiz?code=${roomCode}&view=audience`}
      className="w-full h-full border-0"
      title="Audience Preview"
    />
  </div>
</div>
```

---

## 9. Example: Complete Quiz Implementation Plan

### Database Schema

```sql
-- Rooms table
CREATE TABLE quiz_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Questions (secret)
CREATE TABLE quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES quiz_rooms(id) ON DELETE CASCADE,
  question_id text NOT NULL, -- e.g., "q1", "q2"
  text text NOT NULL,
  answers jsonb NOT NULL, -- [{ id: "a", text: "...", correct: true }]
  time_limit integer DEFAULT 30,
  UNIQUE(room_id, question_id)
);

-- Current state (public-read)
CREATE TABLE quiz_state (
  room_id uuid PRIMARY KEY REFERENCES quiz_rooms(id) ON DELETE CASCADE,
  current_question_id text,
  answer_choices text[], -- ["a", "b", "c", "d"]
  started_at timestamptz,
  expires_in integer,
  answer_revealed boolean DEFAULT false,
  show_leaderboard boolean DEFAULT false
);

-- User answers (private)
CREATE TABLE quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  question_id text NOT NULL,
  user_id uuid NOT NULL,
  answer_id text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  UNIQUE(room_id, question_id, user_id)
);

-- Scores (public-read)
CREATE TABLE quiz_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  question_id text NOT NULL,
  user_id uuid NOT NULL,
  points integer NOT NULL,
  UNIQUE(room_id, question_id, user_id)
);
```

### RLS Policies

```sql
-- quiz_state: anyone can read
CREATE POLICY "Anyone can read quiz state"
  ON quiz_state FOR SELECT
  USING (true);

-- quiz_state: only owner can write
CREATE POLICY "Only owner can update quiz state"
  ON quiz_state FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM quiz_rooms
      WHERE quiz_rooms.id = quiz_state.room_id
      AND quiz_rooms.owner_id = auth.uid()
    )
  );

-- quiz_answers: users can read own answers
CREATE POLICY "Users can read own answers"
  ON quiz_answers FOR SELECT
  USING (auth.uid() = user_id);

-- quiz_answers: users can insert own answers
CREATE POLICY "Users can insert own answers"
  ON quiz_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- quiz_questions: only owner can access
CREATE POLICY "Only owner can read questions"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_rooms
      WHERE quiz_rooms.id = quiz_questions.room_id
      AND quiz_rooms.owner_id = auth.uid()
    )
  );

-- quiz_scores: anyone can read
CREATE POLICY "Anyone can read scores"
  ON quiz_scores FOR SELECT
  USING (true);
```

### Component Structure

```
app/realtime-quiz/
├── page.tsx                    # Route entry with view switching
├── components/
│   ├── QuizAudience.tsx       # Mobile participant view
│   ├── QuizPresentation.tsx   # Large screen display
│   ├── QuizBackstage.tsx      # Admin controls
│   ├── QuestionDisplay.tsx    # Shared question UI
│   └── Leaderboard.tsx        # Shared leaderboard UI
├── hooks/
│   ├── useQuizState.ts        # Subscribe to quiz state
│   ├── useQuizAnswers.ts      # Subscribe to answers
│   └── useLeaderboard.ts      # Subscribe to scores
└── store/
    └── quizStore.ts           # Zustand store
```

### Zustand Store

```typescript
interface QuizStore {
  // State
  roomId: string | null
  currentQuestion: QuizState | null
  myAnswer: string | null
  leaderboard: LeaderboardEntry[]

  // Actions
  joinRoom: (code: string) => Promise<void>
  submitAnswer: (answerId: string) => Promise<void>
  activateQuestion: (questionId: string) => Promise<void>
  revealAnswer: () => Promise<void>
  gradeQuestion: (questionId: string) => Promise<void>
  showLeaderboard: () => Promise<void>

  // Cleanup
  cleanup: () => void
}
```

---

## 10. Resources

- **Auden Repository**: https://github.com/dtinth/auden
- **Fiery (Firebase Hooks)**: https://github.com/dtinth/fiery
- **Supabase Realtime Docs**: https://supabase.com/docs/guides/realtime
- **Supabase RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security

---

This analysis provides a comprehensive blueprint for adapting Auden's architecture to a Next.js + Supabase stack while preserving the elegant three-view pattern and real-time synchronization capabilities.
