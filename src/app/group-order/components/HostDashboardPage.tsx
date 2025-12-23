'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from './QRCode';
import {
  Copy, Check, Users, ArrowRight, Cloud, HardDrive, RefreshCw, Home,
  Share2, ShoppingBag, Clock
} from 'lucide-react';
import { useSupabaseSession } from '../hooks/useSupabaseSession';
import { RealtimeIndicator } from '@/components/common/RealtimeIndicator';
import { CopyableLink } from '@/components/common/CopyableLink';

export function HostDashboardPage({
  sessionId,
}: {
  sessionId: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const { session, isLoading, error, isCloudMode, reload, closeSession } = useSupabaseSession({
    sessionCode: sessionId,
    enabled: true,
  });

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/group-order/join/${sessionId}`
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = async () => {
    if (isCloudMode) {
      await closeSession();
    }
    router.push(`/group-order/summary/${sessionId}`);
  };

  const handleGoHome = () => {
    router.push('/group-order');
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">주문방 로딩 중...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error || '주문방을 찾을 수 없습니다.'}</p>
        <Button className="mt-4" onClick={handleGoHome}>
          <Home className="w-4 h-4 mr-2" />
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  const totalOrders = session.orders?.length || 0;
  const totalAmount = session.orders?.reduce((sum, o) => sum + o.price * o.quantity, 0) || 0;

  // 고유 참여자 수 계산
  const uniqueParticipants = useMemo(() => {
    const names = new Set(session.orders?.map(o => o.name) || []);
    return names.size;
  }, [session.orders]);

  // 공유용 텍스트 생성
  const shareText = useMemo(() => {
    if (!session.orders?.length) return '';

    const menuSummary: Record<string, { quantity: number; price: number; orderers: string[] }> = {};
    session.orders.forEach(order => {
      if (!menuSummary[order.menuName]) {
        menuSummary[order.menuName] = { quantity: 0, price: order.price, orderers: [] };
      }
      menuSummary[order.menuName].quantity += order.quantity;
      menuSummary[order.menuName].orderers.push(`${order.name}(${order.quantity})`);
    });

    return `[${session.restaurantName}] 주문 현황\n\n${Object.entries(menuSummary).map(([menu, data]) =>
      `• ${menu} x${data.quantity} = ${(data.price * data.quantity).toLocaleString()}원\n  └ ${data.orderers.join(', ')}`
    ).join('\n')}\n\n총 금액: ${totalAmount.toLocaleString()}원 (${uniqueParticipants}명)`;
  }, [session, totalAmount, uniqueParticipants]);

  const handleShareText = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // 공유 취소
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{session.restaurantName}</CardTitle>
              <CardDescription>방장: {session.hostName}</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">
                {session.mode === 'fixed' ? '메뉴 선택형' : '자유 입력형'}
              </Badge>
              <Badge variant={isCloudMode ? 'default' : 'secondary'} className={isCloudMode ? 'bg-blue-500' : ''}>
                {isCloudMode ? (
                  <><Cloud className="w-3 h-3 mr-1" /> 클라우드</>
                ) : (
                  <><HardDrive className="w-3 h-3 mr-1" /> 로컬</>
                )}
              </Badge>
              {isCloudMode && <RealtimeIndicator isConnected={true} />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="flex flex-col items-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-muted-foreground mb-3">QR 코드로 참여하기</p>
              <QRCodeSVG value={shareUrl} size={180} />
            </div>

            {/* Share Link */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">초대 링크 (클릭해서 복사)</p>
                <CopyableLink url={shareUrl} className="w-full" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                  <Users className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-700">{uniqueParticipants}</p>
                  <p className="text-xs text-blue-600">참여자</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
                  <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-2xl font-bold text-green-700">{totalOrders}</p>
                  <p className="text-xs text-green-600">주문 수</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center border border-orange-100">
                  <p className="text-2xl font-bold text-orange-700">{totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-orange-600">원</p>
                </div>
              </div>
              {isCloudMode && (
                <Button variant="outline" size="sm" onClick={reload} className="w-full mt-2">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  새로고침
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>주문 현황</CardTitle>
            {totalOrders > 0 && (
              <Button variant="outline" size="sm" onClick={handleShareText}>
                <Share2 className="w-4 h-4 mr-2" />
                주문 공유
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {totalOrders === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              아직 주문이 없습니다. 링크를 공유해주세요!
            </p>
          ) : (
            <div className="space-y-3">
              {session.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.name}</p>
                      {order.timestamp && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.timestamp).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.menuName} x {order.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {(order.price * order.quantity).toLocaleString()}원
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finish Button */}
      <Button onClick={handleFinish} className="w-full" size="lg">
        주문 마감하고 집계하기
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
