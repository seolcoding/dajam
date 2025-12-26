'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  GripVertical,
  Trash2,
  Edit2,
  Play,
  Pause,
  BarChart3,
  HelpCircle,
  Cloud,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import type { SessionElement } from '@/types/database';
import type { ElementType } from '@/lib/elements/types';

// Element type editors
import { PollEditor } from './poll/PollEditor';
import { QuizEditor } from './quiz/QuizEditor';
import { WordCloudEditor } from './word-cloud/WordCloudEditor';

// ============================================
// Types
// ============================================

interface ElementEditorProps {
  sessionId: string;
  className?: string;
}

interface ElementTypeOption {
  type: ElementType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'vote' | 'quiz' | 'collect' | 'game';
}

// ============================================
// Element Type Options
// ============================================

const ELEMENT_TYPES: ElementTypeOption[] = [
  {
    type: 'poll',
    label: '투표',
    description: '단일/복수 선택 투표',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'vote',
  },
  {
    type: 'quiz',
    label: '퀴즈',
    description: '객관식/OX 퀴즈',
    icon: <HelpCircle className="w-5 h-5" />,
    category: 'quiz',
  },
  {
    type: 'word_cloud',
    label: '워드클라우드',
    description: '단어 수집 및 시각화',
    icon: <Cloud className="w-5 h-5" />,
    category: 'collect',
  },
];

const CATEGORY_LABELS = {
  vote: '투표/설문',
  quiz: '퀴즈',
  collect: '수집',
  game: '게임',
};

// ============================================
// Element List Item
// ============================================

interface ElementListItemProps {
  element: SessionElement;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ElementListItem({
  element,
  isActive,
  onActivate,
  onEdit,
  onDelete,
}: ElementListItemProps) {
  const typeOption = ELEMENT_TYPES.find((t) => t.type === element.element_type);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-all',
        isActive
          ? 'bg-blue-100 border-2 border-blue-300'
          : 'bg-white border border-gray-200 hover:border-gray-300'
      )}
    >
      {/* Drag handle */}
      <div className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
        )}
      >
        {typeOption?.icon || <LayoutGrid className="w-5 h-5" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{element.title || '제목 없음'}</p>
        <p className="text-sm text-gray-500">
          {typeOption?.label || element.element_type}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onActivate}
          className="gap-1"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4" />
              활성
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              시작
            </>
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Component
// ============================================

export function ElementEditor({ sessionId, className }: ElementEditorProps) {
  const {
    elements,
    activeElement,
    createElement,
    updateElement,
    deleteElement,
    reorderElements,
    setActiveElement,
    isLoading,
  } = useSessionElements({ sessionId });

  const [isTypeSelectOpen, setIsTypeSelectOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ElementType | null>(null);
  const [editingElement, setEditingElement] = useState<SessionElement | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ============================================
  // Handlers
  // ============================================

  const handleSelectType = useCallback((type: ElementType) => {
    setSelectedType(type);
    setIsTypeSelectOpen(false);
  }, []);

  const handleSaveElement = useCallback((element: SessionElement) => {
    setSelectedType(null);
    setEditingElement(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setSelectedType(null);
    setEditingElement(null);
  }, []);

  const handleDeleteElement = useCallback(
    async (id: string) => {
      if (confirm('이 요소를 삭제하시겠습니까?')) {
        await deleteElement(id);
      }
    },
    [deleteElement]
  );

  const handleReorder = useCallback(
    async (reorderedElements: SessionElement[]) => {
      const ids = reorderedElements.map((e) => e.id);
      await reorderElements(ids);
    },
    [reorderElements]
  );

  const handleActivate = useCallback(
    async (elementId: string) => {
      if (activeElement?.id === elementId) {
        await setActiveElement(null);
      } else {
        await setActiveElement(elementId);
      }
    },
    [activeElement, setActiveElement]
  );

  // ============================================
  // Render Editor Dialog
  // ============================================

  const renderEditorDialog = () => {
    const type = selectedType || (editingElement?.element_type as ElementType);
    if (!type) return null;

    const editorProps = {
      element: editingElement || undefined,
      sessionId,
      onSave: handleSaveElement,
      onCancel: handleCancelEdit,
    };

    return (
      <Dialog open={!!type} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingElement ? '요소 수정' : '새 요소 만들기'}
            </DialogTitle>
          </DialogHeader>

          {type === 'poll' && <PollEditor {...editorProps} />}
          {type === 'quiz' && <QuizEditor {...editorProps} />}
          {type === 'word_cloud' && <WordCloudEditor {...editorProps} />}
        </DialogContent>
      </Dialog>
    );
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 font-bold text-lg"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
          요소 목록 ({elements.length})
        </button>

        <DropdownMenu open={isTypeSelectOpen} onOpenChange={setIsTypeSelectOpen}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              요소 추가
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
              const categoryTypes = ELEMENT_TYPES.filter(
                (t) => t.category === category
              );
              if (categoryTypes.length === 0) return null;

              return (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                    {label}
                  </div>
                  {categoryTypes.map((typeOption) => (
                    <DropdownMenuItem
                      key={typeOption.type}
                      onClick={() => handleSelectType(typeOption.type)}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {typeOption.icon}
                      </div>
                      <div>
                        <p className="font-medium">{typeOption.label}</p>
                        <p className="text-xs text-gray-500">
                          {typeOption.description}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Element List */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : elements.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <LayoutGrid className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">아직 요소가 없습니다</p>
                <Button
                  variant="outline"
                  onClick={() => setIsTypeSelectOpen(true)}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  첫 번째 요소 추가하기
                </Button>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={elements}
                onReorder={handleReorder}
                className="space-y-2"
              >
                {elements.map((element) => (
                  <Reorder.Item key={element.id} value={element}>
                    <ElementListItem
                      element={element}
                      isActive={activeElement?.id === element.id}
                      onActivate={() => handleActivate(element.id)}
                      onEdit={() => setEditingElement(element)}
                      onDelete={() => handleDeleteElement(element.id)}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Dialog */}
      {renderEditorDialog()}
    </div>
  );
}

export default ElementEditor;
