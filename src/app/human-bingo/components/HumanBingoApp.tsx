'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Grid3X3 } from 'lucide-react';
import type { ViewMode } from '../types';
import { HostView } from './HostView';
import { ParticipantView } from './ParticipantView';
import { AppHeader, AppFooter } from '@/components/layout';
import { SessionCodeInput } from '@/components/entry';

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex flex-col">
        <AppHeader
          title="휴먼 빙고"
          description="사람들과 대화하며 특성을 찾아 빙고를 완성하세요!"
          icon={Grid3X3}
          iconGradient="from-purple-500 to-pink-500"
          variant="compact"
        />

        <div className="flex-1 container mx-auto px-4 py-8 max-w-lg">
          {/* Main Tabs */}
          <Tabs defaultValue="host" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="host" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                호스트 (발표자)
              </TabsTrigger>
              <TabsTrigger value="join" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                참여하기
              </TabsTrigger>
            </TabsList>

            {/* Host Tab */}
            <TabsContent value="host" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>새 게임 만들기</CardTitle>
                  <CardDescription>
                    Human Bingo 세션을 만들고 참가자들을 초대하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                    <ul className="space-y-1">
                      <li>- 빙고판 크기와 특성을 설정할 수 있어요</li>
                      <li>- 6자리 코드로 참가자를 초대해요</li>
                      <li>- 참가자들의 진행 상황을 실시간으로 확인해요</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleHostStart}
                    size="lg"
                    className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                  >
                    세션 생성하기
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Join Tab */}
            <TabsContent value="join" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>게임 참여</CardTitle>
                  <CardDescription>
                    6자리 코드로 게임에 참여해요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SessionCodeInput
                    value={sessionCode}
                    onChange={setSessionCode}
                    label="세션 코드"
                    placeholder="ABC123"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      placeholder="표시될 이름을 입력해 주세요"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      maxLength={20}
                    />
                  </div>

                  <Button
                    onClick={handleParticipantJoin}
                    disabled={sessionCode.length !== 6 || !participantName.trim()}
                    size="lg"
                    className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                  >
                    참여하기
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
