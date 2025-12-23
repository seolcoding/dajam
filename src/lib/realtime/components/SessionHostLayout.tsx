'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, RefreshCw, Home, Cloud, HardDrive, X } from 'lucide-react';
import QRCode from 'qrcode';
import { RealtimeIndicator } from '@/components/common/RealtimeIndicator';
import { CopyableLink } from '@/components/common/CopyableLink';
import type { SessionHostLayoutProps } from '../types';

/**
 * 세션 호스트 공통 레이아웃
 * QR 코드, 공유 링크, 참여자 수, 연결 상태 표시
 */
export function SessionHostLayout({
  sessionCode,
  title,
  subtitle,
  participantCount,
  connectionStatus,
  isCloudMode,
  shareUrl,
  children,
  showQRCode = true,
  onRefresh,
  onClose,
}: SessionHostLayoutProps) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // QR 코드 생성
  useEffect(() => {
    if (shareUrl && showQRCode) {
      QRCode.toDataURL(shareUrl, { width: 200, margin: 2 }).then(setQrDataUrl);
    }
  }, [shareUrl, showQRCode]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl">{title}</CardTitle>
                {subtitle && <CardDescription>{subtitle}</CardDescription>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* 세션 코드 */}
                <Badge variant="secondary" className="text-lg px-4 py-2 font-mono">
                  {sessionCode}
                </Badge>

                {/* 클라우드/로컬 모드 */}
                <Badge
                  variant={isCloudMode ? 'default' : 'secondary'}
                  className={isCloudMode ? 'bg-blue-500' : ''}
                >
                  {isCloudMode ? (
                    <>
                      <Cloud className="w-3 h-3 mr-1" /> 클라우드
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3 h-3 mr-1" /> 로컬
                    </>
                  )}
                </Badge>

                {/* 실시간 연결 표시 */}
                {isCloudMode && (
                  <RealtimeIndicator isConnected={connectionStatus === 'connected'} />
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR 코드 */}
              {showQRCode && (
                <div className="flex flex-col items-center p-6 bg-white rounded-xl border">
                  <p className="text-sm text-muted-foreground mb-4">
                    QR 코드를 스캔하거나 링크를 클릭해 복사하세요
                  </p>
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="w-48 h-48 rounded-lg"
                    />
                  )}
                  <div className="mt-4 w-full">
                    <CopyableLink url={shareUrl} className="w-full" />
                  </div>
                </div>
              )}

              {/* 통계 + 버튼 */}
              <div className="space-y-4">
                {/* 참여자 수 */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-3xl font-bold text-blue-700">
                        {participantCount}
                      </p>
                      <p className="text-sm text-blue-600">참여자</p>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  {onRefresh && (
                    <Button variant="outline" onClick={onRefresh} className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      새로고침
                    </Button>
                  )}
                  {onClose && (
                    <Button variant="destructive" onClick={onClose} className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      종료
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 앱별 커스텀 콘텐츠 */}
        {children}
      </div>
    </div>
  );
}
