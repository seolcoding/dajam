'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useBingoStore } from '../stores/useBingoStore';
import { AppHeader, AppFooter } from '@/components/layout';
import { MultiplayerEntry } from '@/components/entry';

export function MenuScreen() {
  const { setGameMode, joinGame } = useBingoStore();
  const [isJoining, setIsJoining] = useState(false);

  const handleHostStart = () => {
    setGameMode('setup');
  };

  const handleParticipantJoin = async ({ code }: { code: string; name: string }) => {
    if (code.length !== 6) return;

    setIsJoining(true);
    try {
      joinGame(code);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <AppHeader
        title="빙고 게임"
        description="친구들과 함께 즐기는 빙고!"
        emoji="🎰"
        iconGradient="from-blue-500 to-indigo-600"
        variant="compact"
      />

      <div className="flex-1 container mx-auto px-4 py-8">
        <MultiplayerEntry
          onHostStart={handleHostStart}
          onParticipantJoin={handleParticipantJoin}
          hostTitle="새 게임 만들기"
          hostDescription="빙고 게임을 생성하고 호출하세요"
          participantTitle="게임 참여"
          participantDescription="호스트가 공유한 6자리 코드로 참여하세요"
          hostButtonText="게임 만들기"
          participantButtonText={isJoining ? "참여 중..." : "참여하기"}
          featureBadges={['숫자 빙고', '테마 빙고', '실시간 동기화']}
          requireName={false}
        />

        {/* Feature Cards */}
        <div className="max-w-lg mx-auto mt-12 grid gap-4">
          <FeatureCard
            emoji="🔢"
            title="다양한 빙고 타입"
            description="숫자, 단어, 테마 빙고 지원"
          />
          <FeatureCard
            emoji="📐"
            title="크기 선택"
            description="3x3, 4x4, 5x5 크기 선택 가능"
          />
          <FeatureCard
            emoji="⚡"
            title="실시간 동기화"
            description="호스트 호출이 모든 참여자에게 즉시 반영"
          />
        </div>
      </div>

      <AppFooter variant="compact" />
    </div>
  );
}

// Simple Feature Card Component
function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <span className="text-2xl">{emoji}</span>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
