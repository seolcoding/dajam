'use client';

import { useState } from 'react';
import { Monitor, Smartphone, Loader2 } from 'lucide-react';
import { useBingoStore } from '../stores/useBingoStore';
import { AppHeader, AppFooter } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionCodeInput } from '@/components/entry';

export function MenuScreen() {
  const { setGameMode, joinGame } = useBingoStore();
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinGame = async () => {
    if (gameCode.length !== 6) return;

    setIsJoining(true);
    try {
      joinGame(gameCode);
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
      />

      <div className="flex-1 container mx-auto px-6 py-12">
        {/* Main Entry Tabs */}
        <Tabs defaultValue="host" className="max-w-lg mx-auto mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="host" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              호스트 모드
            </TabsTrigger>
            <TabsTrigger value="participant" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              참여하기
            </TabsTrigger>
          </TabsList>

          {/* Host Tab */}
          <TabsContent value="host" className="mt-6">
            <Card className="border-2 border-dajaem-green/20">
              <CardHeader>
                <CardTitle>새 게임 만들기</CardTitle>
                <CardDescription>
                  빙고 게임을 생성하고 호출하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setGameMode('setup')}
                  size="lg"
                  className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                >
                  게임 만들기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participant Tab */}
          <TabsContent value="participant" className="mt-6">
            <Card className="border-2 border-dajaem-green/20">
              <CardHeader>
                <CardTitle>게임 참여</CardTitle>
                <CardDescription>
                  6자리 코드로 게임에 참여하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SessionCodeInput
                  value={gameCode}
                  onChange={setGameCode}
                  label="게임 코드"
                  placeholder="ABC123"
                />

                <Button
                  onClick={handleJoinGame}
                  disabled={gameCode.length !== 6 || isJoining}
                  size="lg"
                  className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      참여 중...
                    </>
                  ) : (
                    '참여하기'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature description */}
        <div className="max-w-lg mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>숫자, 단어, 테마 빙고 지원 | 3x3, 4x4, 5x5 크기 선택</p>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
