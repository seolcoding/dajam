import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@mini-apps/ui';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import type { MenuItem } from '@/types';
import { createSession } from '@/services/orderService';

export function CreateSessionPage() {
  const navigate = useNavigate();
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

    if (!restaurantName.trim()) {
      alert('가게 이름을 입력해주세요.');
      return;
    }

    if (!hostName.trim()) {
      alert('주최자 이름을 입력해주세요.');
      return;
    }

    if (mode === 'fixed' && menus.length === 0) {
      alert('최소 1개 이상의 메뉴를 추가해주세요.');
      return;
    }

    if (mode === 'fixed' && menus.some(m => !m.name.trim() || m.price <= 0)) {
      alert('모든 메뉴의 이름과 가격을 입력해주세요.');
      return;
    }

    const session = createSession({
      restaurantName: restaurantName.trim(),
      hostName: hostName.trim(),
      mode,
      menus: mode === 'fixed' ? menus : [],
      deadline: deadline ? new Date(deadline) : undefined,
    });

    navigate(`/host/${session.id}`);
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">주문방 만들기</CardTitle>
            <CardDescription className="text-gray-600">
              단체 주문을 위한 주문방을 생성합니다.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* 가게 이름 */}
              <div className="space-y-2">
                <Label htmlFor="restaurantName">가게/식당 이름 *</Label>
                <Input
                  id="restaurantName"
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  placeholder="예: 맛있는 중국집"
                  required
                />
              </div>

              {/* 주최자 이름 */}
              <div className="space-y-2">
                <Label htmlFor="hostName">주최자 이름 *</Label>
                <Input
                  id="hostName"
                  value={hostName}
                  onChange={e => setHostName(e.target.value)}
                  placeholder="예: 김철수"
                  required
                />
              </div>

              {/* 메뉴 입력 방식 */}
              <div className="space-y-2">
                <Label>메뉴 입력 방식</Label>
                <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'fixed' | 'free')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="cursor-pointer">
                      고정 메뉴 (미리 메뉴 입력)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free" className="cursor-pointer">
                      자유 입력 (참가자가 직접 입력)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 고정 메뉴 입력 */}
              {mode === 'fixed' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>메뉴 목록</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddMenu}>
                      <Plus className="w-4 h-4 mr-1" />
                      메뉴 추가
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {menus.map((menu) => (
                      <Card key={menu.id} className="border-gray-200">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <Input
                                placeholder="메뉴 이름"
                                value={menu.name}
                                onChange={e =>
                                  handleMenuChange(menu.id, 'name', e.target.value)
                                }
                              />
                            </div>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="가격"
                                value={menu.price || ''}
                                onChange={e =>
                                  handleMenuChange(menu.id, 'price', parseInt(e.target.value) || 0)
                                }
                                min="0"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleRemoveMenu(menu.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {menus.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        메뉴를 추가해주세요.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 마감 시간 (선택) */}
              <div className="space-y-2">
                <Label htmlFor="deadline">마감 시간 (선택)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  마감 시간이 지나면 자동으로 주문이 마감됩니다.
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700">
                주문방 생성
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
