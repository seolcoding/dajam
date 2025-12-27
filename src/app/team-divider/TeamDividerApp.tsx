'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { AppHeader, AppFooter } from '@/components/layout';
import { MultiplayerEntry } from '@/components/entry';
import { TeamDivider } from './components/TeamDivider';
import { ParticipantView } from './components/ParticipantView';
import { useSessionStore } from './store/session-store';
import { useTeamStore } from './store/useTeamStore';

type ViewMode = 'entry' | 'host' | 'participant';

export default function TeamDividerApp() {
  const [view, setView] = useState<ViewMode>('entry');
  const { setMode, generateSessionCode, reset } = useSessionStore();
  const { teams } = useTeamStore();

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

  // Entry Screen
  if (view === 'entry') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader
          title="팀 나누기"
          description="공정하고 빠른 팀 배정 도구"
          icon={Users}
          iconGradient="from-blue-500 to-cyan-500"
          variant="compact"
        />

        <div className="flex-1 container mx-auto px-4 py-8">
          <MultiplayerEntry
            onHostStart={handleHostStart}
            onParticipantJoin={handleParticipantJoin}
            hostTitle="팀 나누기 세션 시작"
            hostDescription="참여자를 입력하고 팀을 자동으로 배정하세요"
            participantTitle="세션 참여"
            participantDescription="호스트가 공유한 6자리 코드로 참여하세요"
            hostButtonText="세션 시작하기"
            participantButtonText="참여하기"
            featureBadges={['공정한 배정', '실시간 결과', '다양한 방식']}
          />

          {/* Feature Cards */}
          <div className="max-w-lg mx-auto mt-12 grid gap-4">
            <FeatureCard
              emoji="🎲"
              title="공정한 랜덤 배정"
              description="암호학적으로 안전한 알고리즘으로 완전한 공정성 보장"
            />
            <FeatureCard
              emoji="👥"
              title="다양한 배정 방식"
              description="팀 수 지정, 인원 수 지정, 밸런스 배정 지원"
            />
            <FeatureCard
              emoji="📱"
              title="실시간 결과 공유"
              description="참여자들이 자신의 팀을 즉시 확인"
            />
          </div>
        </div>

        <AppFooter variant="compact" />
      </div>
    );
  }

  // Participant View
  if (view === 'participant') {
    return <ParticipantView teams={teams} onBack={handleBack} />;
  }

  // Host View (Full TeamDivider)
  return <TeamDivider onBack={handleBack} isSessionMode={true} />;
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
