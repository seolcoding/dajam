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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  PollElementConfig,
  PollOption,
  DEFAULT_POLL_CONFIG,
  DEFAULT_POLL_STATE,
} from '@/lib/elements/types';

// ============================================
// Types
// ============================================

interface PollEditorProps {
  /** 기존 요소 수정 시 전달 */
  element?: SessionElement;
  sessionId: string;
  /** 저장 완료 콜백 */
  onSave?: (element: SessionElement) => void;
  /** 취소 콜백 */
  onCancel?: () => void;
  className?: string;
}

// ============================================
// Helper Functions
// ============================================

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyOption = (): PollOption => ({
  id: generateId(),
  text: '',
});

// ============================================
// Component
// ============================================

export function PollEditor({
  element,
  sessionId,
  onSave,
  onCancel,
  className,
}: PollEditorProps) {
  const isEditing = !!element;

  // Element 훅
  const { createElement, updateElement } = useSessionElements({
    sessionId,
  });

  // 폼 상태
  const existingConfig = element?.config as unknown as PollElementConfig | undefined;
  const [title, setTitle] = useState(element?.title || '');
  const [description, setDescription] = useState(element?.description || '');
  const [pollType, setPollType] = useState<'single' | 'multiple' | 'ranking'>(
    existingConfig?.type || 'single'
  );
  const [options, setOptions] = useState<PollOption[]>(
    existingConfig?.options || [
      { id: generateId(), text: '옵션 1' },
      { id: generateId(), text: '옵션 2' },
    ]
  );
  const [allowAnonymous, setAllowAnonymous] = useState(
    existingConfig?.allowAnonymous ?? true
  );
  const [showResultsLive, setShowResultsLive] = useState(
    existingConfig?.showResultsLive ?? true
  );
  const [maxSelections, setMaxSelections] = useState<number | undefined>(
    existingConfig?.maxSelections
  );
  const [timeLimit, setTimeLimit] = useState<number | undefined>(
    existingConfig?.timeLimit
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ============================================
  // Option Handlers
  // ============================================

  const handleAddOption = useCallback(() => {
    setOptions((prev) => [...prev, createEmptyOption()]);
  }, []);

  const handleRemoveOption = useCallback((id: string) => {
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
  }, []);

  const handleUpdateOption = useCallback((id: string, text: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    );
  }, []);

  const handleReorderOptions = useCallback((newOrder: PollOption[]) => {
    setOptions(newOrder);
  }, []);

  // ============================================
  // Save Handler
  // ============================================

  const handleSave = async () => {
    // 유효성 검사
    const validOptions = options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      alert('최소 2개의 옵션이 필요합니다.');
      return;
    }

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      const config: PollElementConfig = {
        type: pollType,
        options: validOptions,
        allowAnonymous,
        showResultsLive,
        maxSelections: pollType === 'multiple' ? maxSelections : undefined,
        timeLimit,
      };

      let savedElement: SessionElement | null = null;

      if (isEditing && element) {
        // 기존 요소 수정
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
        // 새 요소 생성
        savedElement = await createElement({
          session_id: sessionId,
          element_type: 'poll',
          title,
          description: description || undefined,
          config: config as unknown as Json,
        });
      }

      if (savedElement) {
        onSave?.(savedElement);
      }
    } catch (error) {
      console.error('Failed to save poll:', error);
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
          {isEditing ? '투표 수정' : '새 투표 만들기'}
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
          <Label htmlFor="poll-title">제목 *</Label>
          <Input
            id="poll-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="투표 질문을 입력하세요"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="poll-description">설명 (선택)</Label>
          <Input
            id="poll-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="추가 설명이 있다면 입력하세요"
            className="mt-1"
          />
        </div>
      </div>

      {/* Poll Type */}
      <div>
        <Label>투표 유형</Label>
        <Select value={pollType} onValueChange={(v) => setPollType(v as typeof pollType)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">단일 선택</SelectItem>
            <SelectItem value="multiple">복수 선택</SelectItem>
            <SelectItem value="ranking">순위 투표</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Options */}
      <div>
        <Label className="mb-2 block">투표 옵션</Label>
        <Reorder.Group
          axis="y"
          values={options}
          onReorder={handleReorderOptions}
          className="space-y-2"
        >
          <AnimatePresence>
            {options.map((option, index) => (
              <Reorder.Item
                key={option.id}
                value={option}
                className="flex items-center gap-2"
              >
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 w-full"
                >
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={option.text}
                      onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                      placeholder={`옵션 ${index + 1}`}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(option.id)}
                    disabled={options.length <= 2}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        <Button
          variant="outline"
          onClick={handleAddOption}
          className="w-full mt-3"
          disabled={options.length >= 10}
        >
          <Plus className="w-4 h-4 mr-2" />
          옵션 추가
        </Button>
        {options.length >= 10 && (
          <p className="text-sm text-gray-500 mt-1">최대 10개까지 추가할 수 있습니다.</p>
        )}
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

            <div className="flex items-center justify-between">
              <div>
                <Label>익명 투표</Label>
                <p className="text-sm text-gray-500">참여자 이름을 숨깁니다</p>
              </div>
              <Switch
                checked={allowAnonymous}
                onCheckedChange={setAllowAnonymous}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>실시간 결과 공개</Label>
                <p className="text-sm text-gray-500">투표 중에도 결과를 보여줍니다</p>
              </div>
              <Switch
                checked={showResultsLive}
                onCheckedChange={setShowResultsLive}
              />
            </div>

            {pollType === 'multiple' && (
              <div>
                <Label>최대 선택 수</Label>
                <Input
                  type="number"
                  value={maxSelections || ''}
                  onChange={(e) =>
                    setMaxSelections(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="제한 없음"
                  min={1}
                  max={options.length}
                  className="mt-1 w-32"
                />
              </div>
            )}

            <div>
              <Label>제한 시간 (초)</Label>
              <Input
                type="number"
                value={timeLimit || ''}
                onChange={(e) =>
                  setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="제한 없음"
                min={10}
                max={3600}
                className="mt-1 w-32"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isSaving || !title.trim() || options.filter((o) => o.text.trim()).length < 2}
          className="flex-1"
        >
          {isSaving ? (
            '저장 중...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? '수정 완료' : '투표 만들기'}
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

export default PollEditor;
