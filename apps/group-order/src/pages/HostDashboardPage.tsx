import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@mini-apps/ui';
import { Copy, Share2, Users, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useOrderSync } from '@/hooks/useOrderSync';
import { useOrderSummary } from '@/hooks/useOrderSummary';
import { closeSession } from '@/services/orderService';

export function HostDashboardPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading, error } = useSession(sessionId);
  const { orders } = useOrderSync(sessionId || '');
  const summary = useOrderSummary(sessionId || '', orders);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md border-gray-200">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error || '세션을 찾을 수 없습니다.'}</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700">홈으로 돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const joinUrl = `${window.location.origin}${import.meta.env.BASE_URL}join/${session.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    alert('링크가 복사되었습니다!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${session.restaurantName} 주문`,
          text: `${session.restaurantName} 단체 주문에 참여해주세요!`,
          url: joinUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCloseSession = () => {
    if (confirm('주문을 마감하시겠습니까?')) {
      closeSession(session.id);
      navigate(`/summary/${session.id}`);
    }
  };

  const participantNames = Array.from(new Set(orders.map(o => o.participantName)));

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{session.restaurantName}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={session.isActive ? 'default' : 'secondary'} className={session.isActive ? 'bg-green-600' : ''}>
              {session.isActive ? '진행 중' : '마감됨'}
            </Badge>
            {session.deadline && (
              <Badge variant="outline" className="border-gray-300 text-gray-700">
                <Clock className="w-3 h-3 mr-1" />
                마감: {new Date(session.deadline).toLocaleString('ko-KR')}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: QR Code & Invite */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">참여 QR 코드</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <QRCodeSVG value={joinUrl} size={200} />
                </div>
                <div className="mt-4 w-full space-y-2">
                  <Button variant="outline" className="w-full border-gray-300" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-2" />
                    링크 복사
                  </Button>
                  <Button variant="outline" className="w-full border-gray-300" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    공유하기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">주문 현황</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-600" />
                    <span className="text-sm text-gray-700">참여 인원</span>
                  </div>
                  <span className="font-semibold text-gray-900">{summary.participantCount}명</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    <span className="text-sm text-gray-700">총 금액</span>
                  </div>
                  <span className="font-semibold text-gray-900">{summary.totalAmount.toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    <span className="text-sm text-gray-700">1인당</span>
                  </div>
                  <span className="font-semibold text-gray-900">{summary.perPersonAmount.toLocaleString()}원</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Orders & Menu Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Participants */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">참여자 ({participantNames.length}명)</CardTitle>
              </CardHeader>
              <CardContent>
                {participantNames.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">아직 참여자가 없습니다.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {participantNames.map(name => (
                      <Badge key={name} variant="secondary" className="bg-gray-100 text-gray-700">
                        {name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu Summary */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">메뉴별 집계</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.menuSummary.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">아직 주문이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {summary.menuSummary.map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.menuName}</p>
                          <p className="text-sm text-gray-500">
                            {item.unitPrice.toLocaleString()}원 × {item.totalQuantity}개
                          </p>
                        </div>
                        <p className="font-semibold text-lg text-gray-900">
                          {item.subtotal.toLocaleString()}원
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Individual Orders */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">개인별 주문 내역</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">아직 주문이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const orderTotal = order.items.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      );
                      return (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{order.participantName}</h4>
                            <span className="font-semibold text-green-600">
                              {orderTotal.toLocaleString()}원
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center justify-between text-gray-600">
                                <span>
                                  {item.menuName} × {item.quantity}
                                </span>
                                <span>{(item.price * item.quantity).toLocaleString()}원</span>
                              </div>
                            ))}
                          </div>
                          {order.specialRequest && (
                            <div className="mt-2 text-xs text-gray-500 border-t border-gray-200 pt-2">
                              메모: {order.specialRequest}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {session.isActive && (
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={handleCloseSession}>
                <CheckCircle className="w-5 h-5 mr-2" />
                주문 마감하고 주문서 생성
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
