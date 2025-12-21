'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, Home, RefreshCw } from 'lucide-react';

interface Order {
  id: string;
  name: string;
  menuName: string;
  quantity: number;
  price: number;
}

interface Session {
  id: string;
  restaurantName: string;
  hostName: string;
  orders: Order[];
}

interface MenuSummary {
  menuName: string;
  quantity: number;
  price: number;
  orderers: string[];
}

export function SummaryPage({
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

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">주문방을 찾을 수 없습니다.</p>
      </div>
    );
  }

  // Aggregate orders by menu
  const menuSummary: MenuSummary[] = [];
  session.orders.forEach((order) => {
    const existing = menuSummary.find(m => m.menuName === order.menuName);
    if (existing) {
      existing.quantity += order.quantity;
      existing.orderers.push(`${order.name}(${order.quantity})`);
    } else {
      menuSummary.push({
        menuName: order.menuName,
        quantity: order.quantity,
        price: order.price,
        orderers: [`${order.name}(${order.quantity})`],
      });
    }
  });

  const totalAmount = session.orders.reduce((sum, o) => sum + o.price * o.quantity, 0);

  const summaryText = `
[${session.restaurantName}] 주문 집계

${menuSummary.map(m => `- ${m.menuName} x ${m.quantity} = ${(m.price * m.quantity).toLocaleString()}원
  (${m.orderers.join(', ')})`).join('\n')}

---
총 주문 금액: ${totalAmount.toLocaleString()}원
주문 인원: ${session.orders.length}명
`.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">주문 집계</CardTitle>
          <p className="text-muted-foreground">{session.restaurantName}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {menuSummary.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold">{item.menuName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.orderers.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">x {item.quantity}</p>
                  <p className="text-sm text-muted-foreground">
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between text-lg font-bold">
            <span>총 금액</span>
            <span className="text-primary">{totalAmount.toLocaleString()}원</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            총 {session.orders.length}명이 주문했습니다.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button onClick={handleCopy} className="w-full" variant="outline">
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                복사됨!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                주문 내역 복사하기
              </>
            )}
          </Button>
          <div className="flex gap-2 w-full">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => onNavigate('host', { sessionId })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => onNavigate('home')}
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
