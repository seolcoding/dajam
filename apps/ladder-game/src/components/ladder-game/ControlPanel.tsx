/**
 * ControlPanel Component
 *
 * 사다리 생성/리셋 및 설정 제어
 */

import { Shuffle, RotateCcw, Settings } from 'lucide-react';
import {
  Button,
  Label,
  Slider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@mini-apps/ui';
import type { LadderConfig } from '../../lib/ladder/types';

interface ControlPanelProps {
  disabled: boolean;
  config: LadderConfig;
  hasLadder: boolean;
  onStart: () => void;
  onReset: () => void;
  onConfigChange: (config: Partial<LadderConfig>) => void;
}

export function ControlPanel({
  disabled,
  config,
  hasLadder,
  onStart,
  onReset,
  onConfigChange
}: ControlPanelProps) {
  return (
    <div className="space-y-3">
      {/* Main Action Button */}
      <Button
        onClick={onStart}
        disabled={disabled}
        size="lg"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg hover:shadow-xl transition-all text-base h-14"
      >
        <Shuffle className="w-5 h-5 mr-2" />
        {hasLadder ? '🔄 사다리 재생성' : '✨ 사다리 생성'}
      </Button>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        {hasLadder && (
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-semibold"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            초기화
          </Button>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-semibold"
            >
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 border-2 border-purple-200 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900">사다리 설정</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="font-semibold text-gray-700 mb-2 block">가로선 밀도</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[config.density]}
                      onValueChange={([value]) => onConfigChange({ density: value })}
                      min={0.3}
                      max={0.8}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold text-purple-600 w-12 text-right">
                      {Math.round(config.density * 100)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">테마</Label>
                  <Select
                    value={config.theme}
                    onValueChange={(value) => onConfigChange({ theme: value as typeof config.theme })}
                  >
                    <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">☀️ 밝은 테마</SelectItem>
                      <SelectItem value="dark">🌙 어두운 테마</SelectItem>
                      <SelectItem value="colorful">🌈 컬러풀 테마</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">결과 공개 방식</Label>
                  <Select
                    value={config.revealMode}
                    onValueChange={(value) => onConfigChange({ revealMode: value as typeof config.revealMode })}
                  >
                    <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">👆 수동 공개 (클릭)</SelectItem>
                      <SelectItem value="sequential">📊 순차 공개</SelectItem>
                      <SelectItem value="simultaneous">🎯 일괄 공개</SelectItem>
                      <SelectItem value="instant">⚡ 즉시 공개</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
