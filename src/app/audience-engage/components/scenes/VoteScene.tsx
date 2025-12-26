'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import { PollResponse } from '../elements/poll/PollResponse';
import { PollResults } from '../elements/poll/PollResults';
import type { SessionElement } from '@/types/database';

export interface VoteSceneProps {
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
}

/**
 * VoteScene - V2 Poll Element를 사용하는 투표 씬
 *
 * Phase 4 V2 아키텍처 통합:
 * - session_elements 테이블의 poll 타입 element 사용
 * - element_responses 테이블로 투표 저장
 * - element_aggregates 테이블로 실시간 집계
 */
export function VoteScene({
  sessionId,
  isHost,
  participantId,
  participantName,
}: VoteSceneProps) {
  // V2 Element 훅 사용
  const {
    elements,
    activeElement,
    isLoading,
    createElement,
  } = useSessionElements({
    sessionId,
  });

  // poll 타입 element 찾기
  const pollElement = activeElement?.element_type === 'poll'
    ? activeElement
    : elements.find((e) => e.element_type === 'poll');

  // 새 투표 생성 (호스트)
  const handleCreatePoll = async () => {
    await createElement({
      session_id: sessionId,
      element_type: 'poll',
      title: '새 투표',
      config: {
        type: 'single',
        options: [
          { id: 'opt-1', text: '옵션 1' },
          { id: 'opt-2', text: '옵션 2' },
        ],
        allowAnonymous: true,
        showResultsLive: true,
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

  // Poll element가 없는 경우
  if (!pollElement) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-xl font-semibold mb-2">실시간 투표</p>
          <p className="text-muted-foreground mb-4">
            {isHost ? '투표를 만들어 시작하세요' : '투표가 시작되면 참여할 수 있습니다'}
          </p>
          {isHost && (
            <Button onClick={handleCreatePoll}>
              <PlusCircle className="w-4 h-4 mr-2" />
              투표 만들기
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // 호스트: 결과 뷰
  if (isHost) {
    return (
      <div className="h-full flex flex-col p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <PollResults
          element={pollElement}
          sessionId={sessionId}
          showControls={true}
          className="flex-1"
        />
      </div>
    );
  }

  // 참여자: 투표 뷰
  return (
    <div className="h-full flex flex-col p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <PollResponse
        element={pollElement}
        sessionId={sessionId}
        participantId={participantId}
        displayName={participantName}
        showResultsAfterVote={true}
        className="flex-1"
      />
    </div>
  );
}

export default VoteScene;
