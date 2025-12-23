'use client';

import { useState } from 'react';
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
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [sessionCode, setSessionCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);

  // Session title for creation
  const [sessionTitle, setSessionTitle] = useState('');

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
    sessionCode: viewMode === 'home' ? '' : sessionCode,
    enabled: viewMode !== 'home' && !!sessionCode,
    transformConfig: (config: Json) => config as unknown as AudienceEngageConfig,
  });

  const config = session?.config as AudienceEngageConfig | null;

  // 세션 생성
  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) {
      alert('세션 제목을 입력하세요.');
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
    }
  };

  // 세션 참여
  const handleJoinSession = async () => {
    if (!sessionCode.trim() || !participantName.trim()) return;

    const participant = await joinSession({
      displayName: participantName.trim(),
      metadata: {},
    });

    if (participant) {
      setMyParticipantId(participant.id);
      setViewMode('participant');
    } else {
      alert('세션 참여에 실패했습니다. 코드를 확인하세요.');
    }
  };

  // 홈으로 돌아가기
  const handleGoHome = () => {
    setViewMode('home');
    setSessionCode('');
    setMyParticipantId(null);
  };

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
  if (viewMode === 'participant' && myParticipantId && session?.id) {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Presentation className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3">Audience Engage</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            슬라이드와 함께 실시간 청중 참여 경험을 만드세요
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
                  프레젠테이션 세션을 시작하고 청중과 상호작용하세요
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
                  className="w-full"
                >
                  {isLoading ? '생성 중...' : '세션 시작하기'}
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
                  6자리 코드로 발표에 참여하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">세션 코드</Label>
                  <Input
                    id="code"
                    placeholder="ABC123"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-2xl tracking-wider font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    placeholder="표시될 이름을 입력하세요"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    maxLength={20}
                  />
                </div>

                <Button
                  onClick={handleJoinSession}
                  disabled={!sessionCode.trim() || !participantName.trim() || isLoading}
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? '참여 중...' : '참여하기'}
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
    <div className="p-4 bg-white rounded-lg border text-center">
      <div className="flex justify-center mb-2">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="font-medium text-sm">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
}
