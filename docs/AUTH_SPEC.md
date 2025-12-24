# Authentication Specification

## 개요

Supabase Auth를 사용한 소셜 로그인 (Google, Kakao) 구현

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              사용자                                      │
│                                │                                        │
│                    ┌───────────┴───────────┐                           │
│                    ▼                       ▼                           │
│            ┌─────────────┐         ┌─────────────┐                     │
│            │   Google    │         │   Kakao     │                     │
│            │   Login     │         │   Login     │                     │
│            └──────┬──────┘         └──────┬──────┘                     │
│                   │                       │                            │
│                   └───────────┬───────────┘                            │
│                               ▼                                        │
│                    ┌─────────────────────┐                             │
│                    │   Supabase Auth     │                             │
│                    │   (OAuth Provider)  │                             │
│                    └──────────┬──────────┘                             │
│                               │                                        │
│                               ▼                                        │
│                    ┌─────────────────────┐                             │
│                    │   JWT Token         │                             │
│                    │   (access_token)    │                             │
│                    └──────────┬──────────┘                             │
│                               │                                        │
│                               ▼                                        │
│                    ┌─────────────────────┐                             │
│                    │   Next.js App       │                             │
│                    │   (Authenticated)   │                             │
│                    └─────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Supabase 설정

### 1. Google OAuth 설정

**Google Cloud Console:**
1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. 프로젝트 생성 또는 선택
3. APIs & Services → Credentials
4. Create Credentials → OAuth client ID
5. Application type: Web application
6. Authorized redirect URIs:
   ```
   https://<PROJECT_REF>.supabase.co/auth/v1/callback
   ```

**Supabase Dashboard:**
1. Authentication → Providers → Google
2. Enable Google
3. Client ID, Client Secret 입력

### 2. Kakao OAuth 설정

**Kakao Developers:**
1. [developers.kakao.com](https://developers.kakao.com) 접속
2. 내 애플리케이션 → 애플리케이션 추가
3. 앱 키 확인 (REST API 키)
4. 카카오 로그인 → 활성화
5. Redirect URI 등록:
   ```
   https://<PROJECT_REF>.supabase.co/auth/v1/callback
   ```
6. 동의항목 → 필수 동의: 닉네임, 프로필 사진

**Supabase Dashboard:**
1. Authentication → Providers → Kakao
2. Enable Kakao
3. Client ID (REST API 키), Client Secret 입력

### 3. Supabase 환경변수

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 데이터 모델

### users 테이블 (Supabase Auth 기본)

```sql
-- Supabase가 자동 생성하는 auth.users 테이블
-- 추가 프로필 정보를 위한 public.profiles 테이블 생성

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname VARCHAR(50),
  avatar_url TEXT,
  provider VARCHAR(20),  -- 'google' | 'kakao'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 본인 프로필 조회
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 본인 프로필 수정
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 신규 가입 시 프로필 자동 생성 (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'nickname', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 클라이언트 구현

### Supabase 클라이언트 설정

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서는 무시
          }
        },
      },
    }
  );
}
```

### 로그인 컴포넌트

```tsx
// components/auth/LoginButtons.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function LoginButtons() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  const handleKakaoLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={handleGoogleLogin}
        variant="outline"
        className="w-full"
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Google로 계속하기
      </Button>

      <Button
        onClick={handleKakaoLogin}
        className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FDD835]"
      >
        <KakaoIcon className="w-5 h-5 mr-2" />
        카카오로 계속하기
      </Button>
    </div>
  );
}

// 아이콘 컴포넌트
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 3c5.8 0 10.5 3.66 10.5 8.17 0 4.51-4.7 8.17-10.5 8.17-.88 0-1.73-.08-2.54-.24l-4.12 2.74c-.22.15-.52-.02-.48-.28l.62-3.57C3.24 16.14 1.5 13.87 1.5 11.17 1.5 6.66 6.2 3 12 3z"
      />
    </svg>
  );
}
```

### OAuth Callback 처리

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 에러 발생 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
```

### Auth Context (전역 상태)

```tsx
// components/auth/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 사용 예시

```tsx
// app/layout.tsx
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

```tsx
// components/Header.tsx
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Header() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <header className="flex items-center justify-between p-4">
      <Link href="/">SeolCoding Apps</Link>

      {user ? (
        <div className="flex items-center gap-3">
          <Avatar>
            <img src={user.user_metadata.avatar_url} alt="" />
          </Avatar>
          <span>{user.user_metadata.name}</span>
          <Button variant="ghost" onClick={signOut}>
            로그아웃
          </Button>
        </div>
      ) : (
        <Link href="/login">
          <Button>로그인</Button>
        </Link>
      )}
    </header>
  );
}
```

---

## 로그인 페이지

```tsx
// app/login/page.tsx
import { Metadata } from 'next';
import { LoginButtons } from '@/components/auth/LoginButtons';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '로그인 | SeolCoding Apps',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-white">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">SeolCoding Apps</h1>
          <p className="text-muted-foreground mt-2">
            로그인하고 다양한 기능을 이용하세요
          </p>
        </div>

        <LoginButtons />

        <p className="text-xs text-center text-muted-foreground mt-6">
          로그인 시{' '}
          <Link href="/terms" className="underline">이용약관</Link>
          {' '}및{' '}
          <Link href="/privacy" className="underline">개인정보처리방침</Link>
          에 동의합니다.
        </p>
      </Card>
    </div>
  );
}
```

---

## Protected Routes (미들웨어)

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 인증이 필요한 경로
const protectedRoutes = [
  '/profile',
  '/settings',
  '/my-sessions',
];

// 인증 시 접근 불가 경로 (이미 로그인 상태)
const authRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 인증 필요 경로 체크
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?next=${pathname}`, request.url)
      );
    }
  }

  // 이미 로그인된 경우 로그인 페이지 접근 방지
  if (authRoutes.includes(pathname) && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## 인증 + 실시간 세션 연동

```typescript
// 세션 생성 시 사용자 정보 연결
// app/api/sessions/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // 인증된 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();

  // 세션 생성 (호스트 = 현재 사용자)
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      app_type: body.appType,
      config: body.config,
      host_id: user.id,
      code: generateSessionCode(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    sessionId: session.id,
    code: session.code,
  });
}

function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

---

## 요약

### 인증 흐름

```
1. 사용자가 Google/Kakao 로그인 버튼 클릭
2. OAuth Provider로 리다이렉트
3. 사용자 인증 완료
4. /auth/callback으로 리다이렉트
5. Supabase가 JWT 토큰 발급
6. 클라이언트에 세션 저장 (쿠키)
7. 인증된 상태로 앱 사용
```

### 서버 vs 클라이언트

| 역할 | Server | Client |
|------|:------:|:------:|
| OAuth 설정 | ✅ Supabase Dashboard | - |
| 로그인 버튼 | - | ✅ |
| Callback 처리 | ✅ API Route | - |
| 세션 관리 | ✅ Supabase | ✅ Context |
| 인증 상태 확인 | ✅ Middleware | ✅ Hook |
| Protected Routes | ✅ Middleware | - |
| 사용자 정보 조회 | ✅ | ✅ |
