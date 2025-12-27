'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vote, Users, TrendingUp } from 'lucide-react';
import { AppHeader, AppFooter } from '@/components/layout';
import { MultiplayerEntry } from '@/components/entry';

export function HomePage() {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  const handleHostStart = () => {
    router.push('/live-voting/create');
  };

  const handleParticipantJoin = async ({ code }: { code: string; name: string }) => {
    if (code.length !== 6) return;

    setIsJoining(true);
    try {
      router.push(`/live-voting/vote/${code}`);
    } catch {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader
        title="실시간 투표"
        description="QR 코드로 간편하게 투표를 만들고, 실시간으로 결과를 확인하세요"
        icon={Vote}
        iconGradient="from-blue-500 to-indigo-600"
        variant="compact"
      />

      <div className="flex-1 container mx-auto px-4 py-8">
        <MultiplayerEntry
          onHostStart={handleHostStart}
          onParticipantJoin={handleParticipantJoin}
          hostTitle="새 투표 만들기"
          hostDescription="투표를 생성하고 참여자를 초대하세요"
          participantTitle="투표 참여"
          participantDescription="6자리 코드로 투표에 참여하세요"
          hostButtonText="투표 만들기"
          participantButtonText={isJoining ? "참여 중..." : "참여하기"}
          featureBadges={['다양한 투표 유형', 'QR 코드 참여', '실시간 결과']}
          requireName={false}
        />

        {/* Feature Cards */}
        <div className="max-w-lg mx-auto mt-12 grid gap-4">
          <FeatureCard
            icon={Vote}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            title="다양한 투표 유형"
            description="단일 선택, 복수 선택, 순위 투표까지 다양한 형태의 투표를 지원합니다."
          />
          <FeatureCard
            icon={Users}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            title="QR 코드 참여"
            description="QR 코드 스캔으로 앱 설치 없이 바로 투표에 참여할 수 있습니다."
          />
          <FeatureCard
            icon={TrendingUp}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            title="실시간 결과"
            description="투표 결과가 실시간으로 업데이트되어 즉시 확인할 수 있습니다."
          />
        </div>

        {/* Use Cases */}
        <div className="max-w-lg mx-auto mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 text-center text-gray-900">이런 곳에서 사용해보세요</h2>
          <ul className="space-y-2 text-sm">
            <UseCaseItem number={1} text="강의/워크샵에서 실시간 학습 이해도 체크" />
            <UseCaseItem number={2} text="회의에서 팀 의사결정 및 우선순위 투표" />
            <UseCaseItem number={3} text="이벤트/행사에서 참여자 만족도 조사" />
            <UseCaseItem number={4} text="아이스브레이커 활동 및 간단한 설문" />
          </ul>
        </div>
      </div>

      <AppFooter variant="compact" />
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

// Use Case Item Component
function UseCaseItem({ number, text }: { number: number; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
        {number}
      </span>
      <span className="text-gray-700">{text}</span>
    </li>
  );
}
