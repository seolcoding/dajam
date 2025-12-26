'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  Settings2,
  Save,
  X,
  CheckCircle,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import type { SessionElement, Json } from '@/types/database';
import type {
  QuizElementConfig,
  QuizQuestion,
} from '@/lib/elements/types';

// ============================================
// Types
// ============================================

interface QuizEditorProps {
  element?: SessionElement;
  sessionId: string;
  onSave?: (element: SessionElement) => void;
  onCancel?: () => void;
  className?: string;
}

// ============================================
// Helper Functions
// ============================================

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyQuestion = (): QuizQuestion => ({
  id: generateId(),
  text: '',
  type: 'multiple_choice',
  options: ['', '', '', ''],
  correctAnswer: 0,
  points: 10,
  timeLimit: 30,
});

// ============================================
// Component
// ============================================

export function QuizEditor({
  element,
  sessionId,
  onSave,
  onCancel,
  className,
}: QuizEditorProps) {
  const isEditing = !!element;

  const { createElement, updateElement } = useSessionElements({
    sessionId,
  });

  // 폼 상태
  const [title, setTitle] = useState(element?.title || '');
  const [description, setDescription] = useState(element?.description || '');
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    (element?.config as unknown as QuizElementConfig)?.questions || [createEmptyQuestion()]
  );
  const [shuffleQuestions, setShuffleQuestions] = useState(
    (element?.config as unknown as QuizElementConfig)?.shuffleQuestions ?? false
  );
  const [shuffleOptions, setShuffleOptions] = useState(
    (element?.config as unknown as QuizElementConfig)?.shuffleOptions ?? false
  );
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(
    (element?.config as unknown as QuizElementConfig)?.showCorrectAnswer ?? true
  );
  const [showLeaderboard, setShowLeaderboard] = useState(
    (element?.config as unknown as QuizElementConfig)?.showLeaderboard ?? true
  );
  const [speedBonus, setSpeedBonus] = useState(
    (element?.config as unknown as QuizElementConfig)?.speedBonus ?? true
  );

  const [isSaving, setIsSaving] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const activeQuestion = questions[activeQuestionIndex];

  // ============================================
  // Question Handlers
  // ============================================

  const handleAddQuestion = useCallback(() => {
    const newQuestion = createEmptyQuestion();
    setQuestions((prev) => [...prev, newQuestion]);
    setActiveQuestionIndex(questions.length);
  }, [questions.length]);

  const handleRemoveQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (activeQuestionIndex >= questions.length - 1) {
      setActiveQuestionIndex(Math.max(0, questions.length - 2));
    }
  }, [activeQuestionIndex, questions.length]);

  const handleUpdateQuestion = useCallback((index: number, updates: Partial<QuizQuestion>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  }, []);

  const handleUpdateOption = useCallback((questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        const newOptions = [...(q.options || [])];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  }, []);

  const handleAddOption = useCallback((questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        return { ...q, options: [...(q.options || []), ''] };
      })
    );
  }, []);

  const handleRemoveOption = useCallback((questionIndex: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        const newOptions = (q.options || []).filter((_, oi) => oi !== optionIndex);
        // 정답 인덱스 조정
        let newCorrectAnswer = q.correctAnswer;
        if (typeof newCorrectAnswer === 'number') {
          if (optionIndex < newCorrectAnswer) {
            newCorrectAnswer = newCorrectAnswer - 1;
          } else if (optionIndex === newCorrectAnswer) {
            newCorrectAnswer = 0;
          }
        }
        return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
      })
    );
  }, []);

  // ============================================
  // Save Handler
  // ============================================

  const handleSave = async () => {
    // 유효성 검사
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    const validQuestions = questions.filter((q) => q.text.trim());
    if (validQuestions.length === 0) {
      alert('최소 1개의 문제가 필요합니다.');
      return;
    }

    setIsSaving(true);

    try {
      const config: QuizElementConfig = {
        questions: validQuestions,
        shuffleQuestions,
        shuffleOptions,
        showCorrectAnswer,
        showLeaderboard,
        speedBonus,
      };

      let savedElement: SessionElement | null = null;

      if (isEditing && element) {
        const success = await updateElement(element.id, {
          title,
          description: description || undefined,
          config: config as unknown as Json,
        });

        if (success) {
          savedElement = {
            ...element,
            title,
            description,
            config: config as unknown as Json,
          };
        }
      } else {
        savedElement = await createElement({
          session_id: sessionId,
          element_type: 'quiz',
          title,
          description: description || undefined,
          config: config as unknown as Json,
        });
      }

      if (savedElement) {
        onSave?.(savedElement);
      }
    } catch (error) {
      console.error('Failed to save quiz:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          {isEditing ? '퀴즈 수정' : '새 퀴즈 만들기'}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className="w-4 h-4 mr-1" />
            설정
          </Button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="quiz-title">퀴즈 제목 *</Label>
          <Input
            id="quiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: OX 퀴즈, 상식 테스트"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="quiz-description">설명 (선택)</Label>
          <Input
            id="quiz-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="퀴즈에 대한 간단한 설명"
            className="mt-1"
          />
        </div>
      </div>

      {/* Question List */}
      <div>
        <Label className="mb-2 block">문제 목록 ({questions.length}개)</Label>
        <div className="flex gap-2 flex-wrap mb-4">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setActiveQuestionIndex(index)}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all',
                activeQuestionIndex === index
                  ? 'bg-blue-500 text-white'
                  : q.text.trim()
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={handleAddQuestion}
            disabled={questions.length >= 20}
            className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Question Editor */}
      {activeQuestion && (
        <div className="border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">문제 {activeQuestionIndex + 1}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveQuestion(activeQuestionIndex)}
              disabled={questions.length <= 1}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Question Type */}
          <div>
            <Label>문제 유형</Label>
            <Select
              value={activeQuestion.type}
              onValueChange={(v) =>
                handleUpdateQuestion(activeQuestionIndex, { type: v as QuizQuestion['type'] })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">객관식</SelectItem>
                <SelectItem value="true_false">O/X</SelectItem>
                <SelectItem value="short_answer">주관식</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div>
            <Label>문제</Label>
            <Textarea
              value={activeQuestion.text}
              onChange={(e) =>
                handleUpdateQuestion(activeQuestionIndex, { text: e.target.value })
              }
              placeholder="문제를 입력하세요"
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Multiple Choice Options */}
          {activeQuestion.type === 'multiple_choice' && (
            <div>
              <Label className="mb-2 block">보기</Label>
              <div className="space-y-2">
                {(activeQuestion.options || []).map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateQuestion(activeQuestionIndex, { correctAnswer: optIndex })
                      }
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                        activeQuestion.correctAnswer === optIndex
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      )}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleUpdateOption(activeQuestionIndex, optIndex, e.target.value)
                      }
                      placeholder={`보기 ${optIndex + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(activeQuestionIndex, optIndex)}
                      disabled={(activeQuestion.options || []).length <= 2}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddOption(activeQuestionIndex)}
                disabled={(activeQuestion.options || []).length >= 6}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                보기 추가
              </Button>
            </div>
          )}

          {/* True/False */}
          {activeQuestion.type === 'true_false' && (
            <div>
              <Label className="mb-2 block">정답</Label>
              <div className="flex gap-4">
                {['O', 'X'].map((answer) => (
                  <button
                    key={answer}
                    onClick={() =>
                      handleUpdateQuestion(activeQuestionIndex, { correctAnswer: answer })
                    }
                    className={cn(
                      'flex-1 py-4 rounded-xl font-bold text-xl transition-all',
                      activeQuestion.correctAnswer === answer
                        ? answer === 'O'
                          ? 'bg-blue-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {answer}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Short Answer */}
          {activeQuestion.type === 'short_answer' && (
            <div>
              <Label>정답</Label>
              <Input
                value={activeQuestion.correctAnswer as string}
                onChange={(e) =>
                  handleUpdateQuestion(activeQuestionIndex, { correctAnswer: e.target.value })
                }
                placeholder="정답을 입력하세요"
                className="mt-1"
              />
            </div>
          )}

          {/* Points & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                배점
              </Label>
              <Input
                type="number"
                value={activeQuestion.points}
                onChange={(e) =>
                  handleUpdateQuestion(activeQuestionIndex, { points: parseInt(e.target.value) || 10 })
                }
                min={1}
                max={100}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                제한시간 (초)
              </Label>
              <Input
                type="number"
                value={activeQuestion.timeLimit || ''}
                onChange={(e) =>
                  handleUpdateQuestion(activeQuestionIndex, {
                    timeLimit: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="제한 없음"
                min={5}
                max={300}
                className="mt-1"
              />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <Label className="flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              해설 (선택)
            </Label>
            <Textarea
              value={activeQuestion.explanation || ''}
              onChange={(e) =>
                handleUpdateQuestion(activeQuestionIndex, { explanation: e.target.value })
              }
              placeholder="정답 공개 시 표시될 해설"
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 border-t pt-4"
          >
            <h4 className="font-medium text-gray-700">고급 설정</h4>

            <div className="flex items-center justify-between">
              <div>
                <Label>문제 순서 랜덤</Label>
                <p className="text-sm text-gray-500">참여자마다 다른 순서로 표시</p>
              </div>
              <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>보기 순서 랜덤</Label>
                <p className="text-sm text-gray-500">객관식 보기 순서 섞기</p>
              </div>
              <Switch checked={shuffleOptions} onCheckedChange={setShuffleOptions} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>정답 표시</Label>
                <p className="text-sm text-gray-500">정답 공개 시 정답 보여주기</p>
              </div>
              <Switch checked={showCorrectAnswer} onCheckedChange={setShowCorrectAnswer} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>리더보드 표시</Label>
                <p className="text-sm text-gray-500">실시간 순위 표시</p>
              </div>
              <Switch checked={showLeaderboard} onCheckedChange={setShowLeaderboard} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>스피드 보너스</Label>
                <p className="text-sm text-gray-500">빠른 정답에 추가 점수</p>
              </div>
              <Switch checked={speedBonus} onCheckedChange={setSpeedBonus} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isSaving || !title.trim() || questions.filter((q) => q.text.trim()).length === 0}
          className="flex-1"
        >
          {isSaving ? (
            '저장 중...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? '수정 완료' : '퀴즈 만들기'}
            </>
          )}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            취소
          </Button>
        )}
      </div>
    </div>
  );
}

export default QuizEditor;
