'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  ThumbsUp,
  Check,
  Star,
  Trash2,
  MessageSquare,
  ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Q&A 질문 타입
 */
export interface QAQuestion {
  id: string;
  sessionId: string;
  participantId?: string;
  authorName: string;
  body: string;
  likeCount: number;
  isHighlighted: boolean;
  isAnswered: boolean;
  hasLiked?: boolean; // 현재 사용자가 좋아요 했는지
  createdAt: string;
}

export interface QAPanelProps {
  questions: QAQuestion[];
  isHost: boolean;
  participantId?: string;
  participantName?: string;
  disabled?: boolean;
  onSubmitQuestion?: (body: string) => void;
  onLikeQuestion?: (questionId: string) => void;
  onHighlightQuestion?: (questionId: string, highlighted: boolean) => void;
  onMarkAnswered?: (questionId: string, answered: boolean) => void;
  onDeleteQuestion?: (questionId: string) => void;
  className?: string;
}

type SortOrder = 'likes' | 'newest';

/**
 * Q&A 패널 컴포넌트
 * - 질문 목록 표시 (좋아요순/최신순)
 * - 질문 제출 (참여자)
 * - 좋아요 기능
 * - 호스트 관리 (하이라이트, 답변완료, 삭제)
 */
export function QAPanel({
  questions,
  isHost,
  participantId,
  participantName = '익명',
  disabled = false,
  onSubmitQuestion,
  onLikeQuestion,
  onHighlightQuestion,
  onMarkAnswered,
  onDeleteQuestion,
  className = '',
}: QAPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('likes');

  // 정렬된 질문 목록
  const sortedQuestions = useMemo(() => {
    const sorted = [...questions];
    if (sortOrder === 'likes') {
      sorted.sort((a, b) => b.likeCount - a.likeCount);
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // 하이라이트된 질문을 맨 위로
    return sorted.sort((a, b) => {
      if (a.isHighlighted && !b.isHighlighted) return -1;
      if (!a.isHighlighted && b.isHighlighted) return 1;
      return 0;
    });
  }, [questions, sortOrder]);

  // 질문 제출
  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || disabled) return;
    onSubmitQuestion?.(inputValue.trim());
    setInputValue('');
  }, [inputValue, disabled, onSubmitQuestion]);

  // 정렬 토글
  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'likes' ? 'newest' : 'likes'));
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">Q&A</span>
          <Badge variant="secondary" className="text-xs">
            {questions.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSortOrder}
          className="text-xs"
        >
          <ArrowUpDown className="w-3 h-3 mr-1" />
          {sortOrder === 'likes' ? '인기순' : '최신순'}
        </Button>
      </div>

      {/* Question List */}
      <div className="flex-1 overflow-y-auto py-3">
        <AnimatePresence mode="popLayout">
          {sortedQuestions.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              아직 질문이 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {sortedQuestions.map((question) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  isHost={isHost}
                  canLike={!isHost && question.participantId !== participantId}
                  onLike={() => onLikeQuestion?.(question.id)}
                  onHighlight={(h) => onHighlightQuestion?.(question.id, h)}
                  onMarkAnswered={(a) => onMarkAnswered?.(question.id, a)}
                  onDelete={() => onDeleteQuestion?.(question.id)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Input (participants only) */}
      {!isHost && (
        <div className="pt-3 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="질문을 입력하세요..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={disabled}
              className="text-sm"
            />
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || disabled}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 개별 질문 아이템
 */
interface QuestionItemProps {
  question: QAQuestion;
  isHost: boolean;
  canLike: boolean;
  onLike: () => void;
  onHighlight: (highlighted: boolean) => void;
  onMarkAnswered: (answered: boolean) => void;
  onDelete: () => void;
}

function QuestionItem({
  question,
  isHost,
  canLike,
  onLike,
  onHighlight,
  onMarkAnswered,
  onDelete,
}: QuestionItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        p-3 rounded-lg border transition-colors
        ${question.isHighlighted
          ? 'bg-yellow-50 border-yellow-200'
          : question.isAnswered
            ? 'bg-green-50 border-green-200 opacity-60'
            : 'bg-white border-gray-200'
        }
      `}
    >
      {/* Question body */}
      <p className={`text-sm ${question.isAnswered ? 'line-through' : ''}`}>
        {question.body}
      </p>

      {/* Meta & Actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{question.authorName}</span>
          {question.isHighlighted && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              <Star className="w-3 h-3 mr-1 fill-yellow-400" />
              하이라이트
            </Badge>
          )}
          {question.isAnswered && (
            <Badge variant="outline" className="text-green-600 border-green-300">
              <Check className="w-3 h-3 mr-1" />
              답변완료
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Like button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            disabled={!canLike}
            className={`h-7 px-2 ${question.hasLiked ? 'text-blue-600' : ''}`}
          >
            <ThumbsUp className={`w-3 h-3 mr-1 ${question.hasLiked ? 'fill-blue-600' : ''}`} />
            {question.likeCount}
          </Button>

          {/* Host controls */}
          {isHost && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHighlight(!question.isHighlighted)}
                className={`h-7 w-7 p-0 ${question.isHighlighted ? 'text-yellow-600' : ''}`}
                title={question.isHighlighted ? '하이라이트 해제' : '하이라이트'}
              >
                <Star className={`w-3 h-3 ${question.isHighlighted ? 'fill-yellow-400' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAnswered(!question.isAnswered)}
                className={`h-7 w-7 p-0 ${question.isAnswered ? 'text-green-600' : ''}`}
                title={question.isAnswered ? '답변완료 해제' : '답변완료'}
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                title="삭제"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default QAPanel;
