import { useState } from 'react';
import type { Exercise as ExerciseType } from '@/content/chapters';
import type { GradingResult } from '@/lib/grading';
import { PromptEditor } from './PromptEditor';
import { ResponseViewer } from './ResponseViewer';
import { gradeExercise, needsLLMResponse } from '@/lib/grading';
import { streamCompletion, type Message } from '@/lib/llm';
import { updateExerciseProgress } from '@/lib/storage';

interface ExerciseProps {
  exercise: ExerciseType;
  chapterId: string;
  exerciseNumber: number;
  totalExercises: number;
}

export function Exercise({ exercise, chapterId, exerciseNumber, totalExercises }: ExerciseProps) {
  const [systemPrompt, setSystemPrompt] = useState(exercise.defaultSystemPrompt || '');
  const [userPrompt, setUserPrompt] = useState(exercise.defaultUserPrompt || '');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [visibleHints, setVisibleHints] = useState(0);

  const handleRun = async (sys: string, user: string) => {
    setIsLoading(true);
    setError(null);
    setResponse('');
    setResult(null);

    try {
      const messages: Message[] = [];
      if (sys.trim()) {
        messages.push({ role: 'system', content: sys });
      }
      messages.push({ role: 'user', content: user });

      await streamCompletion(messages, {
        onChunk: (chunk) => {
          setResponse((prev) => prev + chunk);
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // 응답이 필요한 경우 먼저 실행
    if (needsLLMResponse(exercise) && !response) {
      await handleRun(systemPrompt, userPrompt);
    }

    // 잠시 대기 후 채점 (응답 상태 업데이트 대기)
    setTimeout(() => {
      const input = exercise.systemPromptEditable ? systemPrompt : userPrompt;
      const gradingResult = gradeExercise(exercise, input, response);
      setResult(gradingResult);

      // 진행상황 저장
      updateExerciseProgress(chapterId, exercise.id, {
        completed: gradingResult.passed,
        bestScore: gradingResult.score,
        lastAttempt: new Date().toISOString(),
        userSolution: {
          systemPrompt,
          userPrompt,
        },
      });
    }, 100);
  };

  const revealNextHint = () => {
    if (visibleHints < exercise.hints.length) {
      setVisibleHints(visibleHints + 1);
    }
  };

  return (
    <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {exerciseNumber}
            </span>
            <h3 className="font-semibold text-neutral-900">{exercise.title}</h3>
          </div>
          <span className="text-xs text-neutral-500">
            {exerciseNumber} / {totalExercises}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        <p className="text-sm text-neutral-700">{exercise.description}</p>

        {/* Prompt Editor */}
        <PromptEditor
          systemPrompt={systemPrompt}
          userPrompt={userPrompt}
          systemPromptEditable={exercise.systemPromptEditable}
          userPromptEditable={exercise.userPromptEditable}
          onSystemPromptChange={setSystemPrompt}
          onUserPromptChange={setUserPrompt}
          onRun={handleRun}
          isLoading={isLoading}
        />

        {/* Response */}
        <ResponseViewer response={response} isLoading={isLoading} error={error} />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowHints(!showHints);
              if (!showHints && visibleHints === 0) {
                setVisibleHints(1);
              }
            }}
            className="flex-1 py-2 px-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              힌트
            </span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!systemPrompt.trim() && !userPrompt.trim())}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
              ${isLoading || (!systemPrompt.trim() && !userPrompt.trim())
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]'
              }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              제출
            </span>
          </button>
        </div>

        {/* Hints */}
        {showHints && exercise.hints.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
            <p className="text-xs font-medium text-amber-700">힌트:</p>
            {exercise.hints.slice(0, visibleHints).map((hint, idx) => (
              <p key={idx} className="text-sm text-amber-800">
                {idx + 1}. {hint}
              </p>
            ))}
            {visibleHints < exercise.hints.length && (
              <button
                onClick={revealNextHint}
                className="text-xs text-amber-600 hover:text-amber-800 underline"
              >
                다음 힌트 보기 ({visibleHints}/{exercise.hints.length})
              </button>
            )}
          </div>
        )}

        {/* Grading Result */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.passed
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {result.passed ? (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className={`font-bold ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
                점수: {result.score}/100
              </span>
            </div>
            <p className={`text-sm mb-3 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
              {result.feedback}
            </p>
            <div className="space-y-1">
              {result.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  {detail.passed ? (
                    <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={detail.passed ? 'text-green-700' : 'text-red-700'}>
                    {detail.feedback}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
