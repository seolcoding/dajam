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

    const initializeAuth = async () => {
      try {
        // Wrap getSession with timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        const { data: { session: currentSession }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as Awaited<ReturnType<typeof supabase.auth.getSession>>;

        if (!isMounted) return;

        if (sessionError || !currentSession) {
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        setUser(currentSession.user);

        if (currentSession.user) {
          await loadOrCreateProfile(currentSession.user);
        }
      } catch (error) {
        // Timeout or other error - treat as no session
        console.error('Error initializing auth:', error);
        setUser(null);
        setSession(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await loadOrCreateProfile(newSession.user);
        } else {
          setProfile(null);
        }

        // Step 2: 세션 변경 시 서버 컴포넌트 갱신
        // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED 이벤트에서 라우터 리프레시
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          router.refresh();
        }
      }
    );

    return () => {
      isMounted = false;
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
