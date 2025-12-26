'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, QrCode, Share2 } from 'lucide-react';

export interface QRCodeShareProps {
  /** 공유할 URL */
  url: string;
  /** 세션 코드 */
  sessionCode: string;
  /** QR 코드 크기 (기본: 200) */
  size?: number;
  /** 제목 */
  title?: string;
  /** 설명 */
  description?: string;
  /** 카드 스타일 사용 여부 */
  asCard?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * QR 코드 + 세션 코드 공유 컴포넌트
 * 참여자가 쉽게 세션에 참여할 수 있도록 QR과 코드를 함께 표시
 */
export function QRCodeShare({
  url,
  sessionCode,
  size = 200,
  title = '참여 방법',
  description = 'QR 코드를 스캔하거나 코드를 입력하세요',
  asCard = true,
  className = '',
}: QRCodeShareProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  // QR 코드 생성 (동적 import로 qrcode 라이브러리 사용)
  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !url) return;

      try {
        const QRCode = (await import('qrcode')).default;
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrLoaded(true);
      } catch (error) {
        console.error('QR 코드 생성 실패:', error);
      }
    };

    generateQR();
  }, [url, size]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '다잼 세션 참여',
          text: `세션 코드: ${sessionCode}`,
          url,
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

  const content = (
    <div className={`text-center space-y-4 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
      {description && <p className="text-sm text-slate-600">{description}</p>}

      {/* QR 코드 */}
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-xl shadow-inner border">
          {!qrLoaded && (
            <div
              className="flex items-center justify-center bg-slate-100 rounded-lg"
              style={{ width: size, height: size }}
            >
              <QrCode className="w-12 h-12 text-slate-300 animate-pulse" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={qrLoaded ? '' : 'hidden'}
            style={{ width: size, height: size }}
          />
        </div>
      </div>

      {/* 세션 코드 */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider">세션 코드</p>
        <button
          onClick={handleCopyCode}
          className="group inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <span className="text-3xl font-mono font-bold tracking-[0.3em] text-slate-800">
            {sessionCode}
          </span>
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Copy className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          )}
        </button>
      </div>

      {/* 공유 버튼 */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyUrl}>
          <Copy className="w-4 h-4 mr-1.5" />
          링크 복사
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1.5" />
            공유
          </Button>
        )}
      </div>
    </div>
  );

  if (asCard) {
    return (
      <Card className="p-6 border-2 border-dashed border-slate-200 bg-slate-50/50">
        {content}
      </Card>
    );
  }

  return content;
}
