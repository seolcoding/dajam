'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import { WordCloudResponse } from '../elements/word-cloud/WordCloudResponse';
import { WordCloudResults } from '../elements/word-cloud/WordCloudResults';
import type { SessionElement } from '@/types/database';

export interface WordCloudSceneProps {
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
}

/**
 * WordCloudScene - V2 WordCloud Element를 사용하는 워드 클라우드 씬
 *
 * Phase 4 V2 아키텍처 통합:
 * - session_elements 테이블의 word_cloud 타입 element 사용
 * - element_responses 테이블로 단어 저장
 * - element_aggregates 테이블로 단어 빈도 집계
 */
export function WordCloudScene({
  sessionId,
  isHost,
  participantId,
  participantName,
}: WordCloudSceneProps) {
  // V2 Element 훅 사용
  const {
    elements,
    activeElement,
    isLoading,
    createElement,
  } = useSessionElements({
    sessionId,
  });

  // word_cloud 타입 element 찾기
  const wordCloudElement = activeElement?.element_type === 'word_cloud'
    ? activeElement
    : elements.find((e) => e.element_type === 'word_cloud');

  // 새 워드 클라우드 생성 (호스트)
  const handleCreateWordCloud = async () => {
    await createElement({
      session_id: sessionId,
      element_type: 'word_cloud',
      title: '워드 클라우드',
      config: {
        prompt: '한 단어로 표현해주세요',
        maxWordsPerPerson: 3,
        minLength: 1,
        maxLength: 20,
        caseSensitive: false,
        allowDuplicates: false,
      },
    });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  // WordCloud element가 없는 경우
  if (!wordCloudElement) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
        <CardContent className="text-center">
          <p className="text-4xl mb-4">☁️</p>
          <p className="text-xl font-semibold mb-2">워드 클라우드</p>
          <p className="text-muted-foreground mb-4">
            {isHost ? '워드 클라우드를 만들어 시작하세요' : '워드 클라우드가 시작되면 참여할 수 있습니다'}
          </p>
          {isHost && (
            <Button onClick={handleCreateWordCloud}>
              <PlusCircle className="w-4 h-4 mr-2" />
              워드 클라우드 만들기
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // 호스트: 결과/컨트롤 뷰
  if (isHost) {
    return (
      <div className="h-full flex flex-col p-4 bg-gradient-to-br from-green-50 to-teal-50">
        <WordCloudResults
          element={wordCloudElement}
          sessionId={sessionId}
          showControls={true}
          className="flex-1"
        />
      </div>
    );
  }

  // 참여자: 단어 입력 뷰
  return (
    <div className="h-full flex flex-col p-4 bg-gradient-to-br from-green-50 to-teal-50">
      <WordCloudResponse
        element={wordCloudElement}
        sessionId={sessionId}
        participantId={participantId}
        displayName={participantName}
        className="flex-1"
      />
    </div>
  );
}

export default WordCloudScene;
