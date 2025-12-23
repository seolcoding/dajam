'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface GoogleSlidesEmbedProps {
  embedUrl: string;
  isHost: boolean;
  slideIndex?: number;
  onSlideChange?: (index: number) => void;
  className?: string;
}

/**
 * GoogleSlidesEmbed - Google Slides iframe 임베드 컴포넌트
 *
 * 호스트:
 * - 슬라이드 이동 컨트롤 표시
 * - 슬라이드 변경 시 참여자에게 브로드캐스트
 *
 * 참여자:
 * - 호스트의 슬라이드와 동기화
 */
export function GoogleSlidesEmbed({
  embedUrl,
  isHost,
  slideIndex = 0,
  onSlideChange,
  className = '',
}: GoogleSlidesEmbedProps) {
  const [currentSlide, setCurrentSlide] = useState(slideIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // 외부에서 slideIndex 변경 시 동기화
  useEffect(() => {
    setCurrentSlide(slideIndex);
  }, [slideIndex]);

  // 슬라이드 이동 (호스트만)
  const goToSlide = useCallback((index: number) => {
    if (!isHost) return;
    setCurrentSlide(index);
    onSlideChange?.(index);
  }, [isHost, onSlideChange]);

  const goToPreviousSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  const goToNextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // iframe 새로고침
  const refreshIframe = useCallback(() => {
    setIframeKey((prev) => prev + 1);
  }, []);

  // Google Slides URL에 슬라이드 인덱스 추가
  const getSlideUrl = useCallback(() => {
    const url = new URL(embedUrl);
    // Google Slides는 0-indexed
    url.searchParams.set('slide', `id.p${currentSlide + 1}`);
    return url.toString();
  }, [embedUrl, currentSlide]);

  return (
    <div
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''} ${className}`}
    >
      {/* Google Slides iframe */}
      <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'} bg-gray-100`}>
        <iframe
          key={iframeKey}
          src={getSlideUrl()}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>

      {/* 호스트 컨트롤 */}
      {isHost && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* 이전/다음 버튼 */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={goToPreviousSlide}
                disabled={currentSlide === 0}
                className="bg-white/90 hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-white font-medium px-3 py-1 bg-black/30 rounded-md">
                슬라이드 {currentSlide + 1}
              </span>
              <Button
                variant="secondary"
                size="icon"
                onClick={goToNextSlide}
                className="bg-white/90 hover:bg-white"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* 유틸리티 버튼 */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={refreshIframe}
                className="bg-white/90 hover:bg-white"
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={toggleFullscreen}
                className="bg-white/90 hover:bg-white"
                title={isFullscreen ? '전체화면 종료' : '전체화면'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 전체화면 닫기 버튼 */}
      {isFullscreen && (
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white"
        >
          <Minimize2 className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

export default GoogleSlidesEmbed;
