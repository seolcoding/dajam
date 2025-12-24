'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

/**
 * AuthProvider - 클라이언트 인증 상태 관리
 *
 * 수정 이력:
 * - 2024-12-24: Step 2 - 세션 감지 개선
 *   - SIGNED_IN/SIGNED_OUT 이벤트 시 router.refresh() 호출
 *   - 서버 컴포넌트들이 새 세션 상태를 반영하도록 함
 * - 2024-12-24: Step 4 - getSession() 타임아웃 문제 해결
 *   - getSession() 대신 onAuthStateChange의 INITIAL_SESSION 이벤트 사용
 *   - Supabase 공식 권장 패턴 적용
 */

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Use ref to store supabase client to avoid dependency issues
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadOrCreateProfile = async (authUser: User) => {
      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!isMounted) return;

        if (existingProfile) {
          setProfile(existingProfile);
          return;
        }

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching profile:', fetchError);
          return;
        }

        const provider = authUser.app_metadata.provider as 'google' | 'kakao' | null;
        const nickname =
          authUser.user_metadata.full_name ||
          authUser.user_metadata.name ||
          authUser.email?.split('@')[0] ||
          `사용자${authUser.id.slice(0, 6)}`;

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            nickname,
            email: authUser.email ?? null,
            avatar_url: authUser.user_metadata.avatar_url ?? null,
            provider,
            is_admin: false,
          })
          .select()
          .single();

        if (!isMounted) return;

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return;
        }

        setProfile(newProfile);
      } catch (error) {
        console.error('Error in loadOrCreateProfile:', error);
      }
    };

    // Step 4: getSession() 대신 onAuthStateChange의 INITIAL_SESSION 이벤트 사용
    // Supabase 공식 권장 패턴 - onAuthStateChange가 초기 세션도 처리함
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;

        console.log('[AuthProvider] onAuthStateChange:', event, newSession?.user?.email);

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await loadOrCreateProfile(newSession.user);
        } else {
          setProfile(null);
        }

        // INITIAL_SESSION: 첫 로드 시 세션 상태 확인 완료
        // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED: 세션 변경
        if (event === 'INITIAL_SESSION') {
          // 초기 세션 로드 완료
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setLoading(false);
          router.refresh();
        }
      }
    );

    // 10초 후에도 INITIAL_SESSION이 안 오면 로딩 해제 (fallback)
    const fallbackTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('[AuthProvider] Fallback: no INITIAL_SESSION received, setting loading to false');
        setLoading(false);
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - supabase is stored in ref

  const signOut = useCallback(async () => {
    const client = supabaseRef.current;
    if (!client) return;

    try {
      await client.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
