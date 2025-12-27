'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Grid3X3 } from 'lucide-react';
import type { ViewMode } from '../types';
import { HostView } from './HostView';
import { ParticipantView } from './ParticipantView';
import { AppHeader, AppFooter } from '@/components/layout';
import { MultiplayerEntry } from '@/components/entry';

export function HumanBingoApp() {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [participantName, setParticipantName] = useState('');

  const handleHostStart = () => {
    setViewMode('host-setup');
  };

  const handleParticipantJoin = () => {
    if (sessionCode.length !== 6 || !participantName.trim()) return;
    setViewMode('participant-join');
  };

  const handleBackToMenu = () => {
    setViewMode('menu');
    setSessionCode('');
    setParticipantName('');
  };

  // 메뉴 화면
  if (viewMode === 'menu') {
    const handleHostStartClick = () => {
      handleHostStart();
    };

    const handleParticipantJoinClick = ({ code, name }: { code: string; name: string }) => {
      if (code.length !== 6 || !name.trim()) return;
      setSessionCode(code);
      setParticipantName(name);
      setViewMode('participant-join');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex flex-col">
        <AppHeader
          title="휴먼 빙고"
          description="사람들과 대화하며 특성을 찾아 빙고를 완성하세요!"
          icon={Grid3X3}
          iconGradient="from-purple-500 to-pink-500"
          variant="compact"
        />

        <div className="flex-1 container mx-auto px-4 py-8">
          <MultiplayerEntry
            onHostStart={handleHostStartClick}
            onParticipantJoin={handleParticipantJoinClick}
            hostTitle="새 게임 만들기"
            hostDescription="Human Bingo 세션을 만들고 참가자들을 초대하세요"
            participantTitle="게임 참여"
            participantDescription="6자리 코드로 게임에 참여해요"
            hostButtonText="세션 생성하기"
            participantButtonText="참여하기"
            featureBadges={['아이스브레이킹', '네트워킹', '실시간 진행']}
          />

          {/* Game Description */}
          <Card className="max-w-lg mx-auto mt-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-3">게임 방법</h3>
              <ol className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li className="flex items-start">
                  <span className="font-bold text-purple-600 mr-2">1.</span>
                  호스트가 세션을 만들고 참가자들에게 6자리 코드를 공유합니다
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-purple-600 mr-2">2.</span>
                  참가자들은 코드로 참여하고 각자 다른 빙고판을 받습니다
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-purple-600 mr-2">3.</span>
                  돌아다니며 특성을 가진 사람을 찾아 대화하고 이름을 입력합니다
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-purple-600 mr-2">4.</span>
                  가로, 세로, 대각선으로 한 줄을 완성하면 빙고!
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <AppFooter variant="compact" />
      </div>
    );
  }

  // 호스트 뷰
  if (viewMode === 'host-setup' || viewMode === 'host') {
    return (
      <HostView
        mode={viewMode}
        onBack={handleBackToMenu}
        onModeChange={setViewMode}
        sessionCode={sessionCode}
        onSessionCodeChange={setSessionCode}
      />
    );
  }

  // 참가자 뷰
  if (viewMode === 'participant-join' || viewMode === 'participant') {
    return (
      <ParticipantView
        mode={viewMode}
        onBack={handleBackToMenu}
        onModeChange={setViewMode}
        sessionCode={sessionCode}
        onSessionCodeChange={setSessionCode}
        initialName={participantName}
      />
    );
  }

  return null;
}
