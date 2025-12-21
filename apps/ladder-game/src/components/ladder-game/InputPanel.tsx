/**
 * InputPanel Component
 *
 * 참가자 및 결과 입력 패널
 */

import { Plus, X, Users, Trophy } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@mini-apps/ui';
import { motion, AnimatePresence } from 'framer-motion';

interface InputPanelProps {
  participants: string[];
  results: string[];
  onParticipantsChange: (participants: string[]) => void;
  onResultsChange: (results: string[]) => void;
  maxCount?: number;
  minCount?: number;
  disabled?: boolean;
}

export function InputPanel({
  participants,
  results,
  onParticipantsChange,
  onResultsChange,
  maxCount = 8,
  minCount = 2,
  disabled = false
}: InputPanelProps) {
  const handleParticipantChange = (index: number, value: string) => {
    const updated = [...participants];
    updated[index] = value;
    onParticipantsChange(updated);
  };

  const handleResultChange = (index: number, value: string) => {
    const updated = [...results];
    updated[index] = value;
    onResultsChange(updated);
  };

  const addParticipant = () => {
    if (participants.length < maxCount) {
      const updated = [...participants, ''];
      onParticipantsChange(updated);

      const updatedResults = [...results, ''];
      onResultsChange(updatedResults);
    }
  };

  const removeParticipant = (index: number) => {
    if (participants.length > minCount) {
      const updatedParticipants = participants.filter((_, i) => i !== index);
      onParticipantsChange(updatedParticipants);

      const updatedResults = results.filter((_, i) => i !== index);
      onResultsChange(updatedResults);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-emerald-200 shadow-lg shadow-emerald-100/50 bg-gradient-to-br from-white to-emerald-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900">참가자</div>
              <div className="text-sm font-normal text-emerald-600">{participants.length}명 참여</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {participants.map((participant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -100 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {index + 1}
                    </div>
                    <Input
                      placeholder={`참가자 이름`}
                      value={participant}
                      onChange={(e) => handleParticipantChange(index, e.target.value)}
                      disabled={disabled}
                      maxLength={10}
                      className="pl-11 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 font-semibold"
                    />
                  </div>
                  {participants.length > minCount && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeParticipant(index)}
                      disabled={disabled}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              variant="outline"
              onClick={addParticipant}
              disabled={disabled || participants.length >= maxCount}
              className="w-full border-2 border-dashed border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              참가자 추가
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-amber-200 shadow-lg shadow-amber-100/50 bg-gradient-to-br from-white to-amber-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900">결과</div>
              <div className="text-sm font-normal text-amber-600">{results.length}개의 선택지</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -100 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <Input
                    placeholder={`결과 선택지`}
                    value={result}
                    onChange={(e) => handleResultChange(index, e.target.value)}
                    disabled={disabled}
                    maxLength={10}
                    className="pl-11 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 font-semibold"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
        💡 {minCount}~{maxCount}명까지 참여 가능합니다
      </div>
    </div>
  );
}
