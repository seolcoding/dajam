'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, RefreshCw, ExternalLink } from 'lucide-react';
import type { SlideSourceType } from '../types';

interface EmbedViewerProps {
  embedUrl: string;
  sourceType: SlideSourceType;
  isHost: boolean;
  slideIndex?: number;
  onSlideChange?: (index: number) => void;
  className?: string;
}

/**
 * EmbedViewer - 통합 임베드 뷰어 컴포넌트
 *
 * 지원하는 소스:
 * - Google Slides (iframe embed)
 * - Canva (iframe embed)
 *
 * 호스트:
 * - 슬라이드 이동 컨트롤 표시 (Google Slides만)
 * - 전체화면/새로고침 기능
 *
 * 참여자:
 * - 호스트의 슬라이드와 동기화
 */
export function EmbedViewer({
  embedUrl,
  sourceType,
  isHost,
  slideIndex = 0,
  onSlideChange,
  className = '',
}: EmbedViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(slideIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 외부에서 slideIndex 변경 시 동기화
  useEffect(() => {
    setCurrentSlide(slideIndex);
  }, [slideIndex]);

  // 슬라이드 이동 (호스트만, Google Slides만 지원)
  const goToSlide = useCallback((index: number) => {
    if (!isHost || sourceType !== 'google-slides') return;
    setCurrentSlide(index);
    onSlideChange?.(index);
  }, [isHost, sourceType, onSlideChange]);

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
    setIsLoading(true);
  }, []);

  // 새 탭에서 열기
  const openInNewTab = useCallback(() => {
    window.open(embedUrl, '_blank');
  }, [embedUrl]);

  // 소스 타입에 따른 URL 생성
  const getDisplayUrl = useCallback(() => {
    if (sourceType === 'google-slides') {
      try {
        const url = new URL(embedUrl);
        // Google Slides는 slide 파라미터로 슬라이드 이동
        url.searchParams.set('slide', `id.p${currentSlide + 1}`);
        return url.toString();
      } catch {
        return embedUrl;
      }
    }
    // Canva와 기타 소스는 URL 그대로 사용
    return embedUrl;
  }, [embedUrl, sourceType, currentSlide]);

  // iframe 로드 완료 핸들러
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // 슬라이드 네비게이션 표시 여부 (Google Slides만)
  const showSlideNavigation = isHost && sourceType === 'google-slides';

  return (
    <div
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''} ${className}`}
    >
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dajaem-green mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {sourceType === 'google-slides' ? 'Google Slides' :
               sourceType === 'canva' ? 'Canva' : '슬라이드'} 로딩 중...
            </p>
          </div>
        </div>
      )}

      {/* Embed iframe */}
      <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'} bg-gray-100`}>
        <iframe
          key={iframeKey}
          src={getDisplayUrl()}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
          onLoad={handleIframeLoad}
          title={`${sourceType} embed`}
        />
      </div>

      {/* 호스트 컨트롤 */}
      {isHost && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* 슬라이드 네비게이션 (Google Slides만) */}
            {showSlideNavigation ? (
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
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white font-medium px-3 py-1 bg-black/30 rounded-md">
                  {sourceType === 'canva' ? 'Canva' :
                   sourceType === 'google-slides' ? 'Google Slides' : '프레젠테이션'}
                </span>
              </div>
            )}

            {/* 유틸리티 버튼 */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={openInNewTab}
                className="bg-white/90 hover:bg-white"
                title="새 탭에서 열기"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
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

export default EmbedViewer;
