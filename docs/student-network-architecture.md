# Student Network Architecture (with Real-Time Multiplayer)

## Component Hierarchy

```
StudentNetworkApp
├── ProfileForm (if !profile)
├── RoomManager (if profile && !selectedRoom)
│   ├── Create Room Card
│   │   ├── [Input] Room Name
│   │   ├── [Button] 로컬 교실 → createLocalRoom()
│   │   └── [Button] 클라우드 교실 → onCreateCloudRoom() ★
│   ├── Join Room Card
│   │   ├── [Input] Room Code (6+ chars)
│   │   └── [Button] 참여하기 → onRoomSelect(code, isCloud) ★
│   └── Room List
│       └── RoomCard[]
│           ├── [Badge] Cloud/Local ★
│           └── [Button] 교실 입장하기 → onRoomSelect()
└── RoomView (if selectedRoom)
    ├── Header
    │   ├── Room Name
    │   ├── [Badge] Cloud/Local ★
    │   ├── [RealtimeIndicator] if cloud mode ★
    │   └── Participant Count ★ (live in cloud mode)
    ├── Tabs
    │   ├── Members Tab
    │   │   └── Member Cards ★ (live in cloud mode)
    │   ├── Matching Tab
    │   │   └── Interest Matching
    │   └── Icebreaker Tab
    │       └── Q&A Cards
    └── Profile Card Modal

★ = Real-time multiplayer features (new)
```

## Data Flow Diagram

### Cloud Room Creation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER ACTION                                │
│         User enters room name + clicks "클라우드 교실"                │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    StudentNetworkApp.tsx                             │
│  handleCreateCloudRoom(roomName)                                     │
│    ↓                                                                 │
│  useNetworkSession('', false).createRoom({                          │
│    roomName: "React Bootcamp",                                       │
│    createdBy: profile.id,                                            │
│    hostProfile: profile                                              │
│  })                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│               hooks/useNetworkSession.ts                             │
│  createRoom():                                                       │
│    1. Build StudentNetworkConfig:                                    │
│       { roomName, createdBy, description }                           │
│    2. Call useRealtimeSession.createSession()                        │
│    3. Auto-join host:                                                │
│       joinSession({ displayName, metadata: ParticipantMetadata })    │
│    4. Return session code                                            │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│               lib/realtime/useRealtimeSession.ts                     │
│  createSession():                                                    │
│    1. Generate 6+ char code via generateSessionCode()                │
│    2. Get current user (anonymous OK)                                │
│    3. Supabase INSERT into sessions:                                 │
│       {                                                              │
│         code: "ABCD1234",                                            │
│         app_type: "student-network",                                 │
│         title: roomName,                                             │
│         config: StudentNetworkConfig,                                │
│         is_active: true                                              │
│       }                                                              │
│    4. Return code                                                    │
│                                                                      │
│  joinSession():                                                      │
│    1. Supabase INSERT into session_participants:                     │
│       {                                                              │
│         session_id: sessionId,                                       │
│         display_name: "홍길동",                                       │
│         metadata: { name, tagline, field, interests, contacts, ... }│
│       }                                                              │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                      │
│                                                                      │
│  sessions table:                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ id     │ code     │ app_type          │ config             │     │
│  ├────────┼──────────┼───────────────────┼────────────────────┤     │
│  │ uuid-1 │ ABCD1234 │ student-network   │ { roomName, ... } │     │
│  └────────┴──────────┴───────────────────┴────────────────────┘     │
│                                                                      │
│  session_participants table:                                         │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ id │ session_id │ display_name │ metadata                  │     │
│  ├────┼────────────┼──────────────┼───────────────────────────┤     │
│  │ p1 │ uuid-1     │ 홍길동        │ { name, field, ... }     │     │
│  └────┴────────────┴──────────────┴───────────────────────────┘     │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    RESPONSE TO CLIENT                                │
│  code = "ABCD1234"                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    StudentNetworkApp.tsx                             │
│  onRoomSelect(code, isCloudMode=true)                                │
│    ↓                                                                 │
│  Navigate to RoomView(roomId="ABCD1234", isCloudMode=true)           │
└──────────────────────────────────────────────────────────────────────┘
```

### Cloud Room Join Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER ACTION                                │
│    User enters code "ABCD1234" + clicks "참여하기"                    │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    RoomManager.tsx                                   │
│  handleJoinRoom():                                                   │
│    if (code.length >= 6) {                                           │
│      onRoomSelect(code, isCloudMode=true) // Auto-detect cloud       │
│    }                                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    StudentNetworkApp.tsx                             │
│  handleRoomSelect(roomId="ABCD1234", cloudMode=true)                 │
│    ↓                                                                 │
│  Navigate to RoomView(roomId="ABCD1234", isCloudMode=true)           │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    RoomView.tsx                                      │
│  1. useNetworkSession(roomId, isCloudMode=true)                      │
│     → Hook loads session from Supabase                               │
│                                                                      │
│  2. useEffect: Auto-join                                             │
│     if (!hasJoined) {                                                │
│       joinRoom(profile)                                              │
│       setHasJoined(true)                                             │
│     }                                                                │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│               hooks/useNetworkSession.ts                             │
│  On mount:                                                           │
│    1. loadSession():                                                 │
│       SELECT * FROM sessions WHERE code = 'ABCD1234'                 │
│       SELECT * FROM session_participants WHERE session_id = ...      │
│    2. Transform participants → Profile[]                             │
│    3. Subscribe to real-time updates                                 │
│                                                                      │
│  joinRoom(profile):                                                  │
│    1. Build metadata: { name, tagline, field, interests, ... }       │
│    2. Call useRealtimeSession.joinSession()                          │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│               lib/realtime/useRealtimeSession.ts                     │
│  joinSession():                                                      │
│    Supabase INSERT into session_participants                         │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                      │
│  session_participants table:                                         │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ id │ session_id │ display_name │ metadata                  │     │
│  ├────┼────────────┼──────────────┼───────────────────────────┤     │
│  │ p1 │ uuid-1     │ 홍길동        │ { name, ... }            │     │
│  │ p2 │ uuid-1     │ 김철수        │ { name, ... }   ← NEW!   │     │
│  └────┴────────────┴──────────────┴───────────────────────────┘     │
│                                                                      │
│  Real-time Broadcast:                                                │
│    Channel: "student-network:uuid-1"                                 │
│    Event: INSERT on session_participants                             │
│    → All subscribers notified                                        │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│               ALL CONNECTED CLIENTS                                  │
│                                                                      │
│  lib/realtime/useRealtimeSubscription.ts receives event:             │
│    onData() callback triggered                                       │
│      ↓                                                               │
│  useRealtimeSession.loadData():                                      │
│    SELECT * FROM session_participants WHERE session_id = uuid-1      │
│      ↓                                                               │
│  setState({ participants: [...] })                                   │
│      ↓                                                               │
│  React re-renders                                                    │
│      ↓                                                               │
│  UI shows new participant (김철수) instantly!                         │
└──────────────────────────────────────────────────────────────────────┘
```

## Real-Time Subscription Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                      RoomView Component                                │
│  const { profiles, isConnected } = useNetworkSession(roomId, true)    │
└───────────────────────┬───────────────────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────────────────┐
│                   useNetworkSession Hook                               │
│  const { participants } = useRealtimeSession({                        │
│    appType: 'student-network',                                        │
│    sessionCode: roomId,                                               │
│    enabled: true                                                      │
│  })                                                                   │
└───────────────────────┬───────────────────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────────────────┐
│                  useRealtimeSession Hook                               │
│  1. loadSession() - initial data load                                 │
│  2. useRealtimeSubscription() - setup subscription                    │
└───────────────────────┬───────────────────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────────────────┐
│               useRealtimeSubscription Hook                             │
│                                                                       │
│  useEffect(() => {                                                    │
│    const channel = supabase                                           │
│      .channel(`student-network:${sessionId}`)                         │
│      .on('postgres_changes', {                                        │
│        event: 'INSERT',                                               │
│        schema: 'public',                                              │
│        table: 'session_participants',                                 │
│        filter: `session_id=eq.${sessionId}`                           │
│      }, (payload) => {                                                │
│        console.log('New participant!', payload);                      │
│        onData(); // Triggers loadData()                               │
│      })                                                               │
│      .subscribe((status) => {                                         │
│        if (status === 'SUBSCRIBED') {                                 │
│          onConnectionChange('connected');                             │
│        }                                                              │
│      });                                                              │
│                                                                       │
│    return () => channel.unsubscribe();                                │
│  }, [sessionId]);                                                     │
└───────────────────────┬───────────────────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────────────────┐
│                      SUPABASE REALTIME                                 │
│                                                                       │
│  WebSocket Connection:                                                │
│    wss://xxx.supabase.co/realtime/v1                                  │
│                                                                       │
│  Channel: "student-network:uuid-1"                                    │
│    Subscriptions:                                                     │
│      - Client A (Host)                                                │
│      - Client B (Participant 1)                                       │
│      - Client C (Participant 2)                                       │
│                                                                       │
│  When INSERT happens:                                                 │
│    1. Postgres trigger fires                                          │
│    2. Broadcast to all channel subscribers                            │
│    3. Each client receives payload                                    │
│    4. Each client triggers onData()                                   │
│    5. Each client re-fetches latest data                              │
│    6. Each client re-renders UI                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## State Management Comparison

### Local Mode (Existing)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Zustand Stores                                │
│                                                                  │
│  useProfileStore                                                 │
│  ├── profile: Profile | null                                    │
│  ├── profiles: Profile[]                                        │
│  ├── createProfile()                                            │
│  ├── updateProfile()                                            │
│  └── getProfileById()                                           │
│                                                                  │
│  useRoomStore                                                    │
│  ├── rooms: Room[]                                              │
│  ├── createRoom()                                               │
│  ├── joinRoom()                                                 │
│  ├── leaveRoom()                                                │
│  └── getRoomById()                                              │
│                                                                  │
│  Storage: IndexedDB (via Zustand persist)                       │
│  Sync: None (single device only)                                │
│  Offline: ✅ Works fully offline                                │
└──────────────────────────────────────────────────────────────────┘
```

### Cloud Mode (New)

```
┌─────────────────────────────────────────────────────────────────┐
│                  useNetworkSession Hook                          │
│                                                                  │
│  State (from useRealtimeSession):                                │
│  ├── session: Session | null                                    │
│  ├── sessionId: string | null                                   │
│  ├── config: StudentNetworkConfig | null                        │
│  ├── participants: SessionParticipant[]                         │
│  ├── connectionStatus: ConnectionStatus                         │
│  └── isConnected: boolean                                       │
│                                                                  │
│  Computed (custom logic):                                        │
│  ├── profiles: Profile[]  ← transformed from participants       │
│  ├── roomName: string | null  ← from config                     │
│  └── participantCount: number                                   │
│                                                                  │
│  Actions:                                                        │
│  ├── createRoom()                                               │
│  ├── joinRoom()                                                 │
│  ├── closeSession()                                             │
│  └── reload()                                                   │
│                                                                  │
│  Storage: Supabase (sessions + session_participants tables)     │
│  Sync: ✅ Real-time WebSocket                                   │
│  Offline: ❌ Requires internet                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Type System

```typescript
// Domain Types (src/app/student-network/types/index.ts)
interface Profile {
  id: string;
  name: string;
  tagline: string;
  field: string;
  interests: string[];
  contacts: { email?, github?, linkedin?, website? };
  avatarUrl?: string;
  createdAt: string;
}

interface Room {
  id: string;           // 6-char local code
  name: string;
  createdBy: string;
  members: string[];    // Profile IDs
  createdAt: string;
}

// ↓ Cloud Mode Types ↓

// Session Config (stored in sessions.config)
interface StudentNetworkConfig {
  roomName: string;
  createdBy: string;
  description?: string;
}

// Participant Metadata (stored in session_participants.metadata)
interface ParticipantMetadata {
  name: string;
  tagline: string;
  field: string;
  interests: string[];
  contacts: { email?, github?, linkedin?, website? };
  avatarUrl?: string;
}

// Transformation
SessionParticipant + ParticipantMetadata → Profile
  {
    id: participant.id,              // Use participant ID as profile ID
    name: metadata.name,
    tagline: metadata.tagline,
    field: metadata.field,
    interests: metadata.interests,
    contacts: metadata.contacts,
    avatarUrl: metadata.avatarUrl,
    createdAt: participant.joined_at,
  }
```

## UI Component Mapping

```
Local Mode                        Cloud Mode
──────────────────────────────────────────────────────────────

Room Name                         Room Name
[Code Badge: 6-char]              [Code Badge: 6+ char]
[Badge: 🖴 로컬]                   [Badge: ☁️ 클라우드]
                                  [RealtimeIndicator: ●●● 실시간]

Participant Count                 Participant Count
Static number                     Live updating

Participant List                  Participant List
getRoomById(id).members           useNetworkSession().profiles
Manual refresh required           Auto-updates on changes

Profile Data Source               Profile Data Source
Zustand store                     session_participants.metadata
useProfileStore()                 useNetworkSession().getProfiles()

Connection Status                 Connection Status
N/A                               Green pulse / Red dot
                                  Shows "connected" or "disconnected"

Share Method                      Share Method
Manual code sharing               QR code (future)
Copy/paste only                   Link sharing (future)
```

## Performance Characteristics

### Local Mode
- **Initial Load**: ~10ms (IndexedDB read)
- **Create Room**: ~20ms (IndexedDB write)
- **Join Room**: ~15ms (IndexedDB update)
- **Update Participant**: ~20ms (IndexedDB write)
- **Sync Latency**: N/A (no sync)

### Cloud Mode
- **Initial Load**: ~200-500ms (Supabase query + network)
- **Create Room**: ~300-600ms (2 Supabase inserts)
- **Join Room**: ~200-400ms (Supabase insert)
- **Real-time Update**: ~50-200ms (WebSocket latency)
- **Sync Latency**: 50-200ms (WebSocket)

### Optimization Strategies

1. **Optimistic Updates** (future):
   ```typescript
   // Immediately update local state
   setState({ participants: [...participants, newParticipant] });

   // Then sync to server
   await joinRoom(profile);
   ```

2. **Debounced Reloads**:
   ```typescript
   const debouncedReload = useMemo(
     () => debounce(reload, 1000),
     [reload]
   );
   ```

3. **Incremental Loading**:
   ```typescript
   // Load basic info first
   const { roomName, participantCount } = useNetworkSession(code, true);

   // Load full profiles lazily
   const profiles = useMemo(() => getProfiles(), [participants]);
   ```

## Error Handling Flow

```
User Action (create/join room)
  ↓
Try Cloud Operation
  ↓
Success? ──YES──> Show room + real-time updates
  │
  NO
  ↓
Error Handling
  ├─ Network Error → Show "인터넷 연결 확인" + fallback to local
  ├─ Session Not Found → Show "방을 찾을 수 없습니다"
  ├─ Permission Error → Show "권한이 없습니다"
  └─ Unknown Error → Show generic error + log to console

Connection Lost (during session)
  ↓
RealtimeIndicator turns red
  ↓
User sees "연결 끊김" status
  ↓
WebSocket auto-retry (3 attempts)
  ↓
Success? ──YES──> Reconnected, indicator turns green
  │
  NO
  ↓
Show "인터넷 연결을 확인해주세요" message
User can manually reload page
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Row Level Security (RLS)                  │
│                                                              │
│  sessions table:                                             │
│  ├─ SELECT: ✅ Allow all (anyone can view active sessions)  │
│  ├─ INSERT: ✅ Allow all (anyone can create)                │
│  ├─ UPDATE: ⚠️  Only host (future: add host_id check)        │
│  └─ DELETE: ❌ No one (soft delete via is_active)           │
│                                                              │
│  session_participants table:                                 │
│  ├─ SELECT: ✅ Allow all                                    │
│  ├─ INSERT: ✅ Allow all (anyone can join)                  │
│  ├─ UPDATE: ⚠️  Only self (future: add user_id check)        │
│  └─ DELETE: ⚠️  Only self or host (future)                   │
└──────────────────────────────────────────────────────────────┘

Data Privacy:
  - All participant data is PUBLIC to room members
  - Room codes are NOT secret (anyone with code can join)
  - Don't store sensitive info in contacts or metadata
  - Future: Add room passwords or approval flow
```

## Deployment Checklist

- [x] Code implementation complete
- [x] Type safety verified
- [x] Documentation written
- [ ] Manual testing (create/join cloud rooms)
- [ ] Multi-device testing (2+ browsers)
- [ ] Connection resilience testing (disconnect/reconnect)
- [ ] Performance testing (many participants)
- [ ] E2E tests written
- [ ] Database indexes optimized
- [ ] RLS policies reviewed
- [ ] Error messages localized (Korean)
- [ ] Analytics events added
- [ ] Monitoring/alerting configured
