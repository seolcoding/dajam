# Student Network Real-Time Usage Guide

## For Developers

### Using the `useNetworkSession` Hook

```typescript
import { useNetworkSession } from '@/app/student-network/hooks/useNetworkSession';

function MyComponent() {
  const {
    // Session info
    roomName,
    description,
    sessionId,

    // Participants
    profiles,          // Profile[] - all participants
    participantCount,
    getProfileById,    // (id: string) => Profile | null

    // State
    isLoading,
    error,
    isCloudMode,       // true if cloud, false if local
    connectionStatus,  // 'connecting' | 'connected' | 'disconnected' | 'error'
    isConnected,       // boolean

    // Actions
    createRoom,        // Create cloud room
    joinRoom,          // Join cloud room
    closeSession,      // Close cloud room (host only)
    reload,            // Manually reload session
  } = useNetworkSession(roomCode, enabled);

  // Use the data...
}
```

### Creating a Cloud Room

```typescript
const { createRoom } = useNetworkSession('', false); // Empty code, disabled initially

async function handleCreateCloudRoom() {
  const code = await createRoom({
    roomName: 'React Bootcamp',
    createdBy: profile.id,
    description: 'Spring 2024 cohort',
    hostProfile: {
      id: profile.id,
      name: profile.name,
      tagline: profile.tagline,
      field: profile.field,
      interests: profile.interests,
      contacts: profile.contacts,
      avatarUrl: profile.avatarUrl,
      createdAt: new Date().toISOString(),
    },
  });

  if (code) {
    console.log('Room created:', code);
    // Navigate to room...
  }
}
```

### Joining a Cloud Room

```typescript
const { joinRoom, profiles } = useNetworkSession(roomCode, true);
const [hasJoined, setHasJoined] = useState(false);

useEffect(() => {
  if (!hasJoined && profile) {
    joinRoom(profile).then(() => {
      setHasJoined(true);
      console.log('Joined room!');
    });
  }
}, [hasJoined, profile, joinRoom]);

// Profiles update automatically via real-time subscription
console.log('Current participants:', profiles);
```

### Displaying Connection Status

```typescript
import { RealtimeIndicator } from '@/components/common/RealtimeIndicator';

function RoomHeader() {
  const { isConnected, isCloudMode } = useNetworkSession(roomCode, true);

  return (
    <div>
      <h1>My Room</h1>
      {isCloudMode && (
        <RealtimeIndicator
          isConnected={isConnected}
          showTimestamp={true}
        />
      )}
    </div>
  );
}
```

### Local vs Cloud Mode

```typescript
// Detect mode by code length
const isCloudMode = roomCode.length > 6;

// Use appropriate data source
const {
  profiles: cloudProfiles,
  isLoading: cloudLoading,
} = useNetworkSession(roomCode, isCloudMode);

const localRoom = useRoomStore((state) => state.getRoomById(roomCode));
const localMembers = localRoom?.members || [];

// Display
const participants = isCloudMode ? cloudProfiles : localMembers;
const loading = isCloudMode ? cloudLoading : false;
```

## For Users

### Creating a Room

**Local Room** (works offline):
1. Go to student-network app
2. Create your profile
3. Enter room name: "My Classroom"
4. Click **"로컬 교실"** (gray button with hard drive icon)
5. Room created with 6-character code
6. Share code with classmates (manual)

**Cloud Room** (real-time sync):
1. Go to student-network app
2. Create your profile
3. Enter room name: "My Classroom"
4. Click **"클라우드 교실"** (blue button with cloud icon)
5. Room created with 6+ character code
6. Share code or QR code with classmates
7. See participants join in real-time

### Joining a Room

1. Get room code from host
2. Enter code in "교실 참여하기" section
3. Click "참여하기"
4. **Local room**: Joins immediately (if code exists locally)
5. **Cloud room**: Loads from server, shows real-time updates

### In a Room

**All Rooms**:
- View all participants
- See interests and matching
- Answer icebreaker questions
- View profile cards

**Cloud Rooms Only**:
- See real-time participant joins
- Connection status indicator (green = live, red = offline)
- Synchronized across all devices
- Share QR code (coming soon)

### Connection Indicator

When in a cloud room, you'll see a badge in the header:

- **Green pulse** + "실시간" = Connected, real-time updates working
- **Red dot** + "연결 끊김" = Disconnected, check your internet

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    StudentNetworkApp                     │
│  - Manages view state (profile-form / room-manager / room)│
│  - Creates cloud rooms via useNetworkSession             │
│  - Passes isCloudMode flag to children                   │
└────────┬────────────────────────────────────────────────┘
         │
         ├─► ProfileForm (creates profile in Zustand store)
         │
         ├─► RoomManager
         │   ├─ Local: createRoom() → Zustand + IndexedDB
         │   ├─ Cloud: onCreateCloudRoom() → useNetworkSession
         │   └─ Join: auto-detects mode by code length
         │
         └─► RoomView (isCloudMode prop)
             ├─ Local Mode:
             │  └─ Zustand store → static participant list
             │
             └─ Cloud Mode:
                └─ useNetworkSession
                   ├─ Loads session from Supabase
                   ├─ Auto-joins with profile
                   ├─ Subscribes to real-time updates
                   └─ Transforms participants → Profile[]

┌─────────────────────────────────────────────────────────┐
│               useNetworkSession Hook                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │        useRealtimeSession (shared lib)           │  │
│  │  - Loads session from Supabase                   │  │
│  │  - Subscribes to session_participants changes    │  │
│  │  - Provides createSession, joinSession methods   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Custom Logic:                                           │
│  - transformConfig: Json → StudentNetworkConfig         │
│  - createRoom: wraps createSession + auto-join          │
│  - joinRoom: adds profile to metadata                   │
│  - getProfiles: transforms participants → Profile[]     │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Supabase Tables                         │
│                                                          │
│  sessions                                                │
│  ├─ code: "ABCD1234"                                     │
│  ├─ app_type: "student-network"                          │
│  └─ config: { roomName, createdBy, description }        │
│                                                          │
│  session_participants                                    │
│  ├─ session_id: (FK to sessions)                         │
│  ├─ display_name: "홍길동"                                │
│  └─ metadata: { name, tagline, field, interests, ... }  │
│                                                          │
│  Real-time Subscription                                  │
│  └─ Channel: "student-network:{sessionId}"              │
│     └─ Event: INSERT on session_participants            │
│        → triggers loadData() → UI updates                │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

### Cloud Room Creation

```
User clicks "클라우드 교실"
  ↓
StudentNetworkApp.handleCreateCloudRoom(roomName)
  ↓
useNetworkSession.createRoom({
  roomName,
  createdBy: profile.id,
  hostProfile: profile
})
  ↓
useRealtimeSession.createSession({
  appType: 'student-network',
  title: roomName,
  config: { roomName, createdBy, description }
})
  ↓
Supabase INSERT into sessions
  ↓
Auto-join host:
useRealtimeSession.joinSession({
  displayName: profile.name,
  metadata: { name, tagline, field, interests, contacts, avatarUrl }
})
  ↓
Supabase INSERT into session_participants
  ↓
Return session code (e.g., "ABCD1234")
  ↓
Navigate to RoomView with isCloudMode=true
```

### Cloud Room Join

```
User enters code "ABCD1234" + clicks "참여하기"
  ↓
App detects code.length > 6 → isCloudMode = true
  ↓
Navigate to RoomView(roomId="ABCD1234", isCloudMode=true)
  ↓
useNetworkSession loads:
  - SELECT * FROM sessions WHERE code = 'ABCD1234'
  - SELECT * FROM session_participants WHERE session_id = ...
  ↓
Auto-join effect triggers:
  joinRoom(profile)
    ↓
  Supabase INSERT into session_participants
  ↓
Subscribe to real-time channel:
  channel: "student-network:{sessionId}"
  event: INSERT on session_participants
  ↓
When new participant joins:
  Real-time event fires
    ↓
  loadData() called
    ↓
  UI re-renders with new participant
```

### Real-Time Updates

```
Participant A joins
  ↓
Supabase INSERT into session_participants
  ↓
Real-time broadcast to all subscribers
  ↓
Participant B's browser receives event
  ↓
useRealtimeSubscription triggers onData callback
  ↓
useRealtimeSession.loadData()
  ↓
SELECT * FROM session_participants WHERE session_id = ...
  ↓
Transform rows → Profile[] via getProfiles()
  ↓
setState({ participants: newParticipants })
  ↓
React re-renders participant list
  ↓
User sees new participant immediately
```

## Comparison: Local vs Cloud

| Feature | Local Mode | Cloud Mode |
|---------|-----------|------------|
| **Storage** | IndexedDB (browser) | Supabase (cloud) |
| **Code Length** | 6 characters | 6+ characters |
| **Real-time Sync** | ❌ No | ✅ Yes |
| **Multi-device** | ❌ No | ✅ Yes |
| **Offline** | ✅ Yes | ❌ No (requires internet) |
| **Connection Indicator** | None | Green/Red pulse |
| **Profile Updates** | Manual refresh | Automatic |
| **Participant Joins** | Manual refresh | Instant |
| **Data Persistence** | Browser only | Server + all clients |
| **QR Code Sharing** | N/A | ✅ Supported (future) |

## Future Enhancements

### 1. QR Code Sharing (SessionHostLayout)

```typescript
import { SessionHostLayout } from '@/lib/realtime';

function RoomView() {
  const { sessionCode, profiles, connectionStatus, isConnected } = useNetworkSession(roomCode, true);

  return (
    <SessionHostLayout
      sessionCode={sessionCode}
      title="My Classroom"
      subtitle="Spring 2024"
      participantCount={profiles.length}
      connectionStatus={connectionStatus}
      isCloudMode={true}
      shareUrl={`https://myapp.com/student-network?code=${sessionCode}`}
      showQRCode={true}
      onRefresh={() => reload()}
    >
      {/* Room content */}
    </SessionHostLayout>
  );
}
```

### 2. Real-Time Icebreaker Sync

```typescript
// Already exists: icebreaker_answers table
// Just needs subscription:

const {
  data: answers,
} = useRealtimeSession({
  appType: 'student-network',
  sessionCode: roomCode,
  dataTable: 'icebreaker_answers',
  dataEvent: 'INSERT',
  transformData: (rows) => rows.map(row => ({
    id: row.id,
    questionText: row.question_text,
    answerText: row.answer_text,
    participantId: row.participant_id,
  })),
});

// Answers update in real-time!
```

### 3. Host Controls

```typescript
function HostControls() {
  const { closeSession, participants } = useNetworkSession(roomCode, true);

  async function handleCloseRoom() {
    const confirmed = confirm('방을 종료하시겠습니까?');
    if (confirmed) {
      await closeSession();
      // Navigate back...
    }
  }

  return (
    <Button onClick={handleCloseRoom} variant="destructive">
      방 종료하기
    </Button>
  );
}
```

## Troubleshooting

### "세션을 찾을 수 없습니다"

**Cause**: Session doesn't exist in Supabase or is expired

**Solution**:
- Check code spelling
- Verify internet connection
- Ask host to create new room

### Connection Indicator Shows Red

**Cause**: WebSocket connection lost

**Solutions**:
1. Check internet connection
2. Refresh page
3. Try closing/reopening browser tab
4. Check Supabase status

### Participants Not Appearing

**Cause**: Real-time subscription not working

**Debug**:
1. Open browser console
2. Look for "[Realtime] subscribed to..." messages
3. Check Network tab for WebSocket connection
4. Verify `NEXT_PUBLIC_SUPABASE_URL` is set

### Local Room Not Found After Creating

**Cause**: IndexedDB storage issue

**Solutions**:
1. Check browser storage settings
2. Try creating again
3. Check browser console for errors
4. Use cloud mode instead

## Best Practices

### When to Use Cloud Mode

✅ **Use Cloud Mode when**:
- Multiple devices need to join
- Real-time updates are important
- Sharing via QR code/link
- Need persistence beyond browser

❌ **Use Local Mode when**:
- Single device only
- Offline environment
- Privacy is critical
- Testing/development

### Performance Tips

1. **Limit participant metadata size**
   - Avoid large avatarUrl data URIs
   - Use external image URLs instead
   - Keep contacts minimal

2. **Handle connection states**
   ```typescript
   if (connectionStatus === 'disconnected') {
     showOfflineNotice();
   }
   ```

3. **Debounce rapid updates**
   ```typescript
   const debouncedReload = useMemo(
     () => debounce(reload, 1000),
     [reload]
   );
   ```

## Security Considerations

### Data Privacy

- Participant metadata is **public** to all room members
- Don't store sensitive info in contacts
- Avatars are visible to everyone
- Room codes are **not secret** (anyone with code can join)

### Row-Level Security (RLS)

Current policies allow:
- Anyone can INSERT into `sessions` (create room)
- Anyone can INSERT into `session_participants` (join room)
- Anyone can SELECT from both tables

Future: Add policies to:
- Restrict edits to host only
- Ban participants
- Require authentication for certain actions
