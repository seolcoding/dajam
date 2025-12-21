import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mini-apps/ui';
import { Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useOrderSync } from '@/hooks/useOrderSync';
import { isSessionClosed } from '@/services/orderService';
import type { OrderItem } from '@/types';

export function JoinSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading, error } = useSession(sessionId);
  const { addOrder, orders } = useOrderSync(sessionId || '');

  const [participantName, setParticipantName] = useState('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [specialRequest, setSpecialRequest] = useState('');
  const [step, setStep] = useState<'name' | 'order'>('name');

  // Free mode state
  const [freeMenuName, setFreeMenuName] = useState('');
  const [freeMenuPrice, setFreeMenuPrice] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md border-gray-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || '세션을 찾을 수 없습니다.'}</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700">홈으로 돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSessionClosed(session.id)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md border-gray-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-yellow-600 mb-4">이 주문방은 마감되었습니다.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700">홈으로 돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    // Check duplicate name
    const existingNames = orders.map(o => o.participantName);
    if (existingNames.includes(participantName.trim())) {
      alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      return;
    }

    setStep('order');
  };

  const handleAddToCart = (menuId: string, menuName: string, price: number) => {
    const existingItem = cartItems.find(item => item.menuId === menuId);

    if (existingItem) {
      setCartItems(
        cartItems.map(item =>
          item.menuId === menuId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          id: nanoid(10),
          menuId,
          menuName,
          price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleAddFreeItem = () => {
    if (!freeMenuName.trim() || !freeMenuPrice || parseInt(freeMenuPrice) <= 0) {
      alert('메뉴 이름과 가격을 모두 입력해주세요.');
      return;
    }

    setCartItems([
      ...cartItems,
      {
        id: nanoid(10),
        menuName: freeMenuName.trim(),
        price: parseInt(freeMenuPrice),
        quantity: 1,
      },
    ]);

    setFreeMenuName('');
    setFreeMenuPrice('');
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setCartItems(
      cartItems
        .map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const handleSubmitOrder = () => {
    if (cartItems.length === 0) {
      alert('최소 1개 이상의 메뉴를 선택해주세요.');
      return;
    }

    addOrder({
      sessionId: session.id,
      participantName: participantName.trim(),
      items: cartItems,
      specialRequest: specialRequest.trim() || undefined,
    });

    alert('주문이 완료되었습니다!');
    navigate(`/host/${session.id}`);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (step === 'name') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">{session.restaurantName}</CardTitle>
            <CardDescription className="text-gray-600">닉네임을 입력하고 주문을 시작하세요.</CardDescription>
          </CardHeader>
          <form onSubmit={handleNameSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="participantName">닉네임 *</Label>
                <Input
                  id="participantName"
                  value={participantName}
                  onChange={e => setParticipantName(e.target.value)}
                  placeholder="예: 홍길동"
                  autoFocus
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                다음
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{session.restaurantName}</h1>
          <p className="text-gray-600">주문자: {participantName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">메뉴 선택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {session.mode === 'fixed' ? (
                  // Fixed menu mode
                  session.menus.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">메뉴가 없습니다.</p>
                  ) : (
                    session.menus.map(menu => (
                      <div
                        key={menu.id}
                        className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{menu.name}</h3>
                          <p className="text-sm text-gray-600">
                            {menu.price.toLocaleString()}원
                          </p>
                          {menu.description && (
                            <p className="text-xs text-gray-500 mt-1">{menu.description}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300"
                          onClick={() => handleAddToCart(menu.id, menu.name, menu.price)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )
                ) : (
                  // Free input mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Input
                          placeholder="메뉴 이름"
                          value={freeMenuName}
                          onChange={e => setFreeMenuName(e.target.value)}
                        />
                      </div>
                      <Input
                        type="number"
                        placeholder="가격"
                        value={freeMenuPrice}
                        onChange={e => setFreeMenuPrice(e.target.value)}
                        min="0"
                      />
                    </div>
                    <Button variant="outline" className="w-full border-gray-300" onClick={handleAddFreeItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      장바구니에 추가
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  장바구니
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 text-sm">
                    메뉴를 선택해주세요.
                  </p>
                ) : (
                  <>
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.menuName}</p>
                          <p className="text-xs text-gray-500">
                            {item.price.toLocaleString()}원
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 border-gray-300"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm w-6 text-center text-gray-900">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 border-gray-300"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-gray-900">합계</span>
                        <span className="text-green-600">{cartTotal.toLocaleString()}원</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialRequest" className="text-xs">
                        특이사항 (선택)
                      </Label>
                      <Input
                        id="specialRequest"
                        placeholder="예: 덜 맵게"
                        value={specialRequest}
                        onChange={e => setSpecialRequest(e.target.value)}
                      />
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmitOrder}>
                      주문하기
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
