'use client';

/**
 * LadderMode - 사다리 타기 게임 모드
 * ladder-game 앱의 핵심 기능을 random-picker에 통합
 *
 * 기능:
 * - 참여자와 결과 매칭
 * - Canvas 기반 사다리 렌더링
 * - 애니메이션 경로 추적
 */

import { useState, useRef } from 'react';
import { useLadderStore } from '@/app/ladder-game/lib/store';
import { generateLadder, validateInput } from '@/app/ladder-game/lib/ladder/generator';
import { InputPanel } from '@/app/ladder-game/components/ladder-game/InputPanel';
import { LadderCanvas } from '@/app/ladder-game/components/ladder-game/LadderCanvas';
import { ControlPanel } from '@/app/ladder-game/components/ladder-game/ControlPanel';
import { ResultModal } from '@/app/ladder-game/components/ladder-game/ResultModal';
import { Card, CardContent } from '@/components/ui/card';

interface LadderModeProps {
  isSessionMode?: boolean;
  onBack?: () => void;
  isHost?: boolean;
}

export function LadderMode({
  isSessionMode = false,
  isHost = true,
}: LadderModeProps) {
  const {
    ladder,
    config,
    isAnimating,
    setParticipants,
    setResults,
    setLadder,
    setConfig,
    setIsAnimating,
    reset
  } = useLadderStore();

  const [participantInputs, setParticipantInputs] = useState<string[]>(['', '']);
  const [resultInputs, setResultInputs] = useState<string[]>(['', '']);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState({ participant: '', result: '' });
  const animationTriggerRef = useRef<{ index: number } | null>(null);

  const handleGenerateLadder = () => {
    const validation = validateInput({
      participants: participantInputs,
      results: resultInputs
    });

    if (!validation.valid) {
      alert(`입력 오류\n\n${validation.errors.join('\n')}`);
      return;
    }

    const newParticipants = participantInputs.map((name, i) => ({
      id: crypto.randomUUID(),
      name,
      order: i
    }));

    const newResults = resultInputs.map((label, i) => ({
      id: crypto.randomUUID(),
      label,
      order: i
    }));

    setParticipants(newParticipants);
    setResults(newResults);

    const newLadder = generateLadder(participantInputs.length, {
      density: config.density,
      minGap: 2,
      ensureAllConnected: true
    });

    setLadder(newLadder);
  };

  const handleReset = () => {
    reset();
    setParticipantInputs(['', '']);
    setResultInputs(['', '']);
    setShowResult(false);
    setCurrentResult({ participant: '', result: '' });
    animationTriggerRef.current = null;
  };

  const handleParticipantClick = (index: number) => {
    if (!ladder || isAnimating) return;

    setIsAnimating(true);
    animationTriggerRef.current = { index };
  };

  const handleAnimationComplete = (resultColumn: number) => {
    setIsAnimating(false);

    if (animationTriggerRef.current !== null) {
      const participantIndex = animationTriggerRef.current.index;
      setCurrentResult({
        participant: participantInputs[participantIndex],
        result: resultInputs[resultColumn]
      });
      setShowResult(true);
      animationTriggerRef.current = null;
    }
  };

  // 참여자 모드일 경우 읽기 전용 뷰
  if (isSessionMode && !isHost) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-2 border-purple-200 shadow-xl shadow-purple-100/50 bg-white overflow-hidden">
          <CardContent className="pt-6">
            <LadderCanvas
              ladder={ladder}
              participants={participantInputs}
              results={resultInputs}
              theme={config.theme}
              onParticipantClick={() => {}}
              onAnimationComplete={() => {}}
              animationTrigger={null}
            />
            <div className="mt-4 text-center text-gray-600">
              호스트가 사다리를 실행하면 결과를 함께 확인할 수 있습니다
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        {/* Left Panel */}
        <div className="space-y-4">
          <InputPanel
            participants={participantInputs}
            results={resultInputs}
            onParticipantsChange={setParticipantInputs}
            onResultsChange={setResultInputs}
            disabled={isAnimating}
          />

          <ControlPanel
            disabled={participantInputs.length < 2 || isAnimating}
            config={config}
            hasLadder={!!ladder}
            onStart={handleGenerateLadder}
            onReset={handleReset}
            onConfigChange={setConfig}
          />
        </div>

        {/* Ladder Display */}
        <Card className="border-2 border-purple-200 shadow-xl shadow-purple-100/50 bg-white overflow-hidden">
          <CardContent className="pt-6">
            <LadderCanvas
              ladder={ladder}
              participants={participantInputs}
              results={resultInputs}
              theme={config.theme}
              onParticipantClick={handleParticipantClick}
              onAnimationComplete={handleAnimationComplete}
              animationTrigger={animationTriggerRef.current}
            />
          </CardContent>
        </Card>
      </div>

      <ResultModal
        isOpen={showResult}
        participant={currentResult.participant}
        result={currentResult.result}
        onClose={() => setShowResult(false)}
      />
    </div>
  );
}
