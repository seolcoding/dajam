# 인증 플로우 트러블슈팅 기록

> **작성일**: 2024-12-24
> **상태**: 진행 중

## 문제 요약

로그인 이후 프로세스에서 반복적인 오류 발생:
1. 로그인 이후 대시보드 리다이렉션 과정에서 화면 전환 안됨
2. 로그인 이후 로그아웃 버튼 없음
3. 로그인 이후 유저 페이지 접근 불가

---

## 현재 코드베이스 구조

| 파일 | 역할 |
|------|------|
| `src/app/(auth)/auth/callback/route.ts` | OAuth 콜백 처리, 세션 교환 |
| `src/components/auth/AuthProvider.tsx` | 클라이언트 인증 상태 관리 |
| `src/components/auth/UserMenu.tsx` | 로그아웃 버튼이 포함된 드롭다운 메뉴 |
| `src/middleware.ts` | 보호된 라우트 리다이렉션 |
| `src/lib/supabase/middleware.ts` | 세션 갱신 유틸리티 |

---

## 원인 분석 (가능성 순위)

### 1순위: `x-forwarded-host` 헤더 미처리

**현재 코드** (`callback/route.ts`):
```typescript
return NextResponse.redirect(`${origin}/dashboard`);
```

**문제점**:
- 프로덕션 환경에서 로드밸런서/Vercel 프록시를 거치면 `origin`이 내부 호스트로 해석됨
- 실제 도메인이 아닌 잘못된 URL로 리다이렉트 가능

**Supabase 공식 권장 패턴**:
```typescript
const forwardedHost = request.headers.get('x-forwarded-host');
const isLocalEnv = process.env.NODE_ENV === 'development';

if (isLocalEnv) {
  return NextResponse.redirect(`${origin}${next}`);
} else if (forwardedHost) {
  return NextResponse.redirect(`https://${forwardedHost}${next}`);
} else {
  return NextResponse.redirect(`${origin}${next}`);
}
```

### 2순위: AuthProvider의 세션 감지 지연

**현재 흐름**:
1. OAuth 콜백 → 세션 교환 성공 → `/dashboard`로 리다이렉트
2. `AuthProvider`가 `getSession()` 호출
3. 세션이 쿠키에 반영되기 전에 체크 → `user: null`
4. `(dashboard)/layout.tsx`에서 `!user` 확인 → `/login`으로 재리다이렉트

**증거**:
- `AuthProvider.tsx`에 5초 타임아웃 존재
- `onAuthStateChange` 리스너가 있지만 초기 로드 시 이벤트를 놓칠 수 있음

### 3순위: 쿠키 설정 패턴 불일치

**현재 콜백 코드**:
```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value, options }) => {
    cookieStore.set(name, value, options);
  });
}
```

**공식 패턴** (NextResponse에도 쿠키 설정):
```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
  supabaseResponse = NextResponse.next({ request })
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  )
}
```

---

## 수정 계획 및 진행 상황

### Step 1: x-forwarded-host 헤더 처리 추가

**파일**: `src/app/(auth)/auth/callback/route.ts`

**변경 내용**:
- `x-forwarded-host` 헤더 확인 로직 추가
- 개발/프로덕션 환경 분기 처리
- `next` 파라미터 지원 추가

**상태**: ✅ 구현 완료

**변경된 코드**:
```typescript
// Step 1: x-forwarded-host 헤더 처리
const forwardedHost = request.headers.get('x-forwarded-host');
const isLocalEnv = process.env.NODE_ENV === 'development';

if (isLocalEnv) {
  return NextResponse.redirect(`${origin}${next}`);
} else if (forwardedHost) {
  return NextResponse.redirect(`https://${forwardedHost}${next}`);
} else {
  return NextResponse.redirect(`${origin}${next}`);
}
```

**결과**:
- [x] 구현 완료
- [ ] 테스트 대기 중

**테스트 결과**:
```
(테스트 후 기록)
```

---

### Step 2: AuthProvider 세션 감지 개선

**파일**: `src/components/auth/AuthProvider.tsx`

**변경 내용**:
- `useRouter` import 추가
- `onAuthStateChange`에서 `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED` 이벤트 시 `router.refresh()` 호출
- 서버 컴포넌트들이 새 세션 상태를 반영하도록 함

**상태**: ✅ 구현 완료

**변경된 코드**:
```typescript
import { useRouter } from 'next/navigation';

// AuthProvider 내부
const router = useRouter();

// onAuthStateChange 내부
if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
  router.refresh();
}
```

**결과**:
- [x] 구현 완료
- [ ] 테스트 대기 중

**테스트 결과**:
```
(테스트 후 기록)
```

---

### Step 3: 쿠키 설정 패턴 수정

**파일**: `src/lib/supabase/middleware.ts`

**변경 내용**:
- `supabaseResponse`를 `const`에서 `let`으로 변경 (재할당 가능하게)
- `setAll` 내에서 `NextResponse.next({ request })`를 재호출
- Supabase 공식 패턴과 일치하도록 수정

**상태**: ✅ 구현 완료

**변경된 코드**:
```typescript
// 기존: const supabaseResponse = NextResponse.next({ request });
// 변경: let으로 변경
let supabaseResponse = NextResponse.next({ request });

setAll(cookiesToSet) {
  // 1. request에 쿠키 설정
  cookiesToSet.forEach(({ name, value }) =>
    request.cookies.set(name, value)
  );
  // 2. 변경된 request로 새 response 생성 (핵심!)
  supabaseResponse = NextResponse.next({
    request,
  });
  // 3. response에도 쿠키 설정
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  );
},
```

**왜 이게 중요한가**:
- 쿠키가 변경된 request를 사용하여 새로운 response를 만들어야 함
- 기존 코드는 response 재생성 없이 쿠키만 추가했기 때문에 동기화 문제 발생 가능

**결과**:
- [x] 구현 완료
- [ ] 테스트 대기 중

**테스트 결과**:
```
(테스트 후 기록)
```

---

## 참고 레퍼런스

- [Supabase SSR Auth - Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [OAuth Callback 처리 패턴](https://supabase.com/docs/guides/auth/social-login/auth-figma)
- [Middleware 세션 갱신](https://supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package-5NRunM)

---

## 테스트 체크리스트

### 로컬 환경 (development)
- [ ] 카카오 로그인 → 대시보드 리다이렉트
- [ ] 구글 로그인 → 대시보드 리다이렉트
- [ ] 로그인 후 UserMenu 표시
- [ ] 로그아웃 버튼 작동
- [ ] 대시보드 페이지 접근 가능

### 프로덕션 환경 (Vercel)
- [ ] 카카오 로그인 → 대시보드 리다이렉트
- [ ] 구글 로그인 → 대시보드 리다이렉트
- [ ] 로그인 후 UserMenu 표시
- [ ] 로그아웃 버튼 작동
- [ ] 대시보드 페이지 접근 가능

---

## 변경 이력

| 날짜 | 단계 | 결과 | 비고 |
|------|------|------|------|
| 2024-12-24 | 초기 분석 | ✅ | 원인 분석 완료 |
| 2024-12-24 | Step 1: x-forwarded-host | ✅ | callback/route.ts 수정 |
| 2024-12-24 | Step 2: AuthProvider | ✅ | router.refresh() 추가 |
| 2024-12-24 | Step 3: 쿠키 패턴 | ✅ | middleware.ts 수정 |
| 2024-12-24 | 빌드 테스트 | ✅ | 성공 |
| 2024-12-24 | E2E 테스트 | ✅ | 8개 테스트 통과 (1.7분) |
| 2024-12-24 | 프로덕션 테스트 #1 | ❌ | Session timeout 에러 |
| 2024-12-24 | Step 4: getSession 제거 | ✅ | onAuthStateChange INITIAL_SESSION 사용 |
| 2024-12-24 | Step 5: 로그아웃 버튼 수정 | ✅ | onClick → onSelect 변경 |
| 2024-12-24 | 프로덕션 테스트 #2 | ✅ | 로그인/로그아웃 정상 작동 |
