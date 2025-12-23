'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Answer, DimensionScore, PersonalityCode } from '../types';
import { MBTI_QUESTIONS } from '../data/questions';
import { getPersonalityType } from '../data/personalities';
import {
  calculatePersonalityType,
  calculateDimensionScores,
  saveTestResult,
  loadTestResult,
  clearTestResult
} from '../utils/calculator';
import TestQuestion from './TestQuestion';
import ResultCard from './ResultCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Play, Users } from 'lucide-react';

type ViewMode = 'home' | 'testing' | 'result';

export default function PersonalityTestApp() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<{
    code: PersonalityCode;
    scores: DimensionScore[];
  } | null>(null);

  // Load previous result on mount
  useEffect(() => {
    const savedResult = loadTestResult();
    if (savedResult) {
      setResult({
        code: savedResult.code,
        scores: savedResult.scores,
      });
    }
  }, []);

  const handleStartTest = () => {
    setViewMode('testing');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    clearTestResult();
  };

  const handleAnswer = (direction: 'left' | 'right') => {
    const currentQuestion = MBTI_QUESTIONS[currentQuestionIndex];

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      dimension: currentQuestion.dimension,
      direction,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    // Check if test is complete
    if (currentQuestionIndex === MBTI_QUESTIONS.length - 1) {
      // Calculate result
      const personalityCode = calculatePersonalityType(newAnswers);
      const dimensionScores = calculateDimensionScores(newAnswers);

      const testResult = {
        code: personalityCode,
        scores: dimensionScores,
      };

      setResult(testResult);
      saveTestResult(personalityCode, dimensionScores);
      setViewMode('result');
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleRetakeTest = () => {
    handleStartTest();
  };

  const handleGoHome = () => {
    setViewMode('home');
  };

  const handleGoToMultiplayer = () => {
    router.push('/personality-test/session/create');
  };

  // Home View
  if (viewMode === 'home') {
    const savedResult = result ? getPersonalityType(result.code) : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              성격 유형 테스트
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              나는 어떤 유형일까?
            </p>
            <p className="text-gray-500">
              16문항 • 5분 소요 • MBTI 스타일
            </p>
          </div>

          {/* Previous Result */}
          {savedResult && (
            <Card className="mb-8 p-8 bg-white shadow-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">이전 테스트 결과</p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-6xl">{savedResult.emoji}</span>
                  <div className="text-left">
                    <p className="text-3xl font-black text-gray-900">
                      {savedResult.code}
                    </p>
                    <p className="text-lg text-gray-700">
                      {savedResult.name}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setViewMode('result')}
                  variant="outline"
                  className="mt-2"
                >
                  결과 다시 보기
                </Button>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleStartTest}
              size="lg"
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl"
            >
              <Play className="w-6 h-6 mr-2" />
              {savedResult ? '테스트 다시 하기' : '테스트 시작하기'}
            </Button>

            <Button
              onClick={handleGoToMultiplayer}
              size="lg"
              variant="outline"
              className="w-full h-16 text-xl font-bold border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Users className="w-6 h-6 mr-2" />
              그룹으로 함께하기
            </Button>
          </div>

          {/* Info Cards */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">빠른 테스트</h3>
              <p className="text-sm text-gray-600">
                16문항으로 5분 내 완료
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">정확한 분석</h3>
              <p className="text-sm text-gray-600">
                MBTI 기반 16가지 유형
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-gray-900 mb-2">SNS 공유</h3>
              <p className="text-sm text-gray-600">
                결과 이미지 저장 및 공유
              </p>
            </Card>
          </div>

          {/* Description */}
          <Card className="mt-8 p-8 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              성격 유형 테스트란?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              성격 유형 테스트는 MBTI(Myers-Briggs Type Indicator) 스타일의 심리 검사로,
              4가지 차원(에너지 방향, 인식 기능, 판단 기능, 생활 양식)을 측정하여
              총 16가지 성격 유형 중 하나로 분류합니다.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">E/I:</span>
                <span>외향형 vs 내향형 (에너지 방향)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">S/N:</span>
                <span>감각형 vs 직관형 (인식 기능)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">T/F:</span>
                <span>사고형 vs 감정형 (판단 기능)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">J/P:</span>
                <span>판단형 vs 인식형 (생활 양식)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Testing View
  if (viewMode === 'testing') {
    const currentQuestion = MBTI_QUESTIONS[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleGoHome}
            className="mb-6 hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            처음으로
          </Button>

          {/* Question */}
          <TestQuestion
            question={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={MBTI_QUESTIONS.length}
            onAnswer={handleAnswer}
          />
        </div>
      </div>
    );
  }

  // Result View
  if (viewMode === 'result' && result) {
    const personalityType = getPersonalityType(result.code);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={handleGoHome}
              className="hover:bg-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              처음으로
            </Button>
            <Button
              onClick={handleRetakeTest}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              다시 테스트
            </Button>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              당신의 성격 유형
            </h1>
            <p className="text-gray-600">
              당신은 {personalityType.name}입니다
            </p>
          </div>

          {/* Result Card */}
          <ResultCard
            personalityType={personalityType}
            scores={result.scores}
          />

          {/* Multiplayer CTA */}
          <Card className="mt-8 p-8 text-center bg-gradient-to-r from-purple-100 to-pink-100 border-0">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              친구들과 함께 해보세요!
            </h3>
            <p className="text-gray-700 mb-6">
              그룹 세션을 만들어 친구들의 성격 유형을 비교해보세요
            </p>
            <Button
              onClick={handleGoToMultiplayer}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Users className="w-5 h-5 mr-2" />
              그룹 세션 만들기
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
