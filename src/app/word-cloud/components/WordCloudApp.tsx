'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Users, Sparkles, ArrowLeft, Cloud } from 'lucide-react';
import { AppHeader, AppFooter } from '@/components/layout';
import { MultiplayerEntry } from '@/components/entry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HostView } from './HostView';
import { ParticipantView } from './ParticipantView';
import { useWordCloudStore } from '../store/wordCloudStore';
import { useRealtimeSession } from '@/lib/realtime';
import type { WordCloudSession, WordEntry } from '../types';
import { DEFAULT_SETTINGS as defaultSettings } from '../types';

type ViewMode = 'home' | 'create' | 'join' | 'host' | 'participant';

export default function WordCloudApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [questionTitle, setQuestionTitle] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const {
    session,
    sessionCode,
    setSession,
    setParticipant,
    addEntry,
    setIsCloudMode,
    isCloudMode: storeIsCloudMode,
    reset,
  } = useWordCloudStore();

  // Realtime session hook
  const {
    session: cloudSession,
    data: cloudEntries,
    participants,
    createSession,
    joinSession,
    closeSession,
    isLoading,
    isCloudMode: realtimeIsCloudMode,
    connectionStatus,
  } = useRealtimeSession<typeof defaultSettings, WordEntry>({
    appType: 'word-cloud',
    sessionCode: sessionCode || '',
    enabled: !!sessionCode && storeIsCloudMode,
    dataTable: 'word_entries',
    dataEvent: 'INSERT',
    transformData: (rows: any[]) =>
      rows.map((r) => ({
        id: r.id,
        sessionId: r.session_id,
        word: r.word,
        participantId: r.participant_id,
        participantName: r.participant_name,
        createdAt: r.created_at,
      })),
    onDataReceived: (entries) => {
      // Update store with realtime data
      entries.forEach((entry) => addEntry(entry));
    },
  });

  const isCloudMode = storeIsCloudMode || realtimeIsCloudMode;

  // Handle URL parameters
  useEffect(() => {
    const view = searchParams.get('view');
    const code = searchParams.get('code');

    if (view === 'create') {
      setViewMode('create');
    } else if (view === 'join' && code) {
      setJoinCode(code);
      setViewMode('join');
    } else if (view === 'host' && code) {
      // Load host view
      setViewMode('host');
    } else if (view === 'participant' && code) {
      setViewMode('participant');
    } else {
      setViewMode('home');
    }
  }, [searchParams]);

  // Update store when cloud session loads
  useEffect(() => {
    if (cloudSession && realtimeIsCloudMode) {
      const session: WordCloudSession = {
        id: cloudSession.id,
        hostId: cloudSession.host_id || '',
        title: cloudSession.title,
        settings: (cloudSession.config as unknown) as typeof defaultSettings,
        status: cloudSession.is_active ? 'collecting' : 'closed',
        createdAt: cloudSession.created_at,
        isCloudMode: true,
      };
      setSession(session, cloudSession.code);
      setIsCloudMode(true);
    }
  }, [cloudSession, realtimeIsCloudMode, setSession, setIsCloudMode]);

  const handleCreateSession = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!questionTitle.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }

    setIsCreating(true);

    try {
      // Create cloud session
      const code = await createSession({
        appType: 'word-cloud',
        title: questionTitle,
        config: defaultSettings,
      });

      if (code) {
        router.push(`/word-cloud?view=host&code=${code}`);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('Create session error:', error);
      alert('세션 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!joinCode.trim()) {
      alert('세션 코드를 입력해주세요.');
      return;
    }

    if (!participantName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setIsJoining(true);

    try {
      // First, verify session exists by setting the code and loading
      const upperCode = joinCode.toUpperCase();
      router.push(`/word-cloud?view=participant&code=${upperCode}`);

      // Join will happen in the participant view
    } catch (error) {
      console.error('Join error:', error);
      alert('세션 참여에 실패했습니다.');
      setIsJoining(false);
    }
  };

  const handleSubmitWord = async (word: string): Promise<boolean> => {
    if (!session || !sessionCode) return false;

    try {
      const participantId = useWordCloudStore.getState().participantId || nanoid();
      const name = useWordCloudStore.getState().participantName || '익명';

      const entry: WordEntry = {
        id: nanoid(),
        sessionId: session.id,
        word,
        participantId,
        participantName: name,
        createdAt: new Date().toISOString(),
      };

      if (isCloudMode) {
        // Submit to Supabase
        // This would need a custom insert function
        // For now, we'll use a simple approach
        const { data, error } = await (window as any).supabase
          .from('word_entries')
          .insert({
            session_id: session.id,
            word,
            participant_id: participantId,
            participant_name: name,
          });

        if (error) throw error;
      }

      addEntry(entry);
      useWordCloudStore.getState().addSubmittedWord(word);
      return true;
    } catch (error) {
      console.error('Submit word error:', error);
      return false;
    }
  };

  const handleCloseSession = async (): Promise<boolean> => {
    if (isCloudMode) {
      return await closeSession();
    } else {
      useWordCloudStore.getState().closeSession();
      return true;
    }
  };

  const navigateTo = (view: ViewMode, code?: string) => {
    const params = new URLSearchParams();
    params.set('view', view);
    if (code) params.set('code', code);
    router.push(`/word-cloud?${params.toString()}`);
  };

  // Home View
  if (viewMode === 'home') {
    const handleHostStart = () => {
      navigateTo('create');
    };

    const handleParticipantJoin = async ({ code, name }: { code: string; name: string }) => {
      if (code.length !== 6 || !name.trim()) return;
      setParticipantName(name);
      setJoinCode(code);
      router.push(`/word-cloud?view=participant&code=${code.toUpperCase()}`);
    };

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AppHeader
          title="워드 클라우드"
          description="실시간으로 참가자들의 의견을 수집하고 시각화하세요"
          icon={Cloud}
          iconGradient="from-purple-500 to-pink-500"
          variant="compact"
        />

        <div className="flex-1 container mx-auto px-4 py-8">
          <MultiplayerEntry
            onHostStart={handleHostStart}
            onParticipantJoin={handleParticipantJoin}
            hostTitle="새 워드 클라우드 만들기"
            hostDescription="질문을 만들고 참가자들의 의견을 수집하세요"
            participantTitle="워드 클라우드 참여"
            participantDescription="6자리 코드로 세션에 참여하세요"
            hostButtonText="워드 클라우드 만들기"
            participantButtonText="참여하기"
            featureBadges={['실시간 동기화', '다양한 테마', 'QR 코드 참여']}
          />

          {/* Feature Cards */}
          <div className="max-w-lg mx-auto mt-12 grid gap-4">
            <FeatureCard
              icon={Sparkles}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              title="실시간 동기화"
              description="참가자가 입력한 단어가 즉시 워드 클라우드에 반영됩니다."
            />
            <FeatureCard
              icon={Cloud}
              iconBg="bg-pink-100"
              iconColor="text-pink-600"
              title="다양한 테마"
              description="5가지 색상 테마로 워드 클라우드를 커스터마이징할 수 있습니다."
            />
            <FeatureCard
              icon={Users}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              title="QR 코드 참여"
              description="QR 코드로 빠르게 참여하고 바로 단어를 제출할 수 있습니다."
            />
          </div>
        </div>

        <AppFooter variant="compact" />
      </div>
    );
  }

  // Create View
  if (viewMode === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader
          title="워드 클라우드"
          description="새 워드 클라우드 생성"
          icon={Cloud}
          iconGradient="from-purple-500 to-pink-500"
        />

        <div className="max-w-2xl mx-auto px-4 py-12 flex-1">
          <Button
            variant="ghost"
            onClick={() => navigateTo('home')}
            className="mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            돌아가기
          </Button>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={32} className="text-purple-600" fill="currentColor" />
              <h2 className="text-3xl font-bold text-gray-900">워드 클라우드 생성</h2>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-lg font-semibold mb-2">
                  질문
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="예: 오늘 기분을 한 단어로 표현하면?"
                  className="text-lg h-14 border-2"
                  maxLength={200}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  참가자들에게 보여질 질문입니다
                </p>
              </div>

              <Button
                type="submit"
                disabled={isCreating}
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isCreating ? '생성 중...' : '워드 클라우드 시작하기'}
              </Button>
            </form>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }

  // Join View
  if (viewMode === 'join') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader
          title="워드 클라우드"
          description="세션에 참여하기"
          icon={Cloud}
          iconGradient="from-purple-500 to-pink-500"
        />

        <div className="max-w-2xl mx-auto px-4 py-12 flex-1">
          <Button
            variant="ghost"
            onClick={() => navigateTo('home')}
            className="mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            돌아가기
          </Button>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users size={32} className="text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">참여하기</h2>
            </div>

            <form onSubmit={handleJoinSession} className="space-y-6">
              <div>
                <Label htmlFor="code" className="text-lg font-semibold mb-2">
                  세션 코드
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={joinCode}
                  onChange={(e) =>
                    setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                  }
                  placeholder="ABC123"
                  className="text-2xl h-14 border-2 text-center font-bold tracking-wider"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="name" className="text-lg font-semibold mb-2">
                  이름
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="홍길동"
                  className="text-lg h-14 border-2"
                  maxLength={20}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isJoining}
                className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700"
              >
                {isJoining ? '참여 중...' : '참여하기'}
              </Button>
            </form>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }

  // Host View
  if (viewMode === 'host' && sessionCode) {
    return (
      <HostView
        sessionCode={sessionCode}
        onCloseSession={handleCloseSession}
        participantCount={participants.length}
        isCloudMode={isCloudMode}
      />
    );
  }

  // Participant View
  if (viewMode === 'participant' && sessionCode) {
    // Auto-join if we have participant name
    useEffect(() => {
      if (participantName && session && !useWordCloudStore.getState().participantId) {
        const id = nanoid();
        setParticipant(id, participantName);
        joinSession({ displayName: participantName });
      }
    }, [participantName, session, joinSession, setParticipant]);

    return (
      <ParticipantView sessionCode={sessionCode} onSubmitWord={handleSubmitWord} />
    );
  }

  // Loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
        <Icon size={24} className={iconColor} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
