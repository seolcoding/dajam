'use client';

import { Suspense } from 'react';
import type { SessionElement } from '@/types/database';
import { PollResponse } from './PollResponse';
import { QuizResponse } from './QuizResponse';
import { WordCloudResponse } from './WordCloudResponse';
import { BalanceGameResponse } from './BalanceGameResponse';
import { Loader2 } from 'lucide-react';

interface ResponseFactoryProps {
  element: SessionElement;
  participantId?: string;
  userId?: string;
  className?: string;
}

export function ElementResponseFactory({
  element,
  participantId,
  userId,
  className 
}: ResponseFactoryProps) {
  // Element Type Routing
  switch (element.element_type) {
    case 'poll':
      return (
        <PollResponse 
          element={element}
          participantId={participantId}
          userId={userId}
          className={className}
        />
      );
    
    case 'quiz':
      return (
        <QuizResponse 
          element={element}
          participantId={participantId}
          userId={userId}
          className={className}
        />
      );
      
    case 'word_cloud':
      return (
        <WordCloudResponse 
          element={element}
          participantId={participantId}
          userId={userId}
          className={className}
        />
      );

    case 'balance_game':
      return (
        <BalanceGameResponse 
          element={element}
          participantId={participantId}
          userId={userId}
          className={className}
        />
      );
      
    default:      return (
        <div className="p-4 border border-dashed rounded-lg text-center text-slate-500">
          지원하지 않는 요소 타입입니다: {element.element_type}
        </div>
      );
  }
}

function NotImplemented({ type }: { type: string }) {
  return (
    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-xl">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {type} 준비 중
      </h3>
      <p className="text-slate-500">
        이 기능은 아직 개발 중입니다. 잠시만 기다려주세요!
      </p>
    </div>
  );
}
