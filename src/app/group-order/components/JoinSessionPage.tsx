'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, ShoppingCart, Cloud, HardDrive, RefreshCw, Loader2, Home } from 'lucide-react';
import { useSupabaseSession } from '../hooks/useSupabaseSession';

export function JoinSessionPage({
  sessionId,
}: {
  sessionId: string;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('');
  const [freeMenuName, setFreeMenuName] = useState('');
  const [freeMenuPrice, setFreeMenuPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { session, isLoading, error, isCloudMode, submitOrder } = useSupabaseSession({
    sessionCode: sessionId,
    enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;
    setIsSubmitting(true);

    let menuName = '';
    let price = 0;

    if (session.mode === 'fixed') {
      const menu = session.menus.find(m => m.id === selectedMenu);
      if (menu) {
        menuName = menu.name;
        price = menu.price;
      }
    } else {
      menuName = freeMenuName;
      price = parseInt(freeMenuPrice) || 0;
    }

    const success = await submitOrder({
      name,
      menuName,
      quantity,
      price,
    });

    setIsSubmitting(false);
    if (success) {
      setSubmitted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">주문방 로딩 중...</p>
      </div>
    );
  }

  const handleGoHome = () => {
    router.push('/group-order');
  };

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

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-8 pb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">주문 완료!</h2>
          <p className="text-muted-foreground">
            주문이 성공적으로 등록되었습니다.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
            추가 주문하기
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <Badge variant="secondary">{session.restaurantName}</Badge>
          </div>
          <Badge variant={isCloudMode ? 'default' : 'secondary'} className={isCloudMode ? 'bg-blue-500' : ''}>
            {isCloudMode ? (
              <><Cloud className="w-3 h-3 mr-1" /> 클라우드</>
            ) : (
              <><HardDrive className="w-3 h-3 mr-1" /> 로컬</>
            )}
          </Badge>
        </div>
        <CardTitle>주문하기</CardTitle>
        <CardDescription>
          방장 {session.hostName}님의 주문방에 참여합니다.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
            />
          </div>

          {session.mode === 'fixed' ? (
            <div className="space-y-2">
              <Label>메뉴 선택</Label>
              <Select value={selectedMenu} onValueChange={setSelectedMenu} required>
                <SelectTrigger>
                  <SelectValue placeholder="메뉴를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {session.menus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.name} - {menu.price.toLocaleString()}원
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="freeMenuName">메뉴명</Label>
                <Input
                  id="freeMenuName"
                  value={freeMenuName}
                  onChange={(e) => setFreeMenuName(e.target.value)}
                  placeholder="후라이드 치킨"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freeMenuPrice">가격</Label>
                <Input
                  id="freeMenuPrice"
                  type="number"
                  value={freeMenuPrice}
                  onChange={(e) => setFreeMenuPrice(e.target.value)}
                  placeholder="18000"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">수량</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                주문 전송 중...
              </>
            ) : (
              '주문하기'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
