'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export interface SessionCodeInputProps {
  /** 현재 코드 값 */
  value: string;
  /** 코드 변경 핸들러 */
  onChange: (code: string) => void;
  /** 코드 길이 (기본: 6) */
  length?: number;
  /** 세션 검증 상태 */
  validationStatus?: 'idle' | 'loading' | 'valid' | 'invalid';
  /** 검증된 세션 제목 (valid일 때 표시) */
  sessionTitle?: string;
  /** 에러 메시지 (invalid일 때 표시) */
  errorMessage?: string;
  /** 라벨 텍스트 */
  label?: string;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 6자리 세션 코드 입력 컴포넌트
 * 실시간 검증 상태 표시 지원
 */
export function SessionCodeInput({
  value,
  onChange,
  length = 6,
  validationStatus = 'idle',
  sessionTitle,
  errorMessage,
  label = '세션 코드',
  placeholder = 'ABC123',
  disabled = false,
}: SessionCodeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (newValue.length <= length) {
      onChange(newValue);
    }
  };

  const isComplete = value.length === length;

  return (
    <div className="space-y-2">
      <Label htmlFor="session-code">{label}</Label>
      <div className="relative">
        <Input
          id="session-code"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={length}
          className="text-center text-2xl tracking-[0.5em] font-mono uppercase pr-10"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck="false"
        />

        {/* 상태 아이콘 */}
        {isComplete && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validationStatus === 'loading' && (
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            )}
            {validationStatus === 'valid' && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {validationStatus === 'invalid' && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* 검증 결과 메시지 */}
      {isComplete && validationStatus === 'loading' && (
        <p className="text-xs text-slate-500 text-center">
          세션 확인 중...
        </p>
      )}
      {isComplete && validationStatus === 'valid' && sessionTitle && (
        <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {sessionTitle}
        </p>
      )}
      {isComplete && validationStatus === 'invalid' && (
        <p className="text-xs text-red-500 text-center">
          {errorMessage || '세션을 찾을 수 없습니다'}
        </p>
      )}
    </div>
  );
}
