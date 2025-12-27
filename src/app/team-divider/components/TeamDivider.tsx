'use client';

import { useTeamStore } from '@/app/team-divider/store/useTeamStore';
import { useSessionStore } from '@/app/team-divider/store/session-store';
import { AppHeader, AppFooter } from '@/components/layout';
import { QRCodeShare } from '@/components/entry';
import { Button } from '@/components/ui/button';
import { ParticipantInput } from './ParticipantInput';
import { TeamSettings } from './TeamSettings';
import { TeamResult } from './TeamResult';
import { QRCodeDisplay } from './QRCodeDisplay';
import { ExportButtons } from './ExportButtons';
import { Shuffle, RotateCcw, Users, ArrowLeft } from 'lucide-react';

interface TeamDividerProps {
  isSessionMode?: boolean;
  onBack?: () => void;
}

export function TeamDivider({ isSessionMode = false, onBack }: TeamDividerProps) {
  const { participants, isShuffled, teams, divideTeams, reset } = useTeamStore();
  const { sessionCode } = useSessionStore();

  // Generate session URL
  const sessionUrl = typeof window !== 'undefined' && sessionCode
    ? `${window.location.origin}/team-divider?session=${sessionCode}`
    : null;

  const canShuffle = participants.length >= 2;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader
        title="팀 나누기"
        description={isSessionMode && sessionCode ? `세션: ${sessionCode}` : "공정한 랜덤 알고리즘으로 팀을 자동 분배하고, QR 코드로 결과를 공유하세요"}
        icon={Users}
        iconGradient="from-blue-500 to-indigo-500"
        actions={
          isSessionMode && onBack ? (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              나가기
            </Button>
          ) : undefined
        }
      />

      <div className="container mx-auto px-4 py-12 max-w-7xl flex-1">
        {!isShuffled ? (
          /* Input Phase */
          <div className="space-y-8">
            <ParticipantInput />
            <TeamSettings />

            {/* Session QR Code (Host Mode Only) */}
            {isSessionMode && sessionCode && sessionUrl && (
              <QRCodeShare
                url={sessionUrl}
                sessionCode={sessionCode}
                size={160}
                title="참여자 초대"
                description="QR 코드를 스캔하거나 코드를 입력하세요"
              />
            )}

            <div className="flex flex-col items-center pt-8 gap-4">
              <Button
                onClick={divideTeams}
                disabled={!canShuffle}
                size="lg"
                className="px-16 py-7 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                <Shuffle className="w-6 h-6 mr-3" />
                팀 나누기
              </Button>

              {!canShuffle && participants.length > 0 && (
                <p className="text-center text-sm text-red-600 font-medium">
                  최소 2명 이상의 참가자가 필요합니다
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Result Phase */
          <div className="space-y-12">
            <div className="text-center bg-gray-50 py-8 px-6 rounded-xl border border-gray-200">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                팀 분배 완료!
              </h2>
              <p className="text-lg text-gray-600">
                총 {teams.length}개 팀, {participants.length}명이 배정되었습니다
              </p>
            </div>

            <TeamResult teams={teams} showConfetti={true} />

            <QRCodeDisplay />

            <ExportButtons />

            <div className="flex justify-center pt-8">
              <Button onClick={reset} size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50">
                <RotateCcw className="w-5 h-5 mr-2" />
                다시 하기
              </Button>
            </div>
          </div>
        )}
      </div>

      <AppFooter disclaimer="Fisher-Yates 알고리즘을 사용하여 공정한 랜덤 분배를 보장합니다." />
    </div>
  );
}
