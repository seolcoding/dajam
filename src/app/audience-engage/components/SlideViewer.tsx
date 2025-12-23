'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface Slide {
  position: number;
  imageUrl: string;
  thumbnailUrl?: string;
}

interface SlideViewerProps {
  slides: Slide[];
  isHost: boolean;
  slideIndex?: number;
  onSlideChange?: (index: number) => void;
  className?: string;
}

/**
 * SlideViewer - 업로드된 슬라이드 이미지 뷰어
 *
 * 호스트:
 * - 슬라이드 이동 컨트롤
 * - 키보드 단축키 (← →)
 *
 * 참여자:
 * - 호스트와 슬라이드 동기화
 */
export function SlideViewer({
  slides,
  isHost,
  slideIndex = 0,
  onSlideChange,
  className = '',
}: SlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(slideIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 외부에서 slideIndex 변경 시 동기화
  useEffect(() => {
    setCurrentIndex(slideIndex);
  }, [slideIndex]);

  // 슬라이드 이동
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentIndex(index);
      if (isHost) {
        onSlideChange?.(index);
      }
    }
  }, [slides.length, isHost, onSlideChange]);

  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  // 키보드 단축키 (호스트만)
  useEffect(() => {
    if (!isHost) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHost, goToPrevious, goToNext, isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  if (slides.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-muted-foreground">슬라이드가 없습니다</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''} ${className}`}
    >
      {/* 슬라이드 이미지 */}
      <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'} bg-gray-900`}>
        {currentSlide && (
          <Image
            src={currentSlide.imageUrl}
            alt={`슬라이드 ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority={currentIndex === 0}
          />
        )}
      </div>

      {/* 호스트 컨트롤 */}
      {isHost && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* 이전/다음 버튼 */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="bg-white/90 hover:bg-white disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-white font-medium px-3 py-1.5 bg-black/40 rounded-md min-w-[100px] text-center">
                {currentIndex + 1} / {slides.length}
              </span>
              <Button
                variant="secondary"
                size="icon"
                onClick={goToNext}
                disabled={currentIndex === slides.length - 1}
                className="bg-white/90 hover:bg-white disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* 전체화면 버튼 */}
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
      )}

      {/* 참여자 슬라이드 인디케이터 */}
      {!isHost && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <span className="text-white text-sm font-medium px-3 py-1 bg-black/50 rounded-full">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>
      )}

      {/* 전체화면 닫기 */}
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

      {/* 썸네일 스트립 (호스트, 전체화면 시) */}
      {isHost && isFullscreen && slides.length > 1 && (
        <div className="absolute bottom-20 left-0 right-0 overflow-x-auto">
          <div className="flex gap-2 px-4 py-2 justify-center">
            {slides.map((slide, index) => (
              <button
                key={slide.position}
                onClick={() => goToSlide(index)}
                className={`relative w-24 h-14 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                  index === currentIndex
                    ? 'border-white ring-2 ring-white/50'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={slide.thumbnailUrl || slide.imageUrl}
                  alt={`썸네일 ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-0.5 right-1 text-xs text-white bg-black/60 px-1 rounded">
                  {index + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SlideViewer;
