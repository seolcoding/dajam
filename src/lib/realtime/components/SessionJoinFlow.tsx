'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, Plus, ArrowRight, RefreshCw } from 'lucide-react';
import type { SessionJoinFlowProps } from '../types';
import { formatSessionCode, validateSessionCode } from '../utils';
import { useParticipantPersistence } from '../hooks/useParticipantPersistence';

/**
 * 세션 참여 플로우 공통 컴포넌트
 * 코드 입력 + 닉네임 입력 + 참여
 *
 * 세션 퍼시스턴스 지원:
 * - 마지막으로 사용한 닉네임 자동 채우기
 * - 이전에 참여한 세션 자동 재참여 옵션
 */
export function SessionJoinFlow({
  appType,
  onJoin,
  onCreateNew,
  onRejoin,
  title = '세션 참여',
  description = '코드를 입력하여 참여하세요',
  placeholder = '6자리 코드 입력',
  joinButtonText = '참여하기',
  createButtonText = '새로 만들기',
  initialCode,
}: SessionJoinFlowProps) {
  const [step, setStep] = useState<'code' | 'name' | 'rejoin'>('code');
  const [code, setCode] = useState(initialCode || '');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 세션 퍼시스턴스 훅
  const {
    participantId,
    isLoaded: isPersistenceLoaded,
    getSessionParticipation,
    getLastUsedName,
  } = useParticipantPersistence();

  // 마지막 사용한 닉네임 자동 채우기
  useEffect(() => {
    if (isPersistenceLoaded && !displayName) {
      const lastUsedName = getLastUsedName();
      if (lastUsedName) {
        setDisplayName(lastUsedName);
      }
    }
  }, [isPersistenceLoaded, displayName, getLastUsedName]);

  // 초기 코드가 있으면 세션 참여 여부 확인
  useEffect(() => {
    if (isPersistenceLoaded && initialCode) {
      const existingParticipation = getSessionParticipation(initialCode);
      if (existingParticipation && existingParticipation.appType === appType) {
        // 이미 참여한 세션 - 재참여 옵션 표시
        setStep('rejoin');
        setDisplayName(existingParticipation.displayName);
      }
    }
  }, [isPersistenceLoaded, initialCode, appType, getSessionParticipation]);

  const handleCodeChange = (value: string) => {
    const formatted = formatSessionCode(value).slice(0, 8);
    setCode(formatted);
    setError(null);
  };

  const handleCodeSubmit = () => {
    if (!validateSessionCode(code, code.length as 6 | 8)) {
      setError('올바른 코드를 입력해주세요');
      return;
    }

    // 기존 참여 정보 확인
    const existingParticipation = getSessionParticipation(code);
    if (existingParticipation && existingParticipation.appType === appType && onRejoin) {
      setStep('rejoin');
      setDisplayName(existingParticipation.displayName);
    } else {
      setStep('name');
    }
  };

  // 재참여 처리
  const handleRejoin = async () => {
    const existingParticipation = getSessionParticipation(code);
    if (!existingParticipation || !onRejoin) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await onRejoin(code, existingParticipation.participantRecordId);
      if (!success) {
        // 재참여 실패 시 새로 참여 시도
        setError('재참여에 실패했습니다. 새로 참여해주세요.');
        setStep('name');
      }
    } catch {
      setError('오류가 발생했습니다.');
      setStep('name');
    } finally {
      setIsLoading(false);
    }
  };

  // 새로 참여 (퍼시스턴스 ID 포함)
  const handleJoin = async () => {
    if (!displayName.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onJoin(code, displayName.trim(), participantId || undefined);
      if (!success) {
        setError('참여에 실패했습니다. 코드를 확인해주세요.');
        setStep('code');
      }
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 'code' && (
            <>
              {/* 코드 입력 */}
              <div className="space-y-2">
                <Label htmlFor="code">세션 코드</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder={placeholder}
                  className="text-center text-2xl font-mono tracking-widest uppercase"
                  maxLength={8}
                  autoComplete="off"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                onClick={handleCodeSubmit}
                disabled={code.length < 6}
                className="w-full"
                size="lg"
              >
                다음
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* 새로 만들기 버튼 */}
              {onCreateNew && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">또는</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={onCreateNew}
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createButtonText}
                  </Button>
                </>
              )}
            </>
          )}

          {step === 'rejoin' && (
            <>
              {/* 재참여 옵션 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-800">이전에 참여한 세션입니다</p>
                <p className="text-sm text-green-600 mt-1">
                  <span className="font-mono font-bold">{code}</span> · {displayName}
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                onClick={handleRejoin}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    재참여 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    이어서 참여하기
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setStep('name')}
                className="w-full"
                size="lg"
              >
                새로 참여하기
              </Button>
            </>
          )}

          {step === 'name' && (
            <>
              {/* 닉네임 입력 */}
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">세션 코드</p>
                <p className="text-xl font-mono font-bold text-blue-600">{code}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">닉네임</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setError(null);
                  }}
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                  autoComplete="off"
                />
                {isPersistenceLoaded && getLastUsedName() && displayName === getLastUsedName() && (
                  <p className="text-xs text-muted-foreground">이전에 사용한 닉네임입니다</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('code')}
                  className="flex-1"
                >
                  이전
                </Button>
                <Button
                  onClick={handleJoin}
                  disabled={isLoading || !displayName.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      참여 중...
                    </>
                  ) : (
                    joinButtonText
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
