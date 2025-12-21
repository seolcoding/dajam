'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export function CreateSessionPage({ onNavigate }: { onNavigate: (page: string, params?: Record<string, string>) => void }) {
  const [restaurantName, setRestaurantName] = useState('');
  const [hostName, setHostName] = useState('');
  const [mode, setMode] = useState<'fixed' | 'free'>('fixed');
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [deadline, setDeadline] = useState('');

  const handleAddMenu = () => {
    setMenus([
      ...menus,
      {
        id: nanoid(10),
        name: '',
        price: 0,
        description: '',
      },
    ]);
  };

  const handleRemoveMenu = (id: string) => {
    setMenus(menus.filter(m => m.id !== id));
  };

  const handleMenuChange = (id: string, field: keyof MenuItem, value: string | number) => {
    setMenus(menus.map(m => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sessionId = nanoid(8);
    const session = {
      id: sessionId,
      restaurantName,
      hostName,
      mode,
      menus: mode === 'fixed' ? menus : [],
      deadline: deadline ? new Date(deadline).toISOString() : null,
      createdAt: new Date().toISOString(),
      orders: [],
    };

    // Save to localStorage
    localStorage.setItem(`group-order-${sessionId}`, JSON.stringify(session));

    // Navigate to host dashboard
    onNavigate('host', { sessionId });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>주문방 만들기</CardTitle>
        <CardDescription>단체 주문을 위한 방을 생성합니다.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="restaurantName">음식점 이름</Label>
            <Input
              id="restaurantName"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="예: 맛있는 치킨집"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostName">방장 이름</Label>
            <Input
              id="hostName"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="예: 홍길동"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>주문 방식</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'fixed' | 'free')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">메뉴 선택형 (미리 메뉴 등록)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="free" />
                <Label htmlFor="free">자유 입력형 (직접 메뉴명 입력)</Label>
              </div>
            </RadioGroup>
          </div>

          {mode === 'fixed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>메뉴 목록</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddMenu}>
                  <Plus className="w-4 h-4 mr-1" />
                  메뉴 추가
                </Button>
              </div>

              {menus.map((menu) => (
                <div key={menu.id} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={menu.name}
                      onChange={(e) => handleMenuChange(menu.id, 'name', e.target.value)}
                      placeholder="메뉴명"
                    />
                    <Input
                      type="number"
                      value={menu.price || ''}
                      onChange={(e) => handleMenuChange(menu.id, 'price', parseInt(e.target.value) || 0)}
                      placeholder="가격"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMenu(menu.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {menus.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  메뉴를 추가해주세요.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="deadline">주문 마감 시간 (선택)</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            주문방 만들기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
