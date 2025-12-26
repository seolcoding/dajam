'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Save, X, MessageSquare, Hash, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import type { SessionElement, Json } from '@/types/database';
import type { WordCloudElementConfig } from '@/lib/elements/types';

// ============================================
// Types
// ============================================

interface WordCloudEditorProps {
  element?: SessionElement;
  sessionId: string;
  onSave?: (element: SessionElement) => void;
  onCancel?: () => void;
  className?: string;
}

// ============================================
// Component
// ============================================

export function WordCloudEditor({
  element,
  sessionId,
  onSave,
  onCancel,
  className,
}: WordCloudEditorProps) {
  const isEditing = !!element;

  const { createElement, updateElement } = useSessionElements({
    sessionId,
  });

  // 폼 상태
  const [title, setTitle] = useState(element?.title || '');
  const [description, setDescription] = useState(element?.description || '');
  const [prompt, setPrompt] = useState(
    (element?.config as unknown as WordCloudElementConfig)?.prompt || '한 단어로 표현해주세요'
  );
  const [maxWords, setMaxWords] = useState(
    (element?.config as unknown as WordCloudElementConfig)?.maxWords ?? 200
  );
  const [maxWordsPerPerson, setMaxWordsPerPerson] = useState(
    (element?.config as unknown as WordCloudElementConfig)?.maxWordsPerPerson ?? 3
  );
  const [minLength, setMinLength] = useState(
    (element?.config as unknown as WordCloudElementConfig)?.minLength ?? 1
  );
  const [maxLength, setMaxLength] = useState(
    (element?.config as unknown as WordCloudElementConfig)?.maxLength ?? 20
  );
  const [allowDuplicates, setAllowDuplicates] = useState(
    (element?.config as unknown as WordCloudElementConfig)?.allowDuplicates ?? true
  );
  const [profanityFilter, setProfanityFilter] = useState(
    (element?.config as unknown as WordCloudElementConfig)?.profanityFilter ?? true
  );
  const [caseSensitive, setCaseSensitive] = useState(
    (element?.config as unknown as WordCloudElementConfig)?.caseSensitive ?? false
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ============================================
  // Save Handler
  // ============================================

  const handleSave = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!prompt.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      const config: WordCloudElementConfig = {
        prompt,
        maxWords,
        maxWordsPerPerson,
        minLength,
        maxLength,
        allowDuplicates,
        profanityFilter,
        caseSensitive,
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
          element_type: 'word_cloud',
          title,
          description: description || undefined,
          config: config as unknown as Json,
        });
      }

      if (savedElement) {
        onSave?.(savedElement);
      }
    } catch (error) {
      console.error('Failed to save word cloud:', error);
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
          {isEditing ? '워드클라우드 수정' : '새 워드클라우드 만들기'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings2 className="w-4 h-4 mr-1" />
          설정
        </Button>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="wc-title">제목 *</Label>
        <Input
          id="wc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 오늘의 기분"
          className="mt-1"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="wc-description">설명 (선택)</Label>
        <Input
          id="wc-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="추가 안내 사항"
          className="mt-1"
        />
      </div>

      {/* Prompt */}
      <div>
        <Label htmlFor="wc-prompt" className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          질문 *
        </Label>
        <Textarea
          id="wc-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="참여자에게 보여질 질문을 입력하세요"
          className="mt-1"
          rows={2}
        />
      </div>

      {/* Basic Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="wc-max-per-person" className="flex items-center gap-1">
            <Hash className="w-4 h-4" />
            1인당 최대 단어 수
          </Label>
          <Input
            id="wc-max-per-person"
            type="number"
            value={maxWordsPerPerson}
            onChange={(e) => setMaxWordsPerPerson(parseInt(e.target.value) || 1)}
            min={1}
            max={10}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="wc-max-total">총 최대 단어 수</Label>
          <Input
            id="wc-max-total"
            type="number"
            value={maxWords}
            onChange={(e) => setMaxWords(parseInt(e.target.value) || 100)}
            min={10}
            max={1000}
            className="mt-1"
          />
        </div>
      </div>

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

            {/* Length Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wc-min-length">최소 글자 수</Label>
                <Input
                  id="wc-min-length"
                  type="number"
                  value={minLength}
                  onChange={(e) => setMinLength(parseInt(e.target.value) || 1)}
                  min={1}
                  max={maxLength}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="wc-max-length">최대 글자 수</Label>
                <Input
                  id="wc-max-length"
                  type="number"
                  value={maxLength}
                  onChange={(e) => setMaxLength(parseInt(e.target.value) || 20)}
                  min={minLength}
                  max={50}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between">
              <div>
                <Label>중복 단어 허용</Label>
                <p className="text-sm text-gray-500">같은 단어를 여러 번 제출 가능</p>
              </div>
              <Switch checked={allowDuplicates} onCheckedChange={setAllowDuplicates} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  비속어 필터
                </Label>
                <p className="text-sm text-gray-500">부적절한 단어 자동 차단</p>
              </div>
              <Switch checked={profanityFilter} onCheckedChange={setProfanityFilter} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>대소문자 구분</Label>
                <p className="text-sm text-gray-500">Hello와 hello를 다른 단어로 처리</p>
              </div>
              <Switch checked={caseSensitive} onCheckedChange={setCaseSensitive} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-500 mb-2">미리보기</p>
        <div className="bg-white rounded-lg p-4 text-center border">
          <p className="text-lg font-medium mb-2">{prompt || '질문을 입력하세요'}</p>
          <p className="text-sm text-gray-400">
            최대 {maxWordsPerPerson}개의 단어를 제출할 수 있습니다
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isSaving || !title.trim() || !prompt.trim()}
          className="flex-1"
        >
          {isSaving ? (
            '저장 중...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? '수정 완료' : '워드클라우드 만들기'}
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

export default WordCloudEditor;
