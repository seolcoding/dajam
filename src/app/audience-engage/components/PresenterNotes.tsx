'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';

interface SlideNote {
  slideIndex: number;
  content: string;
}

interface PresenterNotesProps {
  currentSlideIndex: number;
  notes: SlideNote[];
  onNotesChange?: (notes: SlideNote[]) => void;
  isEditable?: boolean;
  className?: string;
}

/**
 * PresenterNotes - 발표자 노트 컴포넌트
 *
 * - 슬라이드별 노트 표시
 * - 호스트만 편집 가능
 * - 최소화/확장 가능
 */
export function PresenterNotes({
  currentSlideIndex,
  notes,
  onNotesChange,
  isEditable = true,
  className = '',
}: PresenterNotesProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // 현재 슬라이드의 노트 찾기
  const currentNote = notes.find((n) => n.slideIndex === currentSlideIndex);
  const currentContent = currentNote?.content || '';

  // 슬라이드 변경 시 편집 모드 취소
  useEffect(() => {
    setIsEditing(false);
  }, [currentSlideIndex]);

  // 편집 시작
  const handleStartEdit = useCallback(() => {
    setEditContent(currentContent);
    setIsEditing(true);
  }, [currentContent]);

  // 편집 저장
  const handleSaveEdit = useCallback(() => {
    if (!onNotesChange) return;

    const updatedNotes = notes.filter((n) => n.slideIndex !== currentSlideIndex);
    if (editContent.trim()) {
      updatedNotes.push({
        slideIndex: currentSlideIndex,
        content: editContent.trim(),
      });
    }
    updatedNotes.sort((a, b) => a.slideIndex - b.slideIndex);

    onNotesChange(updatedNotes);
    setIsEditing(false);
  }, [notes, currentSlideIndex, editContent, onNotesChange]);

  // 편집 취소
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent('');
  }, []);

  return (
    <Card className={`${className}`}>
      <CardHeader className="py-2 px-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            발표자 노트
            <span className="text-xs text-muted-foreground">
              (슬라이드 {currentSlideIndex + 1})
            </span>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-3">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                placeholder="이 슬라이드에 대한 노트를 입력하세요..."
                className="min-h-[100px] text-sm resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-1" />
                  취소
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="w-4 h-4 mr-1" />
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative group">
              {currentContent ? (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[60px] p-2 bg-muted/30 rounded-md">
                  {currentContent}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground/50 italic min-h-[60px] p-2 bg-muted/30 rounded-md flex items-center justify-center">
                  노트가 없습니다
                </div>
              )}

              {isEditable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleStartEdit}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default PresenterNotes;
