'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';
import type { ViewMode } from '../types';
import { HostView } from './HostView';
import { ParticipantView } from './ParticipantView';

export function HumanBingoApp() {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [sessionCode, setSessionCode] = useState<string>('');

  const handleHostStart = () => {
    setViewMode('host-setup');
  };

  const handleParticipantJoin = () => {
    setViewMode('participant-join');
  };

  const handleBackToMenu = () => {
    setViewMode('menu');
    setSessionCode('');
  };

  // 메뉴 화면
  if (viewMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Human Bingo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              사람들과 대화하며 특성을 찾아 빙고를 완성하세요!
            </p>
          </div>

          {/* Mode Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Host Mode */}
            <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-purple-300">
              <CardContent className="p-8" onClick={handleHostStart}>
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">게임 만들기</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    새로운 Human Bingo 세션을 만들고 참가자들을 초대하세요
                  </p>
                  <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
                    세션 생성하기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Participant Mode */}
            <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-pink-300">
              <CardContent className="p-8" onClick={handleParticipantJoin}>
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mb-6">
                    <UserPlus className="w-10 h-10 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">게임 참여하기</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    6자리 코드를 입력하고 게임에 참여하세요
                  </p>
                  <Button size="lg" className="w-full bg-pink-600 hover:bg-pink-700">
                    참여 코드 입력
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Description */}
          <Card className="mt-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-3">게임 방법</h3>
              <ol className="space-y-2 text-gray-600 dark:text-gray-300">
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
      />
    );
  }

  return null;
}
