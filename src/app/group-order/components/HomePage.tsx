'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Users, QrCode, Calculator, Share2, Monitor, Smartphone, Loader2 } from 'lucide-react';
import { AppHeader, AppFooter } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionCodeInput } from '@/components/entry';

export function HomePage() {
  const router = useRouter();
  const [orderCode, setOrderCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinOrder = async () => {
    if (orderCode.length !== 6) return;

    setIsJoining(true);
    try {
      // Navigate to the join page with the order code
      router.push(`/group-order/join/${orderCode}`);
    } catch {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader
        title="단체 주문 통합"
        description="회식, 단체 주문을 간편하게! QR 코드로 주문하고 자동으로 집계하세요."
        icon={ShoppingCart}
        iconGradient="from-green-500 to-emerald-500"
        variant="compact"
      />

      <div className="flex-1 container mx-auto px-6 py-12">
        {/* Main Entry Tabs */}
        <Tabs defaultValue="host" className="max-w-lg mx-auto mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="host" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              호스트 (주최자)
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
                <CardTitle>새 주문방 만들기</CardTitle>
                <CardDescription>
                  주문방을 생성하고 참여자를 초대하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/group-order/create')}
                  size="lg"
                  className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                >
                  주문방 만들기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participant Tab */}
          <TabsContent value="participant" className="mt-6">
            <Card className="border-2 border-dajaem-green/20">
              <CardHeader>
                <CardTitle>주문 참여</CardTitle>
                <CardDescription>
                  6자리 코드로 주문에 참여하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SessionCodeInput
                  value={orderCode}
                  onChange={setOrderCode}
                  label="주문 코드"
                  placeholder="ABC123"
                />

                <Button
                  onClick={handleJoinOrder}
                  disabled={orderCode.length !== 6 || isJoining}
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

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <Users className="w-10 h-10 mb-3 text-green-600" />
              <CardTitle className="text-gray-900">간편한 참여</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                QR 코드 스캔 또는 링크로 간편하게 참여할 수 있어요.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <QrCode className="w-10 h-10 mb-3 text-green-600" />
              <CardTitle className="text-gray-900">실시간 동기화</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                모든 참가자의 주문이 실시간으로 업데이트되어 한눈에 확인 가능해요.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <Calculator className="w-10 h-10 mb-3 text-green-600" />
              <CardTitle className="text-gray-900">자동 집계</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                메뉴별, 참가자별 주문 내역이 자동으로 집계되어 편리해요.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <Share2 className="w-10 h-10 mb-3 text-green-600" />
              <CardTitle className="text-gray-900">주문서 공유</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                주문 완료 후 이미지나 텍스트로 간편하게 공유할 수 있어요.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How to Use Section */}
        <div className="bg-green-50 border border-green-200 rounded-2xl px-8 py-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">사용 방법</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">주문방 생성</h3>
              <p className="text-gray-600 text-sm">
                가게 이름과 메뉴를 입력하여 주문방을 만듭니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">참여자 초대</h3>
              <p className="text-gray-600 text-sm">
                QR 코드 또는 링크를 공유하여 참여자를 초대합니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">주문 완료</h3>
              <p className="text-gray-600 text-sm">
                모든 주문이 완료되면 주문서를 생성하여 공유합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AppFooter variant="compact" />
    </div>
  );
}
