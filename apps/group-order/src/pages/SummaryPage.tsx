import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@mini-apps/ui';
import { Download, Copy, Share2, Home } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useOrderSync } from '@/hooks/useOrderSync';
import { generateOrderSummary, generateShareText, downloadOrderImage } from '@/services/orderService';

export function SummaryPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading, error } = useSession(sessionId);
  useOrderSync(sessionId || ''); // Keep connection alive for real-time updates

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

  if (error || !session || !sessionId) {
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

  const summary = generateOrderSummary(sessionId);
  const shareText = generateShareText(summary);

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    alert('주문 내역이 복사되었습니다!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${summary.restaurantName} 주문서`,
          text: shareText,
        });
      } catch (err) {
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  const handleDownloadImage = async () => {
    await downloadOrderImage('order-summary-card', `${summary.restaurantName}_주문서.png`);
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">주문 완료</h1>
          <p className="text-gray-600">주문이 성공적으로 마감되었습니다.</p>
        </div>

        {/* Summary Card for Export */}
        <Card id="order-summary-card" className="mb-6 border-gray-200">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="text-2xl mb-2 text-gray-900">{summary.restaurantName}</CardTitle>
              <div className="flex justify-center gap-2">
                <Badge className="bg-green-600">주문 마감</Badge>
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  {new Date().toLocaleDateString('ko-KR')}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-500 mb-1">참여 인원</p>
                <p className="text-2xl font-bold text-green-600">{summary.participantCount}명</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-500 mb-1">총 금액</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.totalAmount.toLocaleString()}원
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-500 mb-1">1인당</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.perPersonAmount.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* Menu Summary */}
            <div>
              <h3 className="font-semibold mb-3 text-lg text-gray-900">주문 내역</h3>
              <div className="space-y-2">
                {summary.menuSummary.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div>
                      <p className="font-medium text-gray-900">{item.menuName}</p>
                      <p className="text-sm text-gray-500">
                        {item.unitPrice.toLocaleString()}원 × {item.totalQuantity}개
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">{item.subtotal.toLocaleString()}원</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Orders */}
            <div>
              <h3 className="font-semibold mb-3 text-lg text-gray-900">개인별 주문</h3>
              <div className="space-y-3">
                {summary.orders.map(order => {
                  const orderTotal = order.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  );
                  return (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{order.participantName}</span>
                        <span className="font-semibold text-green-600">
                          {orderTotal.toLocaleString()}원
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        {order.items.map(item => (
                          <div key={item.id}>
                            • {item.menuName} × {item.quantity} ({(item.price * item.quantity).toLocaleString()}원)
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
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" className="border-gray-300" onClick={handleDownloadImage}>
            <Download className="w-4 h-4 mr-2" />
            이미지 저장
          </Button>
          <Button variant="outline" className="border-gray-300" onClick={handleCopyText}>
            <Copy className="w-4 h-4 mr-2" />
            텍스트 복사
          </Button>
          <Button variant="outline" className="border-gray-300" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            공유하기
          </Button>
        </div>

        <div className="mt-6">
          <Button variant="outline" className="w-full border-gray-300" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
