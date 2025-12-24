'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Users,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  MessageSquare,
  HelpCircle,
  Smile,
  Upload,
  Presentation,
} from 'lucide-react';
import SceneManager from './SceneManager';
import SlideUploader, { type UploadedSlide } from './SlideUploader';
import SlideViewer from './SlideViewer';
import GoogleSlidesEmbed from './GoogleSlidesEmbed';
import PresenterNotes from './PresenterNotes';
import SessionAnalytics from './SessionAnalytics';
import TemplateManager from './TemplateManager';
import { QAPanel } from '@/features/interactions/common/QAPanel';
import { ChatPanel } from '@/features/interactions/common/ChatPanel';
import { useQA } from '../hooks/useQA';
import { useChat } from '../hooks/useChat';
import { useSlideSync } from '../hooks/useSlideSync';
import type { AudienceEngageConfig, ActiveScene, SceneType, SlideSourceType, EmojiType } from '../types';
import type { ConnectionState } from '@/features/interactions';
import type { SessionParticipant } from '@/types/database';

interface HostViewProps {
  sessionId: string;
  sessionCode: string;
  config: AudienceEngageConfig | null;
  participants: SessionParticipant[];
  connectionStatus: ConnectionState;
  onGoHome: () => void;
}

export default function HostView({
  sessionId,
  sessionCode,
  config,
  participants,
  connectionStatus,
  onGoHome,
}: HostViewProps) {
  // Slide upload state
  const [showUploader, setShowUploader] = useState(false);
  const [uploadedSlides, setUploadedSlides] = useState<UploadedSlide[]>([]);
  const [slideSourceType, setSlideSourceType] = useState<SlideSourceType | null>(null);
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState<string | null>(null);

  // Slide sync hook
  const {
    currentScene: syncedScene,
    isPresenting,
    changeScene,
    goToSlide,
    nextSlide,
    previousSlide,
    togglePresenting,
  } = useSlideSync({
    sessionId,
    isHost: true,
    enabled: true,
  });

  // Active scene은 useSlideSync에서 동기화된 상태 사용
  // syncedScene을 activeScene으로 사용
  const activeScene = syncedScene;

  // Settings state (local, will sync later)
  const [settings, setSettings] = useState({
    chatEnabled: config?.settings.chatEnabled ?? true,
    reactionsEnabled: config?.settings.reactionsEnabled ?? true,
    qaEnabled: config?.settings.qaEnabled ?? true,
  });

  // Handle slide upload complete
  const handleSlidesReady = useCallback((slides: UploadedSlide[]) => {
    setUploadedSlides(slides);
    setShowUploader(false);

    // Check if it's a Google Slides embed URL
    if (slides.length === 1 && slides[0].imageUrl.includes('docs.google.com')) {
      setSlideSourceType('google-slides');
      setGoogleSlidesUrl(slides[0].imageUrl);
    } else {
      setSlideSourceType('images');
    }
  }, []);

  // Q&A hook
  const {
    questions,
    toggleHighlight,
    toggleAnswered,
    deleteQuestion,
  } = useQA({
    sessionId,
    enabled: settings.qaEnabled,
  });

  // Chat hook
  const {
    messages: chatMessages,
    deleteMessage,
  } = useChat({
    sessionId,
    enabled: settings.chatEnabled,
  });

  // Presenter notes state
  const [presenterNotes, setPresenterNotes] = useState<Array<{ slideIndex: number; content: string }>>([]);

  // Reaction counts for analytics (would be updated via realtime in production)
  const [reactionCounts] = useState<Record<EmojiType, number>>({
    thumbsUp: 0,
    heart: 0,
    laugh: 0,
    clap: 0,
    party: 0,
  });

  // Session start time for analytics
  const [sessionStartTime] = useState<string>(new Date().toISOString());

  // Copy link state
  const [copied, setCopied] = useState(false);

  // Share URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/audience-engage?code=${sessionCode}`
    : '';

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  // Navigation
  const slideItems = config?.slideItems || [];
  const totalSlides = uploadedSlides.length || slideItems.length || 1;

  const handlePrevSlide = useCallback(() => {
    if (activeScene.type === 'slides' && (activeScene.slideIndex || 0) > 0) {
      // 슬라이드 내에서 이전으로 이동
      previousSlide();
    } else if (activeScene.itemIndex > 0) {
      // 이전 Scene 아이템으로 이동
      const newItem = slideItems[activeScene.itemIndex - 1];
      changeScene({
        type: (newItem?.itemType as SceneType) || 'slides',
        itemIndex: activeScene.itemIndex - 1,
        slideIndex: newItem?.slideIndex,
        linkedSessionCode: newItem?.linkedSessionCode,
      });
    }
  }, [activeScene, slideItems, previousSlide, changeScene]);

  const handleNextSlide = useCallback(() => {
    if (activeScene.type === 'slides') {
      // 슬라이드 내에서 다음으로 이동
      nextSlide();
    } else if (activeScene.itemIndex < slideItems.length - 1) {
      // 다음 Scene 아이템으로 이동
      const newItem = slideItems[activeScene.itemIndex + 1];
      changeScene({
        type: (newItem?.itemType as SceneType) || 'slides',
        itemIndex: activeScene.itemIndex + 1,
        slideIndex: newItem?.slideIndex,
        linkedSessionCode: newItem?.linkedSessionCode,
      });
    }
  }, [activeScene, slideItems, nextSlide, changeScene]);

  // Add scene
  const handleAddScene = (type: SceneType) => {
    // TODO: Add new scene to slideItems
    console.log('Add scene:', type);
  };

  // Load template handler
  const handleLoadTemplate = useCallback((templateConfig: AudienceEngageConfig) => {
    // Update settings from template
    setSettings({
      chatEnabled: templateConfig.settings.chatEnabled,
      reactionsEnabled: templateConfig.settings.reactionsEnabled,
      qaEnabled: templateConfig.settings.qaEnabled,
    });
    // TODO: Apply other template config like slideItems, etc.
  }, []);

  // Get current config for template saving
  const currentConfig: AudienceEngageConfig = {
    title: config?.title || '새 세션',
    description: config?.description,
    presentationId: config?.presentationId,
    slideItems: config?.slideItems || [],
    settings: {
      ...settings,
      anonymousAllowed: config?.settings.anonymousAllowed ?? true,
    },
  };

  return (
    <div className="min-h-screen bg-dajaem-grey">
      {/* Header */}
      <header className="bg-white border-b border-dajaem-green/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onGoHome}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{config?.title || '새 세션'}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="font-mono border-dajaem-green/30">{sessionCode}</Badge>
                <ConnectionStatusBadge status={connectionStatus} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <TemplateManager
              currentConfig={currentConfig}
              onLoadTemplate={handleLoadTemplate}
            />
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-dajaem-green" />
              <span className="font-medium">{participants.length}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="border-dajaem-green/30 hover:bg-dajaem-green/10"
            >
              {copied ? (
                <><Check className="w-4 h-4 mr-1 text-dajaem-green" /> 복사됨</>
              ) : (
                <><Share2 className="w-4 h-4 mr-1" /> 공유</>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Main Content - Scene View */}
          <div className="col-span-12 lg:col-span-8">
            {/* Show uploader when no slides yet or when explicitly opened */}
            {showUploader ? (
              <SlideUploader
                sessionId={sessionId}
                onSlidesReady={handleSlidesReady}
                onCancel={() => setShowUploader(false)}
              />
            ) : !slideSourceType && uploadedSlides.length === 0 ? (
              /* Empty state - prompt to upload slides */
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-dajaem-grey to-white flex flex-col items-center justify-center">
                  <Presentation className="w-16 h-16 text-dajaem-green mb-4" />
                  <h3 className="text-lg font-semibold mb-2">슬라이드를 추가해 주세요</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
                    Google Slides URL을 입력하거나 PDF/이미지를 업로드하면 바로 시작할 수 있어요
                  </p>
                  <Button
                    onClick={() => setShowUploader(true)}
                    className="bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    슬라이드 업로드
                  </Button>
                </div>
              </Card>
            ) : (
              /* Show slides */
              <Card className="overflow-hidden">
                <div className="aspect-video bg-slate-100">
                  {slideSourceType === 'google-slides' && googleSlidesUrl ? (
                    <GoogleSlidesEmbed
                      embedUrl={googleSlidesUrl}
                      isHost={true}
                      slideIndex={activeScene.slideIndex || 0}
                      onSlideChange={goToSlide}
                      className="h-full"
                    />
                  ) : uploadedSlides.length > 0 ? (
                    <SlideViewer
                      slides={uploadedSlides}
                      isHost={true}
                      slideIndex={activeScene.slideIndex || 0}
                      onSlideChange={goToSlide}
                      className="h-full"
                    />
                  ) : (
                    <SceneManager
                      activeScene={activeScene}
                      slideItems={slideItems}
                      isHost={true}
                      sessionCode={sessionCode}
                      sessionId={sessionId}
                      participants={participants}
                    />
                  )}
                </div>

                {/* Navigation Controls */}
                <div className="p-4 border-t flex items-center justify-between">
                  <Button variant="outline" onClick={handlePrevSlide}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    이전
                  </Button>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {activeScene.type === 'slides'
                        ? `슬라이드 ${(activeScene.slideIndex || 0) + 1}${uploadedSlides.length > 0 ? ` / ${uploadedSlides.length}` : ''}`
                        : activeScene.type}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUploader(true)}
                      title="슬라이드 변경"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button variant="outline" onClick={handleNextSlide}>
                    다음
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Timeline - Slide Items */}
            <Card className="mt-4">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">타임라인</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Scene 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {/* Default slides item */}
                  <TimelineItem
                    type="slides"
                    index={0}
                    isActive={activeScene.type === 'slides'}
                    onClick={() => changeScene({ type: 'slides', itemIndex: 0, slideIndex: 0 })}
                  />
                  {/* Additional items from config */}
                  {slideItems.map((item, index) => (
                    <TimelineItem
                      key={item.id}
                      type={item.itemType as SceneType}
                      index={index + 1}
                      isActive={activeScene.itemIndex === index && activeScene.type !== 'slides'}
                      onClick={() => changeScene({
                        type: item.itemType as SceneType,
                        itemIndex: index,
                        linkedSessionCode: item.linkedSessionCode,
                      })}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Presenter Notes */}
            <PresenterNotes
              currentSlideIndex={activeScene.slideIndex || 0}
              notes={presenterNotes}
              onNotesChange={setPresenterNotes}
              isEditable={true}
              className="mt-4"
            />
          </div>

          {/* Sidebar - Controls & Interactions */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Settings */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingToggle
                  label="채팅"
                  icon={MessageSquare}
                  checked={settings.chatEnabled}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, chatEnabled: v }))}
                />
                <SettingToggle
                  label="Q&A"
                  icon={HelpCircle}
                  checked={settings.qaEnabled}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, qaEnabled: v }))}
                />
                <SettingToggle
                  label="리액션"
                  icon={Smile}
                  checked={settings.reactionsEnabled}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, reactionsEnabled: v }))}
                />
              </CardContent>
            </Card>

            {/* Interactions Panel */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">인터랙션</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="qa">
                  <TabsList className="w-full rounded-none border-b">
                    <TabsTrigger value="qa" className="flex-1">Q&A ({questions.length})</TabsTrigger>
                    <TabsTrigger value="chat" className="flex-1">채팅 ({chatMessages.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="qa" className="mt-0 p-4 h-[300px]">
                    <QAPanel
                      questions={questions}
                      isHost={true}
                      onHighlightQuestion={(id, h) => toggleHighlight(id, h)}
                      onMarkAnswered={(id, a) => toggleAnswered(id, a)}
                      onDeleteQuestion={deleteQuestion}
                    />
                  </TabsContent>
                  <TabsContent value="chat" className="mt-0 p-4 h-[300px]">
                    <ChatPanel
                      messages={chatMessages}
                      isHost={true}
                      onDeleteMessage={deleteMessage}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  참여자 ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    참여자를 기다리는 중이에요...
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-dajaem-green rounded-full" />
                        {p.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Analytics */}
            <SessionAnalytics
              participants={participants.map(p => ({
                id: p.id,
                display_name: p.display_name,
                joined_at: p.joined_at,
              }))}
              questions={questions}
              chatMessages={chatMessages}
              reactionCounts={reactionCounts}
              sessionStartTime={sessionStartTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function ConnectionStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    connected: { label: '연결됨', className: 'bg-dajaem-green/10 text-dajaem-green border-dajaem-green/30' },
    connecting: { label: '연결 중', className: 'bg-dajaem-yellow/10 text-dajaem-yellow/90 border-dajaem-yellow/30' },
    disconnected: { label: '연결 끊김', className: 'bg-dajaem-red/10 text-dajaem-red border-dajaem-red/30' },
  };
  const config = statusConfig[status] || statusConfig.disconnected;
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
}

function TimelineItem({
  type,
  index,
  isActive,
  onClick,
}: {
  type: SceneType;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const icons: Record<SceneType, string> = {
    slides: '📊',
    quiz: '🎯',
    vote: '📊',
    'this-or-that': '⚖️',
    'word-cloud': '☁️',
    personality: '🧠',
    bingo: '🎱',
    ladder: '🪜',
    'balance-game': '⚖️',
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1
        transition-all
        ${isActive
          ? 'border-dajaem-green bg-dajaem-green/10'
          : 'border-gray-200 hover:border-dajaem-green/30 bg-white'
        }
      `}
    >
      <span className="text-lg">{icons[type]}</span>
      <span className="text-xs text-muted-foreground">{index + 1}</span>
    </button>
  );
}

function SettingToggle({
  label,
  icon: Icon,
  checked,
  onCheckedChange,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4 text-muted-foreground" />
        {label}
      </Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
