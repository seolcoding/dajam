'use client';

/**
 * 밸런스 게임 세션 생성 페이지
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Users, Play, Check } from 'lucide-react';
import { categoryMetadata } from '../../data/categories';
import { questionTemplates } from '../../data/templates';
import { useBalanceSession } from '../../hooks/useBalanceSession';
import type { Category, Question } from '../../types';

export default function CreateSessionPage() {
  const router = useRouter();
  const { createSession } = useBalanceSession({});

  const [hostName, setHostName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const questions = selectedCategory ? questionTemplates[selectedCategory] || [] : [];

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedQuestions([]);
  };

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  const handleCreate = async () => {
    if (!hostName.trim() || !selectedCategory || selectedQuestions.length < 2) return;

    setIsCreating(true);

    const code = await createSession({
      hostName: hostName.trim(),
      categoryId: selectedCategory,
      questionIds: selectedQuestions,
    });

    if (code) {
      router.push(`/balance-game/session/host/${code}`);
    } else {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/balance-game')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold">멀티플레이어 세션 만들기</h1>
            <p className="text-muted-foreground">참여자들과 함께 밸런스 게임을 즐겨보세요</p>
          </div>
        </div>

        {/* Host Name */}
        <Card>
          <CardHeader>
            <CardTitle>호스트 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="hostName">호스트 이름</Label>
              <Input
                id="hostName"
                placeholder="이름을 입력하세요"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                maxLength={20}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리 선택</CardTitle>
            <CardDescription>질문 카테고리를 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(Object.keys(categoryMetadata) as Category[]).map((category) => {
                const meta = categoryMetadata[category];
                const isSelected = selectedCategory === category;
                const questionCount = questionTemplates[category]?.length || 0;

                return (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-left
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="text-3xl mb-2">{meta.emoji}</div>
                    <div className="font-semibold">{meta.label}</div>
                    <div className="text-sm text-muted-foreground">{questionCount}개 질문</div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Question Selection */}
        {selectedCategory && questions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>질문 선택</CardTitle>
                  <CardDescription>
                    {selectedQuestions.length}개 선택됨 (최소 2개 필요)
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedQuestions.length === questions.length ? '전체 해제' : '전체 선택'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 max-h-80 overflow-y-auto">
                {questions.map((question: Question) => {
                  const isSelected = selectedQuestions.includes(question.id);

                  return (
                    <button
                      key={question.id}
                      onClick={() => handleQuestionToggle(question.id)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3
                        ${isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
                      `}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{question.title}</div>
                        <div className="text-sm text-muted-foreground">
                          A: {question.optionA} vs B: {question.optionB}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        <Button
          onClick={handleCreate}
          disabled={!hostName.trim() || !selectedCategory || selectedQuestions.length < 2 || isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            '생성 중...'
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              세션 만들기 ({selectedQuestions.length}개 질문)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
