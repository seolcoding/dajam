'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { SceneManagerProps, SceneType } from '../types';

// Scene components
import { QuizScene } from './scenes/QuizScene';
import { ThisOrThatScene } from './scenes/ThisOrThatScene';
import { WordCloudScene } from './scenes/WordCloudScene';
import { VoteScene } from './scenes/VoteScene';
import { PersonalityScene } from './scenes/PersonalityScene';
import { BingoScene } from './scenes/BingoScene';
import { LadderScene } from './scenes/LadderScene';
import { BalanceGameScene } from './scenes/BalanceGameScene';

/**
 * SceneManager - Scene 타입에 따라 적절한 컴포넌트를 렌더링
 *
 * 지원 Scene:
 * - slides: 슬라이드 뷰어
 * - quiz: 실시간 퀴즈
 * - vote: 실시간 투표
 * - this-or-that: This or That
 * - word-cloud: 워드 클라우드
 * - personality: 성격 테스트
 * - bingo: 휴먼 빙고
 */
export function SceneManager({
  activeScene,
  slideItems,
  presentation,
  isHost,
  participantId,
  participantName,
  sessionCode,
  sessionId,
  participants = [],
}: SceneManagerProps) {
  // 현재 아이템 정보
  const currentItem = useMemo(() => {
    return slideItems[activeScene.itemIndex];
  }, [slideItems, activeScene.itemIndex]);

  // Scene 렌더링
  const renderScene = () => {
    if (!sessionId) {
      return (
        <Card className="h-full flex items-center justify-center">
          <CardContent>
            <p className="text-muted-foreground">세션 로딩 중...</p>
          </CardContent>
        </Card>
      );
    }

    switch (activeScene.type) {
      case 'slides':
        return (
          <SlideViewer
            presentation={presentation}
            slideIndex={activeScene.slideIndex || 0}
            isHost={isHost}
          />
        );

      case 'quiz':
        return (
          <QuizScene
            sessionId={sessionId}
            isHost={isHost}
            participantId={participantId}
            participantName={participantName}
          />
        );

      case 'this-or-that':
        return (
          <ThisOrThatScene
            sessionId={sessionId}
            sessionCode={sessionCode}
            isHost={isHost}
            participantId={participantId}
            participantName={participantName}
            participants={participants}
          />
        );

      case 'word-cloud':
        return (
          <WordCloudScene
            sessionId={sessionId}
            isHost={isHost}
            participantId={participantId}
            participantName={participantName}
          />
        );

      case 'vote':
        return (
          <VoteScene
            sessionId={sessionId}
            isHost={isHost}
            participantId={participantId}
          />
        );

      case 'personality':
        return (
          <PersonalityScene
            sessionId={sessionId}
            isHost={isHost}
            participantId={participantId}
            participantName={participantName}
          />
        );

      case 'bingo':
        return (
          <BingoScene
            sessionId={sessionId}
            isHost={isHost}
            participantId={participantId}
            participantName={participantName}
          />
        );

      case 'ladder':
        return (
          <LadderScene
            sessionId={sessionId}
            isHost={isHost}
            participantId={participantId}
            participantName={participantName}
          />
        );

      case 'balance-game':
        return (
          <BalanceGameScene
            sessionId={sessionId}
            isHost={isHost}
            participantId={participantId}
            participantName={participantName}
          />
        );

      default:
        return (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <p className="text-muted-foreground">알 수 없는 Scene 타입</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="h-full w-full">
      {renderScene()}
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface SlideViewerProps {
  presentation?: {
    id: string;
    sourceType: 'google-slides' | 'canva' | 'pdf' | 'images';
    sourceUrl?: string;
  };
  slideIndex: number;
  isHost: boolean;
}

function SlideViewer({ presentation, slideIndex, isHost }: SlideViewerProps) {
  if (!presentation) {
    return (
      <Card className="h-full flex items-center justify-center bg-slate-50">
        <CardContent className="text-center">
          <p className="text-2xl mb-2">🎬</p>
          <p className="text-muted-foreground">
            {isHost ? '슬라이드를 업로드하세요' : '발표가 시작되면 슬라이드가 표시됩니다'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Google Slides embed
  if (presentation.sourceType === 'google-slides' && presentation.sourceUrl) {
    const embedUrl = convertToEmbedUrl(presentation.sourceUrl);
    return (
      <div className="h-full w-full">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0 rounded-lg"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
          title="Google Slides Presentation"
        />
      </div>
    );
  }

  // Canva embed
  if (presentation.sourceType === 'canva' && presentation.sourceUrl) {
    const embedUrl = convertToCanvaEmbedUrl(presentation.sourceUrl);
    return (
      <div className="h-full w-full">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0 rounded-lg"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
          title="Canva Presentation"
        />
      </div>
    );
  }

  // PDF/Images - placeholder for now
  return (
    <Card className="h-full flex items-center justify-center bg-slate-50">
      <CardContent className="text-center">
        <p className="text-6xl mb-4">{slideIndex + 1}</p>
        <p className="text-muted-foreground">슬라이드 {slideIndex + 1}</p>
      </CardContent>
    </Card>
  );
}

// Helper to convert Google Slides URL to embed URL
function convertToEmbedUrl(url: string): string {
  const match = url.match(/\/presentation\/d\/([^/]+)/);
  if (match) {
    const presentationId = match[1];
    return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
  }
  return url;
}

// Helper to convert Canva URL to embed URL
function convertToCanvaEmbedUrl(url: string): string {
  // Canva design URL format: https://www.canva.com/design/DAF.../view
  // Canva embed URL format: https://www.canva.com/design/DAF.../view?embed
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('canva.com') && url.includes('/design/')) {
      // Add embed parameter if not present
      if (!urlObj.searchParams.has('embed')) {
        urlObj.searchParams.set('embed', '');
      }
      return urlObj.toString();
    }
  } catch {
    // Invalid URL, return as-is
  }
  return url;
}

// Placeholder for scenes not yet implemented
interface PlaceholderSceneProps {
  type: SceneType;
  icon: string;
  title: string;
  isHost: boolean;
  color: 'pink' | 'yellow' | 'blue' | 'green' | 'purple' | 'orange';
}

function PlaceholderScene({ icon, title, isHost, color }: PlaceholderSceneProps) {
  const colorClasses = {
    pink: 'from-pink-50 to-purple-50',
    yellow: 'from-yellow-50 to-orange-50',
    blue: 'from-blue-50 to-indigo-50',
    green: 'from-green-50 to-teal-50',
    purple: 'from-purple-50 to-blue-50',
    orange: 'from-orange-50 to-red-50',
  };

  return (
    <Card className={`h-full flex items-center justify-center bg-gradient-to-br ${colorClasses[color]}`}>
      <CardContent className="text-center">
        <p className="text-4xl mb-4">{icon}</p>
        <p className="text-xl font-semibold mb-2">{title}</p>
        <p className="text-muted-foreground">
          {isHost ? '호스트 뷰' : '참여자 뷰'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          (개발 예정)
        </p>
      </CardContent>
    </Card>
  );
}

export default SceneManager;
