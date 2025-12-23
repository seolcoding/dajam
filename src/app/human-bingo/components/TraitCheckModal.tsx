'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, CheckCircle2 } from 'lucide-react';
import type { Trait } from '../types';

interface TraitCheckModalProps {
  trait: Trait;
  onConfirm: (checkedByName: string) => void;
  onCancel: () => void;
}

export function TraitCheckModal({ trait, onConfirm, onCancel }: TraitCheckModalProps) {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    if (!name.trim()) return;
    onConfirm(name.trim());
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border-4 border-purple-200 dark:border-purple-700"
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">특성 체크</h2>
          </div>

          {/* Trait display */}
          <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border-2 border-purple-200 dark:border-purple-700">
            <div className="text-center">
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                찾은 특성
              </div>
              <div className="text-xl font-bold">
                "{trait.text}"
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            이 특성을 가진 분의 이름을 입력해주세요
          </p>

          {/* Name input */}
          <div className="mb-6">
            <Label htmlFor="checkedBy" className="text-base mb-2">
              상대방 이름
            </Label>
            <Input
              id="checkedBy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김철수"
              maxLength={20}
              className="text-lg"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              size="lg"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!name.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              체크 완료
            </Button>
          </div>

          {/* Hint */}
          <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            💡 Tip: 정확한 이름을 입력하면 나중에 누구와 대화했는지 확인할 수 있어요
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
