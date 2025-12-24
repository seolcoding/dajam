'use client';

import { useState } from 'react';
import { Share2, Link2, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyticsEvents } from '@/components/analytics/GoogleAnalytics';

interface ShareButtonsProps {
  appName: string;
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
}

export function ShareButtons({
  appName,
  title,
  description,
  imageUrl,
  className = '',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('utm_source', 'share');
    url.searchParams.set('utm_medium', 'social');
    url.searchParams.set('utm_campaign', appName);
    return url.toString();
  };

  const copyToClipboard = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      analyticsEvents.shareClicked(appName, 'copy_link');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareKakao = () => {
    if (typeof window === 'undefined' || !window.Kakao || !window.Kakao.Share) {
      // Fallback: open kakao share URL
      window.open(
        `https://story.kakao.com/share?url=${encodeURIComponent(getShareUrl())}`,
        '_blank'
      );
      return;
    }

    analyticsEvents.shareClicked(appName, 'kakao');

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title,
        description: description || '다잼에서 확인하세요!',
        imageUrl: imageUrl || 'https://dajam.seolcoding.com/og-image.png',
        link: {
          mobileWebUrl: getShareUrl(),
          webUrl: getShareUrl(),
        },
      },
      buttons: [
        {
          title: '앱 열기',
          link: {
            mobileWebUrl: getShareUrl(),
            webUrl: getShareUrl(),
          },
        },
      ],
    });
  };

  const shareNative = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: getShareUrl(),
        });
        analyticsEvents.shareClicked(appName, 'native');
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    }
  };

  const hasNativeShare =
    typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground mr-1">공유하기</span>

      {/* Kakao Share */}
      <Button
        variant="outline"
        size="sm"
        onClick={shareKakao}
        className="gap-1.5"
        title="카카오톡으로 공유"
      >
        <MessageCircle className="h-4 w-4 text-[#FEE500]" />
        <span className="hidden sm:inline">카카오톡</span>
      </Button>

      {/* Copy Link */}
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="gap-1.5"
        title="링크 복사"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{copied ? '복사됨!' : '링크 복사'}</span>
      </Button>

      {/* Native Share (Mobile) */}
      {hasNativeShare && (
        <Button
          variant="outline"
          size="sm"
          onClick={shareNative}
          className="gap-1.5 sm:hidden"
          title="공유"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Kakao SDK types are declared globally in types/kakao.d.ts
