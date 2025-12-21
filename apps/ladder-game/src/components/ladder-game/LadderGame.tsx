/**
 * LadderGame Component
 *
 * 사다리 타기 메인 컴포넌트
 */

import { useState, useRef } from 'react';
import { useLadderStore } from '../../lib/store';
import { generateLadder, validateInput } from '../../lib/ladder/generator';
import { InputPanel } from './InputPanel';
import { LadderCanvas } from './LadderCanvas';
import { ControlPanel } from './ControlPanel';
import { ResultModal } from './ResultModal';
import { Card, CardContent, toast } from '@mini-apps/ui';

export function LadderGame() {
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
      toast({
        title: '입력 오류',
        description: validation.errors.join('\n'),
        variant: 'destructive'
      });
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

    toast({
      title: '사다리 생성 완료',
      description: '참가자를 클릭하여 경로를 확인하세요'
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Header */}
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border-2 border-purple-200">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-2xl">🪜</span>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              사다리 타기
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-medium">
            공정한 랜덤 추첨을 위한 사다리 타기 게임 🎲
          </p>
        </div>

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
    </div>
  );
}
