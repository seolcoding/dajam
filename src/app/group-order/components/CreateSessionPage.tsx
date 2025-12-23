'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, ArrowRight, Cloud, HardDrive, Loader2, Home } from 'lucide-react';
import { useSupabaseSession } from '../hooks/useSupabaseSession';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export function CreateSessionPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState('');
  const [hostName, setHostName] = useState('');
  const [mode, setMode] = useState<'fixed' | 'free'>('fixed');
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [deadline, setDeadline] = useState('');
  const [storageMode, setStorageMode] = useState<'local' | 'cloud'>('cloud');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createCloudSession } = useSupabaseSession({ sessionCode: '', enabled: false });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (storageMode === 'cloud') {
        // 클라우드 모드: Supabase에 저장
        const sessionCode = await createCloudSession({
          restaurantName,
          hostName,
          mode,
          menus: mode === 'fixed' ? menus : [],
          deadline: deadline ? new Date(deadline).toISOString() : null,
        });

        if (sessionCode) {
          router.push(`/group-order/host/${sessionCode}`);
        } else {
          // 클라우드 실패 시 로컬로 폴백
          console.warn('Cloud session failed, falling back to local');
          createLocalSession();
        }
      } else {
        // 로컬 모드
        createLocalSession();
      }
    } catch (err) {
      console.error('Failed to create session:', err);
      createLocalSession();
    } finally {
      setIsSubmitting(false);
    }
  };

  const createLocalSession = () => {
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

    localStorage.setItem(`group-order-${sessionId}`, JSON.stringify(session));
    router.push(`/group-order/host/${sessionId}`);
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

          <div className="space-y-3">
            <Label>저장 방식</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStorageMode('local')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors ${
                  storageMode === 'local'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <HardDrive className={`w-6 h-6 ${storageMode === 'local' ? 'text-gray-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">로컬 모드</span>
                <span className="text-xs text-muted-foreground text-center">같은 기기에서만</span>
              </button>
              <button
                type="button"
                onClick={() => setStorageMode('cloud')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors ${
                  storageMode === 'cloud'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Cloud className={`w-6 h-6 ${storageMode === 'cloud' ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">클라우드 모드</span>
                <span className="text-xs text-muted-foreground text-center">크로스 디바이스</span>
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                주문방 만들기
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
