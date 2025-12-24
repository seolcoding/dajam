'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import type { AppType, Session, SessionParticipant, Json } from '@/types/database';
import type {
  RealtimeSessionState,
  UseRealtimeSessionOptions,
  CreateSessionOptions,
  JoinSessionOptions,
  ConnectionStatus,
} from '../types';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { generateSessionCode } from '../utils';

/**
 * 제네릭 실시간 세션 훅
 * 모든 실시간 앱에서 공통으로 사용
 *
 * @example
 * // live-voting
 * const { session, data: votes } = useRealtimeSession({
 *   appType: 'live-voting',
 *   sessionCode: pollId,
 *   dataTable: 'votes',
 *   transformData: (rows) => rows.map(transformVote),
 * });
 *
 * @example
 * // bingo-game
 * const { session, participants } = useRealtimeSession({
 *   appType: 'bingo-game',
 *   sessionCode: gameCode,
 *   dataTable: 'session_participants',
 * });
 */
export function useRealtimeSession<TConfig = Json, TData = unknown>({
  appType,
  sessionCode,
  enabled = true,
  dataTable = 'session_participants',
  dataEvent = 'INSERT',
  transformConfig,
  transformData,
  onSessionLoaded,
  onDataReceived,
  onConnectionChange,
}: UseRealtimeSessionOptions<TConfig, TData>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;

  const [state, setState] = useState<RealtimeSessionState<TConfig, TData>>({
    session: null,
    sessionId: null,
    config: null,
    participants: [],
    data: [],
    isLoading: true,
    error: null,
    isCloudMode: false,
    connectionStatus: 'disconnected',
  });

  // Stable refs for callbacks to prevent infinite loops
  const transformConfigRef = useRef(transformConfig);
  const transformDataRef = useRef(transformData);
  const onSessionLoadedRef = useRef(onSessionLoaded);
  const onDataReceivedRef = useRef(onDataReceived);
  const onConnectionChangeRef = useRef(onConnectionChange);

  // Ref for sessionId to avoid stale closure in joinSession
  const sessionIdRef = useRef<string | null>(null);

  // Update refs on each render
  useEffect(() => {
    transformConfigRef.current = transformConfig;
    transformDataRef.current = transformData;
    onSessionLoadedRef.current = onSessionLoaded;
    onDataReceivedRef.current = onDataReceived;
    onConnectionChangeRef.current = onConnectionChange;
  });

  // Keep sessionId ref in sync with state
  useEffect(() => {
    sessionIdRef.current = state.sessionId;
  }, [state.sessionId]);

  // 세션 로드
  const loadSession = useCallback(async () => {
    if (!enabled || !sessionCode) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // 세션 조회
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', sessionCode.toUpperCase())
        .eq('app_type', appType)
        .eq('is_active', true)
        .single();

      if (sessionError || !sessionData) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: '세션을 찾을 수 없습니다.',
          isCloudMode: false,
        }));
        return;
      }

      const session = sessionData as Session;
      const config = transformConfigRef.current
        ? transformConfigRef.current(session.config)
        : (session.config as TConfig);

      // 참여자 로드
      const { data: participantsData } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', session.id)
        .order('joined_at', { ascending: true });

      const participants = (participantsData || []) as SessionParticipant[];

      // 데이터 로드 (dataTable이 session_participants가 아닌 경우)
      let data: TData[] = [];
      if (dataTable !== 'session_participants') {
        const { data: tableData } = await supabase
          .from(dataTable)
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true });

        data = transformDataRef.current
          ? transformDataRef.current(tableData || [])
          : ((tableData || []) as TData[]);
      }

      // Update ref immediately (before setState which is async)
      sessionIdRef.current = session.id;

      setState((prev) => ({
        ...prev,
        session,
        sessionId: session.id,
        config,
        participants,
        data,
        isLoading: false,
        isCloudMode: true,
      }));

      onSessionLoadedRef.current?.(session);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : '알 수 없는 오류',
      }));
    }
  }, [appType, sessionCode, enabled, supabase, dataTable]);

  // 데이터 다시 로드
  const loadData = useCallback(async () => {
    if (!state.sessionId) return;

    if (dataTable === 'session_participants') {
      const { data: participantsData } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', state.sessionId)
        .order('joined_at', { ascending: true });

      setState((prev) => ({
        ...prev,
        participants: (participantsData || []) as SessionParticipant[],
      }));
    } else {
      const { data: tableData } = await supabase
        .from(dataTable)
        .select('*')
        .eq('session_id', state.sessionId)
        .order('created_at', { ascending: true });

      const data = transformDataRef.current
        ? transformDataRef.current(tableData || [])
        : ((tableData || []) as TData[]);

      setState((prev) => ({ ...prev, data }));
      onDataReceivedRef.current?.(data);
    }
  }, [state.sessionId, dataTable, supabase]);

  // Realtime 구독
  const { connectionStatus, isConnected } = useRealtimeSubscription({
    sessionId: state.sessionId,
    channelName: `${appType}:${state.sessionId}`,
    enabled: enabled && !!state.sessionId,
    subscriptions: [
      {
        tableName: dataTable,
        event: dataEvent,
      },
      // 참여자도 항상 구독 (dataTable이 다른 경우)
      ...(dataTable !== 'session_participants'
        ? [{ tableName: 'session_participants', event: '*' as const }]
        : []),
    ],
    onData: () => {
      loadData();
    },
    onConnectionChange: (status) => {
      setState((prev) => ({ ...prev, connectionStatus: status }));
      onConnectionChangeRef.current?.(status);
    },
  });

  // 세션 생성
  const createSession = useCallback(
    async (options: CreateSessionOptions<TConfig>): Promise<string | null> => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const code = generateSessionCode();

        const { data, error } = await supabase
          .from('sessions')
          .insert({
            code,
            app_type: options.appType,
            title: options.title,
            host_id: userData.user?.id || null,
            config: options.config as Json,
            is_active: true,
            is_public: options.isPublic ?? true,
            max_participants: options.maxParticipants || null,
            expires_at: options.expiresAt?.toISOString() || null,
          })
          .select()
          .single();

        if (error || !data) {
          throw error || new Error('세션 생성 실패');
        }

        setState((prev) => ({
          ...prev,
          session: data as Session,
          sessionId: data.id,
          config: options.config,
          isCloudMode: true,
        }));

        return code;
      } catch (err) {
        console.error('Failed to create session:', err);
        return null;
      }
    },
    [supabase]
  );

  // 세션 참여 - sessionIdRef 사용으로 stale closure 방지
  const joinSession = useCallback(
    async (options: JoinSessionOptions): Promise<SessionParticipant | null> => {
      // Use ref to get the latest sessionId (avoids stale closure)
      const currentSessionId = sessionIdRef.current;

      if (!currentSessionId) {
        return null;
      }

      try {
        const { data: userData } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from('session_participants')
          .insert({
            session_id: currentSessionId,
            user_id: userData.user?.id || null,
            display_name: options.displayName,
            role: 'participant',
            metadata: options.metadata || {},
          })
          .select()
          .single();

        if (error || !data) {
          throw error || new Error('참여 실패');
        }

        return data as SessionParticipant;
      } catch (err) {
        console.error('[joinSession] Failed:', err);
        return null;
      }
    },
    [supabase] // sessionId 제거 - ref 사용으로 의존성 불필요
  );

  // 세션 종료
  const closeSession = useCallback(async (): Promise<boolean> => {
    if (!state.sessionId) return false;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('id', state.sessionId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to close session:', err);
      return false;
    }
  }, [state.sessionId, supabase]);

  // 초기 로드
  useEffect(() => {
    if (enabled && sessionCode) {
      loadSession();
    } else {
      // When not enabled or no session code, set loading to false
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [loadSession, enabled, sessionCode]);

  return {
    // State
    ...state,
    connectionStatus,
    isConnected,

    // Actions
    createSession,
    joinSession,
    closeSession,
    reload: loadSession,
    loadData,
  };
}
