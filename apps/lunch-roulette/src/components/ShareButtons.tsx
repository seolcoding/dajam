/**
 * 결과 공유 버튼
 */

import { useCallback } from 'react';
import { Share2, Link2, MessageCircle } from 'lucide-react';
import { Button } from '@mini-apps/ui';

interface ShareButtonsProps {
  placeName: string;
  placeUrl: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  placeName,
}) => {
  const shareUrl = `${window.location.origin}${window.location.pathname}?restaurant=${encodeURIComponent(placeName)}`;
  const shareText = `오늘 점심은 "${placeName}"! 🎰 점심 메뉴 룰렛으로 정했어요`;

  const handleKakaoShare = useCallback(() => {
    if (window.kakao && window.kakao.Share) {
      window.kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '점심 메뉴 룰렛 결과',
          description: shareText,
          imageUrl: `${window.location.origin}/og-image.png`,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '나도 돌려보기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } else {
      alert('카카오톡 공유를 사용할 수 없습니다.');
    }
  }, [shareText, shareUrl]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '점심 메뉴 룰렛',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // 사용자가 취소한 경우 무시
        if ((error as Error).name !== 'AbortError') {
          console.error('공유 실패:', error);
        }
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('링크가 복사되었습니다!');
    } catch (error) {
      console.error('복사 실패:', error);
      alert('링크 복사에 실패했습니다.');
    }
  };

  const hasKakaoShare = typeof window !== 'undefined' && window.kakao && window.kakao.Share;
  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {/* 카카오톡 공유 */}
      {hasKakaoShare && (
        <Button
          onClick={handleKakaoShare}
          className="flex items-center gap-2 px-6 py-3 bg-[#FEE500] text-black
                     rounded-lg font-bold hover:bg-[#FFEB00] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          카카오톡 공유
        </Button>
      )}

      {/* 네이티브 공유 (모바일) */}
      {hasNativeShare && (
        <Button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white
                     rounded-lg font-bold hover:bg-orange-700 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          공유하기
        </Button>
      )}

      {/* 링크 복사 */}
      <Button
        onClick={handleCopyUrl}
        variant="outline"
        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700
                   border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
      >
        <Link2 className="w-5 h-5" />
        링크 복사
      </Button>
    </div>
  );
};
