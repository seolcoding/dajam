'use client';

import { useState } from 'react';
import { Disc } from 'lucide-react';
import { AppHeader, AppFooter } from '@/components/layout';
import { MultiplayerEntry } from '@/components/entry';
import RandomPickerClient from './RandomPickerClient';
import { ParticipantView } from './components/ParticipantView';
import { useSessionStore } from './store/session-store';

type ViewMode = 'entry' | 'host' | 'participant';

export default function RandomPickerApp() {
  const [view, setView] = useState<ViewMode>('entry');
  const { setMode, generateSessionCode, reset } = useSessionStore();

  const handleHostStart = () => {
    const code = generateSessionCode();
    setMode('host', code);
    setView('host');
  };

  const handleParticipantJoin = ({ code, name }: { code: string; name: string }) => {
    // TODO: Phase 2 - Validate code against Supabase
    // For now, just set the mode and view
    setMode('participant', code, name);
    setView('participant');
  };

  const handleBack = () => {
    reset();
    setView('entry');
  };

  // Entry Screen
  if (view === 'entry') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader
          title="랜덤 뽑기 룰렛"
          description="공정하고 재미있는 랜덤 선택 도구"
          icon={Disc}
          iconGradient="from-purple-500 to-pink-500"
          variant="compact"
        />

        <div className="flex-1 container mx-auto px-4 py-8">
          <MultiplayerEntry
            onHostStart={handleHostStart}
            onParticipantJoin={handleParticipantJoin}
            hostTitle="랜덤 뽑기 세션 시작"
            hostDescription="항목을 추가하고 참여자와 함께 추첨을 진행하세요"
            participantTitle="세션 참여"
            participantDescription="호스트가 공유한 6자리 코드로 참여하세요"
            hostButtonText="세션 시작하기"
            participantButtonText="참여하기"
            featureBadges={['공정한 랜덤', '실시간 시청', '경품 추첨']}
          />

          {/* Feature Cards */}
          <div className="max-w-lg mx-auto mt-12 grid gap-4">
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
          </div>
        </div>

        <AppFooter variant="compact" />
      </div>
    );
  }

  // Participant View
  if (view === 'participant') {
    return <ParticipantView onBack={handleBack} />;
  }

  // Host View (Full RandomPickerClient)
  return <RandomPickerClient onBack={handleBack} isSessionMode={true} />;
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
