# SeolCoding Apps 고도화 로드맵

> **작성일**: 2024-12-22
> **목표**: 실시간 멀티유저 + UX 개선 + Supabase 백엔드 연동
> **타겟 규모**: 소규모 오프라인 모임(3-10명), 중규모 행사(10-50명)

---

## 1. 현재 상태 분석

### 1.1 Supabase 연동 현황

| 항목 | 상태 | 세부사항 |
|------|------|---------|
| Supabase 프로젝트 | ✅ 생성됨 | `hwgsqzdpqmfoyxiymjsp` |
| 환경변수 | ✅ 설정됨 | `.env.local` 완료 |
| 스키마 설계 | ✅ 완료 | `supabase/migrations/*.sql` |
| **스키마 적용** | ❌ **미완료** | `supabase db push` 필요 |
| RLS 정책 | ⚠️ 문제 있음 | 무한 재귀 오류 (마이그레이션 미적용) |
| TypeScript 타입 | ✅ 수동 작성됨 | `src/types/database.ts` |

### 1.2 앱별 구현 현황

| 앱 | 로컬 모드 | 클라우드 모드 | Supabase Realtime |
|----|----------|-------------|-------------------|
| **live-voting** | ✅ 완료 | ⚠️ 부분 (훅 작성됨) | ⚠️ 미테스트 |
| **group-order** | ✅ UI만 | ❌ 없음 | ❌ 없음 |
| **bingo-game** | ✅ 완료 | ❌ 없음 | ❌ 없음 |

### 1.3 live-voting 상세 현황

```
✅ 완료된 기능:
- 투표 생성 (단일/복수/순위)
- QR 코드 생성
- 로컬 BroadcastChannel 실시간 업데이트
- 프레젠테이션 모드
- Recharts 결과 차트
- useSupabasePoll 훅 작성

⚠️ 미완료/미테스트:
- Supabase sessions 테이블 INSERT (RLS 오류)
- Supabase Realtime 구독 (스키마 미적용)
- 크로스 디바이스 실제 테스트
```

### 1.4 group-order 상세 현황

```
✅ 완료된 기능:
- 홈 페이지 UI
- 세션 생성 UI (CreateSessionPage)
- 호스트 대시보드 UI (HostDashboardPage)
- 참여자 주문 UI (JoinSessionPage)
- 요약 페이지 UI (SummaryPage)
- QR 코드 컴포넌트

❌ 미구현:
- Supabase 연동 (0%)
- 실시간 주문 동기화
- 데이터 저장 로직
```

---

## 2. 고도화 워크플로우

### Phase 0: Supabase 인프라 정상화 (선결 조건)
**예상 작업량**: 터미널 명령 실행

#### 0.1 스키마 적용
```bash
# 1. Supabase CLI 로그인
supabase login

# 2. 프로젝트 연결
cd /Users/sdh/Dev/02_production/seolcoding-apps
supabase link --project-ref hwgsqzdpqmfoyxiymjsp

# 3. 마이그레이션 적용 (스키마 + RLS 수정)
supabase db push

# 4. TypeScript 타입 재생성 (선택)
supabase gen types typescript --project-id hwgsqzdpqmfoyxiymjsp > src/types/database.generated.ts
```

#### 0.2 연결 검증
```bash
# 모든 테이블 접근 가능 확인
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hwgsqzdpqmfoyxiymjsp.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
Promise.all([
  supabase.from('sessions').select('count').limit(1),
  supabase.from('profiles').select('count').limit(1),
  supabase.from('votes').select('count').limit(1),
  supabase.from('orders').select('count').limit(1),
]).then(results => {
  results.forEach((r, i) => {
    const tables = ['sessions', 'profiles', 'votes', 'orders'];
    console.log(r.error ? '❌ ' + tables[i] + ': ' + r.error.message : '✅ ' + tables[i]);
  });
});
"
```

---

### Phase 1: live-voting 클라우드 모드 완성

#### 1.1 기존 코드 검증 및 버그 수정

| 파일 | 작업 내용 |
|------|----------|
| `hooks/useSupabasePoll.ts` | RLS 오류 핸들링 개선, 에러 메시지 개선 |
| `hooks/useLiveResults.ts` | 클라우드/로컬 모드 전환 로직 검증 |
| `components/CreatePoll.tsx` | 클라우드 모드 생성 성공/실패 UX |

#### 1.2 실시간 투표 테스트
```typescript
// 테스트 시나리오
1. 호스트: 클라우드 모드로 투표 생성
2. 참여자 A: QR 스캔 → 투표 참여
3. 참여자 B: 링크 → 투표 참여
4. 호스트: 실시간 결과 업데이트 확인
```

#### 1.3 에러 핸들링 강화
```typescript
// 추가할 에러 케이스
- Supabase 연결 실패 → 로컬 모드 폴백
- 세션 만료 → 재연결 시도
- 네트워크 끊김 → 오프라인 큐잉
```

---

### Phase 2: group-order Supabase 연동

#### 2.1 공통 훅 생성

```typescript
// src/app/group-order/hooks/useSupabaseSession.ts
export function useSupabaseSession(sessionCode: string) {
  // sessions 테이블에서 세션 로드
  // session_participants 관리
  // Realtime 구독
}

// src/app/group-order/hooks/useSupabaseOrders.ts
export function useSupabaseOrders(sessionId: string) {
  // orders 테이블 CRUD
  // Realtime 구독으로 실시간 업데이트
}
```

#### 2.2 컴포넌트 연동

| 컴포넌트 | 작업 내용 |
|---------|----------|
| `CreateSessionPage.tsx` | Supabase sessions INSERT |
| `HostDashboardPage.tsx` | Realtime orders 구독, 참여자 목록 |
| `JoinSessionPage.tsx` | session_participants INSERT, orders INSERT |
| `SummaryPage.tsx` | orders 집계, 공유 기능 |

#### 2.3 데이터 흐름

```
호스트 생성:
  sessions INSERT → session_participants INSERT (host)

참여자 참여:
  sessions SELECT (by code) → session_participants INSERT

주문:
  orders INSERT → Realtime broadcast → 모든 클라이언트 업데이트
```

---

### Phase 3: UX 고도화

#### 3.1 참여 흐름 간소화

| 현재 | 개선 |
|------|------|
| QR 스캔 → 페이지 로드 → 수동 참여 | QR 스캔 → 자동 세션 참여 → 즉시 투표/주문 |
| 링크 접속 → 코드 입력 필요 | 링크에 코드 포함 → 자동 참여 |

```typescript
// URL 구조 개선
/live-voting/vote/[pollId]    → 기존 유지
/group-order/join/[sessionCode]  → 새로 추가 (쿼리 파라미터 대신)
```

#### 3.2 호스트 기능 강화

```typescript
// 추가할 호스트 기능
- 참여자 목록 실시간 표시
- 참여자 강퇴 기능
- 투표/주문 마감 기능
- 결과 공유 (이미지/텍스트)
- 세션 연장/종료
```

#### 3.3 모바일 최적화

```typescript
// 터치 제스처
- 스와이프로 순위 변경 (react-swipeable 활용)
- 풀 투 리프레시
- 바텀 시트 메뉴

// 반응형 개선
- 세로 스크롤 최적화
- 큰 터치 영역 (최소 44px)
- 키보드 회피 (input focus 시)
```

#### 3.4 시각적 피드백 강화

```typescript
// 애니메이션 추가
- 새 투표/주문 들어올 때 하이라이트
- 결과 차트 애니메이션 (Framer Motion)
- 참여자 입장 시 알림 토스트
- 투표 완료 시 confetti (이미 있음)

// 사운드 피드백 (선택적)
- 새 참여자 알림
- 투표/주문 완료
```

---

### Phase 4: 병렬 개발 전략

두 앱을 병렬로 개발하기 위한 공통 모듈화:

#### 4.1 공통 훅 추출

```typescript
// src/hooks/useSupabaseSession.ts (공통)
export function useSupabaseSession({
  appType,
  sessionCode,
  enabled
}: SessionOptions) {
  // live-voting, group-order, bingo-game 공통 사용
}

// src/hooks/useRealtimeSubscription.ts (공통)
export function useRealtimeSubscription<T>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
}: RealtimeOptions<T>) {
  // 범용 Realtime 구독 훅
}
```

#### 4.2 공통 컴포넌트

```typescript
// src/components/session/
├── QRCodeDisplay.tsx       // QR 코드 표시 (공통)
├── SessionCodeInput.tsx    // 6자리 코드 입력 (공통)
├── ParticipantList.tsx     // 참여자 목록 (공통)
├── SessionHeader.tsx       // 세션 정보 헤더 (공통)
└── ShareButton.tsx         // 공유 버튼 (공통)
```

---

## 3. 작업 우선순위

### 즉시 수행 (Phase 0)
1. [ ] Supabase CLI 로그인 및 프로젝트 연결
2. [ ] `supabase db push`로 스키마 적용
3. [ ] 연결 테스트 스크립트 실행

### 1주차 (Phase 1)
1. [ ] live-voting 클라우드 모드 실제 테스트
2. [ ] 에러 핸들링 개선
3. [ ] 로컬/클라우드 모드 전환 UX 개선

### 2주차 (Phase 2)
1. [ ] group-order Supabase 훅 생성
2. [ ] CreateSessionPage Supabase 연동
3. [ ] HostDashboardPage Realtime 연동
4. [ ] JoinSessionPage 참여/주문 연동

### 3주차 (Phase 3)
1. [ ] 참여 흐름 간소화 (URL 구조 개선)
2. [ ] 호스트 기능 강화
3. [ ] 모바일 최적화

### 4주차 (Phase 4)
1. [ ] 공통 모듈 추출
2. [ ] 시각적 피드백 강화
3. [ ] E2E 테스트 작성

---

## 4. 기술적 고려사항

### 4.1 Supabase Realtime 최적화

```typescript
// 권장 패턴: 개별 채널 대신 테이블별 단일 채널
const channel = supabase
  .channel('room-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'votes', filter: `session_id=eq.${id}` },
    handleVoteChange
  )
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${id}` },
    handleParticipantChange
  )
  .subscribe();
```

### 4.2 오프라인 지원 (선택적)

```typescript
// 오프라인 큐잉 전략
1. 네트워크 상태 감지 (navigator.onLine)
2. 실패한 요청 IndexedDB에 저장
3. 온라인 복귀 시 자동 재전송
4. 충돌 해결 (last-write-wins)
```

### 4.3 보안 고려사항

```typescript
// RLS 추가 고려
- 세션 만료 체크 (expires_at)
- 최대 참여자 수 제한 (max_participants)
- 투표 중복 방지 (user_id + session_id unique)
- 강퇴된 사용자 재참여 방지 (is_banned)
```

---

## 5. 성공 지표

### 5.1 기능적 지표

| 지표 | 목표 |
|------|------|
| 크로스 디바이스 투표 성공률 | 99%+ |
| Realtime 업데이트 지연 | < 500ms |
| QR 스캔 → 투표 완료 시간 | < 10초 |
| 세션 동시 참여자 | 50명+ 안정 |

### 5.2 UX 지표

| 지표 | 목표 |
|------|------|
| 참여 탈락률 (QR 스캔 후 이탈) | < 10% |
| 에러 발생 시 복구 성공률 | 95%+ |
| 모바일 사용률 | 70%+ |

---

## 6. 리스크 및 대응

| 리스크 | 대응 방안 |
|--------|----------|
| Supabase Free Tier 한계 | 50명 동시 접속 테스트, 필요시 Pro 업그레이드 |
| Realtime 연결 불안정 | 폴백 폴링 + 재연결 로직 |
| RLS 정책 복잡도 | SECURITY DEFINER 함수 활용 (이미 적용) |
| 모바일 브라우저 호환성 | Safari WebSocket 테스트 필수 |

---

*이 로드맵은 브레인스토밍 세션을 바탕으로 작성되었으며, 실제 구현 시 조정될 수 있습니다.*
