'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vote, Users, TrendingUp, Monitor, Smartphone, Loader2 } from 'lucide-react';
import { AppHeader, AppFooter } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionCodeInput } from '@/components/entry';

export function HomePage() {
  const router = useRouter();
  const [pollCode, setPollCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinPoll = async () => {
    if (pollCode.length !== 6) return;

    setIsJoining(true);
    try {
      // Navigate to the vote page with the poll code
      router.push(`/live-voting/vote/${pollCode}`);
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

      <div className="flex-1 container mx-auto px-6 py-12">
        {/* Main Entry Tabs */}
        <Tabs defaultValue="host" className="max-w-lg mx-auto mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="host" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              호스트 (발표자)
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
                <CardTitle>새 투표 만들기</CardTitle>
                <CardDescription>
                  투표를 생성하고 참여자를 초대하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/live-voting/create')}
                  size="lg"
                  className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                >
                  투표 만들기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participant Tab */}
          <TabsContent value="participant" className="mt-6">
            <Card className="border-2 border-dajaem-green/20">
              <CardHeader>
                <CardTitle>투표 참여</CardTitle>
                <CardDescription>
                  6자리 코드로 투표에 참여하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SessionCodeInput
                  value={pollCode}
                  onChange={setPollCode}
                  label="투표 코드"
                  placeholder="ABC123"
                />

                <Button
                  onClick={handleJoinPoll}
                  disabled={pollCode.length !== 6 || isJoining}
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

        {/* 기능 소개 */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Vote size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">다양한 투표 유형</h3>
            <p className="text-gray-600">
              단일 선택, 복수 선택, 순위 투표까지 다양한 형태의 투표를 지원합니다.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">QR 코드 참여</h3>
            <p className="text-gray-600">
              QR 코드 스캔으로 앱 설치 없이 바로 투표에 참여할 수 있습니다.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">실시간 결과</h3>
            <p className="text-gray-600">
              투표 결과가 실시간으로 업데이트되어 즉시 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 사용 시나리오 */}
        <div className="max-w-3xl mx-auto bg-blue-50 border border-blue-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">이런 곳에서 사용해보세요</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span className="text-gray-700">강의/워크샵에서 실시간 학습 이해도 체크</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span className="text-gray-700">회의에서 팀 의사결정 및 우선순위 투표</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span className="text-gray-700">이벤트/행사에서 참여자 만족도 조사</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span className="text-gray-700">아이스브레이커 활동 및 간단한 설문</span>
            </li>
          </ul>
        </div>
      </div>

      <AppFooter variant="compact" />
    </div>
  );
}
