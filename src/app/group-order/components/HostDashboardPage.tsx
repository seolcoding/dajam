'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from './QRCode';
import { Copy, Check, Users, ArrowRight } from 'lucide-react';

interface Order {
  id: string;
  name: string;
  menuName: string;
  quantity: number;
  price: number;
  timestamp: string;
}

interface Session {
  id: string;
  restaurantName: string;
  hostName: string;
  mode: 'fixed' | 'free';
  menus: Array<{ id: string; name: string; price: number }>;
  deadline: string | null;
  orders: Order[];
}

export function HostDashboardPage({
  sessionId,
  onNavigate
}: {
  sessionId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem(`group-order-${sessionId}`);
    if (data) {
      setSession(JSON.parse(data));
    }
  }, [sessionId]);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/group-order?page=join&sessionId=${sessionId}`
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    onNavigate('summary', { sessionId });
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">주문방을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const totalOrders = session.orders?.length || 0;
  const totalAmount = session.orders?.reduce((sum, o) => sum + o.price * o.quantity, 0) || 0;

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
            <Badge variant="outline">
              {session.mode === 'fixed' ? '메뉴 선택형' : '자유 입력형'}
            </Badge>
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
                <p className="text-sm font-medium mb-2">초대 링크</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground">주문 수</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{totalAmount.toLocaleString()}원</p>
                  <p className="text-xs text-muted-foreground">총 금액</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>주문 현황</CardTitle>
        </CardHeader>
        <CardContent>
          {totalOrders === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              아직 주문이 없습니다. 링크를 공유해주세요!
            </p>
          ) : (
            <div className="space-y-3">
              {session.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.name}</p>
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
