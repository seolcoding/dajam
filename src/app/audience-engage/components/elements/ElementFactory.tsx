'use client';

import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import type { SessionElement } from '@/types/database';
import type { ElementType } from '@/lib/elements/types';

// Lazy load element components
const PollResponse = lazy(() => import('./poll/PollResponse'));
const PollResults = lazy(() => import('./poll/PollResults'));
const QuizResponse = lazy(() => import('./quiz/QuizResponse'));
const QuizResults = lazy(() => import('./quiz/QuizResults'));
const WordCloudResponse = lazy(() => import('./word-cloud/WordCloudResponse'));
const WordCloudResults = lazy(() => import('./word-cloud/WordCloudResults'));

// ============================================
// Types
// ============================================

export interface ElementFactoryProps {
  element: SessionElement;
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  userId?: string;
  anonymousId?: string;
  displayName?: string;
  className?: string;
}

// ============================================
// Loading Fallback
// ============================================

function ElementLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );
}

// ============================================
// Unknown Element
// ============================================

function UnknownElement({ elementType }: { elementType: string }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <p className="text-lg font-medium">지원하지 않는 요소 타입입니다</p>
      <p className="text-sm mt-1">{elementType}</p>
    </div>
  );
}

// ============================================
// Component
// ============================================

/**
 * Element Factory - Dynamic element component loader
 *
 * element_type에 따라 적절한 컴포넌트를 동적으로 로드합니다.
 * Host/Participant에 따라 Results/Response 컴포넌트를 선택합니다.
 *
 * @example
 * // Host view
 * <ElementFactory
 *   element={activeElement}
 *   sessionId={sessionId}
 *   isHost={true}
 * />
 *
 * // Participant view
 * <ElementFactory
 *   element={activeElement}
 *   sessionId={sessionId}
 *   isHost={false}
 *   participantId={myParticipantId}
 * />
 */
export function ElementFactory({
  element,
  sessionId,
  isHost,
  participantId,
  userId,
  anonymousId,
  displayName,
  className,
}: ElementFactoryProps) {
  const elementType = element.element_type as ElementType;

  // Common props for response components
  const responseProps = {
    element,
    sessionId,
    participantId,
    userId,
    anonymousId,
    displayName,
    className,
  };

  // Common props for results components
  const resultsProps = {
    element,
    sessionId,
    showControls: true,
    className,
  };

  return (
    <Suspense fallback={<ElementLoading />}>
      {isHost ? (
        // Host views (Results)
        <>
          {elementType === 'poll' && <PollResults {...resultsProps} />}
          {elementType === 'quiz' && <QuizResults {...resultsProps} />}
          {elementType === 'word_cloud' && <WordCloudResults {...resultsProps} />}
          {!['poll', 'quiz', 'word_cloud'].includes(elementType) && (
            <UnknownElement elementType={elementType} />
          )}
        </>
      ) : (
        // Participant views (Response)
        <>
          {elementType === 'poll' && <PollResponse {...responseProps} />}
          {elementType === 'quiz' && <QuizResponse {...responseProps} />}
          {elementType === 'word_cloud' && <WordCloudResponse {...responseProps} />}
          {!['poll', 'quiz', 'word_cloud'].includes(elementType) && (
            <UnknownElement elementType={elementType} />
          )}
        </>
      )}
    </Suspense>
  );
}

export default ElementFactory;
