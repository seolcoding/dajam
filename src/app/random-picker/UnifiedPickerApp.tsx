'use client';

/**
 * UnifiedPickerApp - 통합 랜덤 선택 앱
 *
 * 3가지 모드를 탭으로 전환:
 * 1. 휠 모드: 범용 랜덤 뽑기 (기존 random-picker)
 * 2. 점심 모드: 위치 기반 맛집 추천 (lunch-roulette 통합)
 * 3. 사다리 모드: 1:1 매칭 시각화 (ladder-game 통합)
 */

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Disc, UtensilsCrossed, GitBranch, ArrowLeft, Loader2 } from 'lucide-react';
import { AppHeader, AppFooter } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MultiplayerEntry } from '@/components/entry';

// Mode Components - Dynamic import to avoid SSR issues
const WheelMode = dynamic(() => import('./modes/WheelMode').then(mod => ({ default: mod.WheelMode })), {
  ssr: false,
  loading: () => <ModeLoadingFallback />,
});

const LunchMode = dynamic(() => import('./modes/LunchMode').then(mod => ({ default: mod.LunchMode })), {
  ssr: false,
  loading: () => <ModeLoadingFallback />,
});

const LadderMode = dynamic(() => import('./modes/LadderMode').then(mod => ({ default: mod.LadderMode })), {
  ssr: false,
  loading: () => <ModeLoadingFallback />,
});

// Store
import { useSessionStore } from './store/session-store';

function ModeLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );
}

export type PickerMode = 'wheel' | 'lunch' | 'ladder';

interface ModeConfig {
  id: PickerMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  gradient: string;
}

const MODE_CONFIGS: ModeConfig[] = [
  {
    id: 'wheel',
    label: '룰렛',
    icon: <Disc className="w-4 h-4" />,
    description: '범용 랜덤 뽑기',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'lunch',
    label: '점심',
    icon: <UtensilsCrossed className="w-4 h-4" />,
    description: '위치 기반 맛집 추천',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'ladder',
    label: '사다리',
    icon: <GitBranch className="w-4 h-4" />,
    description: '1:1 매칭 게임',
    gradient: 'from-blue-500 to-cyan-500',
  },
];

type ViewMode = 'entry' | 'host' | 'participant';

export default function UnifiedPickerApp() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewMode>('entry');
  const [activeMode, setActiveMode] = useState<PickerMode>('wheel');
  const { mode, sessionCode, setMode, generateSessionCode, reset } = useSessionStore();

  // URL 파라미터로 모드 설정 (예: ?mode=lunch)
  useEffect(() => {
    const modeParam = searchParams.get('mode') as PickerMode | null;
    if (modeParam && ['wheel', 'lunch', 'ladder'].includes(modeParam)) {
      setActiveMode(modeParam);
    }

    // 참여 코드가 있으면 참여자 모드로 시작
    const joinCode = searchParams.get('join');
    if (joinCode) {
      // TODO: Phase 2 - Validate code against Supabase
      setMode('participant', joinCode);
      setView('participant');
    }
  }, [searchParams, setMode]);

  const handleHostStart = () => {
    const code = generateSessionCode();
    setMode('host', code);
    setView('host');
  };

  const handleParticipantJoin = ({ code, name }: { code: string; name: string }) => {
    // TODO: Phase 2 - Validate code against Supabase
    setMode('participant', code, name);
    setView('participant');
  };

  const handleBack = () => {
    reset();
    setView('entry');
  };

  const activeModeConfig = MODE_CONFIGS.find(m => m.id === activeMode)!;

  // Entry Screen
  if (view === 'entry') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader
          title="랜덤 뽑기"
          description="공정하고 재미있는 랜덤 선택 도구"
          icon={Disc}
          iconGradient="from-purple-500 to-pink-500"
          variant="compact"
        />

        <div className="flex-1 container mx-auto px-4 py-8">
          {/* Mode Selector Tabs */}
          <div className="max-w-lg mx-auto mb-8">
            <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as PickerMode)}>
              <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                {MODE_CONFIGS.map((config) => (
                  <TabsTrigger
                    key={config.id}
                    value={config.id}
                    className="flex flex-col gap-1 py-3 data-[state=active]:bg-white"
                  >
                    <div className="flex items-center gap-2">
                      {config.icon}
                      <span className="font-semibold">{config.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {config.description}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Multiplayer Entry */}
          <MultiplayerEntry
            onHostStart={handleHostStart}
            onParticipantJoin={handleParticipantJoin}
            hostTitle={`${activeModeConfig.label} 세션 시작`}
            hostDescription={activeModeConfig.description}
            participantTitle="세션 참여"
            participantDescription="호스트가 공유한 6자리 코드로 참여하세요"
            hostButtonText="세션 시작하기"
            participantButtonText="참여하기"
            featureBadges={
              activeMode === 'wheel'
                ? ['공정한 랜덤', '실시간 시청', '경품 추첨']
                : activeMode === 'lunch'
                ? ['위치 기반', '맛집 추천', 'Kakao Maps']
                : ['1:1 매칭', '사다리 타기', '공정한 선택']
            }
          />

          {/* Mode-specific Feature Cards */}
          <div className="max-w-lg mx-auto mt-12 grid gap-4">
            {activeMode === 'wheel' && (
              <>
                <FeatureCard
                  emoji="🎰"
                  title="공정한 랜덤"
                  description="암호학적으로 안전한 알고리즘으로 완전한 공정성 보장"
                />
                <FeatureCard
                  emoji="👥"
                  title="함께 시청"
                  description="참여자들이 실시간으로 추첨 결과를 함께 확인"
                />
                <FeatureCard
                  emoji="🎁"
                  title="경품 추첨"
                  description="이벤트, 회식, 수업에서 간편하게 추첨 진행"
                />
              </>
            )}
            {activeMode === 'lunch' && (
              <>
                <FeatureCard
                  emoji="📍"
                  title="위치 기반"
                  description="현재 위치 주변의 맛집을 자동으로 검색"
                />
                <FeatureCard
                  emoji="🍜"
                  title="카테고리 선택"
                  description="먼저 음식 종류를 룰렛으로 결정하고, 맛집을 추천"
                />
                <FeatureCard
                  emoji="🗺️"
                  title="Kakao Maps 연동"
                  description="선택된 맛집으로 바로 길찾기 가능"
                />
              </>
            )}
            {activeMode === 'ladder' && (
              <>
                <FeatureCard
                  emoji="🪜"
                  title="사다리 타기"
                  description="클래식한 사다리 게임으로 1:1 매칭"
                />
                <FeatureCard
                  emoji="🎯"
                  title="공정한 매칭"
                  description="무작위 브릿지 생성으로 예측 불가능한 결과"
                />
                <FeatureCard
                  emoji="✨"
                  title="애니메이션"
                  description="사다리 타는 과정을 시각적으로 확인"
                />
              </>
            )}
          </div>
        </div>

        <AppFooter variant="compact" />
      </div>
    );
  }

  // Host/Participant View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        title={`랜덤 뽑기 - ${activeModeConfig.label}`}
        description={sessionCode ? `세션: ${sessionCode}` : activeModeConfig.description}
        icon={Disc}
        iconGradient={activeModeConfig.gradient}
        actions={
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            나가기
          </Button>
        }
      />

      <main className="flex-1">
        {activeMode === 'wheel' && (
          <WheelMode
            isSessionMode={true}
            onBack={handleBack}
            isHost={view === 'host'}
          />
        )}
        {activeMode === 'lunch' && (
          <LunchMode onBack={handleBack} />
        )}
        {activeMode === 'ladder' && (
          <LadderMode
            isSessionMode={true}
            onBack={handleBack}
            isHost={view === 'host'}
          />
        )}
      </main>

      <AppFooter />
    </div>
  );
}

// Simple Feature Card Component
function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <span className="text-2xl">{emoji}</span>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
