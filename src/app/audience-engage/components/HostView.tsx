'use client';

import { useState, useCallback, useMemo } from 'react';
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
  Zap,
  Target,
  Cloud,
} from 'lucide-react';
import SceneManager from './SceneManager';
import SlideUploader, { type UploadedSlide } from './SlideUploader';
import SlideViewer from './SlideViewer';
import GoogleSlidesEmbed from './GoogleSlidesEmbed';
import EmbedViewer from './EmbedViewer';
import PresenterNotes from './PresenterNotes';
import SessionAnalytics from './SessionAnalytics';
import TemplateManager from './TemplateManager';
import { HostActiveElement } from './HostActiveElement';
import { QAPanel } from '@/features/interactions/common/QAPanel';
import { ChatPanel } from '@/features/interactions/common/ChatPanel';
import { useQA } from '../hooks/useQA';
import { useChat } from '../hooks/useChat';
import { useSlideSync } from '../hooks/useSlideSync';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import { DEFAULT_POLL_CONFIG, DEFAULT_QUIZ_CONFIG, DEFAULT_WORD_CLOUD_CONFIG, DEFAULT_BALANCE_GAME_CONFIG } from '@/lib/elements/types';
import type { AudienceEngageConfig, ActiveScene, SceneType, SlideSourceType, EmojiType } from '../types';
import type { Json } from '@/types/database';
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
  const [embedTotalSlides, setEmbedTotalSlides] = useState<number | undefined>(undefined);

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

  // V2 Session Elements
  const { 
    elements,
    activeElement, 
    createElement, 
    setActiveElement,
    isLoading: isElementsLoading 
  } = useSessionElements({
    sessionId,
    enabled: true,
  });

  const activeScene = syncedScene;

  // Settings state
  const [settings, setSettings] = useState({
    chatEnabled: config?.settings.chatEnabled ?? true,
    reactionsEnabled: config?.settings.reactionsEnabled ?? true,
    qaEnabled: config?.settings.qaEnabled ?? true,
  });

  // Handlers
  const handleSlidesReady = useCallback((slides: UploadedSlide[]) => {
    setUploadedSlides(slides);
    setShowUploader(false);
    if (slides.length === 1) {
      const url = slides[0].imageUrl;
      if (url.includes('docs.google.com')) {
        setSlideSourceType('google-slides');
        setGoogleSlidesUrl(url);
      } else if (url.includes('canva.com')) {
        setSlideSourceType('canva');
        setGoogleSlidesUrl(url);
      } else {
        setSlideSourceType('images');
      }
    } else {
      setSlideSourceType('images');
    }
  }, []);

  const { questions, toggleHighlight, toggleAnswered, deleteQuestion } = useQA({
    sessionId,
    enabled: settings.qaEnabled,
  });

  const { messages: chatMessages, deleteMessage } = useChat({
    sessionId,
    enabled: settings.chatEnabled,
  });

  const [presenterNotes, setPresenterNotes] = useState<Array<{ slideIndex: number; content: string }>>([]);
  const [reactionCounts] = useState<Record<EmojiType, number>>({
    thumbsUp: 0, heart: 0, laugh: 0, clap: 0, party: 0
  });
  const [sessionStartTime] = useState<string>(new Date().toISOString());
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/audience-engage?code=${sessionCode}`
    : '';

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const slideItems = config?.slideItems || [];
  
  const handlePrevSlide = useCallback(() => {
    if (activeScene.type === 'slides' && (activeScene.slideIndex || 0) > 0) {
      previousSlide();
    } else if (activeScene.itemIndex > 0) {
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
      nextSlide();
    } else if (activeScene.itemIndex < slideItems.length - 1) {
      const newItem = slideItems[activeScene.itemIndex + 1];
      changeScene({
        type: (newItem?.itemType as SceneType) || 'slides',
        itemIndex: activeScene.itemIndex + 1,
        slideIndex: newItem?.slideIndex,
        linkedSessionCode: newItem?.linkedSessionCode,
      });
    }
  }, [activeScene, slideItems, nextSlide, changeScene]);

  const currentConfig: AudienceEngageConfig = {
    title: config?.title || '새 세션',
    description: config?.description,
    presentationId: config?.presentationId,
    slideItems: slideItems,
    settings: { ...settings, anonymousAllowed: config?.settings.anonymousAllowed ?? true },
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
            <TemplateManager currentConfig={currentConfig} onLoadTemplate={() => {}} />
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-dajaem-green" />
              <span className="font-medium">{participants.length}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="border-dajaem-green/30 hover:bg-dajaem-green/10">
              {copied ? <><Check className="w-4 h-4 mr-1 text-dajaem-green" /> 복사됨</> : <><Share2 className="w-4 h-4 mr-1" /> 공유</>}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8 space-y-4">
            
            {/* V2 Interaction Stage - TOP PRIORITY */}
            {activeElement && (
              <div className="flex flex-col min-h-[500px] w-full" data-testid="host-active-element">
                <span className="sr-only" data-testid="active-element-debug">
                  Active: {activeElement.element_type}
                </span>
                <HostActiveElement element={activeElement} onClose={() => setActiveElement(null)} />
              </div>
            )}

            {/* Debug Monitor for Tests */}
            <div className="sr-only" data-testid="elements-status">
              Count: {elements.length}, ActiveID: {activeElement?.id || 'none'}, Loading: {String(isElementsLoading)}, Connected: {String(connectionStatus === 'connected')}
            </div>

            {/* Test Helper Button - Only visible in test mode if needed */}
            {process.env.NODE_ENV === 'development' && elements.length > 0 && !activeElement && (
              <Button 
                data-testid="force-activate-first"
                className="hidden"
                onClick={() => setActiveElement(elements[0].id)}
              >
                Force Activate
              </Button>
            )}

            {/* Slide Stage */}
            {!activeElement && (
              <>
                {showUploader ? (
                  <SlideUploader sessionId={sessionId} onSlidesReady={handleSlidesReady} onCancel={() => setShowUploader(false)} />
                ) : !slideSourceType && uploadedSlides.length === 0 ? (
                  <Card className="overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-dajaem-grey to-white flex flex-col items-center justify-center">
                      <Presentation className="w-16 h-16 text-dajaem-green mb-4" />
                      <h3 className="text-lg font-semibold mb-2">슬라이드를 추가해 주세요</h3>
                      <Button onClick={() => setShowUploader(true)} className="bg-dajaem-green hover:bg-dajaem-green/90 text-white">
                        <Upload className="w-4 h-4 mr-2" /> 슬라이드 업로드
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="overflow-hidden">
                    <div className="aspect-video bg-slate-100">
                      {(slideSourceType === 'google-slides' || slideSourceType === 'canva') && googleSlidesUrl ? (
                        <EmbedViewer embedUrl={googleSlidesUrl} sourceType={slideSourceType} isHost={true} slideIndex={activeScene.slideIndex || 0} totalSlides={embedTotalSlides} onSlideChange={goToSlide} className="h-full" />
                      ) : uploadedSlides.length > 0 ? (
                        <SlideViewer slides={uploadedSlides} isHost={true} slideIndex={activeScene.slideIndex || 0} onSlideChange={goToSlide} className="h-full" />
                      ) : (
                        <SceneManager activeScene={activeScene} slideItems={slideItems} isHost={true} sessionCode={sessionCode} sessionId={sessionId} participants={participants} />
                      )}
                    </div>
                    <div className="p-4 border-t flex items-center justify-between">
                      <Button variant="outline" onClick={handlePrevSlide}><ChevronLeft className="w-4 h-4 mr-1" /> 이전</Button>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">{activeScene.type === 'slides' ? `슬라이드 ${(activeScene.slideIndex || 0) + 1}` : activeScene.type}</div>
                        <Button variant="ghost" size="sm" onClick={() => setShowUploader(true)}><Upload className="w-4 h-4" /></Button>
                      </div>
                      <Button variant="outline" onClick={handleNextSlide}>다음 <ChevronRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Timeline */}
            <Card className="mt-4">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">타임라인</CardTitle>
                  <Button variant="ghost" size="sm"><Plus className="w-4 h-4 mr-1" /> Scene 추가</Button>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <TimelineItem type="slides" index={0} isActive={activeScene.type === 'slides'} onClick={() => changeScene({ type: 'slides', itemIndex: 0, slideIndex: 0 })} />
                  {slideItems.map((item, index) => (
                    <TimelineItem key={item.id} type={item.itemType as SceneType} index={index + 1} isActive={activeScene.itemIndex === index && activeScene.type !== 'slides'} onClick={() => changeScene({ type: item.itemType as SceneType, itemIndex: index, linkedSessionCode: item.linkedSessionCode })} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <PresenterNotes currentSlideIndex={activeScene.slideIndex || 0} notes={presenterNotes} onNotesChange={setPresenterNotes} isEditable={true} className="mt-4" />
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <Card className="border-dajaem-green/50 bg-dajaem-green/5 shadow-glow-green/10">
              <CardHeader className="py-3"><CardTitle className="text-sm font-bold flex items-center gap-2 text-dajaem-green uppercase tracking-wider"><Zap className="w-4 h-4 fill-dajaem-green" /> Quick Action (V2)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {activeElement ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-white rounded-lg border-2 border-dajaem-green/30 animate-pulse-glow">
                      <p className="text-[10px] text-dajaem-green font-bold mb-1 uppercase tracking-tighter">Live Now</p>
                      <p className="text-sm font-semibold truncate text-slate-800">{activeElement.title}</p>
                    </div>
                    <Button variant="destructive" size="sm" className="w-full font-bold shadow-glow-red/20 active:animate-press" onClick={() => setActiveElement(null)} aria-label="인터랙션 종료">인터랙션 종료</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="bg-white hover:border-dajaem-green/50 hover:text-dajaem-green font-semibold transition-all duration-fast" onClick={async () => {
                      const el = await createElement({ session_id: sessionId, element_type: 'poll', title: '즉석 투표', config: DEFAULT_POLL_CONFIG as unknown as Json, is_active: true });
                      if (el) setActiveElement(el.id);
                    }} disabled={isElementsLoading} aria-label="V2 즉석 투표 시작">📊 투표 시작</Button>
                    <Button variant="outline" size="sm" className="bg-white hover:border-dajaem-green/50 hover:text-dajaem-green font-semibold transition-all duration-fast" onClick={async () => {
                      const el = await createElement({ session_id: sessionId, element_type: 'quiz', title: '즉석 퀴즈', config: DEFAULT_QUIZ_CONFIG as unknown as Json, is_active: true });
                      if (el) setActiveElement(el.id);
                    }} disabled={isElementsLoading} aria-label="V2 즉석 퀴즈 시작"><Target className="w-4 h-4 mr-1" /> 퀴즈 시작</Button>
                    <Button variant="outline" size="sm" className="bg-white hover:border-dajaem-green/50 hover:text-dajaem-green font-semibold transition-all duration-fast" onClick={async () => {
                      const el = await createElement({ session_id: sessionId, element_type: 'word_cloud', title: '워드 클라우드', config: DEFAULT_WORD_CLOUD_CONFIG as unknown as Json, is_active: true });
                      if (el) setActiveElement(el.id);
                    }} disabled={isElementsLoading} aria-label="V2 워드클라우드 시작"><Cloud className="w-4 h-4 mr-1" /> 워드 클라우드</Button>
                    <Button variant="outline" size="sm" className="bg-white hover:border-dajaem-green/50 hover:text-dajaem-green font-semibold transition-all duration-fast col-span-2" onClick={async () => {
                      const el = await createElement({ session_id: sessionId, element_type: 'balance_game', title: '밸런스 게임', config: DEFAULT_BALANCE_GAME_CONFIG as unknown as Json, is_active: true });
                      if (el) setActiveElement(el.id);
                    }} disabled={isElementsLoading} aria-label="V2 밸런스게임 시작">⚖️ 밸런스 게임 시작</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Settings className="w-4 h-4" /> 설정</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <SettingToggle label="채팅" icon={MessageSquare} checked={settings.chatEnabled} onCheckedChange={(v) => setSettings(s => ({ ...s, chatEnabled: v }))} />
                <SettingToggle label="Q&A" icon={HelpCircle} checked={settings.qaEnabled} onCheckedChange={(v) => setSettings(s => ({ ...s, qaEnabled: v }))} />
                <SettingToggle label="리액션" icon={Smile} checked={settings.reactionsEnabled} onCheckedChange={(v) => setSettings(s => ({ ...s, reactionsEnabled: v }))} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm font-medium">인터랙션</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="qa">
                  <TabsList className="w-full rounded-none border-b">
                    <TabsTrigger value="qa" className="flex-1">Q&A ({questions.length})</TabsTrigger>
                    <TabsTrigger value="chat" className="flex-1">채팅 ({chatMessages.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="qa" className="mt-0 p-4 h-[300px]">
                    <QAPanel questions={questions} isHost={true} onHighlightQuestion={(id, h) => toggleHighlight(id, h)} onMarkAnswered={(id, a) => toggleAnswered(id, a)} onDeleteQuestion={deleteQuestion} />
                  </TabsContent>
                  <TabsContent value="chat" className="mt-0 p-4 h-[300px]">
                    <ChatPanel messages={chatMessages} isHost={true} onDeleteMessage={deleteMessage} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="w-4 h-4" /> 참여자 ({participants.length})</CardTitle></CardHeader>
              <CardContent>
                {participants.length === 0 ? <div className="text-center text-sm text-muted-foreground py-4">참여자를 기다리는 중이에요...</div> : <div className="space-y-2 max-h-48 overflow-y-auto">{participants.map((p) => (<div key={p.id} className="flex items-center gap-2 text-sm"><div className="w-2 h-2 bg-dajaem-green rounded-full" />{p.display_name}</div>))}</div>}
              </CardContent>
            </Card>

            <SessionAnalytics participants={participants.map(p => ({ id: p.id, display_name: p.display_name, joined_at: p.joined_at }))} questions={questions} chatMessages={chatMessages} reactionCounts={reactionCounts} sessionStartTime={sessionStartTime} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    connected: { label: '연결됨', className: 'bg-dajaem-green/10 text-dajaem-green border-dajaem-green/30' },
    connecting: { label: '연결 중', className: 'bg-dajaem-yellow/10 text-dajaem-yellow/90 border-dajaem-yellow/30' },
    disconnected: { label: '연결 끊김', className: 'bg-dajaem-red/10 text-dajaem-red border-dajaem-red/30' },
  };
  const config = statusConfig[status] || statusConfig.disconnected;
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
}

function TimelineItem({ type, index, isActive, onClick }: { type: SceneType; index: number; isActive: boolean; onClick: () => void }) {
  const icons: Record<SceneType, string> = { slides: '📊', quiz: '🎯', vote: '📊', 'this-or-that': '⚖️', 'word-cloud': '☁️', personality: '🧠', bingo: '🎱', ladder: '🪜', 'balance-game': '⚖️' };
  return (<button onClick={onClick} className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${isActive ? 'border-dajaem-green bg-dajaem-green/10' : 'border-gray-200 hover:border-dajaem-green/30 bg-white'}`}><span className="text-lg">{icons[type]}</span><span className="text-xs text-muted-foreground">{index + 1}</span></button>);
}

function SettingToggle({ label, icon: Icon, checked, onCheckedChange }: { label: string; icon: React.ComponentType<{ className?: string }>; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (<div className="flex items-center justify-between"><Label className="flex items-center gap-2 text-sm"><Icon className="w-4 h-4 text-muted-foreground" />{label}</Label><Switch checked={checked} onCheckedChange={onCheckedChange} /></div>);
}