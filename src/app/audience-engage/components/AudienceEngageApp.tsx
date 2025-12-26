'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Presentation, MessageCircle, BarChart3, Zap } from 'lucide-react';
import { useRealtimeSession } from '@/lib/realtime';
import HostView from './HostView';
import ParticipantView from './ParticipantView';
import type { AudienceEngageConfig, SlideItem, ActiveScene } from '../types';
import type { Json } from '@/types/database';

type ViewMode = 'home' | 'host' | 'participant';

export default function AudienceEngageApp() {
  const searchParams = useSearchParams();

  // URL 파라미터에서 세션 정보 가져오기
  // ?code=ABC123&mode=host → 기존 세션을 호스트로 시작
  // ?code=ABC123 → 참여자로 접속
  const urlCode = searchParams.get('code');
  const urlMode = searchParams.get('mode') as ViewMode | null;
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [sessionCode, setSessionCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState(''); // 참여 코드 입력 (세션 프리로드용)

  // Session title for creation
  const [sessionTitle, setSessionTitle] = useState('');

  // E2E 테스트를 위한 전역 API 노출 (테스트 환경에서만)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__TEST_API__ = {
        setSessionTitle,
        getSessionTitle: () => sessionTitle,
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__TEST_API__;
      }
    };
  }, [sessionTitle]);

  // 6자리 코드가 입력되면 세션을 미리 로드
  const shouldPreloadSession = joinCodeInput.length === 6 && viewMode === 'home';

  // Realtime session
  const {
    session,
    participants,
    isLoading,
    error,
    connectionStatus,
    createSession,
    joinSession,
  } = useRealtimeSession<AudienceEngageConfig, never>({
    appType: 'audience-engage',
    sessionCode: viewMode !== 'home' ? sessionCode : (shouldPreloadSession ? joinCodeInput : ''),
    enabled: viewMode !== 'home' || shouldPreloadSession,
    transformConfig: (config: Json) => config as unknown as AudienceEngageConfig,
  });

  const config = session?.config as AudienceEngageConfig | null;

  // 세션 생성
  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) {
      alert('세션 제목을 입력해 주세요.');
      return;
    }

    const initialConfig: AudienceEngageConfig = {
      title: sessionTitle.trim(),
      slideItems: [],
      settings: {
        chatEnabled: true,
        reactionsEnabled: true,
        qaEnabled: true,
        anonymousAllowed: true,
      },
    };

    const code = await createSession({
      appType: 'audience-engage',
      title: sessionTitle.trim(),
      config: initialConfig,
    });

    if (code) {
      setSessionCode(code);
      setViewMode('host');
    } else {
      alert('세션을 생성할 수 없어요. 네트워크 연결을 확인하거나 잠시 후 다시 시도해 주세요.');
    }
  };;

  // 세션 참여
  const handleJoinSession = async () => {
    if (!joinCodeInput.trim() || !participantName.trim()) return;

    // 세션이 아직 로드되지 않았으면 직접 로드 시도
    if (!session) {
      // 세션 코드를 설정하고 participant 모드로 전환
      setSessionCode(joinCodeInput);
      setViewMode('participant');
      return;
    }

    const participant = await joinSession({
      displayName: participantName.trim(),
      metadata: {},
    });
    if (participant) {
      setSessionCode(joinCodeInput);
      setMyParticipantId(participant.id);
      setViewMode('participant');
    } else {
      alert('세션에 참여할 수 없어요. 코드를 확인해 주세요.');
    }
  };

  // 홈으로 돌아가기
  const handleGoHome = () => {
    setViewMode('home');
    setSessionCode('');
    setJoinCodeInput('');
    setMyParticipantId(null);
    // URL 파라미터 제거
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/audience-engage');
    }
  };

  // URL 파라미터로 세션 시작 처리
  useEffect(() => {
    if (urlCode && urlMode === 'host') {
      // 호스트 모드로 바로 시작
      setSessionCode(urlCode.toUpperCase());
      setViewMode('host');
    } else if (urlCode && !urlMode) {
      // 참여자 모드로 접속 (코드만 있으면)
      setJoinCodeInput(urlCode.toUpperCase());
    }
  }, [urlCode, urlMode]);

  // 자동 참여: participant 모드인데 세션이 로드되고 아직 참여하지 않았을 때
  useEffect(() => {
    const autoJoin = async () => {
      if (viewMode === 'participant' && session && !myParticipantId && participantName) {
        const participant = await joinSession({
          displayName: participantName.trim(),
          metadata: {},
        });
        if (participant) {
          setMyParticipantId(participant.id);
        }
      }
    };
    autoJoin();
  }, [viewMode, session, myParticipantId, participantName, joinSession]);

  // Host View
  if (viewMode === 'host' && session?.id) {
    return (
      <HostView
        sessionId={session.id}
        sessionCode={sessionCode}
        config={config}
        participants={participants}
        connectionStatus={connectionStatus}
        onGoHome={handleGoHome}
      />
    );
  }

  // Participant View
  if (viewMode === 'participant') {
    // 세션 로딩 중 또는 참여 중
    if (!session || !myParticipantId) {
      return (
        <div className="min-h-screen bg-dajaem-grey flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dajaem-green mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {!session ? '세션 연결 중이에요...' : '참여 중이에요...'}
            </p>
            {error && (
              <div className="mt-4">
                <p className="text-dajaem-red text-sm">{error}</p>
                <Button variant="outline" className="mt-2" onClick={handleGoHome}>
                  돌아가기
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <ParticipantView
        sessionId={session.id}
        sessionCode={sessionCode}
        config={config}
        participantId={myParticipantId}
        participantName={participantName}
        connectionStatus={connectionStatus}
        onGoHome={handleGoHome}
      />
    );
  }

  // Home View
  return (
    <div className="min-h-screen bg-gradient-to-b from-dajaem-grey to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-dajaem-green/10 rounded-full">
              <Presentation className="w-12 h-12 text-dajaem-green" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3">다잼 Audience Engage</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            슬라이드와 함께 실시간으로 청중과 소통해요
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <FeatureCard icon={Presentation} label="슬라이드" description="PDF/Google Slides" />
          <FeatureCard icon={BarChart3} label="투표/퀴즈" description="실시간 인터랙션" />
          <FeatureCard icon={MessageCircle} label="Q&A" description="질문 수집" />
          <FeatureCard icon={Zap} label="리액션" description="이모지 반응" />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="host" className="max-w-lg mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="host" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              발표자 (호스트)
            </TabsTrigger>
            <TabsTrigger value="join" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              참여하기
            </TabsTrigger>
          </TabsList>

          {/* Host Tab */}
          <TabsContent value="host" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>새 세션 만들기</CardTitle>
                <CardDescription>
                  프레젠테이션 세션을 시작하고 청중과 소통하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">세션 제목</Label>
                  <Input
                    id="title"
                    placeholder="예: 2024년 마케팅 전략 발표"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleCreateSession}
                  disabled={!sessionTitle.trim() || isLoading}
                  size="lg"
                  className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                >
                  {isLoading ? '생성 중이에요...' : '세션 시작하기'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Join Tab */}
          <TabsContent value="join" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>세션 참여</CardTitle>
                <CardDescription>
                  6자리 코드로 발표에 참여해요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">세션 코드</Label>
                  <Input
                    id="code"
                    placeholder="ABC123"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-2xl tracking-wider font-mono"
                  />
                  {shouldPreloadSession && isLoading && (
                    <p className="text-xs text-muted-foreground text-center">세션 확인 중이에요...</p>
                  )}
                  {shouldPreloadSession && !isLoading && session && (
                    <p className="text-xs text-dajaem-green text-center flex items-center justify-center gap-1">
                      <span className="text-base">✓</span> {session.title}
                    </p>
                  )}
                  {shouldPreloadSession && !isLoading && !session && error && (
                    <p className="text-xs text-dajaem-red text-center">세션을 찾을 수 없어요. 코드를 확인해 주세요</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    placeholder="표시될 이름을 입력해 주세요"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    maxLength={20}
                  />
                </div>

                <Button
                  onClick={handleJoinSession}
                  disabled={joinCodeInput.length !== 6 || !participantName.trim() || isLoading}
                  size="lg"
                  className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                >
                  {isLoading ? '참여 중이에요...' : '참여하기'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Supported Interactions */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">지원하는 인터랙션</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">실시간 퀴즈</Badge>
            <Badge variant="outline">투표</Badge>
            <Badge variant="outline">This or That</Badge>
            <Badge variant="outline">워드클라우드</Badge>
            <Badge variant="outline">성격테스트</Badge>
            <Badge variant="outline">휴먼빙고</Badge>
          </div>
        </div>

        {error && (
          <div className="mt-6 text-center text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({
  icon: Icon,
  label,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-white rounded-lg border text-center hover:border-dajaem-green/30 transition-colors">
      <div className="flex justify-center mb-2">
        <Icon className="w-6 h-6 text-dajaem-green" />
      </div>
      <div className="font-medium text-sm">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
}
