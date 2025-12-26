'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionCodeInput } from './SessionCodeInput';
import { Monitor, Smartphone, Users, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MultiplayerEntryProps {
  /** 호스트 시작 핸들러 */
  onHostStart: (options?: { title?: string }) => void | Promise<void>;
  /** 참여자 참여 핸들러 */
  onParticipantJoin: (options: { code: string; name: string }) => void | Promise<void>;
  /** 세션 코드 검증 핸들러 (선택) */
  onValidateCode?: (code: string) => Promise<{ valid: boolean; title?: string }>;
  /** 호스트 탭 제목 */
  hostTabLabel?: string;
  /** 참여자 탭 제목 */
  participantTabLabel?: string;
  /** 호스트 카드 제목 */
  hostTitle?: string;
  /** 호스트 카드 설명 */
  hostDescription?: string;
  /** 참여자 카드 제목 */
  participantTitle?: string;
  /** 참여자 카드 설명 */
  participantDescription?: string;
  /** 호스트 시작 버튼 텍스트 */
  hostButtonText?: string;
  /** 참여자 시작 버튼 텍스트 */
  participantButtonText?: string;
  /** 세션 제목 입력 필요 여부 */
  requireSessionTitle?: boolean;
  /** 기능 소개 뱃지들 */
  featureBadges?: string[];
  /** 호스트 아이콘 */
  hostIcon?: LucideIcon;
  /** 참여자 아이콘 */
  participantIcon?: LucideIcon;
  /** 기본 탭 */
  defaultTab?: 'host' | 'participant';
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 멀티플레이어 앱용 엔트리 컴포넌트
 * 호스트/참여자 탭으로 역할 선택 UI 제공
 */
export function MultiplayerEntry({
  onHostStart,
  onParticipantJoin,
  onValidateCode,
  hostTabLabel = '호스트 (발표자)',
  participantTabLabel = '참여하기',
  hostTitle = '새 세션 만들기',
  hostDescription = '세션을 시작하고 참여자를 초대하세요',
  participantTitle = '세션 참여',
  participantDescription = '6자리 코드로 세션에 참여하세요',
  hostButtonText = '세션 시작하기',
  participantButtonText = '참여하기',
  requireSessionTitle = false,
  featureBadges,
  hostIcon: HostIcon = Monitor,
  participantIcon: ParticipantIcon = Smartphone,
  defaultTab = 'host',
  isLoading = false,
  className = '',
}: MultiplayerEntryProps) {
  // Host form state
  const [sessionTitle, setSessionTitle] = useState('');
  const [isHostLoading, setIsHostLoading] = useState(false);

  // Participant form state
  const [sessionCode, setSessionCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [validatedTitle, setValidatedTitle] = useState<string>();

  // 세션 코드 변경 시 검증
  const handleCodeChange = async (code: string) => {
    setSessionCode(code);
    setValidationStatus('idle');
    setValidatedTitle(undefined);

    if (code.length === 6 && onValidateCode) {
      setValidationStatus('loading');
      try {
        const result = await onValidateCode(code);
        setValidationStatus(result.valid ? 'valid' : 'invalid');
        if (result.valid && result.title) {
          setValidatedTitle(result.title);
        }
      } catch {
        setValidationStatus('invalid');
      }
    }
  };

  // 호스트 시작
  const handleHostStart = async () => {
    if (requireSessionTitle && !sessionTitle.trim()) {
      return;
    }

    setIsHostLoading(true);
    try {
      await onHostStart({ title: sessionTitle.trim() || undefined });
    } finally {
      setIsHostLoading(false);
    }
  };

  // 참여자 참여
  const handleParticipantJoin = async () => {
    if (sessionCode.length !== 6 || !participantName.trim()) {
      return;
    }

    setIsJoinLoading(true);
    try {
      await onParticipantJoin({
        code: sessionCode,
        name: participantName.trim(),
      });
    } finally {
      setIsJoinLoading(false);
    }
  };

  const hostDisabled = isLoading || isHostLoading || (requireSessionTitle && !sessionTitle.trim());
  const participantDisabled = isLoading || isJoinLoading || sessionCode.length !== 6 || !participantName.trim();

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="host" className="flex items-center gap-2">
            <HostIcon className="w-4 h-4" />
            {hostTabLabel}
          </TabsTrigger>
          <TabsTrigger value="participant" className="flex items-center gap-2">
            <ParticipantIcon className="w-4 h-4" />
            {participantTabLabel}
          </TabsTrigger>
        </TabsList>

        {/* 호스트 탭 */}
        <TabsContent value="host">
          <Card className="border-2 border-dajaem-green/20">
            <CardHeader>
              <CardTitle>{hostTitle}</CardTitle>
              <CardDescription>{hostDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requireSessionTitle && (
                <div className="space-y-2">
                  <Label htmlFor="session-title">세션 제목</Label>
                  <Input
                    id="session-title"
                    type="text"
                    placeholder="예: 2024년 워크샵"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                  />
                </div>
              )}

              <Button
                onClick={handleHostStart}
                disabled={hostDisabled}
                size="lg"
                className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
              >
                {isHostLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  hostButtonText
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 참여자 탭 */}
        <TabsContent value="participant">
          <Card className="border-2 border-dajaem-green/20">
            <CardHeader>
              <CardTitle>{participantTitle}</CardTitle>
              <CardDescription>{participantDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SessionCodeInput
                value={sessionCode}
                onChange={handleCodeChange}
                validationStatus={onValidateCode ? validationStatus : 'idle'}
                sessionTitle={validatedTitle}
              />

              <div className="space-y-2">
                <Label htmlFor="participant-name">이름 (닉네임)</Label>
                <Input
                  id="participant-name"
                  type="text"
                  placeholder="표시될 이름을 입력하세요"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  maxLength={20}
                />
              </div>

              <Button
                onClick={handleParticipantJoin}
                disabled={participantDisabled}
                size="lg"
                className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
              >
                {isJoinLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    참여 중...
                  </>
                ) : (
                  participantButtonText
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 기능 뱃지 */}
      {featureBadges && featureBadges.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-3">지원하는 기능</p>
          <div className="flex flex-wrap justify-center gap-2">
            {featureBadges.map((badge, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
