'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import SceneManager from './SceneManager';
import { QAPanel } from '@/features/interactions/common/QAPanel';
import { ChatPanel } from '@/features/interactions/common/ChatPanel';
import { useQA } from '../hooks/useQA';
import { useChat } from '../hooks/useChat';
import { useReactions } from '../hooks/useReactions';
import { useSlideSync } from '../hooks/useSlideSync';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import { ElementResponseFactory } from '@/components/elements/ResponseFactory';
import type { AudienceEngageConfig, SceneType, EmojiType } from '../types';
import type { ConnectionState } from '@/features/interactions';

interface ParticipantViewProps {
  sessionId: string;
  sessionCode: string;
  config: AudienceEngageConfig | null;
  participantId: string;
  participantName: string;
  connectionStatus: ConnectionState;
  onGoHome: () => void;
}

const EMOJIS: Array<{ type: EmojiType; emoji: string }> = [
  { type: 'thumbsUp', emoji: '👍' },
  { type: 'heart', emoji: '❤️' },
  { type: 'laugh', emoji: '😂' },
  { type: 'clap', emoji: '👏' },
  { type: 'party', emoji: '🎉' },
];

export default function ParticipantView({
  sessionId,
  sessionCode,
  config,
  participantId,
  participantName,
  connectionStatus,
  onGoHome,
}: ParticipantViewProps) {
  // 호스트와 실시간 슬라이드/Scene 동기화
  const { currentScene: activeScene, isPresenting } = useSlideSync({
    sessionId,
    isHost: false,
    enabled: true,
  });

  // V2 Session Elements
  const { activeElement } = useSessionElements({
    sessionId,
    enabled: true,
  });

  const slideItems = config?.slideItems || [];
  const settings = config?.settings || {
    chatEnabled: true,
    reactionsEnabled: true,
    qaEnabled: true,
  };

  // Q&A hook
  const {
    questions,
    submitQuestion,
    toggleLike,
  } = useQA({
    sessionId,
    participantId,
    participantName,
    enabled: settings.qaEnabled,
  });

  // Chat hook
  const {
    messages: chatMessages,
    sendMessage,
  } = useChat({
    sessionId,
    participantId,
    participantName,
    enabled: settings.chatEnabled,
  });

  // Reactions hook
  const { sendReaction } = useReactions({
    sessionId,
    participantId,
    enabled: settings.reactionsEnabled,
  });

  return (
    <div className="min-h-screen bg-dajaem-grey flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-dajaem-green/10 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onGoHome}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-sm">{config?.title || '세션'}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs border-dajaem-green/30">{sessionCode}</Badge>
                <ConnectionStatusDot status={connectionStatus} />
              </div>
            </div>
          </div>
          <Badge className="text-xs bg-dajaem-green/10 text-dajaem-green hover:bg-dajaem-green/20">{participantName}</Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-4">
        {/* Scene View or Active Element */}
        <Card className="mb-4 overflow-hidden">
          {activeElement ? (
            <div className="p-6 bg-white min-h-[300px] flex items-center justify-center">
              <ElementResponseFactory
                element={activeElement}
                participantId={participantId}
                userId={participantId} // user_id fallback to participantId for now
                className="w-full"
              />
            </div>
          ) : (
            <>
              <div className="aspect-video bg-slate-100 relative">
                <SceneManager
                  activeScene={activeScene}
                  slideItems={slideItems}
                  isHost={false}
                  participantId={participantId}
                  participantName={participantName}
                  sessionCode={sessionCode}
                  sessionId={sessionId}
                />
                {/* 프레젠테이션 대기 중 표시 */}
                {!isPresenting && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">호스트를 기다리는 중...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-2 border-t text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                {isPresenting && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                {activeScene.type === 'slides'
                  ? `슬라이드 ${(activeScene.slideIndex || 0) + 1}`
                  : getSceneLabel(activeScene.type)}
              </div>
            </>
          )}
        </Card>

        {/* Reactions Bar */}
        {settings.reactionsEnabled && (
          <Card className="mb-4">
            <CardContent className="py-3">
              <div className="flex justify-center gap-2">
                {EMOJIS.map(({ type, emoji }) => (
                  <button
                    key={type}
                    onClick={() => sendReaction(type)}
                    className="p-3 text-2xl hover:bg-dajaem-yellow/20 rounded-lg transition-all active:scale-95 hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Q&A / Chat Tabs */}
        {(settings.qaEnabled || settings.chatEnabled) && (
          <Card className="flex-1">
            <Tabs defaultValue={settings.qaEnabled ? 'qa' : 'chat'}>
              <CardHeader className="pb-0">
                <TabsList className="w-full">
                  {settings.qaEnabled && (
                    <TabsTrigger value="qa" className="flex-1">Q&A ({questions.length})</TabsTrigger>
                  )}
                  {settings.chatEnabled && (
                    <TabsTrigger value="chat" className="flex-1">채팅 ({chatMessages.length})</TabsTrigger>
                  )}
                </TabsList>
              </CardHeader>

              <CardContent className="p-4 h-[280px]">
                {/* Q&A Tab */}
                {settings.qaEnabled && (
                  <TabsContent value="qa" className="mt-0 h-full">
                    <QAPanel
                      questions={questions}
                      isHost={false}
                      participantId={participantId}
                      participantName={participantName}
                      onSubmitQuestion={submitQuestion}
                      onLikeQuestion={toggleLike}
                    />
                  </TabsContent>
                )}

                {/* Chat Tab */}
                {settings.chatEnabled && (
                  <TabsContent value="chat" className="mt-0 h-full">
                    <ChatPanel
                      messages={chatMessages}
                      isHost={false}
                      participantId={participantId}
                      participantName={participantName}
                      onSendMessage={sendMessage}
                    />
                  </TabsContent>
                )}
              </CardContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper function
function getSceneLabel(type: SceneType): string {
  const labels: Record<SceneType, string> = {
    slides: '슬라이드',
    quiz: '퀴즈',
    vote: '투표',
    'this-or-that': 'This or That',
    'word-cloud': '워드클라우드',
    personality: '성격테스트',
    bingo: '휴먼빙고',
    ladder: '사다리타기',
    'balance-game': '밸런스게임',
  };
  return labels[type] || type;
}

// Sub-components
function ConnectionStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    connected: 'bg-dajaem-green',
    connecting: 'bg-dajaem-yellow',
    disconnected: 'bg-dajaem-red',
  };
  return <div className={`w-2 h-2 rounded-full ${colors[status] || colors.disconnected}`} />;
}

